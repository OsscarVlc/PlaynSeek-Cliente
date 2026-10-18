import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GruposDemo } from '../services/grupos-demo';

@Component({
  selector: 'app-grupo-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './grupo-form.html',
  styleUrl: './grupo-form.scss',
})
export class GrupoForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly gruposService = inject(GruposDemo);
  private readonly router = inject(Router);

  readonly imagenPreview = signal<string | null>(null);
  readonly errorImagen = signal('');
  readonly leyendoImagen = signal(false);

  readonly formulario = this.formBuilder.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.pattern(/\S/),
      Validators.maxLength(60),
    ]],
    descripcion: ['', [Validators.maxLength(500)]],
  });

  seleccionarImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    this.errorImagen.set('');

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

    if (!tiposPermitidos.includes(archivo.type)) {
      this.errorImagen.set('Selecciona una imagen JPG, PNG o WebP.');
      input.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      this.errorImagen.set('La imagen no debe superar los 5 MB.');
      input.value = '';
      return;
    }

    this.leyendoImagen.set(true);

    const lector = new FileReader();

    lector.onload = () => {
      this.imagenPreview.set(lector.result as string);
      this.leyendoImagen.set(false);
    };

    lector.onerror = () => {
      this.errorImagen.set('No pudimos leer la imagen. Inténtalo otra vez.');
      this.leyendoImagen.set(false);
      input.value = '';
    };

    lector.readAsDataURL(archivo);
  }

  quitarImagen(input: HTMLInputElement): void {
    input.value = '';
    this.imagenPreview.set(null);
    this.errorImagen.set('');
  }

  guardar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.leyendoImagen()) return;

    const datos = this.formulario.getRawValue();

    this.gruposService.crear({
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      imagen: this.imagenPreview(),
    });

    void this.router.navigate(['/grupos']);
  }
}