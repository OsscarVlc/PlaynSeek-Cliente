// ============================================================
// core/services/grupo-api.ts
// Todas las llamadas HTTP de grupos viven aqui
// ============================================================

import { HttpClient, HttpEvent, HttpEventType, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map } from 'rxjs';

import { environment } from '@env/environment';
import { DatosGrupo, Grupo } from '@shared/models/grupo';
import { Paginado } from '@shared/models/paginado';

// Lo que responde el back al crear: el grupo viene dentro de "grupo"
interface RespuestaCrearGrupo {
  message: string;
  grupo: Grupo;
}

// Lo que responde el back al eliminar
interface RespuestaMensaje {
  message: string;
}

export type EventoSubidaPortada =
  | { tipo: 'progreso'; porcentaje: number }
  | { tipo: 'completado'; grupo: Grupo };

interface RespuestaPortada {
  message: string;
  grupo: Grupo;
}

@Injectable({
  providedIn: 'root',
})



export class GrupoApi {
  private http = inject(HttpClient);

  private url = environment.apiUrl + '/grupo';

  // GET /grupo?pagina=1&limite=10&q=texto
  // get<Paginado<Grupo>> le dice a TypeScript qué forma tiene la respuesta
  listar(pagina: number, limite: number, busqueda: string): Observable<Paginado<Grupo>> {
    let params = new HttpParams().set('pagina', pagina).set('limite', limite);

    // solo mandamos q si hay texto, para no enviar un parámetro vacío
    if (busqueda.trim() !== '') {
      params = params.set('q', busqueda.trim());
    }

    return this.http.get<Paginado<Grupo>>(this.url, { params: params });
  }


  // GET /grupo/:id  (PUBLICO)
  obtener(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(this.url + '/' + id);
  }


  // POST /grupo  (NECESITA TOKEN)
  // El back responde { message, grupo }
  // Usamos map() para sacar solo el grupo, para que el componente reciba directamente un Grupo
  crear(datos: DatosGrupo): Observable<Grupo> {
    return this.http
      .post<RespuestaCrearGrupo>(this.url, this.cuerpo(datos))
      .pipe(map((respuesta) => respuesta.grupo));
  }


  // PATCH /grupo/:id  (NECESITA TOKEN, solo el líder)
  actualizar(id: string, datos: DatosGrupo): Observable<Grupo> {
    return this.http.patch<Grupo>(this.url + '/' + id, this.cuerpo(datos));
  }


  // DELETE /grupo/:id  (rNECESITA TOKEN, solo el líder; borrado lógico)
  eliminar(id: string): Observable<RespuestaMensaje> {
    return this.http.delete<RespuestaMensaje>(this.url + '/' + id);
  }


  // POST /grupo/:id/unirse  (requiere token)
  unirse(id: string): Observable<RespuestaMensaje> {
    return this.http.post<RespuestaMensaje>(this.url + '/' + id + '/unirse', {});
  }

  // POST /grupo/:id/salir  (requiere token; el líder no puede salir)
  salir(id: string): Observable<RespuestaMensaje> {
    return this.http.post<RespuestaMensaje>(this.url + '/' + id + '/salir', {});
  }

  // DELETE /grupo/:id/integrantes con { usuarioId }  
  expulsar(id: string, usuarioId: string): Observable<RespuestaMensaje> {
    return this.http.delete<RespuestaMensaje>(this.url + '/' + id + '/integrantes', {
      body: { usuarioId: usuarioId },
    });
  }

  // PATCH /grupo/:id/transferir-liderazgo con { nuevoLiderId }  (solo el lider)
  transferirLiderazgo(id: string, nuevoLiderId: string): Observable<RespuestaMensaje> {
    return this.http.patch<RespuestaMensaje>(this.url + '/' + id + '/transferir-liderazgo', {
      nuevoLiderId: nuevoLiderId,
    });
  }

  // POST /grupo/:id/portada  (sube imagen con progreso; reportProgress: true y observe: 'events')
  subirPortada(id: string, archivo: File): Observable<EventoSubidaPortada> {
    const formData = new FormData();
    formData.append('imagen', archivo);

    const req = new HttpRequest('POST', `${this.url}/${id}/portada`, formData, {
      reportProgress: true,
    });

    return this.http.request<RespuestaPortada>(req).pipe(
      map((evento: HttpEvent<RespuestaPortada>) => {
        if (evento.type === HttpEventType.UploadProgress) {
          const total = evento.total ?? archivo.size;
          const porcentaje = total > 0 ? Math.round((100 * evento.loaded) / total) : 0;
          return { tipo: 'progreso' as const, porcentaje: Math.min(porcentaje, 99) };
        }
        if (evento.type === HttpEventType.Response) {
          const grupoActualizado = evento.body?.grupo ?? (evento.body as unknown as Grupo);
          return { tipo: 'completado' as const, grupo: grupoActualizado };
        }
        return { tipo: 'progreso' as const, porcentaje: 0 };
      }),
      filter((evento): evento is EventoSubidaPortada => {
        return evento.tipo === 'completado' || evento.porcentaje > 0;
      }),
    );
  }

  // DELETE /grupo/:id/portada  (elimina la imagen de portada; solo lider o admin)
  eliminarPortada(id: string): Observable<RespuestaMensaje & { grupo?: Grupo }> {
    return this.http.delete<RespuestaMensaje & { grupo?: Grupo }>(`${this.url}/${id}/portada`);
  }

  // Arma el cuerpo con SOLO nombre y descripcion
  private cuerpo(datos: DatosGrupo): DatosGrupo {
    return {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
    };
  }
}