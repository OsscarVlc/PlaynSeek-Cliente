// ============================================================
// shared/models/paginado.ts
// Forma de cualquier lista paginada que responde la API
// ============================================================

export interface Paginado<T> {
  data: T[]; // los elementos de la pagina actual
  pagina: number; // numero de la pagina actual
  totalPaginas: number; //  paginas en total
  total: number; //  elementos  en total
}