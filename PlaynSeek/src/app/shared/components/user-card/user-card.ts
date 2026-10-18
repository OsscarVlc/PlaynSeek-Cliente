// ============================================================
// shared/components/user-card/user-card.ts
// Tarjeta de un usuario
// ============================================================

import { Component, Input } from '@angular/core';

import { Usuario } from '@shared/models/usuario';
import { PlatformBadge } from '@shared/directives/platform-badge';

@Component({
  selector: 'app-user-card',
  imports: [PlatformBadge],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  @Input() usuario!: Usuario;
}