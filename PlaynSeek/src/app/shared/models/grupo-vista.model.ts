export interface GrupoVista {
  liderId: string;
  id: string;
  nombre: string;
  descripcion: string;
  juego: string;
  imagen: string | null;
  tono: 'morado' | 'verde' | 'rosa';
  integrantes: {
    id: string;
    nombre: string;
    iniciales: string;
  }[];
}