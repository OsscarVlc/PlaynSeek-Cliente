// ============================================================
// shared/mock/juegos.mock.ts
// Juegos de prueba para el catálogo, el detalle y el perfil.

// ============================================================

import { Juego } from '@shared/models/juego';

export const JUEGOS_MOCK: Juego[] = [
  {
    _id: 'j1',
    titulo: 'The Legend of Zelda: Breath of the Wild',
    imagen: 'https://placehold.co/400x500?text=Zelda',
    generos: ['Aventura', 'Acción'],
    plataformas: ['nintendo_switch'],
    id_api: 22511,
    activo: true,
  },
  {
    _id: 'j2',
    titulo: 'Counter-Strike 2',
    imagen: 'https://placehold.co/400x500?text=CS2',
    generos: ['Shooter', 'Acción'],
    plataformas: ['pc'],
    id_api: 58175,
    activo: true,
  },
  {
    _id: 'j3',
    titulo: 'The Witcher 3: Wild Hunt',
    imagen: 'https://placehold.co/400x500?text=Witcher+3',
    generos: ['RPG', 'Aventura'],
    plataformas: ['pc', 'playstation', 'xbox', 'nintendo_switch'],
    id_api: 3328,
    activo: true,
  },
  {
    _id: 'j4',
    titulo: 'Mario Kart 8 Deluxe',
    imagen: 'https://placehold.co/400x500?text=Mario+Kart',
    generos: ['Carreras', 'Arcade'],
    plataformas: ['nintendo_switch'],
    id_api: 41494,
    activo: true,
  },
  {
    _id: 'j5',
    titulo: 'Minecraft',
    imagen: 'https://placehold.co/400x500?text=Minecraft',
    generos: ['Sandbox', 'Aventura'],
    plataformas: ['pc', 'playstation', 'xbox', 'nintendo_switch', 'mobile'],
    id_api: 22509,
    activo: true,
  },
  {
    _id: 'j6',
    titulo: 'Overwatch 2',
    imagen: 'https://placehold.co/400x500?text=Overwatch+2',
    generos: ['Shooter', 'Estrategia'],
    plataformas: ['pc', 'playstation', 'xbox', 'nintendo_switch'],
    id_api: 515024,
    activo: true,
  },
  {
    _id: 'j7',
    titulo: 'Rocket League',
    imagen: 'https://placehold.co/400x500?text=Rocket+League',
    generos: ['Deportes', 'Carreras'],
    plataformas: ['pc', 'playstation', 'xbox', 'nintendo_switch'],
    id_api: 3272,
    activo: true,
  },
  {
    // Sin imagen a propósito: la game-card debe mostrar algo de
    // respaldo cuando el juego no trae portada.
    _id: 'j8',
    titulo: 'Genshin Impact',
    generos: ['RPG', 'Aventura'],
    plataformas: ['pc', 'playstation', 'mobile'],
    id_api: 452642,
    activo: true,
  },
];