// ============================================================
// features/chat/chat.routes.ts
// Rutas del chat privado
// Este archivo es de Sergio
// ============================================================

import { Routes } from '@angular/router';

import { ChatPrivado } from './chat-privado/chat-privado';

export const CHAT_ROUTES: Routes = [
  // /chat/abc12   es la conversación privada con otro usuario

  // ":id" es el id del usuario con el que se chatea (tu match),
  // igual que en el back, donde la sala privada se arma con los
  // dos ids de los usuarios.
  { path: ':id', component: ChatPrivado },
];