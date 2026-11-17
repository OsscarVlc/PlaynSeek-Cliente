// ============================================================
// core/services/realtime.ts
// Conexión en tiempo real (Socket.IO) de toda la aplicación.
// ============================================================

import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '@env/environment';

// Estados posibles de la conexión (los muestra el indicador de la navbar)
export type EstadoConexion = 'desconectado' | 'conectando' | 'conectado' | 'reconectando';

@Injectable({
  providedIn: 'root',
})
export class Realtime {
  // La única conexión de la app. null = no hay sesión o se cerró
  private socket: Socket | null = null;

  // Estado de la conexión. Se escribe solo aquí dentro; afuera es de solo lectura.
  private readonly estadoInterno = signal<EstadoConexion>('desconectado');
  readonly estado = this.estadoInterno.asReadonly();

  // Avisa cada vez que la conexión se establece (la primera vez y al reconectar)
  private readonly conexiones = new Subject<void>();

    // ---------- Abrir y cerrar la conexión ----------
  // Abre la conexión enviando el token. El back lo valida en su middleware
  // (socket.handshake.auth.token). Si ya hay una conexión, no abre otra.
  conectar(token: string): void {
    if (this.socket !== null) {
      return;
    }

    this.estadoInterno.set('conectando');

    this.socket = io(environment.socketUrl, {
      auth: { token: token },
      // Reconexión automática: reintenta sin límite, esperando de 1 a 5 segundos
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.registrarEventosDeConexion(this.socket);
  }

  // Cierra la conexión (al cerrar sesión). Al desconectar a propósito,
  // Socket.IO ya no intenta reconectarse.
  desconectar(): void {
    if (this.socket !== null) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.estadoInterno.set('desconectado');
  }

  // ---------- Estado de la conexión ----------

  private registrarEventosDeConexion(socket: Socket): void {
    // Conectó (la primera vez o después de reconectar)
    socket.on('connect', () => {
      this.estadoInterno.set('conectado');
      this.conexiones.next();
    });

    // Se perdió la conexión. socket.active dice si Socket.IO va a
    // reintentar solo (se cayó la red o el servidor) o no (la cerramos
    // nosotros o el servidor nos sacó).
    socket.on('disconnect', () => {
      this.estadoInterno.set(socket.active ? 'reconectando' : 'desconectado');
    });

    // Falló un intento de conexión. Si socket.active es false, el back
    // rechazó el token en su middleware ("No autenticado", "Token inválido"),
    // y reintentar no sirve.
    socket.on('connect_error', () => {
      this.estadoInterno.set(socket.active ? 'reconectando' : 'desconectado');
    });
  }

  // ---------- Usar la conexión desde las vistas ----------

  // Emite cada vez que la conexión está lista: de inmediato si ya está
  // conectada, y otra vez en cada reconexión. La vista lo usa para unirse
  // a su sala y volver a pedir los datos (resincronizar).
  alConectar(): Observable<void> {
    return new Observable<void>((suscriptor) => {
      if (this.estadoInterno() === 'conectado') {
        suscriptor.next();
      }
      const suscripcion = this.conexiones.subscribe(() => suscriptor.next());
      return () => suscripcion.unsubscribe();
    });
  }

  // Escucha un evento del servidor. Al suscribirse se registra el listener
  // y al desuscribirse (al salir de la vista) se quita con socket.off, así
  // los eventos no se duplican al navegar entre vistas.
  escuchar<T>(evento: string): Observable<T> {
    return new Observable<T>((suscriptor) => {
      const socket = this.socket;
      if (socket === null) {
        // sin sesión no hay conexión: el Observable termina sin datos
        suscriptor.complete();
        return;
      }

      const manejador = (datos: T) => suscriptor.next(datos);
      socket.on(evento, manejador);

      // Función de limpieza: se ejecuta al desuscribirse
      return () => {
        socket.off(evento, manejador);
      };
    });
  }

  // Envía un evento al servidor. Devuelve false si no hay conexión, para
  // que la vista muestre un mensaje en lugar de fallar en silencio.
  emitir(evento: string, datos: unknown): boolean {
    if (this.socket === null || this.estadoInterno() !== 'conectado') {
      return false;
    }
    this.socket.emit(evento, datos);
    return true;
  }
}