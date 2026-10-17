// ============================================================
// features/juegos/juegos.routes.ts
// Rutas de la sección de juegos
// Archivo de Andrés
// ============================================================

import { Routes } from '@angular/router';

import { Catalogo } from './catalogo/catalogo';
import { JuegoDetalle } from './juego-detalle/juego-detalle';

export const JUEGOS_ROUTES: Routes = [
  //  /juegos muestra el catálogo completo
  { path: '', component: Catalogo },

  { path: ':id', component: JuegoDetalle },
];