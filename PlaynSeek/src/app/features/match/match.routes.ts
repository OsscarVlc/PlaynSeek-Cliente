// ============================================================
// features/match/match.routes.ts
// Rutas de la sección de matchmaking
// archivo  de Sergio
// ============================================================

import { Routes } from '@angular/router';

import { Recomendaciones } from './recomendaciones/recomendaciones';
import { Solicitudes } from './solicitudes/solicitudes';
import { MisMatches } from './mis-matches/mis-matches';

export const MATCH_ROUTES: Routes = [
  // Esta ruta no muestra ningún componente,solo redirige

  //redirectTo cambia la URL a otra ruta de la misma seccion
  //Esto porque no tenemos una pantalla match
  
  // pathMatch: 'full' significa "solo si la URL es exactamente vacía".
  { path: '', redirectTo: 'recomendaciones', pathMatch: 'full' },

  { path: 'recomendaciones', component: Recomendaciones },
  { path: 'solicitudes', component: Solicitudes },
  { path: 'mis-matches', component: MisMatches },
];