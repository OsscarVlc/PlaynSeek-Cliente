import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { GrupoApi } from '@core/services/grupo-api';
import { Notification } from '@core/services/notification';
import { FormularioConSalida } from '@core/guards/salida-form.guard';
import { DatosGrupo, Grupo } from '@shared/models/grupo';
import { noSoloEspacios } from '@shared/validators/no-solo-espacios';

@Component({
  selector: 'app-grupo-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './grupo-form.html',
  styleUrl: './grupo-form.scss',
})
export class GrupoForm implements OnInit, FormularioConSalida {
  private readonly formBuilder = inject(FormBuilder);
  private readonly grupoApi = inject(GrupoApi);
  private readonly auth = inject(Auth);
  private readonly notificacion = inject(Notification);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly id = signal<string | null>(null);
  readonly esEdicion = computed(() => !!this.id());
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly errorCarga = signal<string | null>(null);
  readonly errorEnvio = signal<string | null>(null);
  readonly guardadoExitoso = signal(false);
  readonly grupoExistente = signal<Grupo | null>(null);
  readonly esLider = signal(true);

  readonly formulario = this.formBuilder.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        noSoloEspacios(),
      ],
    ],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id.set(idParam);
      this.cargarGrupo(idParam);
    }
  }

  cargarGrupo(id: string): void {
    this.cargando.set(true);
    this.errorCarga.set(null);

    this.grupoApi.obtener(id).subscribe({
      next: (grupo) => {
        this.grupoExistente.set(grupo);
        this.formulario.reset({
          nombre: grupo.nombre,
          descripcion: grupo.descripcion || '',
        });

        const usuario = this.auth.usuarioActual;
        if (usuario && grupo.lider_id && usuario._id !== grupo.lider_id) {
          this.esLider.set(false);
          this.formulario.disable();
        }

        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        const mensaje =
          err?.error?.message ||
          'No se pudo encontrar la información del grupo o el servidor no responde.';
        this.errorCarga.set(mensaje);
      },
    });
  }

  tieneCambiosSinGuardar(): boolean {
    if (this.guardadoExitoso()) {
      return false;
    }
    return this.formulario.dirty;
  }

  guardar(): void {
    if (this.esEdicion() && !this.esLider()) {
      return;
    }

    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.guardando()) {
      return;
    }

    const valores = this.formulario.getRawValue();
    const datos: DatosGrupo = {
      nombre: valores.nombre.trim(),
      descripcion: valores.descripcion.trim(),
    };

    this.guardando.set(true);
    this.errorEnvio.set(null);

    if (this.esEdicion()) {
      const idGrupo = this.id()!;
      this.grupoApi.actualizar(idGrupo, datos).subscribe({
        next: (grupoActualizado) => {
          this.guardando.set(false);
          this.guardadoExitoso.set(true);
          this.notificacion.exito('Grupo actualizado con éxito.');
          void this.router.navigate(['/grupos', grupoActualizado._id || idGrupo]);
        },
        error: (err) => {
          this.guardando.set(false);
          const mensaje =
            err?.error?.message || 'Ocurrió un error al actualizar el grupo.';
          this.errorEnvio.set(mensaje);
          this.notificacion.error(mensaje);
        },
      });
    } else {
      this.grupoApi.crear(datos).subscribe({
        next: (nuevoGrupo) => {
          this.guardando.set(false);
          this.guardadoExitoso.set(true);
          this.notificacion.exito('Grupo creado exitosamente.');
          void this.router.navigate(['/grupos', nuevoGrupo._id]);
        },
        error: (err) => {
          this.guardando.set(false);
          const mensaje =
            err?.error?.message || 'Ocurrió un error al crear el grupo.';
          this.errorEnvio.set(mensaje);
          this.notificacion.error(mensaje);
        },
      });
    }
  }

  inicialNombre(): string {
    const val = this.formulario.controls.nombre.value.trim();
    return val.length > 0 ? val.charAt(0).toUpperCase() : '+';
  }
}
