// ============================================================
// core/guards/guest-guard.ts
// Protege las vistas de invitado
// solo deja pasar a quien NO tiene sesión.
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '@core/services/auth';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.estaAutenticado()) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};