import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss',
})
export class ConfirmEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(Auth);
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  readonly correo = signal('nightfall@ejemplo.com');
  readonly nombre = signal('Nightfall');
  readonly verificado = signal(false);
  readonly reenvios = signal(0);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const correoParam = params.get('correo');
    const nombreParam = params.get('nombre');

    if (correoParam) {
      this.correo.set(correoParam);
    }
    if (nombreParam) {
      this.nombre.set(nombreParam);
    }
  }

  confirmarCuentaDemo(): void {
    this.verificado.set(true);
    this.notificacion.exito(
      `¡Correo ${this.correo()} verificado correctamente! Tu cuenta está activa.`
    );
  }

  entrarAlPortal(): void {
    this.auth.iniciarSesion();
    this.notificacion.exito('Sesión iniciada. ¡Bienvenido a Play N Seek!');
    this.router.navigate(['/dashboard']);
  }

  reenviarCorreo(): void {
    this.reenvios.update((n) => n + 1);
    this.notificacion.info(
      `Se reenvió el enlace de confirmación a ${this.correo()}. Revisa también tu carpeta de spam.`
    );
  }

  usarOtroCorreo(): void {
    this.confirmar.pedir(
      `¿Deseas cancelar la verificación de ${this.correo()} y volver al formulario de registro?`,
      () => {
        this.notificacion.advertencia('Regresando al registro para cambiar de correo.');
        this.router.navigate(['/registro']);
      },
      'Cambiar correo electrónico'
    );
  }
}
