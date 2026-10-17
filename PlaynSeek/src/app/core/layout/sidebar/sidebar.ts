// ============================================================
// core/layout/sidebar/sidebar.ts
// Menú lateral de la app
// ============================================================

import { Component, inject } from '@angular/core';


import { RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '@core/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  // Público para poder llamar auth.tieneRol() desde el HTML
  auth = inject(Auth);
}