// ============================================================
// features/admin/admin.routes.ts
// Rutas de la sección de administración
// Este archivo es de Oscar
// ============================================================

import { Routes } from '@angular/router';

import { UsuariosLista } from './usuarios-lista/usuarios-lista';

export const ADMIN_ROUTES: Routes = [
  // /admin solo redirige a /admin/usuarios, que por ahora es la
  // única pantalla de la sección. Así, si después se agrega otra
  // pantalla de admin, /admin ya tiene una entrada definida
  
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },

  // /admin/usuarios: la tabla de usuarios con el cambio de rol
  { path: 'usuarios', component: UsuariosLista },
];