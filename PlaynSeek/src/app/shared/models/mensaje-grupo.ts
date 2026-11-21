// Mensaje que envía el backend en los eventos 'historial' y 'mensaje_recibido'.
export interface MensajeGrupo {
  _id: string;
  grupo_id: string;
  usuario_id: string;
  nombreUsuario: string;
  contenido: string;
  fecha: string;
}