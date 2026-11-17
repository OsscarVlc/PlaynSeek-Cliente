// ============================================================
// core/services/auth.ts
// ============================================================

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, firstValueFrom, tap, timeout } from 'rxjs';

import { environment } from '@env/environment';
import { Realtime } from '@core/services/realtime';
import { Rol, Usuario } from '@shared/models/usuario';

// Lo que se manda al registrarse. El back espera estos nombres en inglés.
export interface DatosRegistro {
  name: string;
  email: string;
  password: string;
}

// El back responde esto al registrarse (no incluye token: primero hay
// que confirmar el correo)
interface RespuestaRegistro {
  message: string;
  user: { _id: string; nombre: string; correo: string; rol: Rol };
}

// El back responde solo { token } al hacer login
interface RespuestaLogin {
  token: string;
}

// El back responde esto en GET /user/me
interface RespuestaMe {
  message: string;
  user: { id: string; correo: string; rol: Rol; nombre: string; foto_perfil?: string };
}

// Nombre con el que se guarda el token en el navegador
const CLAVE_TOKEN = 'pns_token';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private realtime = inject(Realtime);

  // Aquí vive la sesión. Si es null, nadie ha iniciado sesión.
  usuarioActual: Usuario | null = null;

  // ¿Hay alguien con sesión? Lo usan authGuard y guestGuard.
  estaAutenticado(): boolean {
    return this.usuarioActual !== null;
  }

  // ¿El usuario actual tiene alguno de estos roles? Lo usa roleGuard.
  tieneRol(roles: Rol[]): boolean {
    if (this.usuarioActual === null) {
      return false;
    }
    return roles.includes(this.usuarioActual.rol);
  }

  // ---------- Token ----------

  // Lee el token guardado. Devuelve null si no hay.
  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  // ---------- Registro ----------

  // POST /user/register con { name, email, password }. No inicia sesión:
  // el back manda un correo de confirmación y bloquea el login hasta que
  // el usuario confirme. Si el correo ya existe, responde 400.
  registrar(datos: DatosRegistro): Observable<RespuestaRegistro> {
    return this.http.post<RespuestaRegistro>(environment.apiUrl + '/user/register', {
      name: datos.name,
      email: datos.email,
      password: datos.password,
    });
  }

  // ---------- Login ----------

  // POST /user/login con { email, password }. Si sale bien, guardamos el token.
  login(email: string, password: string): Observable<RespuestaLogin> {
    return this.http
      .post<RespuestaLogin>(environment.apiUrl + '/user/login', { email, password })
      .pipe(
        tap((respuesta) => {
          localStorage.setItem(CLAVE_TOKEN, respuesta.token);
        }),
      );
  }

  // GET /user/me: trae id, correo, rol, nombre y foto, y los deja como
  // usuario actual. El rol siempre sale de aquí, nunca de la interfaz.
  // Con la sesión ya confirmada, abre la conexión en tiempo real.
  // Lo usan el login y recuperarSesion(), así que la conexión se abre
  // tanto al iniciar sesión como al recargar la página.
  cargarUsuario(): Observable<RespuestaMe> {
    return this.http.get<RespuestaMe>(environment.apiUrl + '/user/me').pipe(
      tap((respuesta) => {
        this.usuarioActual = {
          _id: respuesta.user.id,
          nombre: respuesta.user.nombre,
          correo: respuesta.user.correo,
          rol: respuesta.user.rol,
          foto_perfil: respuesta.user.foto_perfil,
          isActive: true,
          correo_confirmado: true,
        };

        const token = this.obtenerToken();
        if (token !== null) {
          this.realtime.conectar(token);
        }
      }),
    );
  }

  // Se ejecuta una vez al arrancar la app. Si hay un token guardado, pide
  // quién es el usuario. Tiene un límite de 5 segundos para que, si el back
  // no responde, la app arranque igual (sin sesión) y no se quede cargando.
  // El token solo se borra si el back responde 401 (ya no sirve).
  async recuperarSesion(): Promise<void> {
    if (this.obtenerToken() === null) {
      return;
    }

    try {
      await firstValueFrom(this.cargarUsuario().pipe(timeout(5000)));
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        localStorage.removeItem(CLAVE_TOKEN);
      }
      this.usuarioActual = null;
    }
  }

  // ---------- Cerrar sesión ----------

  // Borra el token, deja de haber usuario y cierra la conexión en tiempo
  // real. También lo usa el interceptor cuando la sesión expira (401).
  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuarioActual = null;
    this.realtime.desconectar();
  }
}