// ============================================================
// shared/models/reporte.ts
// Molde de un reporte: un usuario denuncia a otro
// ============================================================

import { UsuarioResumen } from './usuario';

// Mismos textos que el enum motivoReporte del back
export const MOTIVOS_REPORTE = ['spam', 'acoso', 'contenido_inapropiado', 'otro'] as const;
export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number];

// Mismos textos que el enum estadoReporte del back
export const ESTADOS_REPORTE = ['pendiente', 'resuelto', 'rechazado'] as const;
export type EstadoReporte = (typeof ESTADOS_REPORTE)[number];

// El reporte tal como se guarda =
export interface Reporte {
  _id: string;
  remitente_id: string; // quien reporta
  reportado_id: string; // el usuario reportado
  motivo: MotivoReporte;
  descripcion?: string;
  estado: EstadoReporte; // el back lo crea como 'pendiente'
  fecha: string; // texto ISO

  // Contexto opcional: dónde ocurrió lo reportado
  grupo_id?: string;
  post_id?: string;
  comentario_id?: string;
}

// El reporte como llega en el LISTADO
export interface ReporteConUsuarios extends Omit<Reporte, 'remitente_id' | 'reportado_id'> {
  remitente_id: UsuarioResumen | null;
  reportado_id: UsuarioResumen | null;
}

// Lo que se manda al crear un reporte
export interface DatosReporte {
  reportado_id: string;
  motivo: MotivoReporte;
  descripcion?: string;
  grupo_id?: string;
  post_id?: string;
  comentario_id?: string;
}