// ============================================================
// core/services/reporte-api.ts
// Llamadas HTTP de reportes
// ============================================================

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '@env/environment';
import { Paginado } from '@shared/models/paginado';
import {
  DatosReporte,
  EstadoReporte,
  Reporte,
  ReporteConUsuarios,
} from '@shared/models/reporte';

interface RespuestaCrearReporte {
  message: string;
  reporte: Reporte;
}

@Injectable({
  providedIn: 'root',
})
export class ReporteApi {
  private http = inject(HttpClient);

  private url = environment.apiUrl + '/reporte';

  // GET /reporte?pagina&limite&estado  (moderador o admin)
  // estado null = todos los estados
  listar(
    pagina: number,
    limite: number,
    estado: EstadoReporte | null,
  ): Observable<Paginado<ReporteConUsuarios>> {
    let params = new HttpParams().set('pagina', pagina).set('limite', limite);
    if (estado !== null) {
      params = params.set('estado', estado);
    }
    return this.http.get<Paginado<ReporteConUsuarios>>(this.url, { params: params });
  }

  // Cuántos reportes hay con ese estado
  // Pide una sola fila y se queda con el total que calcula el back
  contar(estado: EstadoReporte | null): Observable<number> {
    return this.listar(1, 1, estado).pipe(map((respuesta) => respuesta.total));
  }

  // POST /reporte  (cualquier usuario con sesión)
  crear(datos: DatosReporte): Observable<Reporte> {
    return this.http
      .post<RespuestaCrearReporte>(this.url, datos)
      .pipe(map((respuesta) => respuesta.reporte));
  }

  // PATCH /reporte/:id con { estado }  (moderador o admin)
  cambiarEstado(id: string, estado: EstadoReporte): Observable<Reporte> {
    return this.http.patch<Reporte>(this.url + '/' + id, { estado });
  }
}