// ============================================================
// features/moderacion/reportes-lista/reportes-lista.ts
// Tabla de reportes para moderadores y administradores
// ============================================================

import { Component, inject } from '@angular/core';
import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { EstadoReporte, MotivoReporte, Reporte } from '@shared/models/reporte';
import { REPORTES_MOCK } from '../reportes.mock';

@Component({
  selector: 'app-reportes-lista',
  templateUrl: './reportes-lista.html',
  styleUrl: './reportes-lista.scss',
})
export class ReportesLista {
  private notificacion = inject(Notification);
  private confirmar = inject(Confirm);

  reportes: Reporte[] = REPORTES_MOCK;


  contarPorEstado(estado: EstadoReporte): number {
    return this.reportes.filter((reporte) => reporte.estado === estado).length;
  }

  // Convierte el valor del back en un texto legible para la tabla
  etiquetaMotivo(motivo: MotivoReporte): string {
    switch (motivo) {
      case 'spam':
        return 'Spam';
      case 'acoso':
        return 'Acoso';
      case 'contenido_inapropiado':
        return 'Contenido inapropiado';
      default:
        return 'Otro';
    }
  }

  // Dice dónde ocurrió lo reportado
  // Va de lo mas especifico a lo mas general
  contexto(reporte: Reporte): string {
    if (reporte.comentario_id) {
      return 'Comentario en un post';
    }
    if (reporte.post_id) {
      return 'Post de un grupo';
    }
    if (reporte.grupo_id) {
      return 'Grupo';
    }
    return 'Perfil de usuario';
  }

  // Convierte la fecha 
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // Ejemplo de CONFIRMACION y NOTIFICACION
  resolver(reporte: Reporte): void {
    const nombre = reporte.reportado ? reporte.reportado.nombre : 'el usuario';

    this.confirmar.pedir(
      '¿Deseas marcar como resuelto el reporte contra ' + nombre + '?',
      () => {
        this.notificacion.exito('Reporte contra ' + nombre + ' marcado como resuelto');
      },
    );
  }

  // Igual que resolver, pero para descartar el reporte
  rechazar(reporte: Reporte): void {
    const nombre = reporte.reportado ? reporte.reportado.nombre : 'el usuario';

    this.confirmar.pedir('¿Deseas rechazar el reporte contra ' + nombre + '?', () => {
      this.notificacion.info('Reporte contra ' + nombre + ' rechazado');
    });
  }
}