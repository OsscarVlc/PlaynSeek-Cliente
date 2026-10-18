import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { USUARIO_GRUPOS_DEMO_ID } from '../../../shared/mock/grupos-demo';
import { GruposDemo } from '../services/grupos-demo';
type FiltroGrupos = 'todos' | 'mios';

@Component({
  selector: 'app-grupos-lista',
  imports: [RouterLink],
  templateUrl: './grupos-lista.html',
  styleUrl: './grupos-lista.scss',
})
export class GruposLista {
  readonly filtro = signal<FiltroGrupos>('todos');
  readonly busqueda = signal('');

  private readonly gruposService = inject(GruposDemo);

  readonly grupos = this.gruposService.grupos;

  readonly usuarioActualId = USUARIO_GRUPOS_DEMO_ID;

  readonly gruposVisibles = computed(() => {
    const texto = this.normalizar(this.busqueda());

    return this.grupos().filter((grupo) => {
      const pertenece = grupo.integrantes.some(
        (integrante) => integrante.id === this.usuarioActualId,
      );

      const coincideFiltro = this.filtro() === 'todos' || pertenece;

      const contenido = this.normalizar(
        `${grupo.nombre} ${grupo.descripcion} ${grupo.juego}`,
      );

      return coincideFiltro && contenido.includes(texto);
    });
  });

  limpiarFiltros(): void {
    this.filtro.set('todos');
    this.busqueda.set('');
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }
}