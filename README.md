# File Storage

Aplicacion fullstack para subir, comprimir y almacenar imagenes usando **Supabase Storage** como proveedor de archivos y **PostgreSQL** como base de datos.

## Stack

- **Client**: Preact + Vite + Tailwind CSS v4 + Axios + browser-image-compression
- **Server**: Express v5 + TypeScript + PostgreSQL (via pg) + Supabase Storage + Multer

## Instalacion

Desde la raiz del proyecto ejecutar:

```bash
npm install
```

Esto instala las dependencias de la raiz, el cliente y el servidor automaticamente gracias al script `postinstall`.

## Variables de entorno

### Server

Copiar el archivo de ejemplo y completar los valores:

```bash
cp server/.env.example server/.env
```

| Variable | Descripcion |
|---|---|
| `PORT` | Puerto del servidor (default: 3000) |
| `NODE_ENV` | Entorno de ejecucion |
| `DB_HOST` | Host de la base de datos PostgreSQL |
| `DB_PORT` | Puerto de la base de datos (default: 6543) |
| `DB_USER` | Usuario de la base de datos |
| `DB_PASSWORD` | Contrasena de la base de datos |
| `DB_NAME` | Nombre de la base de datos (default: postgres) |
| `SUPABASE_URL` | URL del proyecto Supabase, ej: `https://<project>.supabase.co` |
| `SUPABASE_KEY` | **Service Role Key** de Supabase (ver seccion abajo) |

#### Como obtener la SUPABASE_KEY (Service Role Key)

1. Ingresa a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Project Settings** -> **API keys**
3. Selecciona la pestana **Legacy anon, service_role API keys**
4. Copia la **service_role** key

> **Importante**: Se debe usar la **service_role key**, no la anon key. La service_role key permite al backend subir archivos sin restricciones de Row Level Security (RLS). Nunca expongas esta key en el cliente.

### Client

Copiar el archivo de ejemplo y completar los valores:

```bash
cp client/.env.example client/.env
```

| Variable | Descripcion |
|---|---|
| `VITE_API_URL` | URL de la API (solo necesario en produccion, en desarrollo se usa el proxy de Vite) |
| `VITE_SUPABASE_STORAGE_URL` | URL publica de Supabase Storage |

#### Como construir VITE_SUPABASE_STORAGE_URL

Es la URL de tu proyecto Supabase agregandole `/storage/v1/object/public`:

```
https://<tu-proyecto>.supabase.co/storage/v1/object/public
```

## Ejecucion

```bash
npm run dev          # Inicia server (puerto 3000) y client (puerto 3001) en paralelo
npm run dev:server   # Solo el servidor
npm run dev:client   # Solo el cliente
```

## Configuracion de Supabase

1. Crear un bucket llamado `images` en Supabase Storage
2. Marcar el bucket como **publico** para que las imagenes sean accesibles via URL

## Arquitectura

### Compresion de imagenes en el frontend

Antes de subir una imagen al servidor, el cliente la comprime usando la libreria `browser-image-compression`. Esto reduce el tamano del archivo y optimiza el ancho de banda:

```ts
const compressed = await imageCompression(file, {
  maxSizeMB: 1,            // Tamano maximo: 1 MB
  maxWidthOrHeight: 1920,  // Dimension maxima: 1920px
});
```

La compresion ocurre completamente en el navegador antes de enviar el archivo al servidor.

### Multer

[Multer](https://github.com/expressjs/multer) es un middleware de Express para manejar `multipart/form-data`, que es el formato utilizado para subir archivos via HTTP.

En este proyecto se configura con `memoryStorage()`, lo que significa que el archivo se almacena temporalmente en memoria (como un `Buffer`) en lugar de escribirse en disco:

```ts
const upload = multer({ storage: multer.memoryStorage() });
```

Se aplica como middleware en la ruta de upload:

```ts
router.post("/upload", upload.single("file"), uploadImage);
```

`upload.single("file")` indica que se espera un unico archivo en el campo `file` del FormData. Multer parsea la request y pone el archivo disponible en `req.file`, que contiene propiedades como `buffer`, `originalname`, `mimetype`, etc.

### API Endpoints

#### `GET /api/images`

Retorna todas las imagenes almacenadas en la base de datos, ordenadas por fecha de creacion (mas recientes primero).

**Response**: `StorageImage[]`

```json
[
  {
    "id": "uuid",
    "name": "foto.jpg",
    "path": "1234567890-foto.jpg",
    "created_at": "2026-04-19T..."
  }
]
```

#### `POST /api/images/upload`

Sube un archivo de imagen a Supabase Storage.

- **Content-Type**: `multipart/form-data`
- **Campo requerido**: `file` (el archivo de imagen)
- **Response**: `{ path: string }` - la ruta del archivo en Supabase Storage

El servicio genera un nombre unico para el archivo usando un timestamp: `${Date.now()}-${originalname}` para evitar colisiones.

#### `POST /api/images`

Crea un registro de imagen en la base de datos PostgreSQL.

- **Content-Type**: `application/json`
- **Body**: `{ name: string, path: string }`
- **Response**: `StorageImage` (201 Created)

### Flujo completo de subida

1. El usuario arrastra o selecciona una imagen en el DropZone del cliente
2. La imagen se comprime en el navegador con `browser-image-compression`
3. Se envia la imagen comprimida via `POST /api/images/upload` -> retorna el `path`
4. Se crea el registro en la base de datos via `POST /api/images` con el `name` y `path`
5. La imagen aparece en el grid del cliente

### Esquema de base de datos

La tabla se crea automaticamente al iniciar el servidor:

```sql
CREATE TABLE IF NOT EXISTS public.storage_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Estructura del proyecto

```
file-storage/
  package.json              # Scripts del monorepo y concurrently
  server/
    src/
      app.ts                # Express app, routes, middleware, initDb
      config/
        index.ts            # Variables de entorno
        database.ts         # Pool de PostgreSQL + initDb()
        supabase.ts         # Cliente de Supabase
      middlewares/
        errorsMiddleware.ts # Manejo de errores con @hapi/boom
      features/
        images/
          images.router.ts      # Definicion de rutas
          images.controller.ts  # Validacion de input
          images.service.ts     # Logica de negocio (upload + DB)
          images.types.ts       # Tipos TypeScript
  client/
    src/
      app.tsx               # Providers y layout principal
      providers/
        AxiosProvider.tsx    # Instancia de Axios
        ImagesProvider.tsx   # Estado global de imagenes + compresion + upload
      pages/
        ImagesPage.tsx      # Pagina principal
      components/
        DropZone.tsx         # Zona de drag & drop para subir imagenes
        ImageGrid.tsx        # Grid responsivo de imagenes
```
