# Stack y metodología

> Qué tecnologías usamos, por qué, y cómo trabajamos. La organización del código está en
> [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md) y el plan y estado de avance en
> [FASES-IMPLEMENTACION.md](FASES-IMPLEMENTACION.md).

## 1. Qué es el proyecto

Web de **Reverte Fotógrafos** con dos partes:

- **Web pública** (`/`): carrusel, portfolio, sobre mí, testimonios y contacto.
- **Galería privada fotógrafo → cliente** (referencia funcional: Oh My Photo / Pixpa / Pic-Time):
  - **Fotógrafo**: crea galerías, sube sesiones, invita clientes, ve selecciones y mensajes.
  - **Cliente**: ve sus fotos protegidas contra copia, marca su selección, comenta por foto,
    la envía con un mensaje, resuelve dudas con el fotógrafo y descarga originales solo si
    está permitido.

**Arquitectura:** SPA + BaaS (Supabase) + almacenamiento de objetos (Cloudflare R2) + funciones
serverless para la lógica sensible. El backend es "fino": la base de datos con RLS es la primera
capa de seguridad, y lo que no se puede hacer con RLS (firmar URLs, procesar fotos, usar
secretos) va a Edge Functions.

## 2. Stack tecnológico

### Frontend (`apps/web`)

| Pieza | Uso |
|---|---|
| React 18 + TypeScript + Vite 5 | SPA |
| React Router 6 | Rutas públicas / fotógrafo / cliente |
| TanStack Query | Caché de datos del servidor, optimistic updates |
| Zustand | Estado de UI ligero (cola de subida, lightbox, selección) |
| Tailwind CSS v4 + componentes propios | Estilos (`shared/components`) |
| React Hook Form + Zod | Formularios con validación compartida |
| react-dropzone | Subida masiva |
| yet-another-react-lightbox | Visor de fotos (portfolio y galería) |

Tipografías: Cormorant Garamond (títulos, marca) e Inter (texto), vía Google Fonts.

### Backend / BaaS

- **Supabase (en la nube)**
  - Postgres: datos.
  - Auth: email + contraseña; roles `photographer` / `client`.
  - Row Level Security: aislamiento por usuario y galería.
  - Edge Functions (Deno/TS): lógica con secretos o permisos elevados.
  - Realtime: fotos procesadas y mensajes al instante.
- **Cloudflare R2** (compatible S3, sin coste de salida)
  - `originals`: privado, solo URLs firmadas.
  - `previews` / `thumbs`: servidos por un Worker con token de corta duración.
- **Procesado de imagen** (decisión pendiente, F3)
  - Opción A: Cloudflare Worker + Images (resize + marca de agua).
  - Opción B: `apps/image-worker` en Node con `sharp` (Railway/Fly).

### Infra y despliegue

- Front: Vercel / Netlify / Cloudflare Pages (pendiente de decidir).
- Emails transaccionales: Resend (contacto, invitaciones, selección enviada, mensajes).
- Monitorización: Sentry (front + functions), pendiente.

### Tooling

- pnpm workspaces (monorepo), Node 20+ (en uso: Node 26, pnpm 9.12).
- ESLint (flat config) + Prettier.
- Vitest + Testing Library; Playwright para e2e (pendiente).
- Supabase CLI como devDependency (`pnpm supabase …`): migraciones SQL versionadas y tipos TS
  generados.
- GitHub Actions (lint, test, despliegue de migraciones).

**Versiones:** se mantienen las mayores actuales (React 18, Vite 5, Vitest 2, Zod 3) con sus
últimas menores. Subir de versión mayor es una tarea aparte.

## 3. Metodología de trabajo

### Por fases

- Se trabaja **una fase cada vez**, siguiendo [FASES-IMPLEMENTACION.md](FASES-IMPLEMENTACION.md).
- Al terminar algo se marca en el checklist. No se adelanta trabajo de fases futuras.
- Estados del checklist: `[x]` hecho y comprobado · `[~]` hecho en código, falta probarlo contra
  Supabase · `[ ]` pendiente.

### Git

- Repositorio: `github.com/j0saan97/reverteFotografos`.
- Se trabaja en la rama **`dev`**; `main` se actualiza desde `dev`.
- Commits pequeños con prefijo convencional: `feat(f1): …`, `fix: …`, `docs: …`, `chore: …`.

### Antes de cerrar una fase

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm format:check
```

### Base de datos

- Supabase **en la nube** (sin Docker ni WSL).
- Toda tabla nueva lleva **RLS activado y políticas en la misma migración**.
- Las migraciones ya aplicadas **no se editan**: se crea una nueva (`pnpm supabase migration new x`).
- Después de cambiar la base de datos: `pnpm db:types:remote`.

### Convenciones de código

- Código, nombres y comentarios técnicos en **inglés**; textos de la interfaz en **español**.
- Frontend organizado por features (`src/features/*`). Una feature no importa archivos internos
  de otra, solo su `index.ts`.
- Dependencias de fuera hacia dentro: `pages → components → hooks → services → shared/lib`.
- Validación con Zod en `packages/shared`, usada en el front y en las functions.
- `packages/shared` importa con extensión `.ts` para que Deno (Edge Functions) lo pueda usar.

### Comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Arranca la web en http://localhost:5173 |
| `pnpm typecheck` · `pnpm lint` · `pnpm test` | Comprobaciones |
| `pnpm format` · `pnpm format:check` | Prettier |
| `pnpm supabase login` | Inicia sesión en Supabase (una vez) |
| `pnpm db:link --project-ref <ref>` | Vincula el proyecto de la nube |
| `pnpm db:push` | Aplica las migraciones pendientes |
| `pnpm db:types:remote` | Genera `apps/web/src/types/database.ts` |
| `pnpm fn:deploy <nombre>` | Despliega una Edge Function |

### Vista previa sin Supabase (solo desarrollo)

`VITE_DEV_PREVIEW_ROLE=photographer|client` en `apps/web/.env.local` simula una sesión para ver
las pantallas protegidas. No llega a producción.

## 4. Seguridad

- La **service role key solo vive en Edge Functions**, nunca en el frontend.
- El cliente **nunca recibe** `original_key`, `pin_hash` ni URLs permanentes de imágenes. Esas
  columnas no tienen permiso de lectura: se hace `select` con columnas explícitas, nunca `*`.
- Validación con Zod en el front **y** en las functions.
- PIN de galería: hash (bcrypt) + límite de intentos.
- Subidas limitadas por tipo (jpg, png, heic, webp), tamaño máximo por foto y cuota por fotógrafo.
- La caducidad de galerías se aplica en RLS, no solo en la interfaz.
- CORS de las Edge Functions restringido al dominio de la app.
- Un usuario nunca puede ponerse el rol de fotógrafo: la columna `role` no tiene permiso de
  escritura y solo la cambia `claim-photographer` con la service role.

## 5. Decisiones tomadas

| Fecha | Decisión |
|---|---|
| 2026-11-04 | Alta de fotógrafo por **código de invitación** validado en la Edge Function `claim-photographer`. |
| 2026-11-16 | Se añade una **web pública** en `/` con contenido editable en `features/public-site/content.ts` mientras no haya gestión desde el panel. |
| 2026-11-17 | **Supabase en la nube** en lugar de local con Docker. |
| 2026-11-17 | `packages/shared` usa imports con extensión `.ts` y se expone a Deno vía `supabase/functions/deno.json`. |
