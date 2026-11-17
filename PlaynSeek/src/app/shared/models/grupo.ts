// ============================================================
// shared/models/grupo.ts
// Molde de un grupo de jugadores
// ============================================================

import { UsuarioResumen } from './usuario';

export interface Grupo {
  _id: string; // id interno de Mongo (el que usamos en la ruta /grupos/:id)
  nombre: string;
  descripcion?: string; // opcional: un grupo se puede crear sin descripción
  fecha_creacion: string; // en el JSON llega como texto ISO
  lider_id: string; // id del usuario que creó y administra el grupo
  integrantes?: string[]; // ids de los usuarios que pertenecen al grupo
  activo?: boolean; // false = grupo "eliminado" (soft delete)
  imagen?: string; // URL de la portada en Cloudinary (opcional)

  // --- Campos extra SOLO para el front (la API actual no los devuelve) ---
  lider?: UsuarioResumen;
  integrantes_detalle?: UsuarioResumen[];
}

// Los únicos datos que el usuario puede escribir al crear o editar un
// grupo. El back rechaza con 400 cualquier otro campo en una edición.
export interface DatosGrupo {
  nombre: string;
  descripcion?: string;
}