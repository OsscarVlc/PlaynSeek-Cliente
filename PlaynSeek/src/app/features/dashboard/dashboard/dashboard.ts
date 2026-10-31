// ============================================================
// features/dashboard/dashboard/dashboard.ts
// Pantalla de inicio 
// ============================================================

import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { GameCard } from '@shared/components/game-card/game-card';
import { JUEGOS_MOCK } from '@shared/mock/juegos.mock';
import { USUARIOS_MOCK } from '@shared/mock/usuarios.mock';
import { Juego } from '@shared/models/juego';
import { Usuario } from '@shared/models/usuario';

// Un numero rapido de la parte de arriba
// ruta es a donde lleva al hacer clic 
// icono es el nombre de un icono de bootstrap
interface Estadistica {
  icono: string;
  valor: number;
  texto: string;
  ruta: string;
}

// Una fila de match o de solicitud
//  Solo se guarda el id del usuario
// y buscamos sus datos en los mocks
interface Coincidencia {
  usuarioId: string;
  juego: string;
  porcentaje: number;
  detalle: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, GameCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  auth = inject(Auth);
  private notificacion = inject(Notification);
  private confirmar = inject(Confirm);

  // Los cuatro numeros de arriba
  estadisticas: Estadistica[] = [
    { icono: 'bi-chat-dots', valor: 3, texto: 'Matches', ruta: '/match/mis-matches' },
    { icono: 'bi-envelope', valor: 2, texto: 'Solicitudes', ruta: '/match/solicitudes' },
    { icono: 'bi-people', valor: 4, texto: 'Grupos', ruta: '/grupos' },
    { icono: 'bi-controller', valor: 5, texto: 'Juegos activos', ruta: '/juegos' },
  ];

  // Matches recientes 
  matches: Coincidencia[] = [
    { usuarioId: 'u2', juego: 'Mario Kart 8', porcentaje: 94, detalle: 'Listo para jugar' },
    { usuarioId: 'u3', juego: 'Counter-Strike 2', porcentaje: 91, detalle: 'En partida' },
    { usuarioId: 'u4', juego: 'Overwatch 2', porcentaje: 88, detalle: 'Activo hace 32 min' },
  ];

  // Solicitudes pendientes
  solicitudes: Coincidencia[] = [
    { usuarioId: 'u5', juego: 'Counter-Strike 2', porcentaje: 86, detalle: 'Quiere formar squad' },
    { usuarioId: 'u6', juego: 'Genshin Impact', porcentaje: 82, detalle: 'Quiere formar squad' },
  ];

  // Juegos recomendados
  juegosRecomendados: Juego[] = JUEGOS_MOCK.filter((juego) =>
    ['j1', 'j4', 'j5', 'j8'].includes(juego._id),
  );

  // Primer nombre del usuario para  saludar
  primerNombre(): string {
    const usuario = this.auth.usuarioActual;
    if (usuario === null) {
      return '';
    }
    return usuario.nombre.split(' ')[0];
  }

  // Busca un usuario en los mocks por su id
  usuarioPorId(id: string): Usuario | undefined {
    return USUARIOS_MOCK.find((usuario) => usuario._id === id);
  }

  // NOTIFICACION
  //  avisa que se acepto y No cambia la lista
  aceptar(nombre: string): void {
    this.notificacion.exito('Aceptaste la solicitud de ' + nombre);
  }

  // CONFIRMACIÓN
  //  pregunta antes de rechazar. La función de
  // la segunda posición solo se ejecuta si se presiona "Sí"
  // Tampoco se quita nada de la lista
  rechazar(nombre: string): void {
    this.confirmar.pedir('¿Deseas rechazar la solicitud de ' + nombre + '?', () => {
      this.notificacion.info('Solicitud de ' + nombre + ' rechazada');
    });
  }
}