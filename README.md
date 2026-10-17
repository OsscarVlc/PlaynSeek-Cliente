# Play N Seek (Front)

Front de Play N Seek, una plataforma de matchmaking para gamers. Hecho en Angular y TypeScript con Bootstrap.


## Cómo correr el proyecto

```bash
npm install
ng serve
```

## Estructura

```
src/app/
  core/       Lo que existe una sola vez en la app (guards, layouts, servicios)
  shared/     Lo que usan varias secciones (modelos, mocks, componentes, directivas)
  features/   Las pantallas, una carpeta por sección
```

Los imports usan alias para evitar rutas con muchos `../`:

```ts
import { Usuario } from '@shared/models/usuario';
import { Auth } from '@core/services/auth';
```

## De quién es cada carpeta

| Persona | Carpetas |
|---|---|
| Oscar | `core/`, `shared/`, `features/landing`, `features/dashboard`, `features/admin`, `features/moderacion`, `features/errors` |
| Sergio | `features/grupos`, `features/chat`, `features/match` |
| Andrés | `features/auth`, `features/perfil`, `features/juegos` |

## Reglas para no chocar en git

- Solo editen archivos de sus propias carpetas.
- **No editen** `core/`, `shared/`, `app.routes.ts`, `styles.scss`, `angular.json` ni `package.json`
- Los estilos de una pantalla van en el `.scss` de esa pantalla no en el global
- Cada sección define sus subrutas en su propio archivo `*.routes.ts` Si agregan una pantalla, la declaran ahí.
- Los mocks propios de una sección van dentro de su carpeta (por ejemplo `features/grupos/grupos.mock.ts`). Los usuarios y juegos de prueba ya existen en `shared/mock`.

## Flujo de ramas

- `main`: solo la versión final.
- `dev`: aquí se junta todo.
- `oscar`, `sergio`, `andres`: una rama por persona, creadas desde `dev`.

Pasos de trabajo:

1. Antes de empezar cada sesión: `git checkout su-rama` y `git merge dev`.
2. Hacer commits pequeños con mensajes claros.

## Qué ya está listo para usar

### Mocks y modelos

- Modelos en `shared/models` (usuario, juego, grupo, post, comentario, mensaje, solicitud, reporte). Los campos coinciden con los del back.
- Usuarios y juegos de prueba en `shared/mock`.

### Avisos de notificación (toasts)

```ts
import { inject } from '@angular/core';
import { Notification } from '@core/services/notification';

// dentro de la clase del componente:
notificacion = inject(Notification);

// y para mostrar un aviso:
this.notificacion.exito('Se creó correctamente');
// también: error(), info(), advertencia()
```

### Confirmaciones (Sí/No)

```ts
import { inject } from '@angular/core';
import { Confirm } from '@core/services/confirm';

confirmar = inject(Confirm);

// La función de la segunda posición solo se ejecuta si el usuario presiona "Sí".
this.confirmar.pedir('¿Deseas eliminar este registro?', () => {
  this.notificacion.exito('Registro eliminado correctamente');
});
```


### Probar con distintos roles

La sesión es simulada. Para ver las pantallas de moderación o administración, cambien el `rol` de `USUARIO_PRUEBA` en `core/services/auth.ts` a `'moderador'` o `'administrador'` 

- `usuario`: no ve Reportes ni Usuarios en el menú.
- `moderador`: ve Reportes.
- `administrador`: ve Reportes y Usuarios.

