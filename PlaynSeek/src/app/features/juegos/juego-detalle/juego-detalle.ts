import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { GameCard } from '@shared/components/game-card/game-card';
import { PlatformBadge } from '@shared/directives/platform-badge';
import { GRUPOS_DEMO } from '@shared/mock/grupos-demo';
import { GrupoVista } from '@shared/models/grupo-vista.model';
import { Juego } from '@shared/models/juego';
import {
  JuegosDemoService,
  JugadorSquad,
  MetadatosJuego,
} from '../services/juegos-demo';

@Component({
  selector: 'app-juego-detalle',
  imports: [RouterLink, PlatformBadge, GameCard],
  templateUrl: './juego-detalle.html',
  styleUrl: './juego-detalle.scss',
})
export class JuegoDetalle implements OnInit {
  private route = inject(ActivatedRoute);
  juegosDemo = inject(JuegosDemoService);
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  readonly juegoId = signal<string>('j1');
  readonly soloConMicrofono = signal<boolean>(false);

  readonly juego = computed<Juego | undefined>(() =>
    this.juegosDemo.obtenerJuegoPorId(this.juegoId())
  );

  readonly meta = computed<MetadatosJuego>(() =>
    this.juegosDemo.obtenerMetadatos(this.juegoId())
  );

  readonly jugadoresSquad = computed<JugadorSquad[]>(() => {
    const lista = this.juegosDemo.obtenerJugadoresParaJuego(this.juegoId());
    if (this.soloConMicrofono()) {
      return lista.filter((j) => j.microfono);
    }
    return lista;
  });

  readonly gruposRelacionados = computed<GrupoVista[]>(() => GRUPOS_DEMO);

  readonly juegosSimilares = computed<Juego[]>(() => {
    const actual = this.juego();
    const todos = this.juegosDemo.juegos().filter((j) => j._id !== this.juegoId());
    if (!actual) {
      return todos.slice(0, 4);
    }
    const conGeneroComun = todos.filter((j) =>
      j.generos.some((g) => actual.generos.includes(g))
    );
    return (conGeneroComun.length >= 2 ? conGeneroComun : todos).slice(0, 4);
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.juegoId.set(id);
      }
    });
  }

  alternarJugando(juego: Juego): void {
    if (this.juegosDemo.estaJugandoActualmente(juego._id)) {
      this.confirmar.pedir(
        `¿Seguro que deseas quitar "${juego.titulo}" de tus juegos activos? Dejarás de aparecer como jugador activo en este título.`,
        () => {
          this.juegosDemo.quitarJuegoActivo(juego._id);
          this.notificacion.info(
            `Quitaste "${juego.titulo}" de tu rotación actual.`
          );
        },
        'Quitar de juegos activos'
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
        `Activaste "Buscando squad" para ${juego.titulo}.`
      );
    } else {
      this.notificacion.info(
        `Desactivaste "Buscando squad" para ${juego.titulo}.`
      );
    }
  }

  moverAJugadosAntes(juego: Juego): void {
    if (this.juegosDemo.fueJugadoAntes(juego._id)) {
      this.confirmar.pedir(
        `¿Deseas eliminar "${juego.titulo}" de tu lista de juegos jugados anteriormente?`,
        () => {
          this.juegosDemo.quitarDeJugadosAntes(juego._id);
          this.notificacion.info(
            `Se quitó "${juego.titulo}" de tu historial.`
          );
        },
        'Quitar del historial'
      );
      return;
    }

    this.confirmar.pedir(
      `¿Quieres marcar "${juego.titulo}" como jugado anteriormente?`,
      () => {
        this.juegosDemo.marcarComoJugadoAntes(juego._id);
        this.notificacion.exito(
          `"${juego.titulo}" fue guardado en tus juegos pasados.`
        );
      },
      'Guardar en jugados antes'
    );
  }

  conectarJugador(juego: Juego, jugador: JugadorSquad): void {
    if (jugador.conectado) {
      this.confirmar.pedir(
        `¿Deseas retirar la solicitud enviada a ${jugador.nombre}?`,
        () => {
          this.juegosDemo.cancelarSolicitudSquad(juego._id, jugador.id);
          this.notificacion.advertencia(
            `Solicitud a ${jugador.nombre} cancelada.`
          );
        },
        'Cancelar solicitud'
      );
      return;
    }

    this.juegosDemo.enviarSolicitudSquad(juego._id, jugador.id);
    this.notificacion.exito(
      `Solicitud de conexión enviada a ${jugador.nombre}.`
    );
  }
}
