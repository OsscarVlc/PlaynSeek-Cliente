import { Component, inject } from '@angular/core';

import { Notification } from '@core/services/notification';
import { Confirm } from '@core/services/confirm';
import { GameCard } from '@shared/components/game-card/game-card';
import { JUEGOS_MOCK } from '@shared/mock/juegos.mock';
import { UserCard } from '@shared/components/user-card/user-card';
import { USUARIOS_MOCK } from '@shared/mock/usuarios.mock';

@Component({
  selector: 'app-dashboard',
  imports: [GameCard,UserCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  // Los juegos de prueba, para que la plantilla pueda recorrerlos
  juegos = JUEGOS_MOCK;
  usuarios= USUARIOS_MOCK;

  probarEliminar(): void {
    this.confirmar.pedir('¿Deseas eliminar este registro?', () => {
      this.notificacion.exito('Registro eliminado correctamente');
    });
  }
}