import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Juego } from '@shared/models/juego';
import { RatingBadge } from '../../directives/rating-badge';
import {
  JuegosDemoService,
  JugadorSquad,
  MetadatosJuego,
} from '../../services/juegos-demo';

@Component({
  selector: 'app-juego-preview',
  imports: [RouterLink, RatingBadge],
  templateUrl: './juego-preview.html',
  styleUrl: './juego-preview.scss',
})
export class JuegoPreview {
  juegosDemo = inject(JuegosDemoService);

  @Input({ required: true }) juego!: Juego;
  @Input({ required: true }) meta!: MetadatosJuego;
  @Input({ required: true }) jugadores: JugadorSquad[] = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() alternarJugando = new EventEmitter<Juego>();
  @Output() alternarSquad = new EventEmitter<Juego>();
  @Output() marcarJugadoAntes = new EventEmitter<Juego>();
  @Output() conectar = new EventEmitter<JugadorSquad>();
}
