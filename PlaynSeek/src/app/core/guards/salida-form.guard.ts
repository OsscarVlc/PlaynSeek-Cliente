import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { Confirm } from '@core/services/confirm';

export interface FormularioConSalida {
  tieneCambiosSinGuardar?: () => boolean;
  puedeDesactivar?: () => boolean | Promise<boolean>;
}

export const salidaFormGuard: CanDeactivateFn<FormularioConSalida> = (component) => {
  const confirm = inject(Confirm);

  if (component.puedeDesactivar) {
    return component.puedeDesactivar();
  }

  if (component.tieneCambiosSinGuardar && component.tieneCambiosSinGuardar()) {
    return confirm.pedirAsync(
      'Tienes cambios sin guardar en el formulario. ¿Estás seguro de que deseas salir?',
      'Cambios sin guardar'
    );
  }

  return true;
};
