// ============================================================
// core/layout/navbar/navbar.ts
// Muestra el nombre del usuario con sesión y permite ir al perfil o cerrar sesión.
// ============================================================

import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  // Pedimos el servicio  y lo dejamos públicopara poder leerlo directo desde el HTML
  auth = inject(Auth);
  private router = inject(Router);

  // Se ejecuta al presionar Cerrar sesión y borra la sesión
  // simulada y manda al usuario a la pantalla de login
  salir(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}