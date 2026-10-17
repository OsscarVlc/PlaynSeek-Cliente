// ============================================================
// core/guards/auth-guard.ts
// Protege las rutas del portal y solo deja pasar a quien tenga sesion iniciada
// Si no la tiene lo manda a /login.
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '@core/services/auth';

// CanActivateFn es el tipo de una función guard
// Angular la llama cada vez que alguien intenta entrar a una ruta que la use
export const authGuard: CanActivateFn = () => {

  //Se usa   inject() pirque un guard es una funcion no una clase y por eos no se usa constructor.
  const auth = inject(Auth);
  const router = inject(Router);

  // Si hay sesion devolvemos true y se puede navegar
  if (auth.estaAutenticado()) {
    return true;
  }

  // Si no, devolvemos redirección a /login
  // createUrlTree arma esa URL de destino.
  return router.createUrlTree(['/login']);
};