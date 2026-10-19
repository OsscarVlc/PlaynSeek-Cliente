// ============================================================
// features/errors/forbidden/forbidden.ts
// Pantalla de acceso restringido 
// ============================================================

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Navbar } from '@core/layout/navbar/navbar';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, Navbar],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.scss',
})
export class Forbidden {}