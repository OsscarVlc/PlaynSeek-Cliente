// ============================================================
// features/auth/login/login.ts
// Pantalla de inicio de sesión conectada al back 
// ============================================================

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';


import { Auth } from '@core/services/auth';
import { Notification } from '@core/services/notification';
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
  private route = inject(ActivatedRoute);
  auth = inject(Auth);
  notificacion = inject(Notification);

  readonly mostrarPassword = signal(false);

  // true mientras la petición viaja al back: sirve para deshabilitar el botón
  readonly enviando = signal(false);

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

  // El back aun no tiene acceso con Google, asi que solo se avisa
  iniciarConGoogle(): void {
    this.notificacion.info('El acceso con Google estará disponible pronto');
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
    const password = this.formulario.controls.password.value;

    this.enviando.set(true);

    // login. El back responde { token } y Auth lo guarda
    this.auth.login(correo, password).subscribe({
      next: () => this.cargarSesion(),
      // el toast del error ya lo mostro el interceptor
      error: () => this.enviando.set(false),
    });
  }


  // con el token guardado, pedimos quien es el usuario y lo
  // regresamos a la ruta que queria visitar o al dashboard
  private cargarSesion(): void {
    this.auth.cargarUsuario().subscribe({
      next: () => {
        this.enviando.set(false);
        this.notificacion.exito(
          '¡Bienvenido de vuelta, ' +
            (this.auth.usuarioActual?.nombre.split(' ')[0] ?? 'Jugador') +
            '!'
        );
        this.router.navigateByUrl(this.rutaDeRegreso());
      },
      error: () => this.enviando.set(false),
    });
  }

  // esta funcion devuelve la ruta a la que el usuario queria entrar
  // antes de ser redirigido al login
  private rutaDeRegreso(): string {
    const destino = this.route.snapshot.queryParamMap.get('returnUrl');

    // Si el returnUrl es una ruta relativa (empieza con / pero no con //) la devolvemos
    // esta validación evita que alguien ponga un returnUrl externo y nos haga redirigir a otro sitio
    if (destino && destino.startsWith('/') && !destino.startsWith('//')) {
      return destino;
    }
    return '/dashboard';
  }
}