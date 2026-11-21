import { Component, DestroyRef, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom, Subscription } from 'rxjs';

import { Realtime } from '@core/services/realtime';
import { MensajeGrupo } from '@shared/models/mensaje-grupo';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Confirm } from '@core/services/confirm';
import { GrupoApi } from '@core/services/grupo-api';
import { Notification } from '@core/services/notification';
import { Grupo } from '@shared/models/grupo';

import { HasRole } from '@shared/directives/has-role';

import { PostApi } from '@core/services/post-api';

type TabGrupo = 'posts' | 'chat' | 'integrantes';
type AccionIntegrante = 'transferir' | 'expulsar';

interface ComentarioDemo {
  id: string;
  autor: string;
  contenido: string;
  fecha: Date;
}

interface PublicacionDemo {
  id: string;
  grupoId: string;
  autor: string;
  contenido: string;
  imagen: string | null;
  comentarios: ComentarioDemo[];
  fecha: Date;
}

interface MensajeDemo {
  id: string;
  grupoId: string;
  autorId: string;
  autor: string;
  contenido: string;
  fecha: Date;
}

interface ConfirmacionIntegrante {
  accion: AccionIntegrante;
  integranteId: string;
  nombre: string;
}

@Component({
  selector: 'app-grupo-detalle',
  imports: [RouterLink, FormsModule, DatePipe, HasRole],
  templateUrl: './grupo-detalle.html',
  styleUrl: './grupo-detalle.scss',
})
export class GrupoDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly grupoApi = inject(GrupoApi);
  private readonly auth = inject(Auth);
  private readonly confirmar = inject(Confirm);
  private readonly notificacion = inject(Notification);
  readonly realtime = inject(Realtime);
  private readonly destroyRef = inject(DestroyRef);
  private readonly postApi = inject(PostApi);
  readonly guardandoPost = signal(false);
  private cargaDePosts = 0;

  // id del grupo que viene en la URL
  private grupoId = '';

  //  Estado de la pantalla 
  readonly grupo = signal<Grupo | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly noEncontrado = signal(false);

  // true mientras una acción (unirse, salir, eliminar...) viaja al back
  readonly procesando = signal(false);

  readonly tabActual = signal<TabGrupo>('posts');

  // Datos del usuario con sesion
  get usuarioActualId(): string {
    return this.auth.usuarioActual?._id ?? '';
  }

  get nombreUsuario(): string {
    return this.auth.usuarioActual?.nombre ?? 'Tú';
  }

  // computed recalcula su valor cuando cambia el signal grupo()
  readonly esIntegrante = computed(() => { // true si el usuario actual está en la lista de integrantes
    const integrantes = this.grupo()?.integrantes ?? [];
    return integrantes.includes(this.usuarioActualId);
  });

  // computed recalcula su valor cuando cambia el signal grupo()
  readonly esLider = computed(() => this.grupo()?.lider_id === this.usuarioActualId);

  readonly totalIntegrantes = computed(() => this.grupo()?.integrantes?.length ?? 0);

  //  Posts y chat 
  readonly imagenPost = signal<string | null>(null);
  readonly errorImagenPost = signal('');
  readonly leyendoImagenPost = signal(false);

  // borradores de comentarios, indexados por id del post
  borradoresComentarios: Record<string, string | undefined> = {};

  private readonly publicaciones = signal<PublicacionDemo[]>([]);
  private readonly mensajes = signal<MensajeDemo[]>([]);

  
  readonly postsDelGrupo = computed(() =>
    this.publicaciones().filter((post) => post.grupoId === this.grupo()?._id),
  );

  readonly mensajesDelGrupo = computed(() =>
    this.mensajes().filter((mensaje) => mensaje.grupoId === this.grupo()?._id),
  );

  nuevoPost = '';
  nuevoMensaje = '';

  // Integrantes 
  readonly confirmacion = signal<ConfirmacionIntegrante | null>(null);
  readonly usuarioReportado = signal<{ id: string; nombre: string } | null>(null);
  motivoReporte = '';


constructor() {
  effect((alSalir) => {
    const grupo = this.grupo();

    if (this.cargando() || this.tabActual() !== 'chat' || !grupo || !this.esIntegrante()) {
      return;
    }

    // Este efecto solo debe reaccionar al grupo, la membresía y la pestaña.
    // Las reconexiones las maneja alConectar().
    const cerrarSala = untracked(() => this.abrirSalaChat(grupo._id));
    alSalir(cerrarSala);
  });
}

private abrirSalaChat(grupoId: string): () => void {
  let escuchas = new Subscription();

  const conexion = this.realtime.alConectar()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(() => {
      // Al reconectar, quitamos las escuchas anteriores antes de registrarlas otra vez.
      escuchas.unsubscribe();
      escuchas = new Subscription();

      escuchas.add(
        this.realtime.escuchar<MensajeGrupo[]>('historial')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((lista) => {
            if (lista.some((mensaje) => mensaje.grupo_id !== grupoId)) return;

            // Un mensaje en vivo puede llegar mientras el servidor consulta el historial.
            // Combinamos por id para no perderlo ni mostrarlo dos veces.
            this.mensajes.update((actuales) => {
              const porId = new Map<string, MensajeDemo>();

              for (const mensaje of lista) {
                porId.set(mensaje._id, this.aMensajeVista(mensaje));
              }
              for (const mensaje of actuales) {
                if (mensaje.grupoId === grupoId) porId.set(mensaje.id, mensaje);
              }

              return [...porId.values()].sort(
                (a, b) => a.fecha.getTime() - b.fecha.getTime(),
              );
            });
          }),
      );

      escuchas.add(
        this.realtime.escuchar<MensajeGrupo>('mensaje_recibido')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((mensaje) => {
            if (mensaje.grupo_id !== grupoId) return;

            this.mensajes.update((actuales) => {
              if (actuales.some((actual) => actual.id === mensaje._id)) return actuales;
              return [...actuales, this.aMensajeVista(mensaje)];
            });
          }),
      );

      escuchas.add(
        this.realtime.escuchar<string>('error_chat')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((aviso) => this.notificacion.advertencia(aviso)),
      );

      // El servidor responde con 'historial'. Las escuchas ya están listas.
      this.realtime.emitir('unirse_grupo', grupoId);
    });

  let cerrada = false;
  const cerrarSala = () => {
    if (cerrada) return;
    cerrada = true;
    conexion.unsubscribe();
    escuchas.unsubscribe();
    this.realtime.emitir('salir_grupo', grupoId);
  };

  const quitarAlDestruir = this.destroyRef.onDestroy(cerrarSala);

  // El constructor también llama esta limpieza al cambiar de pestaña o grupo.
  return () => {
    quitarAlDestruir();
    cerrarSala();
  };
}

private aMensajeVista(mensaje: MensajeGrupo): MensajeDemo {
  return {
    id: mensaje._id,
    grupoId: mensaje.grupo_id,
    autorId: mensaje.usuario_id,
    autor: mensaje.nombreUsuario,
    contenido: mensaje.contenido,
    fecha: new Date(mensaje.fecha),
  };
}

  // Carga del grupo


  // paramMap avisa cada vez que cambia el :id de la URL, asi el detalle
  // se recarga si navegas de un grupo a otro sin salir de la pantalla.
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.grupoId = params.get('id') ?? '';
      this.cargar();
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.noEncontrado.set(false);

    this.grupoApi.obtener(this.grupoId).subscribe({
      next: (grupo) => {
        this.grupo.set(grupo);
        this.cargando.set(false);
        if (this.esIntegrante()) {
          void this.cargarPosts(grupo._id);
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404 || err.status === 400) {
          this.noEncontrado.set(true);
        } else {
          this.error.set(true);
        }
        this.cargando.set(false);
      },
    });
  }

  // Refresca los datos del grupo desde la API, sin cambiar de pantalla
  private refrescar(): void {
    this.grupoApi.obtener(this.grupoId).subscribe((grupo) => {
      this.grupo.set(grupo);

      if (this.esIntegrante()) {
        void this.cargarPosts(grupo._id);
      } else {
        this.publicaciones.set([]);
      }
    });
  }

  seleccionarTab(tab: TabGrupo): void {
    this.tabActual.set(tab);
  }





  // Acciones contra la API

  unirse(): void {
    this.procesando.set(true);
    this.grupoApi.unirse(this.grupoId).subscribe({
      next: () => {
        this.notificacion.exito('Te uniste al grupo');
        this.refrescar();
        this.procesando.set(false);
      },
      // Si hay un error, muestra el mensaje y oculta el spinner
      error: () => this.procesando.set(false),
    });
  }

  // El líder no puede salir del grupo, debe transferir el liderazgo primero
  salir(): void {
    if (this.esLider()) {
      this.notificacion.advertencia('Transfiere el liderazgo antes de salir del grupo.');
      return;
    }

    this.procesando.set(true);
    this.grupoApi.salir(this.grupoId).subscribe({
      next: () => {
        this.notificacion.exito('Saliste del grupo');
        this.nuevoPost = '';
        this.nuevoMensaje = '';
        this.refrescar();
        this.procesando.set(false);
      },
      error: () => this.procesando.set(false),
    });
  }


  // El líder puede eliminar el grupo, lo que lo borra de la lista de todos los usuarios
  eliminar(): void {
    const grupo = this.grupo();
    if (!grupo) return;

    this.confirmar.pedir(
      '¿Deseas eliminar el grupo "' + grupo.nombre + '"? Dejará de aparecer en la lista.',
      () => {
        this.procesando.set(true);
        this.grupoApi.eliminar(this.grupoId).subscribe({
          next: () => {
            this.notificacion.exito('Grupo eliminado correctamente');
            this.router.navigate(['/grupos']);
          },
          error: () => this.procesando.set(false),
        });
      },
      'Eliminar grupo',
    );
  }

  // Acciones sobre integrantes: transferir liderazgo o expulsar
  pedirConfirmacion(accion: AccionIntegrante, integranteId: string): void {
    this.confirmacion.set({
      accion: accion,
      integranteId: integranteId,
      nombre: this.nombreIntegrante(integranteId),
    });
  }

  // Confirma la acción de transferir liderazgo o expulsar a un integrante
  confirmarAccion(): void {
    const pendiente = this.confirmacion();
    if (!pendiente || this.procesando()) return;

    // Transferir requiere ser líder; expulsar permite líder o administrador.
    const puedeRealizarAccion = pendiente.accion === 'transferir'
      ? this.esLider()
      : this.esLider() || this.auth.tieneRol(['administrador']);

    if (!puedeRealizarAccion) {
      this.notificacion.advertencia('No tienes permiso para realizar esta acción.');
      this.confirmacion.set(null);
      return;
    }

    // El líder debe transferir el liderazgo antes de abandonar el grupo.
    if (
      pendiente.accion === 'expulsar' &&
      pendiente.integranteId === this.grupo()?.lider_id
    ) {
      this.notificacion.advertencia('No se puede expulsar al líder del grupo.');
      this.confirmacion.set(null);
      return;
    }

    this.procesando.set(true);

    if (pendiente.accion === 'transferir') {
      this.grupoApi.transferirLiderazgo(this.grupoId, pendiente.integranteId).subscribe({
        next: () => {
          this.notificacion.exito('Ahora ' + pendiente.nombre + ' lidera el grupo');
          this.terminarAccionIntegrante();
        },
        error: () => this.procesando.set(false),
      });
    } else {
      this.grupoApi.expulsar(this.grupoId, pendiente.integranteId).subscribe({
        next: () => {
          this.notificacion.exito(pendiente.nombre + ' fue retirado del grupo');
          this.terminarAccionIntegrante();
        },
        error: () => this.procesando.set(false),
      });
    }
  }

  private terminarAccionIntegrante(): void {
    this.confirmacion.set(null);
    this.refrescar();
    this.procesando.set(false);
  }




  // Reportes (simulado)

  abrirReporte(integranteId: string): void {
    this.motivoReporte = '';
    this.usuarioReportado.set({ id: integranteId, nombre: this.nombreIntegrante(integranteId) });
  }

  enviarReporte(): void {
    const usuario = this.usuarioReportado();
    if (!usuario || !this.motivoReporte.trim()) return;

    this.usuarioReportado.set(null);
    this.motivoReporte = '';
    this.notificacion.info('Reporte de ' + usuario.nombre + ' simulado. Todavía no se envía al servidor.');
  }





  // Posts, comentarios y chat (locales)


  publicar(inputImagen: HTMLInputElement): void {
    const grupoId = this.grupo()?._id;
    const contenido = this.nuevoPost.trim();

    if (!grupoId || !this.esIntegrante() || !contenido ||
        this.leyendoImagenPost() || this.guardandoPost()) {
      return;
    }

    const archivo = inputImagen.files?.[0];
    this.guardandoPost.set(true);

    this.postApi.crear(grupoId, contenido, archivo).subscribe({
      next: () => {
        this.guardandoPost.set(false);
        if (this.grupoId !== grupoId) return;

        // Mongo ya confirmó el guardado. Ahora sí limpiamos el formulario
        // y consultamos el muro para mostrar el post con su id real.
        this.nuevoPost = '';
        this.quitarImagenPost(inputImagen);
        void this.cargarPosts(grupoId);
      },
      error: () => {
        // El interceptor muestra el error; conservamos texto e imagen para reintentar.
        this.guardandoPost.set(false);
      },
    });
  }

  seleccionarImagenPost(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    this.errorImagenPost.set('');

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!tiposPermitidos.includes(archivo.type)) {
      this.errorImagenPost.set('Selecciona una imagen JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.errorImagenPost.set('La imagen no debe superar los 5 MB.');
      input.value = '';
      return;
    }

    this.leyendoImagenPost.set(true);

    const lector = new FileReader();

    lector.onload = () => {
      this.imagenPost.set(lector.result as string);
      this.leyendoImagenPost.set(false);
    };

    lector.onerror = () => {
      this.errorImagenPost.set('No se pudo leer la imagen.');
      this.leyendoImagenPost.set(false);
      input.value = '';
    };

    lector.readAsDataURL(archivo);
  }

  quitarImagenPost(input: HTMLInputElement): void {
    input.value = '';
    this.imagenPost.set(null);
    this.errorImagenPost.set('');
  }

  comentar(postId: string): void {
    const contenido = (this.borradoresComentarios[postId] ?? '').trim();

    if (!this.grupo() || !this.esIntegrante() || !contenido) return;

    const comentario: ComentarioDemo = {
      id: crypto.randomUUID(),
      autor: this.nombreUsuario,
      contenido,
      fecha: new Date(),
    };

    // Agrega el comentario al post correspondiente, sin modificar los demás
    this.publicaciones.update((posts) =>
      posts.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          comentarios: [...post.comentarios, comentario],
        };
      }),
    );

    this.borradoresComentarios[postId] = '';
  }

  enviarMensaje(): void {
    const grupo = this.grupo();
    const contenido = this.nuevoMensaje.trim();

    if (!grupo || !this.esIntegrante() || !contenido) return;

    const enviado = this.realtime.emitir('mensaje_nuevo', {
      grupoId: grupo._id,
      contenido,
    });

    if (!enviado) {
      this.notificacion.advertencia('Sin conexión. Tu mensaje sigue en el cuadro de texto.');
      return;
    }

    this.nuevoMensaje = '';
  }




  // Ayudantes para la plantilla

  // La API solo devuelve ids de integrantes, sin nombres
  nombreIntegrante(id: string): string {
    if (id === this.usuarioActualId) {
      return this.nombreUsuario;
    }
    return 'Integrante ' + id.slice(-4);
  }

  inicial(texto: string): string {
    return texto.charAt(0).toUpperCase();
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

private async cargarPosts(grupoId: string): Promise<void> {
  const carga = ++this.cargaDePosts;
  const posts: PublicacionDemo[] = [];
  let pagina = 1;
  let totalPaginas: number;

  try {
    do {
      const respuesta = await firstValueFrom(this.postApi.listar(grupoId, pagina));

      // Si el usuario cambió de grupo o empezó otra carga, descartamos esta.
      if (grupoId !== this.grupoId || carga !== this.cargaDePosts) return;

      for (const post of respuesta.data) {
        posts.push({
          id: post._id,
          grupoId: post.grupo_id,
          autor: post.usuario_id === this.usuarioActualId
            ? this.nombreUsuario
            : this.nombreIntegrante(post.usuario_id),
          contenido: post.contenido,
          imagen: post.imagenes?.[0] ?? null,
          comentarios: [],
          fecha: new Date(post.fecha),
        });
      }

      totalPaginas = respuesta.totalPaginas;
      pagina++;
    } while (pagina <= totalPaginas);

    // El muro muestra primero las publicaciones más recientes.
    posts.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    this.publicaciones.set(posts);
  } catch {
    // El interceptor ya muestra el error de la API.
    // Conservamos el muro actual si falla la consulta.
  }
}
}

