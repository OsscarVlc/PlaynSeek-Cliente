# Play N Seek (Cliente Web) — Entrega 4: Manejo de Archivos

**Repositorio:** [https://github.com/OsscarVlc/PlaynSeek-Cliente](https://github.com/OsscarVlc/PlaynSeek-Cliente)  
**Materia:** Desarrollo en el Cliente  
**Equipo:** Oscar Velasco, Sergio Bernal, Andrés Huerta  

---

## Funcionalidad implementada: Portada del grupo (archivos)

Para esta entrega se implementó la gestión de imágenes de portada en los grupos (subida, previsualización, progreso, visualización, descarga y eliminación).

### 1. Subida y validación
- **Componente dedicado:** `src/app/features/grupos/subir-portada/`.
- **Selección de archivo:** Mediante input tradicional (`input type="file"`) o arrastrar y soltar (**Drag and Drop**).
- **Validaciones antes de enviar:**
  - Formatos aceptados: `image/jpeg`, `image/png` y `image/webp`. Si se intenta subir otro tipo de archivo se muestra un mensaje de error claro.
  - Tamaño máximo: 5 MB. Si excede el peso, no se envía y se avisa al usuario.
- **Vista previa:** Con `FileReader` se muestra la previsualización de la imagen antes de subirla, junto con su nombre y peso.

### 2. Barra de progreso y cancelación
- Las peticiones se realizan a través de `GrupoApi.subirPortada(id, archivo)` usando `reportProgress: true` y `observe: 'events'` (sin usar `HttpClient` directamente en componentes).
- Emite `{ tipo: 'progreso', porcentaje }` para actualizar la barra en tiempo real y `{ tipo: 'completado', grupo }` al terminar.
- **Botón Cancelar:** Guarda la suscripción activa y llama a `unsubscribe()`, abortando la petición HTTP en curso.
- Toasts de éxito o error al terminar el proceso.

### 3. Visualización y descarga
- La imagen (`grupo.imagen`) se muestra en:
  - La tarjeta de `/grupos` (catálogo).
  - La cabecera del detalle en `/grupos/:id`.
  - Si el grupo no tiene portada, se mantiene el degradado predeterminado.
- Botón para abrir la imagen en una pestaña nueva (`target="_blank"`).
- Botón para descargar la imagen directamente (`download`).

### 4. Eliminación y permisos
- Botón para eliminar la portada con confirmación previa a través del servicio `Confirm`.
- Solo disponible para el líder del grupo (`grupo.lider_id === usuario.id`) o usuarios administradores.
- Si la API responde con un error 403, la pantalla no se queda trabada y muestra una notificación clara.
- Se controlan estados de carga, error y vacío (sin portada).

---

## Cómo correr el proyecto

### 1. Servidor Backend
```bash
cd Proyecto-Servidor/BACKEND
npm install
npm run dev
```
La API queda disponible en `http://localhost:3000`.

### 2. Cliente Frontend
```bash
cd PlaynSeek-Cliente/PlaynSeek
npm install
npx ng serve
```
La aplicación abre en `http://localhost:4200`.

### Usuarios de prueba
- **Usuario normal (líder):** `prueba@gmail.com` / `123456789`
- **Administrador:** `admin@playnseek.com` / `Admin12345`

---

## Pruebas automatizadas

Para correr las pruebas unitarias:
```bash
cd PlaynSeek-Cliente/PlaynSeek
npx ng test --watch=false
```
Incluye pruebas para validación de tipo MIME, límite de tamaño (5 MB), cancelación de subida y emisión de estados.
