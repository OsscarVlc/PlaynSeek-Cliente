// ============================================================
// features/grupos/subir-portada/subir-portada.spec.ts
// Pruebas unitarias de validación y subida de archivos (Entrega 4)
// Autor: Andrés Huerta
// ============================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SubirPortada } from './subir-portada';
import { GrupoApi } from '@core/services/grupo-api';
import { Notification } from '@core/services/notification';
import { Confirm } from '@core/services/confirm';

describe('SubirPortada (Validaciones de Archivos)', () => {
  let component: SubirPortada;
  let fixture: ComponentFixture<SubirPortada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirPortada],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        GrupoApi,
        Notification,
        Confirm,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubirPortada);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('grupoId', 'g123');
    fixture.componentRef.setInput('puedeEditar', true);
    fixture.detectChanges();
  });

  it('debe instanciarse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe rechazar archivos con formato no permitido (ej. PDF)', () => {
    const archivoInvalido = new File(['dummy'], 'documento.pdf', { type: 'application/pdf' });
    component.procesarArchivo(archivoInvalido);

    expect(component.archivoSeleccionado()).toBeNull();
    expect(component.vistaPrevia()).toBeNull();
    expect(component.mensajeError()).toContain('Formato no permitido');
  });

  it('debe rechazar imágenes que superen el límite de 5 MB', () => {
    // 6 MB en bytes
    const tamanoExcesivo = 6 * 1024 * 1024;
    const blobGigante = new Blob([new Uint8Array(tamanoExcesivo)], { type: 'image/jpeg' });
    const archivoPesado = new File([blobGigante], 'portada-pesada.jpg', { type: 'image/jpeg' });

    component.procesarArchivo(archivoPesado);

    expect(component.archivoSeleccionado()).toBeNull();
    expect(component.vistaPrevia()).toBeNull();
    expect(component.mensajeError()).toContain('excede el tamaño máximo permitido de 5 MB');
  });

  it('debe aceptar una imagen JPG válida menor a 5 MB', () => {
    const archivoValido = new File(['dummy content'], 'portada.jpg', { type: 'image/jpeg' });
    component.procesarArchivo(archivoValido);

    expect(component.archivoSeleccionado()).toBe(archivoValido);
    expect(component.mensajeError()).toBe('');
  });

  it('debe permitir cancelar la subida y resetear el progreso', () => {
    component.cancelarSubida();
    expect(component.subiendo()).toBe(false);
    expect(component.porcentajeProgreso()).toBe(0);
  });
});
