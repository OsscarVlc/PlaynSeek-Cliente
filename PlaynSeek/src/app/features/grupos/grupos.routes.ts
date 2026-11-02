// ============================================================
// features/grupos/grupos.routes.ts
// Rutas de la sección de grupos
// Archivo de Sergio
// ============================================================

import { Routes } from '@angular/router';

import { GruposLista } from './grupos-lista/grupos-lista';
import { GrupoForm } from './grupo-form/grupo-form';
import { GrupoDetalle } from './grupo-detalle/grupo-detalle';
import { salidaFormGuard } from '@core/guards/salida-form.guard';

export const GRUPOS_ROUTES: Routes = [
  // path vacio porque es la raíz de esta seccion
  { path: '', component: GruposLista },

  // /grupos/nuevo  = formulario para crear un grupo
  { path: 'nuevo', component: GrupoForm, canDeactivate: [salidaFormGuard] },
  
  { path: ':id/editar', component: GrupoForm, canDeactivate: [salidaFormGuard] },

  { path: ':id', component: GrupoDetalle },
];