// ============================================================
// shared/models/grupo.ts
// Molde de un grupo de jugadores
// ============================================================

// Importamos UsuarioResumen para poder mostrar nombre y foto del
// lider y de los integrantes sin cargar el usuario completo.
import { UsuarioResumen } from './usuario';

export interface Grupo {
  _id: string; // id interno de Mongo (el que usamos en la ruta /grupos/:id)
  nombre: string;
  descripcion?: string; // opcional: un grupo se puede crear sin descripción
  fecha_creacion: string; // obligatoria en el back; en el JSON llega como texto ISO
  lider_id: string; // id del usuario que creó y administra el grupo
  integrantes?: string[]; // ids de los usuarios que pertenecen al grupo
  activo?: boolean; // false = grupo "eliminado" (soft delete)

  //Campos extra para el front
  // Cuando el back hace populate, en vez de ids llegan los datos del
  // usuario. Con estos campos, los mocks pueden traer el nombre y la
  // foto ya listos y las vistas no tienen que buscar en otros arreglos.
  lider?: UsuarioResumen;
  integrantes_detalle?: UsuarioResumen[];
}