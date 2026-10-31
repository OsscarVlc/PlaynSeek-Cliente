// ============================================================
// shared/directives/platform-badge.ts
// Directiva de atributo
// le pone a una etiqueta el color de la plataforma que recibe
// ============================================================

import { Directive, HostBinding, Input } from '@angular/core';

import { Plataforma } from '@shared/models/usuario';

@Directive({
  selector: '[appPlatformBadge]',
})
export class PlatformBadge {
  // El nombre entre comillas es cómo se escribe en el HTML
  //  La propiedad recibe la plataforma, y TypeScript solo deja pasar
  // valores validos ('pc', 'xbox', etc.)
  @Input('appPlatformBadge') plataforma!: Plataforma;

  // @HostBinding conecta una propiedad del elemento (aquí su color de fondo) con el valor que devuelve esta función. 
  // "Host" es el elemento donde se puso la directiva
  @HostBinding('style.backgroundColor')
  get colorFondo(): string {
    switch (this.plataforma) {
      case 'pc':
        return '#0d6efd';
      case 'playstation':
        return '#003791'; 
      case 'xbox':
        return '#107c10'; 
      case 'nintendo_switch':
        return '#e60012';
      case 'mobile':
        return '#6f42c1'; 
      default:
        return '#6c757d'; 
    }
  }
  @HostBinding('style.color') colorTexto = 'white';
}