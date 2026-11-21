import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { Post } from '@shared/models/post';

interface PaginaPosts {
  data: Post[];
  pagina: number;
  totalPaginas: number;
}

@Injectable({ providedIn: 'root' })
export class PostApi {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/post`;

  listar(grupoId: string, pagina: number) {
    return this.http.get<PaginaPosts>(this.url, {
      params: { grupo_id: grupoId, pagina, limite: 50 },
    });
  }

  crear(grupoId: string, contenido: string, imagen?: File) {
    const datos = new FormData();
    datos.append('grupo_id', grupoId);
    datos.append('contenido', contenido);

    // El backend espera el archivo original en upload.single('imagen').
    // La vista previa que se muestra en Angular no es el archivo que se sube.
    if (imagen) datos.append('imagen', imagen);

    return this.http.post<{ post: Post }>(this.url, datos);
  }
}