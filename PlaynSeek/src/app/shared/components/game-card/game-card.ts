// ============================================================
// shared/components/game-card/game-card.ts
// Tarjeta de un juego
// ============================================================

import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PlatformBadge } from '@shared/directives/platform-badge';
import { Juego } from '@shared/models/juego';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink,PlatformBadge],
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  // @Input marca la propiedad como dato que llega de afuera
  @Input() juego!: Juego;
}