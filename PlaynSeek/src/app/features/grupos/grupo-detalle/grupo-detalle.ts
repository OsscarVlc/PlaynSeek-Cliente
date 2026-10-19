import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { GruposDemo } from '../services/grupos-demo';
import { USUARIO_GRUPOS_DEMO_ID } from '../../../shared/mock/grupos-demo';

type TabGrupo = 'posts' | 'chat' | 'integrantes';

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

type AccionIntegrante = 'transferir' | 'expulsar';

interface ConfirmacionIntegrante {
  accion: AccionIntegrante;
  integranteId: string;
  nombre: string;
}

@Component({
  selector: 'app-grupo-detalle',
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './grupo-detalle.html',
  styleUrl: './grupo-detalle.scss',
})
export class GrupoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly gruposService = inject(GruposDemo);

  private readonly parametros = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly usuarioActualId = USUARIO_GRUPOS_DEMO_ID;
  readonly tabActual = signal<TabGrupo>('posts');

  readonly grupo = computed(() => {
    const id = this.parametros().get('id');
    return this.gruposService.grupos().find((grupo) => grupo.id === id);
  });

  readonly imagenPost = signal<string | null>(null);
  readonly errorImagenPost = signal('');
  readonly leyendoImagenPost = signal(false);

  borradoresComentarios: Record<string, string | undefined> = {};

  readonly esIntegrante = computed(() =>
    this.grupo()?.integrantes.some(
      (integrante) => integrante.id === this.usuarioActualId,
    ) ?? false,
  );

  private readonly publicaciones = signal<PublicacionDemo[]>([]);
  private readonly mensajes = signal<MensajeDemo[]>([]);

  readonly postsDelGrupo = computed(() =>
    this.publicaciones().filter((post) => post.grupoId === this.grupo()?.id),
  );

  readonly mensajesDelGrupo = computed(() =>
    this.mensajes().filter((mensaje) => mensaje.grupoId === this.grupo()?.id),
  );

  nuevoPost = '';
  nuevoMensaje = '';

  seleccionarTab(tab: TabGrupo): void {
    this.tabActual.set(tab);
  }

  publicar(inputImagen: HTMLInputElement): void {
    const grupo = this.grupo();
    const contenido = this.nuevoPost.trim();

    if (
      !grupo ||
      !this.esIntegrante() ||
      !contenido ||
      this.leyendoImagenPost()
    ) {
      return;
    }

    const post: PublicacionDemo = {
      id: crypto.randomUUID(),
      grupoId: grupo.id,
      autor: 'Sergio',
      contenido,
      imagen: this.imagenPost(),
      comentarios: [],
      fecha: new Date(),
    };

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
    const grupo = this.grupo();
    const contenido = (this.borradoresComentarios[postId] ?? '').trim();

    if (!grupo || !this.esIntegrante() || !contenido) return;

    const comentario: ComentarioDemo = {
      id: crypto.randomUUID(),
      autor: 'Sergio',
      contenido,
      fecha: new Date(),
    };

    this.publicaciones.update((posts) =>
      posts.map((post) => {
        if (post.id !== postId || post.grupoId !== grupo.id) return post;

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
      grupoId: grupo.id,
      autorId: this.usuarioActualId,
      autor: 'Sergio',
      contenido,
      fecha: new Date(),
    };

    this.mensajes.update((actuales) => [...actuales, mensaje]);
    this.nuevoMensaje = '';
  }

  readonly esLider = computed(
  () => this.grupo()?.liderId === this.usuarioActualId,
);

readonly aviso = signal('');
readonly confirmacion = signal<ConfirmacionIntegrante | null>(null);

readonly usuarioReportado = signal<{
  id: string;
  nombre: string;
} | null>(null);

motivoReporte = '';

unirse(): void {
  const grupo = this.grupo();
  if (!grupo) return;

  this.gruposService.unirse(grupo.id);
  this.aviso.set('Te uniste al grupo.');
}

salir(): void {
  const grupo = this.grupo();
  if (!grupo) return;

  if (this.esLider()) {
    this.aviso.set('Transfiere el liderazgo antes de salir del grupo.');
    return;
  }

  this.gruposService.salir(grupo.id);
  this.nuevoPost = '';
  this.nuevoMensaje = '';
  this.aviso.set('Saliste del grupo.');
}

pedirConfirmacion(
  accion: AccionIntegrante,
  integrante: { id: string; nombre: string },
): void {
  this.confirmacion.set({
    accion,
    integranteId: integrante.id,
    nombre: integrante.nombre,
  });
}

confirmarAccion(): void {
  const grupo = this.grupo();
  const accion = this.confirmacion();

  if (!grupo || !accion || !this.esLider()) return;

  if (accion.accion === 'transferir') {
    this.gruposService.transferirLiderazgo(grupo.id, accion.integranteId);
    this.aviso.set(`Ahora ${accion.nombre} lidera el grupo.`);
  } else {
    this.gruposService.expulsarIntegrante(grupo.id, accion.integranteId);
    this.aviso.set(`${accion.nombre} fue retirado del grupo.`);
  }

  this.confirmacion.set(null);
}

abrirReporte(integrante: { id: string; nombre: string }): void {
  this.motivoReporte = '';
  this.usuarioReportado.set(integrante);
}

enviarReporte(): void {
  const usuario = this.usuarioReportado();

  if (!usuario || !this.motivoReporte.trim()) return;

  this.usuarioReportado.set(null);
  this.motivoReporte = '';
  this.aviso.set(
    `Reporte de ${usuario.nombre} simulado. Todavía no se envía al servidor.`,
  );
}

}