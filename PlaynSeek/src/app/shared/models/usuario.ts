// ============================================================
// shared/models/usuario.ts
// molde de un usuario en el front
// Los valores coinciden con los del back 
// ============================================================



// Guardamos cada lista como un arreglo de solo lectura "as const"
//de est amanera TypeScript sabe que los elementos son esos textos exactos y no cualquier string.
export const SEXOS = ['masculino', 'femenino', 'otro'] as const;

// De ese arreglo sacamos el tipo: "cualquier elemento de SEXOS"
// Resultado: Sexo solo puede ser 'masculino' | 'femenino' | 'otro'
export type Sexo = (typeof SEXOS)[number];

export const MODOS_DE_JUEGO = [
  'casual',
  'competitivo',
  'agresivo',
  'estrategico',
  'cooperativo',
  'explorador',
  'apoyo',
  'rolero',
  'completista',
  'tryhard',
] as const;
export type ModoDeJuego = (typeof MODOS_DE_JUEGO)[number];

//  idiomas llevan acentos porque así se guardan en Mongo
export const IDIOMAS = [
  'español',
  'inglés',
  'portugués',
  'francés',
  'alemán',
  'italiano',
  'japonés',
  'coreano',
  'chino',
  'ruso',
  'árabe',
  'hindi',
] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const PLATAFORMAS = ['pc', 'playstation', 'xbox', 'nintendo_switch', 'mobile'] as const;
export type Plataforma = (typeof PLATAFORMAS)[number];

// en el back el enum se llama ADMIN, USER y MOD
export const ROLES = ['administrador', 'usuario', 'moderador'] as const;
export type Rol = (typeof ROLES)[number];

// ------------------------------------------------------------
// OBJETOS ANIDADOS (viven dentro del usuario)
// ------------------------------------------------------------



// Una plataforma que juega el usuario, con su nombre de usuario
// en esa plataforma (por ejemplo su gamertag de Xbox).
export interface PlataformaUsuario {
  nombre: Plataforma;
  gamertag: string;
}

// Un juego que el usuario está jugando ahora.
// juego_id es un string porque en el JSON los ObjectId de Mongo
// llegan como texto. busca_equipo indica si quiere compañeros
// para ese juego. desde es la fecha en que empezó a jugarlo.
export interface JuegoActivo {
  juego_id: string;
  busca_equipo: boolean;
  desde: string; // en el JSON las fechas llegan como texto ISO, no como Date
}


// ------------------------------------------------------------
// USUARIO COMPLETO
// ------------------------------------------------------------
// Los campos con "?" son opcionales ya que  el usuario los llena después del registro
export interface Usuario {
  _id: string; // id que genera Mongo
  nombre: string;
  correo: string;
  rol: Rol;
  isActive: boolean; // false = cuenta desactivada (soft delete)
  correo_confirmado: boolean; // sin confirmar, el back no deja iniciar sesión
  edad?: number;
  sexo?: Sexo;
  foto_perfil?: string; // URL de Cloudinary
  zona_horaria?: string;
  horario_juego?: string[]; // en qué momentos del día juega
  disponibilidad?: string[]; // qué días está disponible
  idiomas?: Idioma[]; // lista de idiomas que habla
  modo_juego?: ModoDeJuego[]; // cómo le gusta jugar
  plataformas?: PlataformaUsuario[];
  juegos_activos?: JuegoActivo[];
  juegos_pasados?: string[]; // ids de juegos que ya jugó
}

// ------------------------------------------------------------
// USUARIO RESUMIDO
// ------------------------------------------------------------
// En un post, un comentario o la lista de integrantes de un grupo
// solo necesitamos mostrar nombre y foto, no los 15 campos.
// Esto es lo que el API devolvería al hacer populate de un usuario.
export interface UsuarioResumen {
  _id: string;
  nombre: string;
  foto_perfil?: string;
}