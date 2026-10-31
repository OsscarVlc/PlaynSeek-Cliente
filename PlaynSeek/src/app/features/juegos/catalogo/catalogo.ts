import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { PlatformBadge } from '@shared/directives/platform-badge';
import { Juego } from '@shared/models/juego';
import { Plataforma } from '@shared/models/usuario';
import { RatingBadge } from '../directives/rating-badge';
import {
  JuegosDemoService,
  JugadorSquad,
  MetadatosJuego,
} from '../services/juegos-demo';
import { JuegoPreview } from './juego-preview/juego-preview';

type CriterioOrden = 'popularidad' | 'rating' | 'squad' | 'nombre';

interface OpcionPlataforma {
  valor: Plataforma | 'todas';
  etiqueta: string;
  icono: string;
}

@Component({
  selector: 'app-catalogo',
  imports: [RouterLink, PlatformBadge, RatingBadge, JuegoPreview],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.scss',
})
export class Catalogo {
  juegosDemo = inject(JuegosDemoService);
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  readonly busqueda = signal('');
  readonly generoSeleccionado = signal<string>('Todos');
  readonly plataformaSeleccionada = signal<Plataforma | 'todas'>('todas');
  readonly soloMisJuegos = signal(false);
  readonly orden = signal<CriterioOrden>('popularidad');
  readonly juegoPreviewId = signal<string | null>('j1');

  readonly generosDisponibles = [
    'Todos',
    'Acción',
    'Aventura',
    'RPG',
    'Shooter',
    'Estrategia',
    'Carreras',
    'Deportes',
    'Sandbox',
  ];

  readonly plataformasDisponibles: OpcionPlataforma[] = [
    { valor: 'todas', etiqueta: 'Todas', icono: 'bi-grid-fill' },
    { valor: 'pc', etiqueta: 'PC', icono: 'bi-pc-display' },
    { valor: 'playstation', etiqueta: 'PlayStation', icono: 'bi-controller' },
    { valor: 'xbox', etiqueta: 'Xbox', icono: 'bi-xbox' },
    { valor: 'nintendo_switch', etiqueta: 'Switch', icono: 'bi-nintendo-switch' },
    { valor: 'mobile', etiqueta: 'Móvil', icono: 'bi-phone' },
  ];

  readonly juegosFiltrados = computed(() => {
    const termino = this.busqueda().trim().toLowerCase();
    const genero = this.generoSeleccionado();
    const plataforma = this.plataformaSeleccionada();
    const soloMios = this.soloMisJuegos();
    const criterio = this.orden();

    const filtrados = this.juegosDemo.juegos().filter((juego) => {
      if (juego.activo === false) {
        return false;
      }

      if (soloMios && !this.juegosDemo.estaJugandoActualmente(juego._id)) {
        return false;
      }

      if (genero !== 'Todos' && !juego.generos.includes(genero)) {
        return false;
      }

      if (plataforma !== 'todas' && !juego.plataformas.includes(plataforma)) {
        return false;
      }

      if (termino) {
        const coincideTitulo = juego.titulo.toLowerCase().includes(termino);
        const coincideGenero = juego.generos.some((g) =>
          g.toLowerCase().includes(termino)
        );
        return coincideTitulo || coincideGenero;
      }

      return true;
    });

    return [...filtrados].sort((a, b) => {
      const metaA = this.juegosDemo.obtenerMetadatos(a._id);
      const metaB = this.juegosDemo.obtenerMetadatos(b._id);

      switch (criterio) {
        case 'rating':
          return metaB.rating - metaA.rating;
        case 'squad':
          return metaB.buscandoSquad - metaA.buscandoSquad;
        case 'nombre':
          return a.titulo.localeCompare(b.titulo, 'es');
        case 'popularidad':
        default:
          return metaB.enLinea - metaA.enLinea;
      }
    });
  });

  readonly juegoPreview = computed<Juego | null>(() => {
    const id = this.juegoPreviewId();
    if (!id) {
      return null;
    }
    return (
      this.juegosDemo.obtenerJuegoPorId(id) ??
      this.juegosFiltrados()[0] ??
      null
    );
  });

  readonly metaPreview = computed<MetadatosJuego | null>(() => {
    const juego = this.juegoPreview();
    if (!juego) {
      return null;
    }
    return this.juegosDemo.obtenerMetadatos(juego._id);
  });

  readonly jugadoresPreview = computed<JugadorSquad[]>(() => {
    const juego = this.juegoPreview();
    if (!juego) {
      return [];
    }
    return this.juegosDemo.obtenerJugadoresParaJuego(juego._id).slice(0, 3);
  });

  readonly tituloSeccion = computed(() => {
    if (this.soloMisJuegos()) {
      return 'Mi rotación activa';
    }
    const plat = this.plataformaSeleccionada();
    if (plat === 'todas') {
      return 'Populares en el catálogo';
    }
    return `Populares en ${this.juegosDemo.etiquetaPlataforma(plat)}`;
  });

  seleccionarJuego(juego: Juego): void {
    this.juegoPreviewId.set(juego._id);
  }

  cerrarPreview(): void {
    this.juegoPreviewId.set(null);
  }

  seleccionarGenero(genero: string): void {
    this.generoSeleccionado.set(genero);
  }

  seleccionarPlataforma(plataforma: Plataforma | 'todas'): void {
    this.plataformaSeleccionada.set(plataforma);
  }

  alternarSoloMisJuegos(): void {
    this.soloMisJuegos.update((v) => !v);
    if (this.soloMisJuegos()) {
      this.notificacion.info('Mostrando únicamente tus juegos activos.');
    }
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.generoSeleccionado.set('Todos');
    this.plataformaSeleccionada.set('todas');
    this.soloMisJuegos.set(false);
    this.notificacion.info('Filtros del catálogo restablecidos.');
  }

  alternarJugandoActualmente(juego: Juego): void {
    if (this.juegosDemo.estaJugandoActualmente(juego._id)) {
      this.confirmar.pedir(
        `¿Deseas quitar "${juego.titulo}" de tu lista de juegos activos?`,
        () => {
          this.juegosDemo.quitarJuegoActivo(juego._id);
          this.notificacion.info(
            `"${juego.titulo}" se quitó de tus juegos activos.`
          );
        },
        'Quitar juego activo'
      );
    } else {
      this.juegosDemo.activarJuego(juego._id, true);
      this.notificacion.exito(
        `¡Agregaste "${juego.titulo}" a tus juegos activos!`
      );
    }
  }

  alternarBuscaSquad(juego: Juego): void {
    const buscando = this.juegosDemo.alternarBuscaEquipo(juego._id);
    if (buscando) {
      this.notificacion.exito(
        `Ahora apareces como "Buscando squad" en ${juego.titulo}.`
      );
    } else {
      this.notificacion.info(
        `Pausaste la búsqueda de squad para ${juego.titulo}.`
      );
    }
  }

  marcarJugadoAntes(juego: Juego): void {
    if (this.juegosDemo.fueJugadoAntes(juego._id)) {
      this.confirmar.pedir(
        `¿Quieres quitar "${juego.titulo}" de tu historial de juegos pasados?`,
        () => {
          this.juegosDemo.quitarDeJugadosAntes(juego._id);
          this.notificacion.info(
            `Se eliminó "${juego.titulo}" de tus juegos pasados.`
          );
        },
        'Quitar de jugados antes'
      );
      return;
    }

    if (this.juegosDemo.estaJugandoActualmente(juego._id)) {
      this.confirmar.pedir(
        `¿Deseas mover "${juego.titulo}" de tus juegos activos a tu historial de "Jugado antes"?`,
        () => {
          this.juegosDemo.marcarComoJugadoAntes(juego._id);
          this.notificacion.exito(
            `"${juego.titulo}" se movió a tu historial de juegos pasados.`
          );
        },
        'Mover a jugados antes'
      );
    } else {
      this.juegosDemo.marcarComoJugadoAntes(juego._id);
      this.notificacion.exito(
        `Guardaste "${juego.titulo}" en tus juegos jugados anteriormente.`
      );
    }
  }

  conectarConJugador(juego: Juego, jugador: JugadorSquad): void {
    if (jugador.conectado) {
      this.confirmar.pedir(
        `¿Deseas cancelar la solicitud de match enviada a ${jugador.nombre} para jugar ${juego.titulo}?`,
        () => {
          this.juegosDemo.cancelarSolicitudSquad(juego._id, jugador.id);
          this.notificacion.advertencia(
            `Solicitud para ${jugador.nombre} cancelada.`
          );
        },
        'Cancelar solicitud de conexión'
      );
      return;
    }

    this.juegosDemo.enviarSolicitudSquad(juego._id, jugador.id);
    this.notificacion.exito(
      `Solicitud de squad enviada a ${jugador.nombre} para ${juego.titulo}.`
    );
  }

  metadatosDe(juegoId: string): MetadatosJuego {
    return this.juegosDemo.obtenerMetadatos(juegoId);
  }
}
