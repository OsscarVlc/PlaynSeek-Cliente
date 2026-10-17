import { Component, inject } from '@angular/core';
import { Notification } from '@core/services/notification';
import { Confirm } from '@core/services/confirm';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  // Simula eliminar: pide confirmación y, si el usuario acepta,
  // solo muestra el aviso. No se borra nada, como pide la actividad.
  probarEliminar(): void {
    this.confirmar.pedir('¿Deseas eliminar este registro?', () => {
      this.notificacion.exito('Registro eliminado correctamente');
    });
  }
}