// ============================================================
// features/perfil/perfil.routes.ts
// Rutas de la sección de perfil
// archivo es de Andrés
// ============================================================

import { Routes } from '@angular/router';

import { PerfilForm } from './perfil-form/perfil-form';

export const PERFIL_ROUTES: Routes = [
  // Una sola pantalla = /perfil muestra el formulario del perfil
  { path: '', component: PerfilForm },
];

//Solo hay una ruta, porque cada usuario edita unicamente su propio perfil