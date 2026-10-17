// ============================================================
// core/services/confirm.ts
// Maneja el mensaje de confirmación
// ============================================================

import { Injectable, signal } from '@angular/core';

// La forma de una confirmación que está esperando respuesta.
// alConfirmar es la función que se ejecuta solo si el usuario presiona el botón de confirmar
export interface ConfirmacionPendiente {
  titulo: string;
  mensaje: string;
  alConfirmar: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class Confirm {
  // Guarda la confirmación activa. Si es null, no hay ninguna
  // abierta y el modal no se muestra
  // Es un signal para que el modal se actualice solo cuando cambia.
  pendiente = signal<ConfirmacionPendiente | null>(null);

  // Abre el modal
  // titulo tiene un valor por defecto: si no lo pasan, usa ese.
  pedir(mensaje: string, alConfirmar: () => void, titulo: string = 'Confirmar acción'): void {
    this.pendiente.set({
      titulo: titulo,
      mensaje: mensaje,
      alConfirmar: alConfirmar,
    });
  }

  // El usuario presionó "Sí": ejecutamos la función que nos dio la
  // pantalla y cerramos el modal.
  aceptar(): void {
    const actual = this.pendiente();
    if (actual !== null) {
      actual.alConfirmar();
    }
    this.pendiente.set(null);
  }

  // El usuario presionó "No": solo cerramos el modal, sin ejecutar nada.
  cancelar(): void {
    this.pendiente.set(null);
  }
}