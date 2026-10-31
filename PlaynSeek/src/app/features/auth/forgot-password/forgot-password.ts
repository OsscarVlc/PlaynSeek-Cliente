import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  readonly enlaceEnviado = signal(false);
  readonly mostrarNuevaPassword = signal(false);

  readonly formularioCorreo = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
  });

  readonly formularioReset = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.minLength(4)]],
    nuevaPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmarPassword: ['', [Validators.required]],
  });

  enviarEnlace(): void {
    if (this.formularioCorreo.invalid) {
      this.formularioCorreo.markAllAsTouched();
      this.notificacion.advertencia('Ingresa un correo electrónico válido para recuperar tu cuenta.');
      return;
    }

    const correo = this.formularioCorreo.controls.correo.value.trim();
    this.enlaceEnviado.set(true);
    this.notificacion.exito(
      `Enviamos las instrucciones de recuperación a ${correo}`
    );
  }

  reenviarEnlace(): void {
    const correo = this.formularioCorreo.controls.correo.value.trim();
    this.notificacion.info(
      `Se ha reenviado un nuevo código y enlace de recuperación a ${correo}.`
    );
  }

  cambiarCorreo(): void {
    this.confirmar.pedir(
      '¿Deseas ingresar una dirección de correo electrónico distinta?',
      () => {
        this.enlaceEnviado.set(false);
        this.notificacion.info('Puedes ingresar otro correo electrónico.');
      },
      'Cambiar correo de recuperación'
    );
  }

  alternarNuevaPassword(): void {
    this.mostrarNuevaPassword.update((v) => !v);
  }

  passwordsCoinciden(): boolean {
    const { nuevaPassword, confirmarPassword } = this.formularioReset.getRawValue();
    return nuevaPassword === confirmarPassword;
  }

  actualizarPassword(): void {
    if (this.formularioReset.invalid || !this.passwordsCoinciden()) {
      this.formularioReset.markAllAsTouched();
      if (!this.passwordsCoinciden()) {
        this.notificacion.error('Las contraseñas nuevas no coinciden.');
      } else {
        this.notificacion.advertencia('Completa el código de verificación y tu nueva contraseña.');
      }
      return;
    }

    this.confirmar.pedir(
      '¿Confirmas la actualización de tu contraseña? Se cerrarán las sesiones activas en otros dispositivos.',
      () => {
        this.notificacion.exito(
          'Contraseña restablecida correctamente. Ya puedes iniciar sesión.'
        );
        this.router.navigate(['/login']);
      },
      'Actualizar contraseña'
    );
  }
}
