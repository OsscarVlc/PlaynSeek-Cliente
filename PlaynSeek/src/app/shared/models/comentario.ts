// ============================================================
// shared/models/comentario.ts
// Molde de un comentario dentro de un post
// ============================================================

import { UsuarioResumen } from './usuario';

export interface Comentario {
  _id: string; // id interno de Mongo
  post_id: string; // id del post al que pertenece el comentario
  usuario_id: string; // id del usuario que comentó
  contenido: string; // el texto del comentario
  fecha: string; // en el JSON las fechas llegan como texto ISO

  // Campo extra  para el front ---
  // Representa lo que el API devolvería al hacer populate de
  // usuario_id, para pintar el nombre y la foto sin buscarlos aparte.
  autor?: UsuarioResumen;
}