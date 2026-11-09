// ============================================================
// features/auth/login/login.ts
// Pantalla de inicio de sesión conectada al back 
// ============================================================

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


import { Auth } from '@core/services/auth';
import { Notification } from '@core/services/notification';



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

  // Mensaje del back cuando el login falla
  readonly errorLogin = signal('');

  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });


  constructor() {
    // valueChanges avisa cada vez que cambia algun campo del formulario
    // Si el usuario corrige el correo o la contraseña, el error del intento
    // anterior ya no aplica, asi que lo borramos.
    // takeUntilDestroyed cancela esta suscripcion cuando se cierra la
    // pantalla, para que no quede escuchando para siempre.
    this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.errorLogin.set('');
    });
  }

  alternarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }

  // El back aun no tiene acceso con Google, asi que solo se avisa
  iniciarConGoogle(): void {
    this.notificacion.info('El acceso con Google estará disponible pronto');
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
    this.errorLogin.set('');

    // login. El back responde { token } y Auth lo guarda
    this.auth.login(correo, password).subscribe({
      next: () => this.cargarSesion(),
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        // 401 = credenciales inválidas o correo sin confirmar: mostramos
        // el mensaje del back también dentro del formulario
        if (err.status === 401) {
          this.errorLogin.set(err.error?.message ?? 'Credenciales inválidas');
        }
      },
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
            '!',
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