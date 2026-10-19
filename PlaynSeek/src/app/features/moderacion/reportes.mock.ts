// ============================================================
// features/moderacion/reportes.mock.ts
// Reportes de prueba para la tabla de moderacion
// ============================================================

import { Reporte } from '@shared/models/reporte';

export const REPORTES_MOCK: Reporte[] = [
  {
    _id: 'r1',
    remitente_id: 'u4',
    reportado_id: 'u5',
    motivo: 'acoso',
    descripcion: 'Insultos repetidos durante una partida de Overwatch 2.',
    estado: 'pendiente',
    fecha: '2026-10-16T20:15:00.000Z',
    grupo_id: 'g1',
    remitente: { _id: 'u4', nombre: 'Valeria Torres' },
    reportado: { _id: 'u5', nombre: 'Mateo García' },
  },
  {
    _id: 'r2',
    remitente_id: 'u2',
    reportado_id: 'u7',
    motivo: 'spam',
    descripcion: 'Publica enlaces externos en todos los posts del grupo.',
    estado: 'pendiente',
    fecha: '2026-10-17T14:40:00.000Z',
    grupo_id: 'g1',
    post_id: 'p3',
    remitente: { _id: 'u2', nombre: 'Sofía Ramírez' },
    reportado: { _id: 'u7', nombre: 'Luis Navarro' },
  },
  {
    _id: 'r3',
    remitente_id: 'u6',
    reportado_id: 'u5',
    motivo: 'contenido_inapropiado',
    descripcion: 'Comentario con lenguaje ofensivo en una publicación.',
    estado: 'pendiente',
    fecha: '2026-10-17T22:05:00.000Z',
    grupo_id: 'g1',
    post_id: 'p2',
    comentario_id: 'c4',
    remitente: { _id: 'u6', nombre: 'Camila Ortiz' },
    reportado: { _id: 'u5', nombre: 'Mateo García' },
  },
  {
    // Sin descripción 
    _id: 'r4',
    remitente_id: 'u1',
    reportado_id: 'u8',
    motivo: 'otro',
    estado: 'resuelto',
    fecha: '2026-10-10T18:30:00.000Z',
    remitente: { _id: 'u1', nombre: 'Oscar Velasco' },
    reportado: { _id: 'u8', nombre: 'Ana Beltrán' },
  },
  {
    _id: 'r5',
    remitente_id: 'u3',
    reportado_id: 'u7',
    motivo: 'acoso',
    descripcion: 'Mensajes insistentes por chat privado.',
    estado: 'rechazado',
    fecha: '2026-10-08T12:10:00.000Z',
    remitente: { _id: 'u3', nombre: 'Diego Hernández' },
    reportado: { _id: 'u7', nombre: 'Luis Navarro' },
  },
];