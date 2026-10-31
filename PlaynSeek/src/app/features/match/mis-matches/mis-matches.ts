import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { JugadorMatch, MatchDemo } from '../services/match-demo';
import { ChatDemo } from '../../chat/services/chat-demo';

@Component({
  selector: 'app-mis-matches',
  imports: [RouterLink],
  templateUrl: './mis-matches.html',
  styleUrl: './mis-matches.scss',
})
export class MisMatches {
  private readonly matchService = inject(MatchDemo);
  private readonly chatService = inject(ChatDemo);
  private readonly router = inject(Router);

  readonly busqueda = signal('');
  readonly matches = this.matchService.matches;

  readonly matchesVisibles = computed(() => {
    const texto = this.normalizar(this.busqueda());

    return this.matches().filter((jugador) =>
      this.normalizar(`${jugador.nombre} ${jugador.juegos.join(' ')}`)
        .includes(texto),
    );
  });

  abrirChat(jugador: JugadorMatch): void {
    this.chatService.asegurarConversacion({
      usuarioId: jugador.id,
      nombre: jugador.nombre,
      iniciales: jugador.iniciales,
      juego: jugador.juegos.join(' · '),
    });

    void this.router.navigate(['/chat', jugador.id]);
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}