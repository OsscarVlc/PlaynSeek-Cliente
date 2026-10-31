# Play N Seek (Front)

Front de Play N Seek, una plataforma de matchmaking para gamers. Hecho en Angular y TypeScript con Bootstrap.

**Entrega actual (3): integración con la API.** Las vistas consumen datos reales del back, con formularios validados, CRUD completo de grupos y manejo de estados de carga, error y vacío.

## Backend elegido: API propia

Usamos nuestra propia API REST en Express + TypeScript + MongoDB, la que desarrollamos en la materia de Tecnologías de Desarrollo en el Servidor (repositorio `SergioABC123/Proyecto-Servidor`).


## Cómo correr el proyecto

### 1. Back

En el repositorio del back, rama `main`, carpeta `BACKEND`:

```bash
npm install
npm run dev
```

El archivo `.env` debe estar dentro de `BACKEND` La API queda en `http://localhost:3000`.

### 2. Front

El proyecto de Angular está dentro de la carpeta `PlaynSeek`:

```bash
cd PlaynSeek
npm install
ng serve
```

La app abre en `http://localhost:4200`.

### Usuario de prueba

Para entrar al portal se necesita una cuenta con el correo confirmado. 

## Variables de entorno

La URL base de la API se lee de los archivos de entorno de Angular, nunca se escribe dentro de los servicios:

| Archivo | Se usa con | `apiUrl` |
|---|---|---|
| `src/environments/environment.development.ts` | `ng serve` | `http://localhost:3000` |
| `src/environments/environment.ts` | `ng build` | dominio del back desplegado |

Los servicios importan siempre `environment` (`import { environment } from '@env/environment'`), y Angular sustituye el archivo según el modo de compilación (`fileReplacements` en `angular.json`).

## Arquitectura de la capa de datos

```
PlaynSeek/src/app/
  core/
    services/      Llamadas HTTP (grupo-api.ts) y sesión (auth.ts)
    interceptors/  token-interceptor.ts y error-interceptor.ts
    guards/        authGuard y roleGuard
  shared/
    models/        Modelos tipados (Grupo, Usuario, Paginado<T>...)
  features/        Pantallas, una carpeta por sección
```

- **Servicios:** las llamadas HTTP viven solo en `core/services`. Los componentes nunca usan `HttpClient` directo.
- **Interceptor del token:** agrega `Authorization: Bearer <token>` a cada petición hacia nuestra API.
- **Interceptor de errores:** atrapa los errores de todas las peticiones en un solo lugar, muestra el `message` del back en un toast y relanza el error para que cada pantalla actualice su estado.
- **Sesión:** el token se guarda en `localStorage` y al arrancar la app se recupera el usuario con `GET /user/me`. Sabemos que `localStorage` es vulnerable a XSS; para el alcance de esta entrega lo aceptamos y lo dejamos documentado como riesgo.

## Contrato de la API

Base URL: `http://localhost:3000` en desarrollo.
Las rutas protegidas piden el encabezado `Authorization: Bearer <token>`.

### Modelo Grupo

| Campo | Tipo | Notas |
|---|---|---|
| `_id` | string | |
| `nombre` | string | obligatorio |
| `descripcion` | string | opcional |
| `fecha_creacion` | string (fecha ISO) | |
| `lider_id` | string | id del usuario líder |
| `integrantes` | string[] | ids de usuarios |
| `activo` | boolean | `false` = eliminado (borrado lógico) |

### Lista paginada

```json
{ "data": [], "pagina": 1, "totalPaginas": 0, "total": 0 }
```

### Endpoints

| Método y ruta | Acceso | Body | Respuesta exitosa |
|---|---|---|---|
| `POST /user/login` | público | `{ email, password }` | 200 `{ token }` |
| `GET /user/me` | token | | 200 `{ message, user: { id, correo, rol, nombre, foto_perfil } }` |
| `GET /grupo` | público | | 200 lista paginada de grupos |
| `GET /grupo/:id` | público | | 200 `Grupo` |
| `POST /grupo` | token | `{ nombre, descripcion? }` | 201 `{ message, grupo }` |
| `PATCH /grupo/:id` | token, solo el líder | `{ nombre?, descripcion? }` | 200 `Grupo` actualizado |
| `DELETE /grupo/:id` | token, solo el líder | | 200 `{ message }` |

Parámetros de `GET /grupo`: `pagina` (por defecto 1), `limite` (por defecto 10), `q` (busca por nombre, sin distinguir mayúsculas) e `incluirInactivos` (por defecto `false`).

`PATCH` rechaza con 400 un body que traiga `lider_id`, `integrantes` o `activo`. Por eso el servicio del front solo envía `nombre` y `descripcion`.

### Respuestas de error

Todos los errores responden con la misma forma:

```json
{ "message": "Texto del error" }
```

| Código | Cuándo |
|---|---|
| 400 | Falta un dato obligatorio, id con formato inválido o campos no editables en un `PATCH` |
| 401 | Sin token, token inválido, credenciales incorrectas o correo sin confirmar |
| 403 | El usuario no es el líder del grupo |
| 404 | El grupo no existe o está inactivo |
| 500 | Error del servidor |

Si el servidor no responde (apagado o sin conexión), el front muestra "No se pudo conectar con el servidor".

### Validaciones del front

El back solo exige que el nombre exista, así que el front agrega reglas propias:

| Campo | Reglas |
|---|---|
| Nombre del grupo | obligatorio, entre 3 y 50 caracteres, no puede ser solo espacios (validador personalizado) |
| Descripción | opcional, máximo 200 caracteres |
| Correo (login) | obligatorio, formato de correo |
| Contraseña (login) | obligatoria, mínimo 6 caracteres |



## Flujo de trabajo

- Cada integrante trabaja en su rama: `oscar`, `sergio` o `andres`.
- Antes de cada sesión, traer lo último: `git merge origin/main`.
- Cada funcionalidad llega a `main` por **Pull Request**, revisado y aprobado por otro integrante del equipo.
- El commit evaluado de cada entrega se etiqueta en `main` (por ejemplo `entrega-3`).

