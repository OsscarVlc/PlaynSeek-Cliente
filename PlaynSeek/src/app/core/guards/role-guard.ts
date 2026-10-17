// ============================================================
// core/guards/role-guard.ts
// Protege las rutas que solo ciertos roles pueden ver
// ============================================================

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Rol } from '@shared/models/usuario';

// este guard recibe "route"
//  la ruta a la que se intenta entrar

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  // route.data es un objeto que cada ruta puede llenar con lo que quiera
  //  Aqui esperamos que traiga  la lista de roles permitidos. 
  const rolesPermitidos = route.data['roles'] as Rol[];

  // Si el rol esta en la lista , lo dejamos pasar
  if (auth.tieneRol(rolesPermitidos)) {
    return true;
  }

  // Si no, se manda a la pantalla de acceso denegado.
  return router.createUrlTree(['/403']);
};