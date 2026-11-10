import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Auth } from '@core/services/auth';
import { Confirm } from '@core/services/confirm';
import { Notification } from '@core/services/notification';
import { PlatformBadge } from '@shared/directives/platform-badge';
import { USUARIOS_MOCK } from '@shared/mock/usuarios.mock';
import { Juego } from '@shared/models/juego';
import {
  IDIOMAS,
  Idioma,
  MODOS_DE_JUEGO,
  ModoDeJuego,
  PLATAFORMAS,
  Plataforma,
  PlataformaUsuario,
  SEXOS,
  Sexo,
} from '@shared/models/usuario';
import { JuegosDemoService } from '../../juegos/services/juegos-demo';

@Component({
  selector: 'app-perfil-form',
  imports: [ReactiveFormsModule, RouterLink, PlatformBadge],
  templateUrl: './perfil-form.html',
  styleUrl: './perfil-form.scss',
})
export class PerfilForm {
  private fb = inject(FormBuilder);
  auth = inject(Auth);
  juegosDemo = inject(JuegosDemoService);
  notificacion = inject(Notification);
  confirmar = inject(Confirm);

  private readonly baseUsuario = USUARIOS_MOCK[0];

  readonly sexos = SEXOS;
  readonly modosDisponibles = MODOS_DE_JUEGO;
  readonly idiomasDisponibles = IDIOMAS;
  readonly plataformasCatalogo = PLATAFORMAS;

  readonly diasSemana = [
    'lunes',
    'martes',
    'miércoles',
    'jueves',
    'viernes',
    'sábado',
    'domingo',
  ];

  readonly bloquesHorario = [
    { valor: 'mañana', etiqueta: 'Mañana (08:00 - 12:00)', icono: 'bi-sunrise' },
    { valor: 'tarde', etiqueta: 'Tarde (12:00 - 19:00)', icono: 'bi-sun' },
    { valor: 'noche', etiqueta: 'Noche (19:00 - 00:00)', icono: 'bi-moon-stars' },
    { valor: 'madrugada', etiqueta: 'Madrugada (00:00+)', icono: 'bi-stars' },
  ];

  readonly zonasHorarias = [
    'America/Mexico_City',
    'America/Monterrey',
    'America/Bogota',
    'America/Lima',
    'America/Santiago',
    'America/Argentina/Buenos_Aires',
    'Europe/Madrid',
  ];

  readonly fotoPreview = signal<string | null>(
    this.baseUsuario.foto_perfil ?? null
  );
  readonly disponibilidad = signal<string[]>([
    ...(this.baseUsuario.disponibilidad ?? ['lunes', 'miércoles', 'viernes']),
  ]);
  readonly horarioJuego = signal<string[]>([
    ...(this.baseUsuario.horario_juego ?? ['noche']),
  ]);
  readonly idiomas = signal<Idioma[]>([
    ...(this.baseUsuario.idiomas ?? ['español', 'inglés']),
  ]);
  readonly modosJuego = signal<ModoDeJuego[]>([
    ...(this.baseUsuario.modo_juego ?? ['competitivo', 'cooperativo']),
  ]);
  readonly plataformas = signal<PlataformaUsuario[]>([
    ...(this.baseUsuario.plataformas ?? [
      { nombre: 'pc', gamertag: 'OsscarVlc' },
      { nombre: 'playstation', gamertag: 'Oscar_PS' },
    ]),
  ]);

  readonly nuevaPlataforma = signal<Plataforma>('xbox');
  readonly nuevoGamertag = signal<string>('');
  readonly juegoParaAgregar = signal<string>('j2');

  readonly formulario = this.fb.nonNullable.group({
    nombre: [
      this.auth.usuarioActual?.nombre ?? this.baseUsuario.nombre,
      [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    ],
    correo: [
      this.auth.usuarioActual?.correo ?? this.baseUsuario.correo,
      [Validators.required, Validators.email],
    ],
    edad: [
      this.baseUsuario.edad ?? 22,
      [Validators.required, Validators.min(13), Validators.max(99)],
    ],
    sexo: [(this.baseUsuario.sexo ?? 'masculino') as Sexo, [Validators.required]],
    zona_horaria: [
      this.baseUsuario.zona_horaria ?? 'America/Mexico_City',
      [Validators.required],
    ],
  });

  readonly juegosNoActivos = computed<Juego[]>(() =>
    this.juegosDemo
      .juegos()
      .filter((j) => !this.juegosDemo.estaJugandoActualmente(j._id))
  );

  readonly porcentajeCompletado = computed<number>(() => {
    let puntos = 2;
    if (this.disponibilidad().length > 0) puntos++;
    if (this.horarioJuego().length > 0) puntos++;
    if (this.idiomas().length > 0) puntos++;
    if (this.modosJuego().length > 0) puntos++;
    if (this.plataformas().length > 0) puntos++;
    if (this.juegosDemo.juegosActivos().length > 0) puntos++;
    return Math.round((puntos / 8) * 100);
  });

  iniciales(): string {
    const nombre = this.formulario.controls.nombre.value || 'Jugador';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) {
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.notificacion.error('La imagen supera el tamaño máximo de 5 MB.');
      input.value = '';
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === 'string') {
        this.fotoPreview.set(lector.result);
        this.notificacion.exito('Foto de perfil cargada en vista previa.');
      }
    };
    lector.readAsDataURL(archivo);
  }

  quitarFoto(input: HTMLInputElement): void {
    this.confirmar.pedir(
      '¿Deseas eliminar tu foto de perfil actual y volver a mostrar tus iniciales?',
      () => {
        this.fotoPreview.set(null);
        input.value = '';
        this.notificacion.info('Foto de perfil eliminada.');
      },
      'Quitar foto de perfil'
    );
  }

  alternarDia(dia: string): void {
    this.disponibilidad.update((lista) =>
      lista.includes(dia) ? lista.filter((d) => d !== dia) : [...lista, dia]
    );
  }

  alternarHorario(bloque: string): void {
    this.horarioJuego.update((lista) =>
      lista.includes(bloque)
        ? lista.filter((b) => b !== bloque)
        : [...lista, bloque]
    );
  }

  alternarIdioma(idioma: Idioma): void {
    this.idiomas.update((lista) =>
      lista.includes(idioma)
        ? lista.filter((i) => i !== idioma)
        : [...lista, idioma]
    );
  }

  alternarModo(modo: ModoDeJuego): void {
    this.modosJuego.update((lista) =>
      lista.includes(modo)
        ? lista.filter((m) => m !== modo)
        : [...lista, modo]
    );
  }

  agregarPlataforma(): void {
    const nombre = this.nuevaPlataforma();
    const gamertag = this.nuevoGamertag().trim();

    if (!gamertag) {
      this.notificacion.advertencia(
        'Escribe tu gamertag o ID antes de agregar la plataforma.'
      );
      return;
    }

    const existe = this.plataformas().some((p) => p.nombre === nombre);
    if (existe) {
      this.plataformas.update((lista) =>
        lista.map((p) => (p.nombre === nombre ? { nombre, gamertag } : p))
      );
      this.notificacion.info(
        `Se actualizó tu gamertag en ${this.juegosDemo.etiquetaPlataforma(nombre)}.`
      );
    } else {
      this.plataformas.update((lista) => [...lista, { nombre, gamertag }]);
      this.notificacion.exito(
        `Plataforma ${this.juegosDemo.etiquetaPlataforma(nombre)} vinculada.`
      );
    }

    this.nuevoGamertag.set('');
  }

  eliminarPlataforma(plat: PlataformaUsuario): void {
    this.confirmar.pedir(
      `¿Deseas desvincular tu cuenta de ${this.juegosDemo.etiquetaPlataforma(plat.nombre)} (${plat.gamertag}) de tu perfil?`,
      () => {
        this.plataformas.update((lista) =>
          lista.filter((item) => item.nombre !== plat.nombre)
        );
        this.notificacion.info(
          `Plataforma ${this.juegosDemo.etiquetaPlataforma(plat.nombre)} eliminada.`
        );
      },
      'Desvincular plataforma'
    );
  }

  agregarJuegoARotacion(): void {
    const id = this.juegoParaAgregar();
    const juego = this.juegosDemo.obtenerJuegoPorId(id);
    if (!juego) {
      return;
    }

    this.juegosDemo.activarJuego(juego._id, true);
    this.notificacion.exito(
      `"${juego.titulo}" fue agregado a tus juegos activos.`
    );

    const siguiente = this.juegosNoActivos()[0];
    if (siguiente) {
      this.juegoParaAgregar.set(siguiente._id);
    }
  }

  quitarJuegoActivo(juegoId: string): void {
    const titulo = this.tituloJuego(juegoId);
    this.confirmar.pedir(
      `¿Deseas quitar "${titulo}" de tus juegos activos?`,
      () => {
        this.juegosDemo.quitarJuegoActivo(juegoId);
        this.notificacion.info(`"${titulo}" se quitó de tus juegos activos.`);
      },
      'Quitar juego activo'
    );
  }

  moverJuegoAHistorial(juegoId: string): void {
    const titulo = this.tituloJuego(juegoId);
    this.confirmar.pedir(
      `¿Quieres mover "${titulo}" a tu historial de juegos pasados?`,
      () => {
        this.juegosDemo.marcarComoJugadoAntes(juegoId);
        this.notificacion.exito(
          `"${titulo}" se movió a tus juegos jugados anteriormente.`
        );
      },
      'Mover a juegos pasados'
    );
  }

  reactivarJuegoPasado(juegoId: string): void {
    const titulo = this.tituloJuego(juegoId);
    this.juegosDemo.activarJuego(juegoId, true);
    this.notificacion.exito(`¡Volviste a activar "${titulo}" en tu rotación!`);
  }

  quitarJuegoPasado(juegoId: string): void {
    const titulo = this.tituloJuego(juegoId);
    this.confirmar.pedir(
      `¿Deseas eliminar "${titulo}" de tu historial de juegos pasados?`,
      () => {
        this.juegosDemo.quitarDeJugadosAntes(juegoId);
        this.notificacion.info(`Se eliminó "${titulo}" de tu historial.`);
      },
      'Eliminar del historial'
    );
  }

  alternarBuscaEquipoEnPerfil(juegoId: string): void {
    const titulo = this.tituloJuego(juegoId);
    const buscando = this.juegosDemo.alternarBuscaEquipo(juegoId);
    if (buscando) {
      this.notificacion.exito(`Buscando squad activado para ${titulo}.`);
    } else {
      this.notificacion.info(`Buscando squad pausado para ${titulo}.`);
    }
  }

  restablecerFormulario(): void {
    this.confirmar.pedir(
      '¿Deseas descartar los cambios no guardados y restaurar los valores predeterminados de tu perfil?',
      () => {
        this.formulario.reset({
          nombre: this.baseUsuario.nombre,
          correo: this.baseUsuario.correo,
          edad: this.baseUsuario.edad ?? 22,
          sexo: (this.baseUsuario.sexo ?? 'masculino') as Sexo,
          zona_horaria: this.baseUsuario.zona_horaria ?? 'America/Mexico_City',
        });
        this.disponibilidad.set([
          ...(this.baseUsuario.disponibilidad ?? ['lunes', 'miércoles', 'viernes']),
        ]);
        this.horarioJuego.set([...(this.baseUsuario.horario_juego ?? ['noche'])]);
        this.idiomas.set([...(this.baseUsuario.idiomas ?? ['español', 'inglés'])]);
        this.modosJuego.set([
          ...(this.baseUsuario.modo_juego ?? ['competitivo', 'cooperativo']),
        ]);
        this.plataformas.set([
          ...(this.baseUsuario.plataformas ?? [
            { nombre: 'pc', gamertag: 'OsscarVlc' },
            { nombre: 'playstation', gamertag: 'Oscar_PS' },
          ]),
        ]);
        this.juegosDemo.restaurarRotacionInicial();
        this.notificacion.info('Se restauraron los datos originales del perfil.');
      },
      'Restablecer perfil'
    );
  }

  desactivarCuenta(): void {
    this.confirmar.pedir(
      '¿Estás seguro de que deseas desactivar tu cuenta? Tu perfil se ocultará del matchmaking hasta que vuelvas a iniciar sesión.',
      () => {
        this.notificacion.advertencia(
          'Solicitud de desactivación confirmada (modo demostración: tu cuenta sigue visible para pruebas).'
        );
      },
      'Desactivar cuenta'
    );
  }

  guardarPerfil(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.notificacion.error(
        'Por favor revisa los campos obligatorios (nombre, correo y edad válida).'
      );
      return;
    }

    const datos = this.formulario.getRawValue();

    if (this.auth.usuarioActual) {
      this.auth.usuarioActual.nombre = datos.nombre.trim();
      this.auth.usuarioActual.correo = datos.correo.trim();
      this.auth.usuarioActual.edad = datos.edad;
      this.auth.usuarioActual.sexo = datos.sexo;
      this.auth.usuarioActual.zona_horaria = datos.zona_horaria;
      this.auth.usuarioActual.disponibilidad = [...this.disponibilidad()];
      this.auth.usuarioActual.horario_juego = [...this.horarioJuego()];
      this.auth.usuarioActual.idiomas = [...this.idiomas()];
      this.auth.usuarioActual.modo_juego = [...this.modosJuego()];
      this.auth.usuarioActual.plataformas = [...this.plataformas()];
    }

    this.notificacion.exito('¡Tu perfil de jugador se actualizó correctamente!');
  }

  tituloJuego(juegoId: string): string {
    return (
      this.juegosDemo.obtenerJuegoPorId(juegoId)?.titulo ?? 'Juego del catálogo'
    );
  }
}
