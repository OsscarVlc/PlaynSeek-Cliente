// ============================================================
// features/landing/landing/landing.ts
// Página de inicio (landing). Tiene el hero, la franja de
// estadísticas, "Cómo funciona", los bloques de funciones, los
// juegos destacados, las comunidades y el footer.
// ============================================================

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GameCard } from '@shared/components/game-card/game-card';
import { JUEGOS_MOCK } from '@shared/mock/juegos.mock';
import { Juego } from '@shared/models/juego';


interface Estadistica {
  valor: string;
  texto: string;
}

// La forma de un paso de "Cómo funciona"
interface Paso {
  numero: string;
  icono: string;
  titulo: string;
  texto: string;
}

// La forma de un bloque de funcion
interface Funcion {
  tipo: 'compatibilidad' | 'chat' | 'grupos';
  etiqueta: string;
  titulo: string;
  texto: string;
  puntos: string[];
}

// Una barra de la tarjeta de compatibilidad 
interface Barra {
  nombre: string;
  valor: number;
}

// Un mensaje de la conversación de ejemplo
interface Mensaje {
  propio: boolean;
  texto: string;
}

// La forma de una tarjeta de comunidad
interface Comunidad {
  nombre: string;
  juego: string;
  integrantes: string;
  descripcion: string;
  icono: string;
  tono: 'morado' | 'verde' | 'rosa';
  miembros: string[];
}

// Un enlace del footer
interface EnlacePie {
  texto: string;
  ruta?: string;
}

// Una columna del footer
interface ColumnaPie {
  titulo: string;
  enlaces: EnlacePie[];
}

// Una red social del footer
interface RedSocial {
  nombre: string;
  icono: string;
}

@Component({
  selector: 'app-landing',

  imports: [RouterLink, GameCard],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  // Iniciales de los avatares de "12,000+ jugadores"
  avatares: string[] = ['JK', 'LU', 'AS'];

  // Los datos de la franja de estadísticas
  estadisticas: Estadistica[] = [
    { valor: '12k+', texto: 'jugadores conectados' },
    { valor: '30+', texto: 'juegos para explorar' },
    { valor: '24/7', texto: 'alguien con quien jugar' },
  ];

  // Los tres pasos de "Cómo funciona"
  pasos: Paso[] = [
    {
      numero: '01',
      icono: 'bi-person',
      titulo: 'Crea tu perfil de jugador',
      texto: 'Tus juegos, tus idiomas, tu zona horaria. Cuéntanos cómo te gusta jugar.',
    },
    {
      numero: '02',
      icono: 'bi-heart',
      titulo: 'Encuentra tu tipo de gamer',
      texto: 'Explora jugadores compatibles. Descarta a los random y quédate con las buenas vibras.',
    },
    {
      numero: '03',
      icono: 'bi-controller',
      titulo: 'Match. Conecta. A jugar.',
      texto: 'Cuando el interés es mutuo, abre un chat y arma tu squad.',
    },
  ];

  // Los tres bloques de funciones
  funciones: Funcion[] = [
    {
      tipo: 'compatibilidad',
      etiqueta: 'ALGORITMO DE COMPATIBILIDAD',
      titulo: 'Más que un juego en común.',
      texto:
        'Conectamos jugadores por estilo de juego, idioma y horario, para que tu próximo compañero encaje de verdad.',
      puntos: ['Prioriza idioma, plataforma y juegos', 'Recomendaciones hechas a tu medida'],
    },
    {
      tipo: 'chat',
      etiqueta: 'CHAT EN TIEMPO REAL',
      titulo: 'Rompe el hielo antes de la primera partida.',
      texto:
        'Escríbele a tu match sin salir de la plataforma. Cuando se entiendan, el resto lo ponen ustedes.',
      puntos: ['Chat privado con tus matches', 'Chat dentro de cada grupo'],
    },
    {
      tipo: 'grupos',
      etiqueta: 'COMUNIDADES DE GRUPO',
      titulo: 'Busca un equipo fijo, no solo un dúo.',
      texto:
        'Únete a grupos de tu juego favorito, comparte jugadas en el muro y organiza la próxima sesión.',
      puntos: ['Publicaciones con imágenes', 'Líder y miembros con permisos distintos'],
    },
  ];

  // Datos del visual de compatibilidad
  barras: Barra[] = [
    { nombre: 'Idioma', valor: 100 },
    { nombre: 'Plataforma', valor: 90 },
    { nombre: 'Juegos en común', valor: 85 },
    { nombre: 'Horario', valor: 75 },
  ];

  // Datos del visual de chat
  mensajes: Mensaje[] = [
    { propio: false, texto: 'Vi que jugamos Valorant. ¿Duo esta noche?' },
    { propio: true, texto: '¡Va! Entro a las 8. ¿Qué agentes usas?' },
    { propio: false, texto: 'Sage main. Te cubro la espalda.' },
  ];

  // Iniciales de los integrantes del visual de grupos
  miembros: string[] = ['OV', 'NB', 'LU', 'GH', 'KA'];

  // Los juegos destacados
  juegosDestacados: Juego[] = JUEGOS_MOCK.filter((juego) =>
    ['j2', 'j3', 'j6', 'j7'].includes(juego._id),
  );

  // Las tres comunidades de ejemplo
  comunidades: Comunidad[] = [
    {
      nombre: 'The Night Shift',
      juego: 'VALORANT',
      integrantes: '842 integrantes',
      descripcion: 'Partidas de madrugada. GGs al amanecer. Un hogar para el equipo nocturno.',
      icono: 'bi-moon-stars',
      tono: 'morado',
      miembros: ['JK', 'LU', 'AS'],
    },
    {
      nombre: 'Ranked & Rational',
      juego: 'APEX LEGENDS',
      integrantes: '1.2k integrantes',
      descripcion: 'Suban juntos. Comunicación clara. El tilt se queda en la puerta.',
      icono: 'bi-crosshair',
      tono: 'verde',
      miembros: ['SY', 'EV', 'MO'],
    },
    {
      nombre: 'Cozy Co-op Club',
      juego: 'MULTIJUEGO',
      integrantes: '678 integrantes',
      descripcion: 'Aventuras cooperativas, amistades nuevas y cero presión por ser el mejor.',
      icono: 'bi-cup-hot',
      tono: 'rosa',
      miembros: ['KI', 'JO', 'NE'],
    },
  ];

  // ---------- Footer ----------
  anio: number = new Date().getFullYear();

  // Redes sociales
  redes: RedSocial[] = [
    { nombre: 'Instagram', icono: 'bi-instagram' },
    { nombre: 'TikTok', icono: 'bi-tiktok' },
    { nombre: 'YouTube', icono: 'bi-youtube' },
    { nombre: 'Discord', icono: 'bi-discord' },
  ];

  // Las tres columnas de enlaces
  columnasPie: ColumnaPie[] = [
    {
      titulo: 'Producto',
      enlaces: [
        { texto: 'Juegos', ruta: '/juegos' },
        { texto: 'Grupos', ruta: '/grupos' },
        { texto: 'Match', ruta: '/match' },
      ],
    },
    {
      titulo: 'Cuenta',
      enlaces: [
        { texto: 'Iniciar sesión', ruta: '/login' },
        { texto: 'Registrarse', ruta: '/registro' },
        { texto: 'Olvidé mi contraseña', ruta: '/olvide-contrasena' },
      ],
    },
    {
      titulo: 'Legal',
      enlaces: [
        { texto: 'Términos de uso' },
        { texto: 'Política de privacidad' },
        { texto: 'Normas de la comunidad' },
      ],
    },
  ];
}