import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';

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
  confirmar = inject(Confirm);

  readonly mostrarPassword = signal(false);
  readonly mostrarConfirmar = signal(false);
  readonly passwordTexto = signal('');

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', [Validators.required]],
    aceptaTerminos: [false, [Validators.requiredTrue]],
  });

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
    this.auth.iniciarSesion();
    this.notificacion.exito('Cuenta vinculada con Google correctamente.');
    this.router.navigate(['/dashboard']);
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

    const { nombre, correo } = this.formulario.getRawValue();

    this.confirmar.pedir(
      `¿Confirmas el registro de la cuenta "${nombre.trim()}" con el correo ${correo.trim()}? Te enviaremos un enlace de verificación.`,
      () => {
        this.notificacion.exito(
          `¡Cuenta creada para ${nombre.trim()}! Revisa tu correo para confirmarla.`
        );
        this.router.navigate(['/confirmar-correo'], {
          queryParams: {
            correo: correo.trim(),
            nombre: nombre.trim(),
          },
        });
      },
      'Confirmar creación de cuenta'
    );
  }
}
