// ============================================================
// features/moderacion/moderacion.routes.ts
// Rutas de la sección de moderacion
// Este archivo es de Oscar
// ============================================================

import { Routes } from '@angular/router';

import { ReportesLista } from './reportes-lista/reportes-lista';

export const MODERACION_ROUTES: Routes = [
  // /moderacion redirige a /moderacion/reportes 
  { path: '', redirectTo: 'reportes', pathMatch: 'full' },

  // /moderacion/reportes: la tabla de reportes pendientes y resueltos
  { path: 'reportes', component: ReportesLista },
];