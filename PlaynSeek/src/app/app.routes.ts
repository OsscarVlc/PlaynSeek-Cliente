// ============================================================
// app.routes.ts
// Archivo de Oscar
// ============================================================

import { Routes } from '@angular/router';

// Layouts: los marcos dentro de los que se pintan las pantallas
import { PublicLayout } from '@core/layout/public-layout/public-layout';
import { PortalLayout } from '@core/layout/portal-layout/portal-layout';

// Pantallas que no tienen archivo de rutas propio
import { Landing } from './features/landing/landing/landing';
import { Dashboard } from './features/dashboard/dashboard/dashboard';
import { Forbidden } from './features/errors/forbidden/forbidden';
import { NotFound } from './features/errors/not-found/not-found';

//Guards
import { authGuard } from '@core/guards/auth-guard';
import { roleGuard } from '@core/guards/role-guard';

// Arreglos de rutas de cada seccion de features
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { PERFIL_ROUTES } from './features/perfil/perfil.routes';
import { JUEGOS_ROUTES } from './features/juegos/juegos.routes';
import { GRUPOS_ROUTES } from './features/grupos/grupos.routes';
import { MATCH_ROUTES } from './features/match/match.routes';
import { CHAT_ROUTES } from './features/chat/chat.routes';
import { ADMIN_ROUTES } from './features/admin/admin.routes';
import { MODERACION_ROUTES } from './features/moderacion/moderacion.routes';
import { guestGuard } from '@core/guards/guest-guard';

export const routes: Routes = [
  // ZONA PÚBLICA = se ve sin iniciar sesión
  // PublicLayout es el marco, y sus children son lo que se pinta dentro.
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Landing, pathMatch: 'full' },

      // Esta ruta no tiene componente, solo agrupa 
      // las rutas de auth (login, registro...) quedan colgadas del mismo layout público
      { path: '',canActivate:[guestGuard] ,children: AUTH_ROUTES },
    ],
  },


  // PORTAL: lo que ve el usuario con sesión iniciada
  // PortalLayout trae la navbar
  {
    path: '',
    component: PortalLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      // Cada sección monta su arreglo de rutas bajo un prefijo
      // Por eso dentro de grupos.routes.ts el path '' equivale a /grupos
      { path: 'perfil', children: PERFIL_ROUTES },
      { path: 'juegos', children: JUEGOS_ROUTES },
      { path: 'grupos', children: GRUPOS_ROUTES },
      { path: 'match', children: MATCH_ROUTES },
      { path: 'chat', children: CHAT_ROUTES },
      { path: 'admin', 
        children: ADMIN_ROUTES,
        canActivate: [roleGuard],
        data: {roles: ['administrador']} 
      },
      { path: 'moderacion', 
        children: MODERACION_ROUTES,
        canActivate: [roleGuard],
        data: { roles : ['administrador', 'moderador']} 
      },
    ],
  },


  // PANTALLAS DE ERROR
  { path: '403', component: Forbidden },
  { path: '**', component: NotFound },
];