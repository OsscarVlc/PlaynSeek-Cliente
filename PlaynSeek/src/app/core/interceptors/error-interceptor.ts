// ============================================================
// core/interceptors/error-interceptor.ts
// Atrapa los errores de todas las peticiones HTTP en un solo lugar
// ============================================================

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { Auth } from '@core/services/auth';
import { Notification } from '@core/services/notification';

// Lee el message que siempre responde nuestro back, o usa uno por defecto
function mensajeDelBack(error: HttpErrorResponse, porDefecto: string): string {
  if (error.error && typeof error.error.message === 'string') {
    return error.error.message;
  }
  return porDefecto;
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificacion = inject(Notification);
  const auth = inject(Auth);
  const router = inject(Router);

 return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // no hay conexión con el back 
      if (error.status === 0) {
        notificacion.error('No se pudo conectar con el servidor');
        return throwError(() => error);
      }

      // 401 = no autenticado
      if (error.status === 401) {
        // En el login, un 401 es significa credenciales inválidas o confirma tu
        // correo, lo que hacemos es mostrar el mensaje del back y no cerrar la sesión ni redirigir al login.
        if (req.url.endsWith('/user/login')) {
          notificacion.error(mensajeDelBack(error, 'Credenciales inválidas'));
          return throwError(() => error);
        }

        // En cualquier otra peticion, un 401 significa que la sesión expiró o el token es inválido.
        // Cerramos la sesion y redirigimos al login.
        auth.cerrarSesion();
        notificacion.advertencia('Tu sesión expiró. Inicia sesión de nuevo.');

        // Evitamos un bucle infinito de redirecciones al login si la peticion que fallo es la de obtener el usuario actual
        if (!req.url.endsWith('/user/me')) {
          router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
        }

        return throwError(() => error);
      }

      // 403 = no autorizado, el usuario tiene sesión pero no tiene permiso para hacer esa acción
      if (error.status === 403) {
        notificacion.error(mensajeDelBack(error, 'No tienes permiso para realizar esta acción'));
        return throwError(() => error);
      }

      // ---------- Cualquier otro error ----------
      notificacion.error(mensajeDelBack(error, 'Ocurrió un error inesperado'));
      return throwError(() => error);
    }),
  );
};