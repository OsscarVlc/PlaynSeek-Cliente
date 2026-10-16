// ============================================================
// shared/models/reporte.ts
// Molde de un reporte: un usuario denuncia a otro
// ============================================================

import { UsuarioResumen } from './usuario';

// Arreglo de valores + tipo derivado, igual que con roles y estados
// Son los mismos textos que el enum motivoReporte del back
export const MOTIVOS_REPORTE = ['spam', 'acoso', 'contenido_inapropiado', 'otro'] as const;
export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number];

// Mismos textos que el enum estadoReporte del back.
export const ESTADOS_REPORTE = ['pendiente', 'resuelto', 'rechazado'] as const;
export type EstadoReporte = (typeof ESTADOS_REPORTE)[number];

export interface Reporte {
  _id: string; // id interno de Mongo
  remitente_id: string; // id de quien hace el reporte
  reportado_id: string; // id del usuario reportado (siempre un usuario)
  motivo: MotivoReporte;
  descripcion?: string; // opcional: el usuario puede no explicar más
  estado: EstadoReporte; // en el back arranca como 'pendiente'
  fecha: string; // en el JSON llega como texto ISO

  // Contexto opcional
  // Un reporte puede venir de un grupo, de un post o de un comentario,o de ninguno si se reportó directo a un usuario.
  grupo_id?: string;
  post_id?: string;
  comentario_id?: string;

  // --- Campos extra para el front ---
  // Representan lo que el API devolvería al hacer populate de
  // remitente_id y reportado_id, para pintar nombres directo en la tabla.
  remitente?: UsuarioResumen;
  reportado?: UsuarioResumen;
}