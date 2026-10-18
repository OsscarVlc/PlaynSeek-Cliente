import { GrupoVista } from '../models/grupo-vista.model';

export const USUARIO_GRUPOS_DEMO_ID = 'usuario-sergio';

export const GRUPOS_DEMO: GrupoVista[] = [
  {
    id: 'valorant-nocturno',
    nombre: 'Valorant Nocturno',
    descripcion:
      'Una partida más antes de dormir. Buscamos buena comunicación y ganas de jugar en equipo.',
    juego: 'Valorant',
    liderId: 'usuario-oscar',
    imagen: null,
    tono: 'morado',
    integrantes: [
      { id: 'usuario-oscar', nombre: 'Oscar', iniciales: 'OV' },
      { id: 'usuario-sergio', nombre: 'Sergio', iniciales: 'SO' },
      { id: 'usuario-dante', nombre: 'Dante', iniciales: 'DA' },
    ],
  },
  {
    id: 'ranked-sin-drama',
    nombre: 'Ranked sin drama',
    descripcion:
      'Subimos juntos, aprendemos juntos. Aquí los errores se corrigen con paciencia.',
    juego: 'Apex Legends',
    liderId: 'usuario-luna',
    imagen: null,
    tono: 'verde',
    integrantes: [
      { id: 'usuario-luna', nombre: 'Luna', iniciales: 'LU' },
      { id: 'usuario-nova', nombre: 'Nova', iniciales: 'NV' },
    ],
  },
  {
    id: 'cooperativo-cafe',
    nombre: 'Cooperativo y café',
    descripcion:
      'Aventuras cooperativas, nuevos amigos y cero presión por quedar en primer lugar.',
    juego: 'Multijuego',
    liderId: 'usuario-sergio',
    imagen: null,
    tono: 'rosa',
    integrantes: [
      { id: 'usuario-sergio', nombre: 'Sergio', iniciales: 'SO' },
      { id: 'usuario-luna', nombre: 'Luna', iniciales: 'LU' },
      { id: 'usuario-alex', nombre: 'Alex', iniciales: 'AL' },
    ],
  },
];