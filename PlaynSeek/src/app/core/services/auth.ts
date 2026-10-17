// ============================================================
// core/services/auth.ts
// Guarda quién es el usuario con sesión. 
// POR AHORA LA SESION ES SIMULADA
// ============================================================

import { Injectable } from '@angular/core';


import { Usuario, Rol } from '@shared/models/usuario';

// Usuario de prueba con el que arranca la app.
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
  // Aquí vive la sesión. Si es null, nadie ha iniciado sesión.
  // POR AHORA EMPIEZA con el usuario de prueba para poder ver el portal
  usuarioActual: Usuario | null = USUARIO_PRUEBA;

  // ¿Hay alguien con sesión?
  //  devuelve true cuando sI hay un usuario.
  estaAutenticado(): boolean {
    return this.usuarioActual !== null;
  }

  // ¿El usuario actual tiene alguno de estos roles?
  // Recibe una lista porque algunas secciones aceptan más de uno
  tieneRol(roles: Rol[]): boolean {
    // Sin sesión no hay rol
    if (this.usuarioActual === null) {
      return false;
    }
    // revisa si el rol del usuario aparece en la lista
    return roles.includes(this.usuarioActual.rol);
  }

  // Simula iniciar sesión
  iniciarSesion(): void {
    this.usuarioActual = USUARIO_PRUEBA;
  }

  // Simula cerrar sesión
  cerrarSesion(): void {
    this.usuarioActual = null;
  }

  //Esto solo es para probar mientras se desarolla
  // cambia el rol del usuario actual sin tener que editar el código.
  // para poder ver como cambia el sidebar y como reaccionan los guards
  cambiarRol(rol: Rol): void {
    if (this.usuarioActual !== null) {
      this.usuarioActual.rol = rol;
    }
  }
}