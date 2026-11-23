// ============================================================
// features/grupos/subir-portada/subir-portada.ts
// Componente de subida, visualización, descarga y eliminación
// de la portada de un grupo (Archivos - Entrega 4).
// Autor: Andrés Huerta
// ============================================================

import { Component, OnDestroy, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';

import { Confirm } from '@core/services/confirm';
import { EventoSubidaPortada, GrupoApi } from '@core/services/grupo-api';
import { Notification } from '@core/services/notification';
import { Grupo } from '@shared/models/grupo';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

@Component({
  selector: 'app-subir-portada',
  standalone: true,
  templateUrl: './subir-portada.html',
  styleUrl: './subir-portada.scss',
})
export class SubirPortada implements OnDestroy {
  private readonly grupoApi = inject(GrupoApi);
  private readonly confirmar = inject(Confirm);
  private readonly notificacion = inject(Notification);

  // Parámetros de entrada
  readonly grupoId = input.required<string>();
  readonly imagenActual = input<string | null | undefined>(null);
  readonly puedeEditar = input<boolean>(false);

  // Eventos de salida
  readonly portadaActualizada = output<Grupo>();
  readonly portadaEliminada = output<void>();
  readonly cerrar = output<void>();

  // Estado del archivo y validaciones
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly vistaPrevia = signal<string | null>(null);
  readonly tamanoFormateado = signal<string>('');
  readonly mensajeError = signal<string>('');

  // Estados de proceso
  readonly arrastrandoSobre = signal<boolean>(false);
  readonly subiendo = signal<boolean>(false);
  readonly porcentajeProgreso = signal<number>(0);
  readonly eliminando = signal<boolean>(false);

  private subscripcionSubida?: Subscription;

  ngOnDestroy(): void {
    if (this.subscripcionSubida) {
      this.subscripcionSubida.unsubscribe();
    }
  }

  // --- Selección y Validación de Archivo ---

  onDragOver(evento: DragEvent): void {
    evento.preventDefault();
    evento.stopPropagation();
    if (!this.subiendo()) {
      this.arrastrandoSobre.set(true);
    }
  }

  onDragLeave(evento: DragEvent): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.arrastrandoSobre.set(false);
  }

  onDrop(evento: DragEvent): void {
    evento.preventDefault();
    evento.stopPropagation();
    this.arrastrandoSobre.set(false);

    if (this.subiendo()) return;

    const archivos = evento.dataTransfer?.files;
    if (archivos && archivos.length > 0) {
      this.procesarArchivo(archivos[0]);
    }
  }

  onFileSelected(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  procesarArchivo(archivo: File): void {
    this.mensajeError.set('');

    // Validación de tipo MIME
    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      this.mensajeError.set('Formato no permitido. Solo se aceptan imágenes JPG, PNG o WebP.');
      this.archivoSeleccionado.set(null);
      this.vistaPrevia.set(null);
      this.notificacion.error('Formato no permitido. Solo JPG, PNG o WebP.');
      return;
    }

    // Validación de tamaño máximo (5 MB)
    if (archivo.size > TAMANO_MAX_BYTES) {
      const megas = (archivo.size / (1024 * 1024)).toFixed(2);
      this.mensajeError.set(`El archivo excede el tamaño máximo permitido de 5 MB (${megas} MB).`);
      this.archivoSeleccionado.set(null);
      this.vistaPrevia.set(null);
      this.notificacion.error('El archivo excede el tamaño máximo de 5 MB.');
      return;
    }

    // Archivo válido: generar vista previa
    this.archivoSeleccionado.set(archivo);
    this.tamanoFormateado.set((archivo.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = () => {
      this.vistaPrevia.set(reader.result as string);
    };
    reader.readAsDataURL(archivo);
  }

  limpiarSeleccion(): void {
    this.archivoSeleccionado.set(null);
    this.vistaPrevia.set(null);
    this.tamanoFormateado.set('');
    this.mensajeError.set('');
  }

  // --- Subida con Progreso y Cancelación ---

  subir(): void {
    const archivo = this.archivoSeleccionado();
    if (!archivo || this.subiendo()) return;

    this.subiendo.set(true);
    this.porcentajeProgreso.set(0);
    this.mensajeError.set('');

    this.subscripcionSubida = this.grupoApi
      .subirPortada(this.grupoId(), archivo)
      .subscribe({
        next: (evento: EventoSubidaPortada) => {
          if (evento.tipo === 'progreso') {
            this.porcentajeProgreso.set(evento.porcentaje);
          } else if (evento.tipo === 'completado') {
            this.subiendo.set(false);
            this.porcentajeProgreso.set(100);
            this.notificacion.exito('Portada actualizada correctamente');
            this.portadaActualizada.emit(evento.grupo);
            this.limpiarSeleccion();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.subiendo.set(false);
          this.porcentajeProgreso.set(0);

          if (err.status === 403) {
            this.mensajeError.set('No tienes permisos de líder o administrador para cambiar la portada.');
            this.notificacion.error('Acceso denegado (403)');
          } else {
            const mensaje = err.error?.message || 'Error al subir la portada. Inténtalo de nuevo.';
            this.mensajeError.set(mensaje);
            this.notificacion.error(mensaje);
          }
        },
      });
  }

  cancelarSubida(): void {
    if (this.subscripcionSubida) {
      this.subscripcionSubida.unsubscribe();
      this.subscripcionSubida = undefined;
    }
    this.subiendo.set(false);
    this.porcentajeProgreso.set(0);
    this.notificacion.info('Subida de portada cancelada');
  }

  // --- Eliminación con Confirmación ---

  async eliminarPortada(): Promise<void> {
    const confirmado = await this.confirmar.pedirAsync(
      '¿Estás seguro de que deseas eliminar la portada del grupo? Volverá al degradado predeterminado.',
      'Eliminar portada',
    );

    if (!confirmado) return;

    this.eliminando.set(true);
    this.grupoApi.eliminarPortada(this.grupoId()).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.notificacion.exito('Portada eliminada correctamente');
        this.portadaEliminada.emit();
        this.limpiarSeleccion();
      },
      error: (err: HttpErrorResponse) => {
        this.eliminando.set(false);
        if (err.status === 403) {
          this.notificacion.error('No tienes permisos para eliminar la portada (403)');
        } else {
          this.notificacion.error(err.error?.message || 'Error al eliminar la portada');
        }
      },
    });
  }

  // --- Visualización y Descarga ---

  abrirEnNuevaPestana(): void {
    const url = this.imagenActual();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  descargar(): void {
    const url = this.imagenActual();
    if (!url) return;

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `portada-grupo-${this.grupoId()}.jpg`;
    enlace.target = '_blank';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  }
}
