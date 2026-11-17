// ============================================================
// core/services/grupo-api.ts
// Todas las llamadas HTTP de grupos viven aqui
// ============================================================

import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
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

// Lo que responde el back al subir o eliminar la portada
interface RespuestaPortada {
  message: string;
  grupo: Grupo;
}

// Respuesta de las acciones que solo devuelven un mensaje
interface RespuestaMensaje {
  message: string;
}

// Lo que recibe el componente mientras sube la portada
export type EventoSubida =
  | { tipo: 'progreso'; porcentaje: number }
  | { tipo: 'completado'; grupo: Grupo };

@Injectable({
  providedIn: 'root',
})
export class GrupoApi {
  private http = inject(HttpClient);

  // http://localhost:3000/grupo en desarrollo
  private url = environment.apiUrl + '/grupo';

  // GET /grupo?pagina=1&limite=10&q=texto  (público)
  listar(pagina: number, limite: number, busqueda: string): Observable<Paginado<Grupo>> {
    let params = new HttpParams().set('pagina', pagina).set('limite', limite);

    // solo mandamos q si hay texto, para no enviar un parámetro vacío
    if (busqueda.trim() !== '') {
      params = params.set('q', busqueda.trim());
    }

    return this.http.get<Paginado<Grupo>>(this.url, { params: params });
  }

  // GET /grupo/:id  (público)
  obtener(id: string): Observable<Grupo> {
    return this.http.get<Grupo>(this.url + '/' + id);
  }

  // POST /grupo  (requiere token). El back responde { message, grupo };
  // con map() sacamos solo el grupo.
  crear(datos: DatosGrupo): Observable<Grupo> {
    return this.http
      .post<RespuestaCrearGrupo>(this.url, this.cuerpo(datos))
      .pipe(map((respuesta) => respuesta.grupo));
  }

  // PATCH /grupo/:id  (requiere token, solo el líder)
  actualizar(id: string, datos: DatosGrupo): Observable<Grupo> {
    return this.http.patch<Grupo>(this.url + '/' + id, this.cuerpo(datos));
  }

  // DELETE /grupo/:id  (requiere token, solo el líder; borrado lógico)
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

  // DELETE /grupo/:id/integrantes con { usuarioId }  (líder o admin)
  expulsar(id: string, usuarioId: string): Observable<RespuestaMensaje> {
    return this.http.delete<RespuestaMensaje>(this.url + '/' + id + '/integrantes', {
      body: { usuarioId: usuarioId },
    });
  }

  // PATCH /grupo/:id/transferir-liderazgo con { nuevoLiderId }  (solo el líder)
  transferirLiderazgo(id: string, nuevoLiderId: string): Observable<RespuestaMensaje> {
    return this.http.patch<RespuestaMensaje>(this.url + '/' + id + '/transferir-liderazgo', {
      nuevoLiderId: nuevoLiderId,
    });
  }



  // ---------- Portada (archivo) ----------

  subirPortada(id: string, archivo: File): Observable<EventoSubida> {

    const datos = new FormData();
    datos.append('imagen', archivo);

    return this.http
      .post<RespuestaPortada>(this.url + '/' + id + '/imagen', datos, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(
        // De todos los eventos, solo nos importan el progreso y la respuesta
        filter(
          (evento) =>
            evento.type === HttpEventType.UploadProgress || evento.type === HttpEventType.Response,
        ),
        map((evento): EventoSubida => {
          if (evento.type === HttpEventType.UploadProgress) {
            // total puede venir vacío; en ese caso mostramos 0
            const total = evento.total ?? 0;
            const porcentaje = total > 0 ? Math.round((evento.loaded / total) * 100) : 0;
            return { tipo: 'progreso', porcentaje: porcentaje };
          }
          // HttpEventType.Response: el back terminó y respondió
          return { tipo: 'completado', grupo: (evento.body as RespuestaPortada).grupo };
        }),
      );
  }

  // DELETE /grupo/:id/imagen  (líder o admin)
  eliminarPortada(id: string): Observable<Grupo> {
    return this.http
      .delete<RespuestaPortada>(this.url + '/' + id + '/imagen')
      .pipe(map((respuesta) => respuesta.grupo));
  }

  // Arma el cuerpo con SOLO nombre y descripción. El back responde 400 si
  // una edición trae lider_id, integrantes o activo.
  private cuerpo(datos: DatosGrupo): DatosGrupo {
    return {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
    };
  }
}