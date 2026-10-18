import { Injectable, signal } from '@angular/core';

export interface MensajePrivado {
  id: string;
  autorId: string;
  contenido: string;
  fecha: string;
}

export interface ConversacionPrivada {
  usuarioId: string;
  nombre: string;
  iniciales: string;
  juego: string;
  mensajes: MensajePrivado[];
}

export const USUARIO_CHAT_DEMO_ID = 'usuario-sergio';

@Injectable({
  providedIn: 'root',
})
export class ChatDemo {
  private readonly conversacionesInternas = signal<ConversacionPrivada[]>([
    {
      usuarioId: 'usuario-oscar',
      nombre: 'Oscar',
      iniciales: 'OV',
      juego: 'Valorant',
      mensajes: [
        {
          id: 'mensaje-1',
          autorId: 'usuario-oscar',
          contenido: '¿Te apuntas a unas partidas esta noche?',
          fecha: '2026-10-18T19:00:00-06:00',
        },
        {
          id: 'mensaje-2',
          autorId: USUARIO_CHAT_DEMO_ID,
          contenido: '¡Claro! Después de las ocho puedo.',
          fecha: '2026-10-18T19:02:00-06:00',
        },
        {
          id: 'mensaje-3',
          autorId: 'usuario-oscar',
          contenido: 'Perfecto, nos vemos en el lobby.',
          fecha: '2026-10-18T19:03:00-06:00',
        },
      ],
    },
    {
      usuarioId: 'usuario-dante',
      nombre: 'Dante',
      iniciales: 'DA',
      juego: 'Minecraft',
      mensajes: [
        {
          id: 'mensaje-4',
          autorId: 'usuario-dante',
          contenido: 'Ya tengo listo el mundo. ¿Construimos la base?',
          fecha: '2026-10-18T18:30:00-06:00',
        },
      ],
    },
    {
      usuarioId: 'usuario-luna',
      nombre: 'Luna',
      iniciales: 'LU',
      juego: 'Apex Legends',
      mensajes: [],
    },
  ]);

  readonly conversaciones = this.conversacionesInternas.asReadonly();

  enviar(usuarioId: string, contenido: string): void {
    const texto = contenido.trim();

    if (!texto || texto.length > 1000) return;

    const mensaje: MensajePrivado = {
      id: crypto.randomUUID(),
      autorId: USUARIO_CHAT_DEMO_ID,
      contenido: texto,
      fecha: new Date().toISOString(),
    };

    this.conversacionesInternas.update((conversaciones) =>
      conversaciones.map((conversacion) =>
        conversacion.usuarioId === usuarioId
          ? {
              ...conversacion,
              mensajes: [...conversacion.mensajes, mensaje],
            }
          : conversacion,
      ),
    );
  }

  asegurarConversacion(contacto: {
    usuarioId: string;
    nombre: string;
    iniciales: string;
    juego: string;
  }): void {
    this.conversacionesInternas.update((actuales) => {
      const existe = actuales.some(
        (conversacion) => conversacion.usuarioId === contacto.usuarioId,
      );

      if (existe) return actuales;

      return [
        {
          ...contacto,
          mensajes: [],
        },
        ...actuales,
      ];
    });
  }
}