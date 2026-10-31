// ============================================================
// core/services/grupo-api.ts
// Todas las llamadas HTTP de grupos viven aqui
// ============================================================

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

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

  // Arma el cuerpo con SOLO nombre y descripcion
  private cuerpo(datos: DatosGrupo): DatosGrupo {
    return {
      nombre: datos.nombre,
      descripcion: datos.descripcion,
    };
  }
}