import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noSoloEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined) {
      return null;
    }

    if (typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0) {
      return { soloEspacios: true };
    }

    return null;
  };
}
