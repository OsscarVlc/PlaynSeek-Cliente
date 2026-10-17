// ============================================================
// core/layout/public-layout/public-layout.ts
// Marco de las pantallas públicas (landing, login, registro...)
// ============================================================

import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss',
})
export class PublicLayout {}