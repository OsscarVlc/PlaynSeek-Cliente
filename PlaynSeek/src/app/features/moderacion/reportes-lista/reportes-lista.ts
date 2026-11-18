// ============================================================
// features/moderacion/reportes-lista/reportes-lista.ts
// Tabla de reportes para moderadores y administradores, conectada al back
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { ReporteApi } from '@core/services/reporte-api';
import { EstadoReporte, MotivoReporte, ReporteConUsuarios } from '@shared/models/reporte';
import { UsuarioResumen } from '@shared/models/usuario';

const LIMITE = 10;

interface Conteos {
  total: number;
  pendiente: number;
  resuelto: number;
  rechazado: number;
}

@Component({
  selector: 'app-reportes-lista',
  templateUrl: './reportes-lista.html',
  styleUrl: './reportes-lista.scss',
})
export class ReportesLista implements OnInit {
  private reporteApi = inject(ReporteApi);
  private notificacion = inject(Notification);
  private confirmar = inject(Confirm);

  // Estado de la pantalla 
  readonly reportes = signal<ReporteConUsuarios[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  // id del reporte que se está actualizando para deshabilitar sus botones
  readonly procesandoId = signal<string | null>(null);

  // Filtro y paginación 
  readonly filtro = signal<EstadoReporte | null>(null); // null = todos
  readonly pagina = signal(1);
  readonly totalPaginas = signal(0);

  //  Contadores del resumen 
  readonly conteos = signal<Conteos>({ total: 0, pendiente: 0, resuelto: 0, rechazado: 0 });

  ngOnInit(): void {
    this.cargar();
  }

  // Pide la página actual con el filtro aplicado
  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);

    this.reporteApi.listar(this.pagina(), LIMITE, this.filtro()).subscribe({
      next: (respuesta) => {
        this.reportes.set(respuesta.data);
        this.totalPaginas.set(respuesta.totalPaginas);
        this.cargando.set(false);
        // Los contadores se piden solo si la lista cargó, para no
        // llenar la pantalla de avisos de error repetidos
        this.cargarConteos();
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  //forkJoin es un operador de RxJS que permite combinar múltiples observables en uno solo
  // forkJoin lanza las 4 peticiones a la vez y espera a que TODAS terminen
  private cargarConteos(): void {
    forkJoin({
      total: this.reporteApi.contar(null),
      pendiente: this.reporteApi.contar('pendiente'),
      resuelto: this.reporteApi.contar('resuelto'),
      rechazado: this.reporteApi.contar('rechazado'),
    }).subscribe((conteos) => this.conteos.set(conteos));
  }

  // Clic en una tarjeta del resumen: filtra por ese estado
  filtrar(estado: EstadoReporte | null): void {
    this.filtro.set(estado);
    this.pagina.set(1);
    this.cargar();
  }

  paginaAnterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((valor) => valor - 1);
      this.cargar();
    }
  }

  paginaSiguiente(): void {
    if (this.pagina() < this.totalPaginas()) {
      this.pagina.update((valor) => valor + 1);
      this.cargar();
    }
  }

  // ---------- Acciones ----------

  resolver(reporte: ReporteConUsuarios): void {
    this.cambiarEstado(reporte, 'resuelto', '¿Deseas marcar como resuelto el reporte contra ');
  }

  rechazar(reporte: ReporteConUsuarios): void {
    this.cambiarEstado(reporte, 'rechazado', '¿Deseas rechazar el reporte contra ');
  }

  private cambiarEstado(
    reporte: ReporteConUsuarios,
    estado: EstadoReporte,
    pregunta: string,
  ): void {
    const nombre = this.nombre(reporte.reportado_id);

    this.confirmar.pedir(pregunta + nombre + '?', () => {
      this.procesandoId.set(reporte._id);

      this.reporteApi.cambiarEstado(reporte._id, estado).subscribe({
        next: () => {
          this.notificacion.exito('Reporte contra ' + nombre + ' marcado como ' + estado);
          this.procesandoId.set(null);
          // El PATCH no devuelve los nombres, así que recargamos la lista
          this.cargar();
        },
        // el toast del error ya lo mostró el interceptor
        error: () => this.procesandoId.set(null),
      });
    });
  }

  //  Ayudantes para la plantilla 

  nombre(usuario: UsuarioResumen | null): string {
    return usuario?.nombre ?? 'Usuario eliminado';
  }

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

  // Dónde ocurrió lo reportado, de lo más específico a lo más general
  contexto(reporte: ReporteConUsuarios): string {
    if (reporte.comentario_id) return 'Comentario en un post';
    if (reporte.post_id) return 'Post de un grupo';
    if (reporte.grupo_id) return 'Grupo';
    return 'Perfil de usuario';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}