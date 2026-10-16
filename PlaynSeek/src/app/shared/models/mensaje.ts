// ============================================================
// shared/models/mensaje.ts
// Molde de un mensaje de chat
// ============================================================

// Mensaje plano así se guarda en la base y asi se envia
// usuario_id es solo el id de quien lo escribio
export interface Mensaje {
  _id: string; // id interno de Mongo
  usuario_id: string; // id del usuario que escribió el mensaje
  contenido: string; // el texto del mensaje
  fecha: string; // en el JSON las fechas llegan como texto ISO
  grupo_id?: string; // presente solo si es un mensaje de grupo
  destinatario_id?: string; // presente solo si es un mensaje privado
}

// Mensaje con usuario es lo que el chat recibe para pintar las burbujas. 
// Igual que en el back, tomamos Mensaje y OMITIMOS
// usuario_id (Omit), para volver a declararlo como un objeto con
// el id y el nombre de quien escribio.
export interface MensajeConUsuario extends Omit<Mensaje, 'usuario_id'> {
  usuario_id: {
    _id: string;
    nombre: string;
  };
}