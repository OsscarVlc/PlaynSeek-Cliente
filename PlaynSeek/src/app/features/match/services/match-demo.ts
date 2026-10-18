import { Injectable, computed, signal } from '@angular/core';

export interface JugadorMatch {
  id: string;
  nombre: string;
  iniciales: string;
  descripcion: string;
  juegos: string[];
  idiomas: string[];
  plataformas: string[];
  disponibilidad: string;
}

export interface SolicitudMatch {
  id: string;
  jugador: JugadorMatch;
  direccion: 'recibida' | 'enviada';
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
  fecha: string;
}

const JUGADORES_DEMO: JugadorMatch[] = [
  {
    id: 'usuario-carlos',
    nombre: 'Carlos Frost',
    iniciales: 'CF',
    descripcion:
      'Buenas partidas, comunicación y cero drama. Busco compañeros para jugar por las noches.',
    juegos: ['Valorant', 'Apex Legends'],
    idiomas: ['Español', 'Inglés'],
    plataformas: ['PC'],
    disponibilidad: 'Entre semana, después de las 8 p. m.',
  },
  {
    id: 'usuario-nova',
    nombre: 'NovaByte',
    iniciales: 'NV',
    descripcion:
      'Me gustan las aventuras cooperativas y construir cosas que probablemente no necesitábamos.',
    juegos: ['Minecraft', 'Stardew Valley'],
    idiomas: ['Español'],
    plataformas: ['PC', 'Nintendo Switch'],
    disponibilidad: 'Viernes y fines de semana.',
  },
  {
    id: 'usuario-alex',
    nombre: 'Alex',
    iniciales: 'AL',
    descripcion:
      'Una partida rápida o una sesión larga. Lo importante es pasarla bien en equipo.',
    juegos: ['Rocket League', 'Valorant'],
    idiomas: ['Español', 'Inglés'],
    plataformas: ['PC', 'PlayStation'],
    disponibilidad: 'Por las tardes.',
  },
  {
    id: 'usuario-kai',
    nombre: 'KaiStorm',
    iniciales: 'KS',
    descripcion: 'Busco un equipo constante para mejorar en ranked.',
    juegos: ['Valorant'],
    idiomas: ['Español'],
    plataformas: ['PC'],
    disponibilidad: 'De lunes a jueves por la noche.',
  },
  {
    id: 'usuario-astra',
    nombre: 'Astra',
    iniciales: 'AS',
    descripcion: 'Exploración, cooperación y buenas conversaciones.',
    juegos: ['Minecraft'],
    idiomas: ['Español', 'Inglés'],
    plataformas: ['PC'],
    disponibilidad: 'Fines de semana.',
  },
  {
    id: 'usuario-oscar',
    nombre: 'Oscar',
    iniciales: 'OV',
    descripcion: 'Siempre listo para una partida de Valorant.',
    juegos: ['Valorant'],
    idiomas: ['Español'],
    plataformas: ['PC'],
    disponibilidad: 'Por las noches.',
  },
  {
    id: 'usuario-dante',
    nombre: 'Dante',
    iniciales: 'DA',
    descripcion: 'Construyamos algo juntos.',
    juegos: ['Minecraft'],
    idiomas: ['Español'],
    plataformas: ['PC'],
    disponibilidad: 'Por las tardes.',
  },
  {
    id: 'usuario-luna',
    nombre: 'Luna',
    iniciales: 'LU',
    descripcion: 'Una buena comunicación hace la diferencia.',
    juegos: ['Apex Legends'],
    idiomas: ['Español', 'Inglés'],
    plataformas: ['PC'],
    disponibilidad: 'Fines de semana.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class MatchDemo {
  private readonly descartados = signal<string[]>([]);

  private readonly solicitudesInternas = signal<SolicitudMatch[]>(
    JUGADORES_DEMO.filter((jugador) =>
      ['usuario-kai', 'usuario-astra'].includes(jugador.id),
    ).map((jugador) => ({
      id: `solicitud-${jugador.id}`,
      jugador,
      direccion: 'recibida',
      estado: 'pendiente',
      fecha: '2026-10-18T10:00:00-06:00',
    })),
  );

  private readonly matchesInternos = signal<JugadorMatch[]>(
    JUGADORES_DEMO.filter((jugador) =>
      ['usuario-oscar', 'usuario-dante', 'usuario-luna'].includes(jugador.id),
    ),
  );

  readonly solicitudes = this.solicitudesInternas.asReadonly();
  readonly matches = this.matchesInternos.asReadonly();

  readonly recibidas = computed(() =>
    this.solicitudes().filter(
      (solicitud) =>
        solicitud.direccion === 'recibida' &&
        solicitud.estado === 'pendiente',
    ),
  );

  readonly enviadas = computed(() =>
    this.solicitudes().filter(
      (solicitud) =>
        solicitud.direccion === 'enviada' &&
        solicitud.estado === 'pendiente',
    ),
  );

  readonly recomendaciones = computed(() => {
    const excluidos = new Set([
      ...this.descartados(),
      ...this.matches().map((jugador) => jugador.id),
      ...this.solicitudes()
        .filter((solicitud) => solicitud.estado === 'pendiente')
        .map((solicitud) => solicitud.jugador.id),
    ]);

    return JUGADORES_DEMO.filter((jugador) => !excluidos.has(jugador.id));
  });

  pasar(jugadorId: string): void {
    this.descartados.update((ids) => [...new Set([...ids, jugadorId])]);
  }

  restablecerDescartados(): void {
    this.descartados.set([]);
  }

  enviarSolicitud(jugadorId: string): boolean {
    const jugador = this.recomendaciones().find(
      (candidato) => candidato.id === jugadorId,
    );

    if (!jugador) return false;

    const solicitud: SolicitudMatch = {
      id: crypto.randomUUID(),
      jugador,
      direccion: 'enviada',
      estado: 'pendiente',
      fecha: new Date().toISOString(),
    };

    this.solicitudesInternas.update((actuales) => [...actuales, solicitud]);

    return true;
  }

  responderSolicitud(solicitudId: string, aceptar: boolean): boolean {
    const solicitud = this.recibidas().find(
      (actual) => actual.id === solicitudId,
    );

    if (!solicitud) return false;

    this.solicitudesInternas.update((actuales) =>
      actuales.map((actual) =>
        actual.id === solicitudId
          ? { ...actual, estado: aceptar ? 'aceptada' : 'rechazada' }
          : actual,
      ),
    );

    if (aceptar) {
      this.matchesInternos.update((actuales) =>
        actuales.some((jugador) => jugador.id === solicitud.jugador.id)
          ? actuales
          : [solicitud.jugador, ...actuales],
      );
    }

    return true;
  }

  cancelarSolicitud(solicitudId: string): void {
    this.solicitudesInternas.update((actuales) =>
      actuales.map((solicitud) =>
        solicitud.id === solicitudId &&
        solicitud.direccion === 'enviada' &&
        solicitud.estado === 'pendiente'
          ? { ...solicitud, estado: 'cancelada' }
          : solicitud,
      ),
    );
  }
}