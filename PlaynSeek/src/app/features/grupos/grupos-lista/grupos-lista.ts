import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GrupoApi } from '@core/services/grupo-api';
import { Grupo } from '@shared/models/grupo';

//grupos por pagina
const LIMITE = 9;


@Component({
  selector: 'app-grupos-lista',
  imports: [RouterLink],
  templateUrl: './grupos-lista.html',
  styleUrl: './grupos-lista.scss',
})


export class GruposLista {
  private grupoApi = inject(GrupoApi);

// signals -- Estado de la pantalla
  readonly grupos = signal<Grupo[]>([]);
  readonly cargando = signal(true);
  readonly error = signal(false);

  // paginacion
  readonly pagina = signal(1);
  readonly totalPaginas = signal(0);
  readonly total = signal(0);

  readonly busqueda = signal('');   // lo que el usuario esta escribiendo en el input
  readonly busquedaAplicada = signal('');   //  el texto con el que realmente se pidio la lista


  ngOnInit(): void {
    this.cargar();
  }

  // Lee la lista de grupos desde el API y actualiza los signals
  cargar(): void {
    this.cargando.set(true); // para mostrar el spinner
    this.error.set(false); // para ocultar el mensaje de error

    this.grupoApi.listar(this.pagina(), LIMITE, this.busquedaAplicada()).subscribe({
      next: (respuesta) => {
        this.grupos.set(respuesta.data);
        this.totalPaginas.set(respuesta.totalPaginas);
        this.total.set(respuesta.total);
        this.cargando.set(false);
      },

      // Si hay un error, muestra el mensaje y oculta el spinner
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  // Busca los grupos segun el texto en el input y reinicia la paginacion
  buscar(): void {
    this.busquedaAplicada.set(this.busqueda().trim());
    this.pagina.set(1);
    this.cargar();
  }

  // Limpia el input de busqueda y reinicia la paginacion
  limpiarBusqueda(): void {
    this.busqueda.set('');
    this.busquedaAplicada.set('');
    this.pagina.set(1);
    this.cargar();
  }

  // Cambia a la pagina anterior y recarga la lista
  paginaAnterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((valor) => valor - 1);
      this.cargar();
    }
  }

  // Cambia a la pagina siguiente y recarga la lista
  paginaSiguiente(): void {
    if (this.pagina() < this.totalPaginas()) {
      this.pagina.update((valor) => valor + 1);
      this.cargar();
    }
  }

  // Alterna el color de la portada según la posicion de la tarjeta
  claseTono(indice: number): string {
    const tonos = ['', 'portada-verde', 'portada-rosa'];
    return tonos[indice % 3];
  }

  // Convierte la fecha
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}