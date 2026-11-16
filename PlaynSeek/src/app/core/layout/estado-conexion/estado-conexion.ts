// ============================================================
// core/layout/estado-conexion/estado-conexion.ts
// Indicador visible del estado de la conexión en tiempo real
// ============================================================

import { Component, computed, inject } from '@angular/core';

import { Realtime } from '@core/services/realtime';

@Component({
  selector: 'app-estado-conexion',
  templateUrl: './estado-conexion.html',
  styleUrl: './estado-conexion.scss',
})
export class EstadoConexion {
  private realtime = inject(Realtime);

  readonly estado = this.realtime.estado;

  // Texto que se muestra junto al punto de color
  //se utiliza computed para que se actualice automáticamente cuando cambia el estado de la conexión
  
  readonly texto = computed(() => {
    switch (this.estado()) {
      case 'conectado':
        return 'En línea';
      case 'conectando':
        return 'Conectando...';
      case 'reconectando':
        return 'Reconectando...';
      default:
        return 'Sin conexión';
    }
  });
}