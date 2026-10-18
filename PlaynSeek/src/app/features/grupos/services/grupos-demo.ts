import { Injectable, signal } from '@angular/core';
import {
  GRUPOS_DEMO,
  USUARIO_GRUPOS_DEMO_ID,
} from '../../../shared/mock/grupos-demo';
import { GrupoVista } from '../../../shared/models/grupo-vista.model';

interface NuevoGrupo {
  nombre: string;
  descripcion: string;
  imagen: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class GruposDemo {
  private readonly gruposInternos = signal<GrupoVista[]>([...GRUPOS_DEMO]);

  readonly grupos = this.gruposInternos.asReadonly();

  crear(datos: NuevoGrupo): GrupoVista {
    const grupo: GrupoVista = {
      id: crypto.randomUUID(),
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      imagen: datos.imagen,
      juego: 'Multijuego',
      liderId: USUARIO_GRUPOS_DEMO_ID,
      tono: 'morado',
      integrantes: [
        {
          id: USUARIO_GRUPOS_DEMO_ID,
          nombre: 'Sergio',
          iniciales: 'SO',
        },
      ],
    };

    this.gruposInternos.update((actuales) => [grupo, ...actuales]);

    return grupo;
  }

  unirse(grupoId: string): void {
  this.gruposInternos.update((grupos) =>
    grupos.map((grupo) => {
      if (grupo.id !== grupoId) return grupo;

      const yaPertenece = grupo.integrantes.some(
        (integrante) => integrante.id === USUARIO_GRUPOS_DEMO_ID,
      );

      if (yaPertenece) return grupo;

      return {
        ...grupo,
        integrantes: [
          ...grupo.integrantes,
          {
            id: USUARIO_GRUPOS_DEMO_ID,
            nombre: 'Sergio',
            iniciales: 'SO',
          },
        ],
      };
    }),
  );
}

salir(grupoId: string): void {
  this.gruposInternos.update((grupos) =>
    grupos.map((grupo) => {
      if (
        grupo.id !== grupoId ||
        grupo.liderId === USUARIO_GRUPOS_DEMO_ID
      ) {
        return grupo;
      }

      return {
        ...grupo,
        integrantes: grupo.integrantes.filter(
          (integrante) => integrante.id !== USUARIO_GRUPOS_DEMO_ID,
        ),
      };
    }),
  );
}

transferirLiderazgo(grupoId: string, integranteId: string): void {
  this.gruposInternos.update((grupos) =>
    grupos.map((grupo) => {
      if (
        grupo.id !== grupoId ||
        grupo.liderId !== USUARIO_GRUPOS_DEMO_ID
      ) {
        return grupo;
      }

      const pertenece = grupo.integrantes.some(
        (integrante) => integrante.id === integranteId,
      );

      if (!pertenece) return grupo;

      return { ...grupo, liderId: integranteId };
    }),
  );
}

expulsarIntegrante(grupoId: string, integranteId: string): void {
  this.gruposInternos.update((grupos) =>
    grupos.map((grupo) => {
      if (
        grupo.id !== grupoId ||
        grupo.liderId !== USUARIO_GRUPOS_DEMO_ID ||
        integranteId === grupo.liderId
      ) {
        return grupo;
      }

      return {
        ...grupo,
        integrantes: grupo.integrantes.filter(
          (integrante) => integrante.id !== integranteId,
        ),
      };
    }),
  );
}

}