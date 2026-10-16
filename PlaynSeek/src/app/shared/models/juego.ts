// ============================================================
// shared/models/juego.ts
// Molde de un juego del catálogo
// ============================================================


import { Plataforma } from './usuario';

export interface Juego {
  _id: string; // id interno de Mongo (el que usamos en la ruta /juegos/:id)
  titulo: string;
  imagen?: string; // opcional: en el back no es obligatoria, así que una card debe poder mostrarse sin portada
  generos: string[]; // texto libre que viene de RAWG, por ejemplo ['Acción', 'RPG']
  plataformas: Plataforma[]; // solo valores válidos: 'pc', 'xbox', etc.
  id_api: number; // id del juego en RAWG, único para no importar duplicados
  activo?: boolean; // false = "eliminado" (soft delete), un admin puede reactivarlo
}