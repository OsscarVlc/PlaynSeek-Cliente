// ============================================================
// core/services/auth.ts
// Guarda quién es el usuario con sesión y su token. Los guards, la
// navbar y el interceptor del token le preguntan a este servicio.
// ============================================================

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap, firstValueFrom, timeout } from 'rxjs';

import { environment } from '@env/environment';
import { Rol, Usuario } from '@shared/models/usuario';

//-----Registro
// Lo que se manda 
export interface DatosRegistro {
  name: string;
  email: string;
  password: string;
}
// El back responde 
interface RespuestaRegistro {
  message: string;
  user: { _id: string; nombre: string; correo: string; rol: Rol };
}



//-----Login

// El back responde solo { token } al hacer login
interface RespuestaLogin {
  token: string;
}


// El back responde esto en GET /user/me (viene del token, sin consultar la base)
interface RespuestaMe {
  message: string;
  user: { id: string; correo: string; rol: Rol; nombre: string; foto_perfil?: string };
}


// Nombre con el que se guarda el token en el navegador
const CLAVE_TOKEN = 'pns_token';


// Usuario de prueba para la sesion SIMULADA que todavía usan las pantallas
// de registro y confirmar correo
const USUARIO_PRUEBA: Usuario = {
  _id: 'u1',
  nombre: 'Oscar Velasco',
  correo: 'oscar@correo.com',
  rol: 'usuario',
  isActive: true,
  correo_confirmado: true,
};


@Injectable({
  providedIn: 'root',
})


export class Auth {
  private http = inject(HttpClient);
  // Aquí vive la sesion 
  // Si es null, nadie ha iniciado sesio
  // POR AHORA EMPIEZA con el usuario de prueba para poder ver el portal
  usuarioActual: Usuario | null = null;

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

  //---REGISTRO---
  // POST /user/register con { name, email, password }
  // el back manda un correo de confirmación y bloquea el login hasta que
  // el usuario confirme. Si el correo ya existe, responde 400.
  registrar(datos: DatosRegistro): Observable<RespuestaRegistro> {
    return this.http.post<RespuestaRegistro>(environment.apiUrl + '/user/register', {
      name: datos.name,
      email: datos.email,
      password: datos.password,
    });
  }


  //--- LOGIN ---
  // POST /user/login con { email, password } 
  // Si sale bien, guardamos el token y pedimos los datos del usuario a GET /user/me
  
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

  // Se ejecuta una vez al arrancar la app
  // si hay un token guardado, pide quien es el usuario
  // si el token ya no sirve, lo borra y la app queda sin sesion
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



  //--- CERRAR SESION ---
  //  borra el token y deja de haber usuario
  cerrarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this.usuarioActual = null;
  }


  //--TEMPORALES----
  //temporal
  iniciarSesion(): void {
    this.usuarioActual = USUARIO_PRUEBA;
  }

  // TEMPORAL
  cambiarRol(rol: Rol): void {
    if (this.usuarioActual !== null) {
      this.usuarioActual.rol = rol;
    }
  }


}