import {
  Directive,
  DoCheck,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';

import { Auth } from '@core/services/auth';
import { Rol } from '@shared/models/usuario';

// Muestra el elemento si el usuario tiene alguno de los roles permitidos.
@Directive({
  selector: '[appHasRole]',
  standalone: true,
})
export class HasRole implements DoCheck {
  private readonly auth = inject(Auth);

  // El contenido HTML sobre el que colocamos la directiva.
  private readonly plantilla = inject(TemplateRef<unknown>);

  // El lugar donde insertamos o quitamos ese contenido.
  private readonly contenedor = inject(ViewContainerRef);

  // Nos permite evitar que el mismo elemento se cree varias veces.
  private visible = false;

  // Lista de roles que pueden ver el contenido.
  @Input({ required: true }) appHasRole: Rol[] = [];

  ngDoCheck(): void {
    const permitido = this.auth.tieneRol(this.appHasRole);

    // Si el permiso no cambió, dejamos la vista como está.
    if (permitido === this.visible) return;

    this.visible = permitido;

    if (permitido) {
      this.contenedor.createEmbeddedView(this.plantilla);
    } else {
      this.contenedor.clear();
    }
  }
}