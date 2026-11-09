// ============================================================
// core/guards/auth-guard.ts
// Protege las rutas del portal y solo deja pasar a quien tenga sesion iniciada
// Si no la tiene lo manda a /login.
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '@core/services/auth';

// route es la ruta que se está evaluando
// state es el estado completo de la navegación
// state.url es la URL a la que el usuario intenta entrar
export const authGuard: CanActivateFn = (route, state) => {

  //Se usa   inject() pirque un guard es una funcion no una clase y por eos no se usa constructor.
  const auth = inject(Auth);
  const router = inject(Router);

  // Si hay sesion devolvemos true y se puede navegar
  if (auth.estaAutenticado()) {
    return true;
  }

  // /login?returnUrl=/grupos/123
  // Si no hay sesion devolvemos un UrlTree que redirige al login y le pasa la ruta a la que intentaba entrar
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }, 
  });
  
};