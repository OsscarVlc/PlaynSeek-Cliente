import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchDemo } from '../services/match-demo';

@Component({
  selector: 'app-solicitudes',
  imports: [RouterLink, DatePipe],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.scss',
})
export class Solicitudes {
  private readonly matchService = inject(MatchDemo);

  readonly recibidas = this.matchService.recibidas;
  readonly enviadas = this.matchService.enviadas;

  readonly tabActual = signal<'recibidas' | 'enviadas'>('recibidas');
  readonly aviso = signal('');

  responder(id: string, aceptar: boolean): void {
    if (this.matchService.responderSolicitud(id, aceptar)) {
      this.aviso.set(
        aceptar
          ? '¡Nuevo match! Puedes encontrarlo en Mis matches.'
          : 'Solicitud rechazada.',
      );
    }
  }

  cancelar(id: string): void {
    this.matchService.cancelarSolicitud(id);
    this.aviso.set('Solicitud cancelada.');
  }
}