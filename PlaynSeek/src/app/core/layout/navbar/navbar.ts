// ============================================================
// core/layout/navbar/navbar.ts
// Barra de navegación unica de toda la app
// ============================================================

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Notification } from '@core/services/notification';

import { HasRole } from '@shared/directives/has-role';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, HasRole],
  templateUrl: './navbar.html', 
  styleUrl: './navbar.scss',
  
})
export class Navbar {
  // Publicos para poder usarlos directo desde el HTML
  auth = inject(Auth);
  notificacion = inject(Notification);
  private router = inject(Router);

  // Primera letra del nombre, para el circulo del usuario
  // Si no hay usuario, devuelve texto vacio
  inicial(): string {
    const usuario = this.auth.usuarioActual;
    if (usuario === null) {
      return '';
    }
    return usuario.nombre.charAt(0);
  }

  // Simula una notificacion nueva 
  verNotificaciones(): void {
    this.notificacion.info('Tienes una solicitud de match nueva');
  }

  // Cierra la sesion  y manda a la pantalla de login
  salir(): void {
    this.router.navigate(['/']).then(() => {
      this.auth.cerrarSesion();
    });
  }
}