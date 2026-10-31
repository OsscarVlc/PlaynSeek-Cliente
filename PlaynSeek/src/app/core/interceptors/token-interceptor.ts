// ============================================================
// core/interceptors/token-interceptor.ts
// Agrega el token de sesión a cada petición que sale hacia nuestra API,
// en el encabezado Authorization
// ============================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { Auth } from '@core/services/auth';
import { environment } from '@env/environment';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.obtenerToken();

  // Solo mandamos el token a nuestra propia API, nunca a otros servicios
  const esNuestraApi = req.url.startsWith(environment.apiUrl);

  if (token !== null && esNuestraApi) {
    // clone() crea una copia de la peticion con el encabezado agregado
    const copia = req.clone({
      setHeaders: { Authorization: 'Bearer ' + token },
    });
    return next(copia);
  }

  // Sin token  la peticion sale como estaba
  return next(req);
};