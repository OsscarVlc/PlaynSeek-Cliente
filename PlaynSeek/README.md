# Play N Seek (Cliente Web) — Entrega 3: Autenticación y Permisos

**Repositorio oficial en GitHub:** [https://github.com/OsscarVlc/PlaynSeek-Cliente](https://github.com/OsscarVlc/PlaynSeek-Cliente)  
**Etiqueta de entrega:** `entrega-3-auth` (en rama `main`)  
**Materia:** Desarrollo en el Cliente  
**Equipo:** Oscar Velasco, Sergio Bernal, Andrés Huerta  

---

## 1. Proveedor de Autenticación

Para esta entrega se utiliza una **API propia REST** desarrollada en Node.js con Express, TypeScript y MongoDB (repositorio `SergioABC123/Proyecto-Servidor` de la materia Tecnologías de Desarrollo en el Servidor).

### Justificación y Funcionamiento
- **Seguridad en almacenamiento:** Las contraseñas de los usuarios se guardan en la base de datos con cifrado unidireccional utilizando **bcrypt** con factor de sal (salt rounds = 10); jamás se almacenan ni transmiten contraseñas en texto plano.
- **Tokens de acceso (JWT):** Tras validar las credenciales en `POST /user/login`, el servidor genera y firma un JSON Web Token (JWT) con un secreto criptográfico y tiempo de expiración definido.
- **Verificación de identidad:** El frontend consume el endpoint `GET /user/me` enviando el token en el encabezado `Authorization: Bearer <token>`, permitiendo validar la identidad y el rol activo del usuario sin exponer llaves privadas en el cliente.

---

## 2. Usuarios de Prueba (Cuentas Activas con Correo Verificado)

Para la evaluación de los diferentes roles y niveles de acceso en la plataforma, se proporcionan las siguientes credenciales:

| Rol | Correo Electrónico | Contraseña | Capacidades principales |
|---|---|---|---|
| **Usuario** | `prueba@gmail.com` | `123456789` | Acceso al portal, creación de grupos, perfil de jugador, catálogo. |
| **Moderador** | `mod@playnseek.com` | `Moder12345` | Acceso a vista de reportes y herramientas de moderación. |
| **Administrador** | `admin@playnseek.com` | `Admin12345` | Acceso a panel de usuarios, moderación y expulsión de miembros en cualquier grupo. |

---

## 3. Matriz de Roles y Permisos

| Módulo / Acción | Invitado | Usuario | Moderador | Administrador |
|---|:---:|:---:|:---:|:---:|
| Ver Landing / Catálogo público | ✅ | ✅ | ✅ | ✅ |
| Registro e Inicio de sesión | ✅ | ❌ (bloqueado por `guestGuard`) | ❌ (bloqueado por `guestGuard`) | ❌ (bloqueado por `guestGuard`) |
| Acceso a Dashboard y Mi Perfil | ❌ (`authGuard`) | ✅ | ✅ | ✅ |
| Crear y administrar grupos propios | ❌ | ✅ | ✅ | ✅ |
| Expulsar integrante de un grupo | ❌ | Solo líder del grupo | Solo líder del grupo | ✅ Líder o Administrador |
| Ver sección de Moderación / Reportes | ❌ | ❌ (403) | ✅ | ✅ |
| Ver sección de Administración de Usuarios | ❌ | ❌ (403) | ❌ (403) | ✅ |

### Acción Restringida por Rol en el CRUD
En la vista de detalle de grupo (`src/app/features/grupos/grupo-detalle/`):
- Los integrantes comunes no pueden expulsar compañeros.
- El líder original del grupo puede expulsar miembros.
- El **Administrador** cuenta con permisos elevados para expulsar integrantes de cualquier grupo mediante la directiva `*appHasRole="['administrador']"`, garantizando además validación en la capa lógica y soporte ante respuestas HTTP 403 del servidor.

---

## 4. Capa de Autenticación y Manejo de Sesión

La arquitectura sigue el patrón recomendado para Angular 22 (`core/`, `shared/`, `features/`):

```
src/app/
  core/
    guards/
      auth-guard.ts        # Redirige a /login con returnUrl si no hay sesión
      guest-guard.ts       # Impide reingreso a /login o /registro si ya hay sesión
      role-guard.ts        # Evalúa permisos y redirige a /403 si no tiene el rol
    interceptors/
      token-interceptor.ts # Adjunta automáticamente 'Authorization: Bearer <token>'
      error-interceptor.ts # Manejo global y centralizado de 401 y 403
    services/
      auth.ts              # Servicio centralizado de sesión y credenciales
  shared/
    directives/
      has-role.ts          # Directiva estructural *appHasRole
```

- **Almacenamiento de Token:** Se resguarda en `localStorage` bajo la clave `pns_token`.
- **Persistencia de Sesión:** Al cargar o recargar la página, `Auth.recuperarSesion()` ejecuta `GET /user/me`. Si el token expiró o es inválido, se purga el almacenamiento y la sesión queda limpia.
- **Cierre de Sesión:** `Auth.cerrarSesion()` elimina el token, resetea el usuario en memoria y redirige a la ruta pública correspondiente.
- **Manejo Centralizado de Errores (401 y 403):**
  * `401 en /user/login`: Se presenta el mensaje de credenciales inválidas directamente en el formulario.
  * `401 en peticiones autenticadas`: Se detecta expiración de token, se cierra la sesión y se redirige a `/login` con aviso preventivo.
  * `403 Forbidden`: Muestra una alerta descriptiva al usuario y previene que la aplicación quede en estado inconsistente.

---

## 5. Directiva Estructural de Permisos (`*appHasRole`)

Se implementó la directiva estructural `HasRole` en `src/app/shared/directives/has-role.ts`:

```html
<!-- Ejemplo de uso para administradores en la barra de navegación -->
<a routerLink="/admin/usuarios" *appHasRole="['administrador']">
  Usuarios
</a>

<!-- Ejemplo para moderadores o administradores -->
<a routerLink="/moderacion/reportes" *appHasRole="['moderador', 'administrador']">
  Reportes
</a>
```

La directiva evalúa el rol de la sesión activa contra el listado de roles autorizados, agregando o destruyendo la vista del DOM según corresponda.

---

## 6. Variables de Entorno y Ejecución Local

No se incluyen contraseñas ni secretos reales en el repositorio. Se provee un archivo `.env.example` con la estructura requerida para desplegar el backend y frontend.

### Requisitos Previos
- Node.js >= 20.x
- Angular CLI >= 21.x
- Backend corriendo en `http://localhost:3000`

### Instrucciones de Arranque
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start
# (O alternativamente: npx ng serve)

# 3. Ejecutar pruebas unitarias
npm test -- --watch=false
```

---

## 7. Flujo de Trabajo en Equipo (GitHub)

- **Oscar Velasco:** Interceptor global de errores (401/403), `authGuard` con preservación de ruta original (`returnUrl`), `guestGuard`, servicio base de autenticación `Auth.registrar()`, integración de login sin credenciales simuladas.
- **Sergio Bernal:** Directiva estructural `*appHasRole` en `shared/directives/has-role.ts`, integración de visibilidad por rol en `navbar`, y restricción de acción de expulsión en `grupo-detalle`.
- **Andrés Huerta:** Integración de registro de usuarios conectado a la API (`auth.registrar`), validaciones reactivas de formulario (`nombre`, `correo` con detección de 400 ya en uso, `password` mínimo 8 caracteres y confirmación coincidente), estado de carga/deshabilitación de botón, desacoplamiento completo de `auth.iniciarSesion()`, remoción del selector manual de rol en `perfil` (`auth.cambiarRol()`), y evidencias de la entrega.
