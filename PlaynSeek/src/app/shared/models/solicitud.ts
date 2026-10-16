// ============================================================
// shared/models/solicitud.ts
// Molde de una solicitud de compañero
// ============================================================

import { UsuarioResumen } from './usuario';

// Igual que con los roles: arreglo de valores + tipo derivado
// Son los mismos textos que el enum EstadoSolicitud del back
export const ESTADOS_SOLICITUD = ['pendiente', 'aceptada', 'rechazada', 'cancelada'] as const;
export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

export interface Solicitud {
  _id: string; // id interno de Mongo
  de_usuario: string; // id de quien envía la solicitud
  a_usuario: string; // id de quien la recibe
  estado: EstadoSolicitud; // en el back arranca como 'pendiente'
  fecha_creacion: string; // cuando se envip; en el JSON llega como texto ISO
  fecha_respuesta?: string; // opcional: solo existe cuando ya se aceptó o rechazó

  // --- Campos extra  para el front  ---
  // Representan lo que el API devolvería al hacer populate de
  // de_usuario y a_usuario, para pintar nombre y foto directo.
  remitente?: UsuarioResumen;
  destinatario?: UsuarioResumen;
}