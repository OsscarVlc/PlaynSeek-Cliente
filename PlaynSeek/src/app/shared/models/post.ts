// ============================================================
// shared/models/post.ts
// Molde de una publicación dentro de un grupo
// ============================================================

import { UsuarioResumen } from './usuario';

export interface Post {
  _id: string; // id interno de Mongo
  usuario_id: string; // id del usuario que escribió el post
  grupo_id: string; // id del grupo donde se publicó
  contenido: string; // el texto del post, obligatorio
  imagenes?: string[]; // URLs de Cloudinary opcional
  fecha: string;
  activo?: boolean; // false = post "eliminado" (soft delete)

  //Campos extra SOLO para el front---
  // autor representa lo que el API devolvería al hacer populate de
  // usuario_id. total_comentarios es un conteo que el back podría
  // calcular, para mostrar 3 comentarios sin cargar todos.
  autor?: UsuarioResumen;
  total_comentarios?: number;
}