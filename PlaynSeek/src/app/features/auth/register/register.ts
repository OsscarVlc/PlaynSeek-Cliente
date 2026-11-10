import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Notification } from '@core/services/notification';
import { noSoloEspacios } from '@shared/validators/no-solo-espacios';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  auth = inject(Auth);
  notificacion = inject(Notification);

  readonly mostrarPassword = signal(false);
  readonly mostrarConfirmar = signal(false);
  readonly passwordTexto = signal('');

  // true mientras viaja la petición al backend para deshabilitar el botón
  readonly enviando = signal(false);

  // Mensaje cuando el correo ya está registrado en el backend
  readonly errorCorreo = signal('');

  readonly formulario = this.fb.nonNullable.group(
    {
      nombre: [
        '',
        [
          Validators.required,
          noSoloEspacios(),
          Validators.minLength(3),
          Validators.maxLength(40),
        ],
      ],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]],
    },
    {
      validators: [
        (group: AbstractControl): ValidationErrors | null => {
          const pass = group.get('password')?.value;
          const conf = group.get('confirmarPassword')?.value;
          if (conf && pass !== conf) {
            return { noCoinciden: true };
          }
          return null;
        },
      ],
    }
  );

  constructor() {
    // Si el usuario modifica el correo, limpiamos el error del intento previo
    this.formulario.controls.correo.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.errorCorreo.set('');
        if (this.formulario.controls.correo.hasError('yaExiste')) {
          const errors = { ...this.formulario.controls.correo.errors };
          delete errors['yaExiste'];
          this.formulario.controls.correo.setErrors(
            Object.keys(errors).length ? errors : null
          );
        }
      });
  }

  readonly nivelFortaleza = computed(() => {
    const valor = this.passwordTexto();
    if (!valor) {
      return 0;
    }
    let puntos = 0;
    if (valor.length >= 8) puntos++;
    if (/[0-9]/.test(valor) && /[a-zA-Z]/.test(valor)) puntos++;
    if (valor.length >= 10 && /[^a-zA-Z0-9]/.test(valor)) puntos++;
    return Math.max(1, puntos);
  });

  readonly detalleFortaleza = computed(() => {
    const valor = this.passwordTexto();
    if (!valor) {
      return 'Mínimo 8 caracteres · Incluye números y símbolos';
    }
    const tieneNumero = /[0-9]/.test(valor);
    const tieneSimbolo = /[^a-zA-Z0-9]/.test(valor);

    if (tieneNumero && tieneSimbolo) {
      return `${valor.length} caracteres · Incluye números y símbolos`;
    }
    if (tieneNumero) {
      return `${valor.length} caracteres · Incluye números (agrega un símbolo)`;
    }
    return `${valor.length} caracteres · Agrega números y símbolos`;
  });

  actualizarPassword(valor: string): void {
    this.passwordTexto.set(valor);
  }

  alternarPassword(): void {
    this.mostrarPassword.update((v) => !v);
  }

  alternarConfirmar(): void {
    this.mostrarConfirmar.update((v) => !v);
  }

  registrarseConGoogle(): void {
    this.notificacion.info('El registro con Google estará disponible pronto');
  }

  verDocumento(nombreDoc: string, event: Event): void {
    event.preventDefault();
    this.notificacion.info(
      `${nombreDoc}: Respeto entre jugadores, cero toxicidad y uso responsable de la plataforma.`
    );
  }

  passwordsCoinciden(): boolean {
    const { password, confirmarPassword } = this.formulario.getRawValue();
    return password === confirmarPassword;
  }

  crearCuenta(): void {
    if (this.formulario.invalid || !this.passwordsCoinciden()) {
      this.formulario.markAllAsTouched();
      if (!this.passwordsCoinciden()) {
        this.notificacion.error('Las contraseñas no coinciden. Verifícalas por favor.');
      } else {
        this.notificacion.advertencia('Completa todos los campos requeridos y acepta los términos.');
      }
      return;
    }

    const { nombre, correo, password } = this.formulario.getRawValue();

    this.enviando.set(true);
    this.errorCorreo.set('');

    this.auth
      .registrar({
        name: nombre.trim(),
        email: correo.trim().toLowerCase(),
        password: password,
      })
      .subscribe({
        next: (res) => {
          this.enviando.set(false);
          this.notificacion.exito(
            res.message ?? `¡Cuenta creada para ${nombre.trim()}! Revisa tu correo para confirmarla.`
          );
          this.router.navigate(['/confirmar-correo'], {
            queryParams: {
              correo: correo.trim().toLowerCase(),
              nombre: nombre.trim(),
            },
          });
        },
        error: (err: HttpErrorResponse) => {
          this.enviando.set(false);
          if (err.status === 400) {
            const mensaje =
              err.error?.message ?? 'Este correo ya esta siendo utilizado';
            this.errorCorreo.set(mensaje);
            this.formulario.controls.correo.setErrors({ yaExiste: true });
            this.formulario.controls.correo.markAsTouched();
          }
        },
      });
  }
}
