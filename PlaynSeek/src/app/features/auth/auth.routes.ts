// ============================================================
// features/auth/auth.routes.ts
// Rutas de la sección de autenticación (login, registro, etc.).
// Este archivo es de Andrés por si agrega una pantalla de auth, solo toca este archivo.
// ============================================================

import { Routes } from '@angular/router';

// Importamos cada componente (la clase que exporta su archivo .ts).
// Ya no usamos import() dentro de la ruta: se importan aquí arriba.
import { Login } from './login/login';
import { Register } from './register/register';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ConfirmEmail } from './confirm-email/confirm-email';

// Routes es el tipo de un arreglo de rutas
// SE exporta en mayusculas para que app.routes.ts lo pueda importar.
export const AUTH_ROUTES: Routes = [
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'olvide-contrasena', component: ForgotPassword },
  { path: 'confirmar-correo', component: ConfirmEmail },
];