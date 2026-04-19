# File Storage

## Stack

- **Client**: Preact + Vite + Tailwind CSS v4 + Axios + browser-image-compression
- **Server**: Express v5 + TypeScript + PostgreSQL (via pg) + Supabase Storage (@supabase/supabase-js) + Multer
- **Monorepo**: root `package.json` con `concurrently`

## Commands

```bash
npm install          # instala root + client + server (via postinstall)
npm run dev          # server (3000) + client (3001) en paralelo
npm run dev:server   # solo server
npm run dev:client   # solo client
```

## Environment Variables

Crear los archivos `.env` en client y server siguiendo como ejemplo los `.env.example`:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server (`server/.env`)

```
PORT=3000
NODE_ENV=development
DB_HOST=
DB_PORT=6543
DB_USER=
DB_PASSWORD=
DB_NAME=postgres
SUPABASE_URL=           # https://<project>.supabase.co
SUPABASE_KEY=           # service role key o anon key
```

### Client (`client/.env`)

```
VITE_API_URL=                    # solo producción, en dev usa proxy de Vite
VITE_SUPABASE_STORAGE_URL=      # https://<project>.supabase.co/storage/v1/object/public
```

## Architecture

### Server

```
server/src/
  app.ts                          # Express app, routes, middleware, initDb + listen
  config/
    index.ts                      # env vars: PORT, NODE_ENV, DB_*, SUPABASE_URL, SUPABASE_KEY
    database.ts                   # pg Pool + initDb() — crea tabla storage_images
    supabase.ts                   # Supabase client (solo para Storage)
  middlewares/
    errorsMiddleware.ts           # @hapi/boom error handling
  features/
    images/
      images.router.ts            # GET /, POST /, POST /upload
      images.controller.ts        # valida input, llama al service
      images.service.ts           # sube a Supabase Storage, guarda en DB, lista imágenes
      images.types.ts             # StorageImage, CreateImageDTO
```

**Pattern**: cada feature tiene router → controller → service → types.

**Routes montadas en app.ts**:

- `/api/images` → images.router

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS public.storage_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

La tabla se crea automáticamente al iniciar el server.

### API Endpoints

- `GET /api/images` — lista todas las imágenes ordenadas por created_at DESC
- `POST /api/images` — `{ name: string, path: string }` → guarda registro en DB, retorna la imagen creada (201)
- `POST /api/images/upload` — multipart/form-data con campo `file` → sube a Supabase Storage bucket `images`, retorna `{ path }`

### Client

```
client/src/
  main.tsx                         # render
  app.tsx                          # AxiosProvider > ImagesProvider > ImagesPage
  types.ts                         # StorageImage
  providers/
    AxiosProvider.tsx              # axios instance con error interceptor
    ImagesProvider.tsx             # estado: images, loading, uploading, uploadAndCreateImage()
  pages/
    ImagesPage.tsx                 # layout con header, dropzone y grid
  components/
    DropZone.tsx                   # drag & drop + file input, comprime imagen antes de subir
    ImageGrid.tsx                  # grid responsive de imágenes
```

### Upload Flow

1. Usuario arrastra o selecciona imagen en DropZone
2. Se comprime con `browser-image-compression` (maxSizeMB: 1, maxWidthOrHeight: 1920)
3. POST `/api/images/upload` con FormData → recibe `{ path }`
4. POST `/api/images` con `{ name, path }` → guarda en DB
5. Se agrega la imagen al estado local

### Supabase Setup

1. Crear bucket `images` en Supabase Storage (marcarlo como público)
2. La URL pública de las imágenes se construye: `VITE_SUPABASE_STORAGE_URL + "/" + path`

## Conventions

- `export const X = () =>` para todos los componentes, providers y hooks
- Un componente por archivo
- Preact: usa `preact/hooks`, `preact/compat` para librerías React-compatible
- CSS: Tailwind CSS v4 con CSS variables (dark theme)
- HTTP errors: `@hapi/boom` en el server
- Sin auth — todos los endpoints son públicos
