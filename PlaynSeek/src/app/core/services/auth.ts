// ============================================================
// core/services/auth.ts
// Guarda quién es el usuario con sesión y su token. Los guards, la
// navbar y el interceptor del token le preguntan a este servicio.
// ============================================================

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '@env/environment';
import { Rol, Usuario } from '@shared/models/usuario';

// El back responde solo { token } al hacer login
interface RespuestaLogin {
  token: string;
}

// El back responde esto en GET /user/me (viene del token, sin consultar la base)
interface RespuestaMe {
  message: string;
  user: { id: string; correo: string; rol: Rol; nombre: string; foto_perfil?: string };
}

const CLAVE_TOKEN = 'pns_token';

// Usuario de prueba con el que arranca la app NO TIENE TOKEN
const USUARIO_PRUEBA: Usuario = {
  _id: 'u1',
  nombre: 'Oscar Velasco',
  correo: 'oscar@correo.com',
  rol: 'usuario',
  isActive: true,
  correo_confirmado: true,
};

// providedIn: 'root' hace que Angular cree una sola instancia
// de este servicio y la comparta con toda la app
@Injectable({
  providedIn: 'root',
})


export class Auth {
  private http = inject(HttpClient);
  // Aquí vive la sesion 
  // Si es null, nadie ha iniciado sesio
  // POR AHORA EMPIEZA con el usuario de prueba para poder ver el portal
  usuarioActual: Usuario | null = USUARIO_PRUEBA;

  // ¿Hay alguien con sesion?
  //  devuelve true cuando sI hay un usuario
  estaAutenticado(): boolean {
    return this.usuarioActual !== null;
  }

  // ¿El usuario actual tiene alguno de estos roles?
  // Recibe una lista porque algunas secciones aceptan mas de uno
  tieneRol(roles: Rol[]): boolean {
    // Sin sesion no hay rol
    if (this.usuarioActual === null) {
      return false;
    }
    // revisa si el rol del usuario aparece en la lista
    return roles.includes(this.usuarioActual.rol);
  }



  //---TOKEN--
  // Lee el token guardado y devuelve null si no hay
  // localStorage guarda texto en el navegador y sobrevive aL recargar la pagina

  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }


  //--Login REAL---
  // POST /user/login con { email, password } Si sale bien, guardamos el
  // token y pedimos los datos del usuario a GET /user/me
  // tap() ejecuta algo con la respuesta sin cambiarla
  login(email: string, password: string): Observable<RespuestaLogin> {
    return this.http
      .post<RespuestaLogin>(environment.apiUrl + '/user/login', { email: email, password: password })
      .pipe(
        tap((respuesta) => {
          localStorage.setItem(CLAVE_TOKEN, respuesta.token);
        }),
      );
  }


  // GET /user/me: trae id, correo y rol, etc y los deja como usuario actual
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
      }),
    );
  }

  //  borra el token y deja de haber usuario
  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuarioActual = null;
  }

  //temporal
  iniciarSesion(): void {
    this.usuarioActual = USUARIO_PRUEBA;
  }

  //Esto solo es para probar mientras se desarolla
  // cambia el rol del usuario actual sin tener que editar el codigo
  // para poder ver como cambia el navbar y como reaccionan los guards
  cambiarRol(rol: Rol): void {
    if (this.usuarioActual !== null) {
      this.usuarioActual.rol = rol;
    }
  }
}