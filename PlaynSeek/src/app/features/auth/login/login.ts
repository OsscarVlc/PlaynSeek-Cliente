import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { USUARIOS_MOCK } from '@shared/mock/usuarios.mock';
import { Rol } from '@shared/models/usuario';

interface CuentaDemo {
  etiqueta: string;
  correo: string;
  rol: Rol;
  descripcion: string;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  auth = inject(Auth);
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  readonly mostrarPassword = signal(false);

  readonly cuentasDemo: CuentaDemo[] = [
    {
      etiqueta: 'Usuario',
      correo: 'oscar@correo.com',
      rol: 'usuario',
      descripcion: 'Vista estándar del portal',
    },
    {
      etiqueta: 'Moderador',
      correo: 'sofia@correo.com',
      rol: 'moderador',
      descripcion: 'Habilita panel de Reportes',
    },
    {
      etiqueta: 'Admin',
      correo: 'diego@correo.com',
      rol: 'administrador',
      descripcion: 'Habilita Reportes y Usuarios',
    },
  ];

  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    recordarme: [false],
  });

  alternarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  iniciarConGoogle(): void {
    this.auth.iniciarSesion();
    this.notificacion.exito('Sesión iniciada con Google correctamente');
    this.router.navigate(['/dashboard']);
  }

  rellenarCuentaDemo(cuenta: CuentaDemo): void {
    this.formulario.patchValue({
      correo: cuenta.correo,
      password: 'PlayNSeek2026!',
    });
    this.notificacion.info(
      `Credenciales cargadas para rol ${cuenta.etiqueta} (${cuenta.correo})`
    );
  }

  ingresar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificacion.advertencia(
        'Revisa tu correo electrónico y contraseña antes de continuar.'
      );
      return;
    }

    const correo = this.formulario.controls.correo.value.trim().toLowerCase();
    const usuarioMock = USUARIOS_MOCK.find(
      (u) => u.correo.toLowerCase() === correo
    );

    if (usuarioMock && !usuarioMock.isActive) {
      this.notificacion.error(
        'Esta cuenta se encuentra desactivada temporalmente. Contacta a un administrador.'
      );
      return;
    }

    if (usuarioMock && !usuarioMock.correo_confirmado) {
      this.confirmar.pedir(
        `La cuenta ${usuarioMock.correo} aún no ha confirmado su correo electrónico. ¿Deseas ir a la pantalla de verificación ahora?`,
        () => {
          this.notificacion.info('Redirigiendo a confirmación de correo...');
          this.router.navigate(['/confirmar-correo'], {
            queryParams: { correo: usuarioMock.correo },
          });
        },
        'Correo pendiente de confirmar'
      );
      return;
    }

    this.auth.iniciarSesion();

    if (usuarioMock) {
      this.auth.cambiarRol(usuarioMock.rol);
    }

    this.notificacion.exito(
      `¡Bienvenido de vuelta, ${this.auth.usuarioActual?.nombre ?? 'Jugador'}!`
    );
    this.router.navigate(['/dashboard']);
  }
}
