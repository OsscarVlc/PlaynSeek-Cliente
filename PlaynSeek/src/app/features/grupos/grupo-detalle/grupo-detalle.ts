import { Component, OnInit, computed, inject, signal } from '@angular/core';
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
    this.grupoApi.obtener(this.grupoId).subscribe((grupo) => this.grupo.set(grupo));
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
    const grupo = this.grupo();
    const contenido = this.nuevoPost.trim();

    if (!grupo || !this.esIntegrante() || !contenido || this.leyendoImagenPost()) {
      return;
    }

    const post: PublicacionDemo = {
      id: crypto.randomUUID(),
      grupoId: grupo._id,
      autor: this.nombreUsuario,
      contenido,
      imagen: this.imagenPost(),
      comentarios: [],
      fecha: new Date(),
    };

    // el post nuevo va primero, seguido de los que ya había
    this.publicaciones.update((actuales) => [post, ...actuales]);

    this.nuevoPost = '';
    this.quitarImagenPost(inputImagen);
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

    const mensaje: MensajeDemo = {
      id: crypto.randomUUID(),
      grupoId: grupo._id,
      autorId: this.usuarioActualId,
      autor: this.nombreUsuario,
      contenido,
      fecha: new Date(),
    };

    this.mensajes.update((actuales) => [...actuales, mensaje]);
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
}