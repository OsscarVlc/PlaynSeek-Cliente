import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  JugadorMatch,
  MatchDemo,
} from '../services/match-demo';
import { ChatDemo } from '../../chat/services/chat-demo';

@Component({
  selector: 'app-recomendaciones',
  imports: [RouterLink],
  templateUrl: './recomendaciones.html',
  styleUrl: './recomendaciones.scss',
})
export class Recomendaciones {
  private readonly matchService = inject(MatchDemo);
  private readonly chatService = inject(ChatDemo);
  private readonly router = inject(Router);

  readonly filtroJuego = signal('');
  readonly filtroIdioma = signal('');
  readonly aviso = signal('');

  readonly juegos = [
    'Valorant',
    'Apex Legends',
    'Minecraft',
    'Stardew Valley',
    'Rocket League',
  ];

  readonly idiomas = ['Español', 'Inglés'];

  readonly recibidas = this.matchService.recibidas;
  readonly matches = this.matchService.matches;

  readonly candidatos = computed(() =>
    this.matchService.recomendaciones().filter((jugador) => {
      const coincideJuego =
        !this.filtroJuego() || jugador.juegos.includes(this.filtroJuego());

      const coincideIdioma =
        !this.filtroIdioma() || jugador.idiomas.includes(this.filtroIdioma());

      return coincideJuego && coincideIdioma;
    }),
  );

  readonly candidatoActual = computed(() => this.candidatos()[0]);

  pasar(jugador: JugadorMatch): void {
    this.matchService.pasar(jugador.id);
    this.aviso.set(`Pasaste el perfil de ${jugador.nombre}.`);
  }

  conectar(jugador: JugadorMatch): void {
    if (this.matchService.enviarSolicitud(jugador.id)) {
      this.aviso.set(`Solicitud enviada a ${jugador.nombre} en esta demostración.`);
    }
  }

  responder(solicitudId: string, aceptar: boolean): void {
    if (this.matchService.responderSolicitud(solicitudId, aceptar)) {
      this.aviso.set(
        aceptar
          ? '¡Nuevo match! Ya aparece en Mis matches.'
          : 'Solicitud rechazada.',
      );
    }
  }

  mostrarDeNuevo(): void {
    this.filtroJuego.set('');
    this.filtroIdioma.set('');
    this.matchService.restablecerDescartados();
  }

  abrirChat(jugador: JugadorMatch): void {
    this.chatService.asegurarConversacion({
      usuarioId: jugador.id,
      nombre: jugador.nombre,
      iniciales: jugador.iniciales,
      juego: jugador.juegos.join(' · '),
    });

    void this.router.navigate(['/chat', jugador.id]);
  }
}