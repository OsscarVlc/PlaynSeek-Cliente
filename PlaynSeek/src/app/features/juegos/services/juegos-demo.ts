import { Injectable, inject, signal } from '@angular/core';

import { Auth } from '@core/services/auth';
import { JUEGOS_MOCK } from '@shared/mock/juegos.mock';
import { USUARIOS_MOCK } from '@shared/mock/usuarios.mock';
import { Juego } from '@shared/models/juego';
import { JuegoActivo, Plataforma, Usuario } from '@shared/models/usuario';

export interface MetadatosJuego {
  juegoId: string;
  desarrollador: string;
  distribuidor: string;
  lanzamiento: string;
  rating: number;
  buscandoSquad: number;
  enLinea: number;
  descripcion: string;
}

export interface JugadorSquad {
  id: string;
  nombre: string;
  iniciales: string;
  plataforma: Plataforma;
  plataformaEtiqueta: string;
  actividad: string;
  microfono: boolean;
  compatibilidad: number;
  conectado: boolean;
}

const METADATOS_EXTRA: Record<string, MetadatosJuego> = {
  j1: {
    juegoId: 'j1',
    desarrollador: 'Nintendo EPD',
    distribuidor: 'Nintendo',
    lanzamiento: '3 mar 2017',
    rating: 4.78,
    buscandoSquad: 34,
    enLinea: 19,
    descripcion:
      'Explora un vasto Hyrule abierto, descubre santuarios ancestrales, comparte rutas de speedrun, retos Master Mode y consejos de equipamiento con otros aventureros.',
  },
  j2: {
    juegoId: 'j2',
    desarrollador: 'Valve Corporation',
    distribuidor: 'Valve',
    lanzamiento: '27 sep 2023',
    rating: 4.35,
    buscandoSquad: 86,
    enLinea: 52,
    descripcion:
      'El shooter táctico competitivo por excelencia. Arma tu five-stack para Premier, practica utilidades en Mirage e Inferno y sube de rango con comunicación clara.',
  },
  j3: {
    juegoId: 'j3',
    desarrollador: 'CD Projekt Red',
    distribuidor: 'CD Projekt',
    lanzamiento: '19 may 2015',
    rating: 4.82,
    buscandoSquad: 28,
    enLinea: 14,
    descripcion:
      'Acompaña a Geralt de Rivia en un mundo de fantasía oscura. Comparte builds de alquimia y señales, decisiones de historia y partidas de Gwent con la comunidad.',
  },
  j4: {
    juegoId: 'j4',
    desarrollador: 'Nintendo EPD',
    distribuidor: 'Nintendo',
    lanzamiento: '28 abr 2017',
    rating: 4.61,
    buscandoSquad: 45,
    enLinea: 27,
    descripcion:
      'Salas privadas de 150cc y 200cc, torneos nocturnos del Pase de Pistas Extras y partidas casuales con chat de voz para pasar un buen rato en equipo.',
  },
  j5: {
    juegoId: 'j5',
    desarrollador: 'Mojang Studios',
    distribuidor: 'Xbox Game Studios',
    lanzamiento: '18 nov 2011',
    rating: 4.71,
    buscandoSquad: 64,
    enLinea: 41,
    descripcion:
      'Servidores survival técnico, construcción cooperativa, modpacks y aventuras en el Nether. Encuentra compañeros constantes para levantar proyectos gigantes.',
  },
  j6: {
    juegoId: 'j6',
    desarrollador: 'Blizzard Entertainment',
    distribuidor: 'Blizzard',
    lanzamiento: '4 oct 2022',
    rating: 4.08,
    buscandoSquad: 58,
    enLinea: 33,
    descripcion:
      'Combates 5v5 por objetivos donde la sinergia entre tanque, daño y apoyo define la partida. Encuentra dúo o equipo completo para ranked sin toxicidad.',
  },
  j7: {
    juegoId: 'j7',
    desarrollador: 'Psyonix',
    distribuidor: 'Epic Games',
    lanzamiento: '7 jul 2015',
    rating: 4.44,
    buscandoSquad: 49,
    enLinea: 24,
    descripcion:
      'Fútbol de alto octanaje con acrobacias aéreas. Busca tu compañero de 2v2 o 3v3 con buena rotación, pases al centro y mentalidad competitiva.',
  },
  j8: {
    juegoId: 'j8',
    desarrollador: 'HoYoverse',
    distribuidor: 'Cognosphere',
    lanzamiento: '28 sep 2020',
    rating: 4.52,
    buscandoSquad: 39,
    enLinea: 22,
    descripcion:
      'Explora Teyvat en cooperativo, derrota jefes semanales, farmea dominios de artefactos y arma composiciones elementales con otros viajeros.',
  },
};

@Injectable({
  providedIn: 'root',
})
export class JuegosDemoService {
  private auth = inject(Auth);

  readonly juegos = signal<Juego[]>(
    JUEGOS_MOCK.map(({ imagen, ...juego }) => ({ ...juego }))
  );

  readonly solicitudesEnviadas = signal<string[]>([]);

  readonly juegosActivos = signal<JuegoActivo[]>([
    ...(USUARIOS_MOCK[0]?.juegos_activos ?? [
      { juego_id: 'j1', busca_equipo: true, desde: '2026-08-10T00:00:00.000Z' },
      { juego_id: 'j3', busca_equipo: false, desde: '2026-09-02T00:00:00.000Z' },
    ]),
  ]);

  readonly juegosPasados = signal<string[]>([...(USUARIOS_MOCK[0]?.juegos_pasados ?? ['j5'])]);

  constructor() {
    this.sincronizarUsuarioActual();
  }

  obtenerJuegoPorId(id: string): Juego | undefined {
    return this.juegos().find((j) => j._id === id);
  }

  obtenerMetadatos(juegoId: string): MetadatosJuego {
    return (
      METADATOS_EXTRA[juegoId] ?? {
        juegoId,
        desarrollador: 'Estudio Independiente',
        distribuidor: 'RAWG Network',
        lanzamiento: '2024',
        rating: 4.4,
        buscandoSquad: 24,
        enLinea: 12,
        descripcion:
          'Descubre compañeros compatibles por horario, plataforma y estilo de juego para armar tu próximo squad.',
      }
    );
  }

  estaJugandoActualmente(juegoId: string): boolean {
    return this.juegosActivos().some((item) => item.juego_id === juegoId);
  }

  estaBuscandoEquipo(juegoId: string): boolean {
    const activo = this.juegosActivos().find((item) => item.juego_id === juegoId);
    return activo ? activo.busca_equipo : false;
  }

  fueJugadoAntes(juegoId: string): boolean {
    return this.juegosPasados().includes(juegoId);
  }

  activarJuego(juegoId: string, buscaEquipo: boolean = true): void {
    if (this.estaJugandoActualmente(juegoId)) {
      return;
    }
    const nuevo: JuegoActivo = {
      juego_id: juegoId,
      busca_equipo: buscaEquipo,
      desde: new Date().toISOString(),
    };
    this.juegosActivos.update((lista) => [...lista, nuevo]);
    this.juegosPasados.update((lista) => lista.filter((id) => id !== juegoId));
    this.sincronizarUsuarioActual();
  }

  quitarJuegoActivo(juegoId: string): void {
    this.juegosActivos.update((lista) => lista.filter((item) => item.juego_id !== juegoId));
    this.sincronizarUsuarioActual();
  }

  alternarBuscaEquipo(juegoId: string): boolean {
    if (!this.estaJugandoActualmente(juegoId)) {
      this.activarJuego(juegoId, true);
      return true;
    }
    let nuevoEstado = false;
    this.juegosActivos.update((lista) =>
      lista.map((item) => {
        if (item.juego_id === juegoId) {
          nuevoEstado = !item.busca_equipo;
          return { ...item, busca_equipo: nuevoEstado };
        }
        return item;
      })
    );
    this.sincronizarUsuarioActual();
    return nuevoEstado;
  }

  marcarComoJugadoAntes(juegoId: string): void {
    this.quitarJuegoActivo(juegoId);
    if (!this.juegosPasados().includes(juegoId)) {
      this.juegosPasados.update((lista) => [...lista, juegoId]);
    }
    this.sincronizarUsuarioActual();
  }

  quitarDeJugadosAntes(juegoId: string): void {
    this.juegosPasados.update((lista) => lista.filter((id) => id !== juegoId));
    this.sincronizarUsuarioActual();
  }

  restaurarRotacionInicial(): void {
    this.juegosActivos.set([
      { juego_id: 'j1', busca_equipo: true, desde: '2026-08-10T00:00:00.000Z' },
      { juego_id: 'j3', busca_equipo: false, desde: '2026-09-02T00:00:00.000Z' },
    ]);
    this.juegosPasados.set(['j5']);
    this.sincronizarUsuarioActual();
  }

  obtenerJugadoresParaJuego(juegoId: string): JugadorSquad[] {
    const juego = this.obtenerJuegoPorId(juegoId);
    const enviados = this.solicitudesEnviadas();

    const candidatos: Usuario[] = USUARIOS_MOCK.filter(
      (u) => u._id !== 'u1' && u.isActive && u.correo_confirmado
    );

    const actividadesPorGenero = [
      'Ranked · Mic encendido',
      'Partidas casuales · Noche',
      'Co-op · Fin de semana',
      'Competitivo · Sin toxicidad',
      'Misiones y logros · Tarde',
    ];

    return candidatos.map((usuario, idx) => {
      const juegaEste =
        usuario.juegos_activos?.some((ja) => ja.juego_id === juegoId) ?? false;
      const plat =
        usuario.plataformas?.[0]?.nombre ??
        juego?.plataformas?.[0] ??
        'pc';

      return {
        id: usuario._id,
        nombre: usuario.nombre,
        iniciales: this.obtenerIniciales(usuario.nombre),
        plataforma: plat,
        plataformaEtiqueta: this.etiquetaPlataforma(plat),
        actividad: juegaEste
          ? 'Buscando squad activo · Mic on'
          : actividadesPorGenero[idx % actividadesPorGenero.length],
        microfono: idx % 2 === 0,
        compatibilidad: juegaEste ? 94 - idx * 3 : 85 - idx * 4,
        conectado: enviados.includes(`${juegoId}:${usuario._id}`),
      };
    });
  }

  enviarSolicitudSquad(juegoId: string, usuarioId: string): void {
    const clave = `${juegoId}:${usuarioId}`;
    if (!this.solicitudesEnviadas().includes(clave)) {
      this.solicitudesEnviadas.update((lista) => [...lista, clave]);
    }
  }

  cancelarSolicitudSquad(juegoId: string, usuarioId: string): void {
    const clave = `${juegoId}:${usuarioId}`;
    this.solicitudesEnviadas.update((lista) => lista.filter((item) => item !== clave));
  }

  etiquetaPlataforma(plataforma: Plataforma): string {
    switch (plataforma) {
      case 'pc':
        return 'PC';
      case 'playstation':
        return 'PlayStation';
      case 'xbox':
        return 'Xbox';
      case 'nintendo_switch':
        return 'Switch';
      case 'mobile':
        return 'Móvil';
      default:
        return plataforma;
    }
  }

  iconoPlataforma(plataforma: Plataforma): string {
    switch (plataforma) {
      case 'pc':
        return 'bi-pc-display';
      case 'playstation':
        return 'bi-controller';
      case 'xbox':
        return 'bi-xbox';
      case 'nintendo_switch':
        return 'bi-nintendo-switch';
      case 'mobile':
        return 'bi-phone';
      default:
        return 'bi-controller';
    }
  }

  private obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  }

  private sincronizarUsuarioActual(): void {
    if (this.auth.usuarioActual) {
      this.auth.usuarioActual.juegos_activos = [...this.juegosActivos()];
      this.auth.usuarioActual.juegos_pasados = [...this.juegosPasados()];
    }
  }
}
