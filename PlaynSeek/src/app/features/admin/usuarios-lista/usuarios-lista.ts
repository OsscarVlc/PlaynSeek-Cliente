// ============================================================
// features/admin/usuarios-lista/usuarios-lista.ts
// Tabla de usuarios para el administrador
// ============================================================

import { Component, inject } from '@angular/core';

import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { USUARIOS_MOCK } from '@shared/mock/usuarios.mock';
import { ROLES, Rol, Usuario } from '@shared/models/usuario';

@Component({
  selector: 'app-usuarios-lista',
  templateUrl: './usuarios-lista.html',
  styleUrl: './usuarios-lista.scss',
})
export class UsuariosLista {
  private notificacion = inject(Notification);
  private confirmar = inject(Confirm);


  usuarios: Usuario[] = USUARIOS_MOCK;

  // Los roles del menú desplegable
  roles = ROLES;

  // Ccuenta cuntos usuarios tienen cierto rol
  contarPorRol(rol: Rol): number {
    return this.usuarios.filter((usuario) => usuario.rol === rol).length;
  }

  // cuenta cuantas cuentas estan desactivadas
  contarInactivos(): number {
    return this.usuarios.filter((usuario) => !usuario.isActive).length;
  }

  // Devuelve la clase de color de la etiqueta de cada rol
  claseRol(rol: Rol): string {
    switch (rol) {
      case 'administrador':
        return 'rol-administrador';
      case 'moderador':
        return 'rol-moderador';
      default:
        return 'rol-usuario';
    }
  }

  // Ejemplo de CONFIRMACION y NOTIFICACION
  //  pregunta antes de cambiar el rol y, si el administrador acepta, muestra un avis
  // El rol de la tabla no cambia
  cambiarRol(usuario: Usuario, nuevoRol: Rol): void {
    // Si elige el rol que ya tiene, solo avisamos y no preguntamos nada
    if (usuario.rol === nuevoRol) {
      this.notificacion.info(usuario.nombre + ' ya tiene el rol ' + nuevoRol);
      return;
    }

    this.confirmar.pedir(
      '¿Deseas cambiar el rol de ' + usuario.nombre + ' a ' + nuevoRol + '?',
      () => {
        this.notificacion.exito('Rol de ' + usuario.nombre + ' actualizado a ' + nuevoRol);
      },
    );
  }

  // Desactiva o reactiva una cuenta (soft delete)
  cambiarEstado(usuario: Usuario): void {
    if (usuario.isActive) {
      this.confirmar.pedir('¿Deseas desactivar la cuenta de ' + usuario.nombre + '?', () => {
        this.notificacion.exito('Cuenta de ' + usuario.nombre + ' desactivada');
      });
    } else {
      this.confirmar.pedir('¿Deseas reactivar la cuenta de ' + usuario.nombre + '?', () => {
        this.notificacion.exito('Cuenta de ' + usuario.nombre + ' reactivada');
      });
    }
  }
}