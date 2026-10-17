// ============================================================
// core/services/notification.ts
// Guarda la lista de avisos (toasts) que se están mostrando
// ============================================================

import { Injectable , signal} from '@angular/core';

// Los tipos de aviso que existen
export type TipoToast = 'exito' | 'error' | 'info' | 'advertencia';

// La forma de un aviso individual
export interface Toast {
  id: number; // para distinguir un aviso de otro y poder cerrarlo
  tipo: TipoToast;
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class Notification {

  //Un signal es un valor con “alarma”. Cuando cambia, avisa a todas las plantillas que lo leen
  // Lista de avisos visibles ahora mismo, guardada en un signal que empieza vacío
  toasts = signal<Toast[]>([]);

  // Contador para darle un id distinto a cada aviso
  private siguienteId = 1;

  // Atajos para que  la pantalla escriba notificacion.exito('Grupo creado')
  // en vez de pasar el tipo cada vez
  exito(mensaje: string): void {
    this.mostrar('exito', mensaje);
  }

  error(mensaje: string): void {
    this.mostrar('error', mensaje);
  }

  info(mensaje: string): void {
    this.mostrar('info', mensaje);
  }

  advertencia(mensaje: string): void {
    this.mostrar('advertencia', mensaje);
  }

  // Quita un aviso de la lista
  //  update recibe la lista actual y devuelve la nueva
  // filter deja solo los avisos cuyo id sea distinto al que queremos quitar
  cerrar(id: number): void {
    this.toasts.update((lista) => lista.filter((toast) => toast.id !== id));
  }

  // Crea el aviso, lo agrega a la lista y programa que se cierre
  // solo a los 4 segundos
  private mostrar(tipo: TipoToast, mensaje: string): void {
    const toast: Toast = {
      id: this.siguienteId,
      tipo: tipo,
      mensaje: mensaje,
    };
    this.siguienteId = this.siguienteId + 1;

    // concat devuelve una lista nueva con el aviso al final. Hay que
    // crear una lista nueva, porque el signal solo se entera del
    // cambio si recibe un valor distinto al anterior.
    this.toasts.update((lista) => lista.concat(toast));

    setTimeout(() => {
      this.cerrar(toast.id);
    }, 4000);
  }
}