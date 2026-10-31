// ============================================================
// core/interceptors/error-interceptor.ts
// Atrapa los errores de todas las peticiones HTTP en un solo lugar
// ============================================================

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { Notification } from '@core/services/notification';

// HttpInterceptorFn es el tipo de una funcion interceptora la cual recibe la
// petición (req) y "next", que la manda al siguiente paso hasta llegar al back
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificacion = inject(Notification);

  // next(req) hace la petición y devuelve un flujo con la respuesta.
  // pipe(catchError(...)) lo que nos dice es "si ese flujo termina en error, ejecuta esto"
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensaje = 'Ocurrió un error inesperado';

      if (error.status === 0) {
        // status 0 -> que ni siquiera llegó al servidor:
        mensaje = 'No se pudo conectar con el servidor';
      } else if (error.error && typeof error.error.message === 'string') {
        // nuestro back siempre responde { message: '...' }
        mensaje = error.error.message;
      }

      notificacion.error(mensaje);

      // relanzamos el error para que quien hizo la peticion se entere
      return throwError(() => error);
    }),
  );
};