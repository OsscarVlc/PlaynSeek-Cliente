// ============================================================
// features/errors/not-found/not-found.ts
// Pantalla de pagina no encontrada
// ============================================================

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Navbar } from '@core/layout/navbar/navbar';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Navbar],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {}