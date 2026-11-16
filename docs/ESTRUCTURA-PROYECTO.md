# Estructura del proyecto

> Cómo está organizado el código, el modelo de datos y los flujos principales. Tecnologías y forma
> de trabajar en [STACK-Y-METODOLOGIA.md](STACK-Y-METODOLOGIA.md); plan y estado en
> [FASES-IMPLEMENTACION.md](FASES-IMPLEMENTACION.md).

## 1. Monorepo

```
galeria-fotos/
├── apps/
│   ├── web/                      # SPA React (web pública + fotógrafo + cliente)
│   └── image-worker/             # (opción B) procesado de imágenes con sharp
├── packages/
│   └── shared/                   # tipos, esquemas Zod y constantes (front ↔ functions)
├── supabase/
│   ├── migrations/               # SQL versionado (tablas, RLS, funciones)
│   ├── functions/                # Edge Functions (Deno)
│   │   ├── deno.json             # import map: zod + @galeria/shared
│   │   ├── _shared/              # clientes Supabase y CORS
│   │   ├── claim-photographer/   # código de invitación → role=photographer
│   │   ├── contact/              # formulario de contacto de la web pública
│   │   ├── sign-upload/          # URL prefirmada de subida a R2
│   │   ├── process-photo/        # genera thumb + preview con marca de agua
│   │   ├── sign-view/            # token de visualización de previews
│   │   ├── sign-download/        # URL firmada del original (si se permite)
│   │   ├── invite-client/        # crea invitación + email
│   │   ├── verify-pin/           # acceso a galería por PIN
│   │   ├── submit-selection/     # cierra la selección + avisa al fotógrafo
│   │   └── reopen-selection/     # el fotógrafo reabre una selección
│   ├── seed.sql
│   └── config.toml
├── docs/                         # esta documentación
├── .github/workflows/            # CI
├── CLAUDE.md                     # contexto y reglas para Claude Code
└── package.json / pnpm-workspace.yaml
```

## 2. Frontend (`apps/web/src`)

```
src/
├── app/
│   ├── main.tsx
│   ├── router.tsx                # rutas públicas / fotógrafo / cliente
│   ├── providers.tsx             # QueryClient + AuthProvider
│   ├── shells.tsx                # conecta los layouts con la sesión
│   └── guards/
│       ├── RequireAuth.tsx       # sin sesión → /login
│       └── RequireRole.tsx       # rol distinto → home de su rol
│
├── features/                     # VERTICAL SLICES (cada una expone su index.ts)
│   ├── public-site/              # web pública en "/"
│   │   ├── content.ts            # textos, contacto y fotos editables
│   │   ├── components/           # SiteHeader, HeroCarousel, PortfolioSection,
│   │   │                         # AboutSection, TestimonialsSection, ContactSection, SiteFooter
│   │   ├── services/contactService.ts
│   │   └── pages/HomePage.tsx
│   ├── auth/
│   │   ├── pages/                # Login, Register, ResetPassword, AcceptInvite
│   │   ├── components/           # AuthShell, RedirectIfSignedIn
│   │   ├── context/              # AuthProvider (sesión + perfil)
│   │   ├── hooks/useSession.ts
│   │   └── services/authService.ts
│   ├── dashboard/                # (fotógrafo) panel y marca
│   ├── galleries/                # (fotógrafo) CRUD de galerías
│   ├── upload/                   # (fotógrafo) subida masiva: Dropzone, cola, store
│   ├── clients/                  # (fotógrafo) clientes e invitaciones
│   ├── selections/               # selección, comentarios y mensajes
│   ├── client-gallery/           # (cliente) sus galerías, acceso por PIN, vista protegida
│   └── downloads/                # pide la URL firmada del original
│
├── shared/
│   ├── components/               # Button, TextField, Select, TextArea, Alert,
│   │                             # Spinner, Brand, iconos
│   ├── layouts/                  # PhotographerLayout (sidebar), ClientLayout (oscuro)
│   ├── lib/                      # supabase.ts, api.ts (invocar functions), errors.ts
│   ├── protection/               # utilidades anti-captura (ver §6)
│   └── hooks/
└── types/database.ts             # generado con `pnpm db:types:remote`
```

**Regla de dependencias** (de fuera hacia dentro): `pages → components → hooks → services → shared/lib`.
Una feature no importa de otra salvo por su `index.ts`. Los layouts de `shared/` no conocen la
sesión: reciben `userName` y `onSignOut` desde `app/shells.tsx`.

## 3. Rutas

| Zona | Ruta | Contenido |
|---|---|---|
| Pública | `/` | Web: carrusel, portfolio, sobre mí, testimonios, contacto |
| | `/login` `/register` `/reset-password` | Autenticación |
| | `/invite/:token` | Aceptar invitación a una galería |
| | `/g/:slug` | Acceso a galería con PIN |
| Fotógrafo (`RequireRole photographer`) | `/dashboard` | Resumen |
| | `/galleries` · `/galleries/new` | Listado y alta |
| | `/galleries/:id` | Fotos, orden, portada, subida |
| | `/galleries/:id/settings` | Descarga, selección, PIN, caducidad, marca de agua |
| | `/galleries/:id/selection` | Qué eligió cada cliente |
| | `/clients` · `/settings/branding` | Clientes y marca |
| Cliente (`RequireRole client` o PIN) | `/my` | Sus galerías |
| | `/my/:slug` | Vista protegida + selección |
| | `/my/:slug/selection` | Revisar y enviar |

## 4. Edge Functions

Todo lo que necesita **secretos o permisos elevados** va aquí, nunca en el front.

| Función | Entrada | Comprueba | Hace |
|---|---|---|---|
| `claim-photographer` | `code` | Usuario autenticado y código = `PHOTOGRAPHER_INVITE_CODE` | `profiles.role = 'photographer'` |
| `contact` | nombre, email, teléfono?, tipo, fecha?, mensaje | `contactSchema` + honeypot | Guarda en `contact_requests` y avisa por email (Resend) |
| `sign-upload` | gallery_id, filename, mime, size | Dueño de la galería, cuota, tipo | URL PUT prefirmada a R2 (5 min) + fila `photos(status='uploading')` |
| `process-photo` | (al terminar la subida) | — | Thumb 400 px + preview 1600 px con marca de agua; `status='ready'` |
| `sign-view` | gallery_id | Acceso del cliente (RLS / PIN) | Token corto para servir previews |
| `sign-download` | photo_id[] | `allow_download` + acceso | URLs firmadas (60 s) o ZIP; registra en `downloads` |
| `invite-client` | gallery_id, email | Dueño de la galería | Crea `gallery_access` + email con enlace |
| `verify-pin` | slug, pin | Hash del PIN + límite de intentos | Vincula el acceso al usuario |
| `submit-selection` | gallery_id | Selección abierta | `submitted_at`, bloquea cambios, avisa al fotógrafo |
| `reopen-selection` | selección | Dueño de la galería | `submitted_at = null`, `reopened_at = now()` |

## 5. Datos (Supabase Postgres)

| Tabla | Campos principales |
|---|---|
| `profiles` | `id` (= auth.users.id), `role` (photographer \| client), `display_name`, `brand_name`, `brand_logo_key` |
| `galleries` | `photographer_id`, `title`, `slug` único, `pin_hash`, `cover_photo_id`, `allow_download`, `allow_selection`, `max_selection`, `watermark_text`, `expires_at`, `status` (draft \| published \| archived) |
| `gallery_access` | PK (`gallery_id`, `email`), `client_id`, `invited_at`, `accepted_at` |
| `photos` | `gallery_id`, `filename`, `original_key`, `preview_key`, `thumb_key`, `width`, `height`, `size_bytes`, `position`, `status` (uploading \| processing \| ready \| error) |
| `selections` | `gallery_id`, `client_id` (únicos juntos), `client_note`, `submitted_at`, `reopened_at` |
| `selection_items` | PK (`selection_id`, `photo_id`), `comment` (≤ 500) |
| `gallery_messages` | `gallery_id`, `photo_id` (null = duda general), `author_id`, `body`, `read_at` |
| `downloads` | Auditoría: `photo_id`, `client_id`, `ip` |
| `contact_requests` | `name`, `email`, `phone`, `session_type`, `event_date`, `message`, `handled` |

Al registrarse, el trigger `handle_new_user` crea el perfil con rol `client`.

### RLS (resumen)

- **profiles**: cada usuario lee y edita el suyo; `role` no se puede modificar desde el cliente.
- **galleries**: el fotógrafo hace CRUD de las suyas; el cliente solo lee si tiene acceso aceptado,
  la galería está publicada y no ha caducado. `pin_hash` nunca se lee desde el cliente.
- **photos**: mismas reglas que su galería; el cliente solo ve fotos `ready` y nunca `original_key`.
- **selections / items**: el cliente gestiona las suyas mientras no estén enviadas; el fotógrafo
  lee las de sus galerías.
- **gallery_messages**: fotógrafo y cliente de esa galería leen y escriben; solo se puede marcar
  como leído un mensaje ajeno.
- **downloads**: solo inserta la service role.
- **contact_requests**: solo inserta la service role; los fotógrafos leen y marcan `handled`.

## 6. Almacenamiento (R2) y flujos de imagen

```
originals/{photographer_id}/{gallery_id}/{photo_id}.{ext}   privado
previews/{gallery_id}/{photo_id}.webp                       vía Worker + token
thumbs/{gallery_id}/{photo_id}.webp                         vía Worker + token
branding/{photographer_id}/logo.png                         público
```

**Subida:**
1. El front pide `sign-upload` y recibe una URL PUT.
2. Sube directo a R2, sin pasar por un servidor propio.
3. `process-photo` genera los derivados.
4. Realtime avisa de `status='ready'` y la foto aparece en el grid.

**Visualización (cliente):**
1. Al entrar, `sign-view` da un token corto (15 min).
2. `<img src="https://img.dominio.com/previews/…?t=TOKEN">`.
3. El Worker valida el token; sin token devuelve 403. No hay URL permanente que compartir.

### Protección anti-captura

No se puede impedir al 100 % (cámara del móvil, capturas del sistema). El objetivo es que lo
capturado no tenga valor y disuadir.

- **Servidor** (lo que protege de verdad): previews de 1600 px máx. en webp de calidad media,
  marca de agua quemada en la imagen (nunca solo CSS), opcionalmente marca semi-invisible con el
  email del cliente, y URLs con token que caduca.
- **Cliente** (disuasión, `shared/protection`): bloquear menú contextual, arrastrar y seleccionar;
  capa transparente sobre la imagen; `user-select: none` y `-webkit-touch-callout: none`;
  difuminar al perder el foco; ocultar al pulsar Imprimir pantalla; ocultar al imprimir; bloquear
  Ctrl+S / Ctrl+P; aviso "Imágenes protegidas · © fotógrafo".

## 7. Flujo de selección y comentarios (cliente)

- **En cada foto del grid**: check para marcar (siempre visible en móvil, al pasar el ratón en
  escritorio); clic en la foto abre el visor, clic en el check solo marca. Icono de bocadillo para
  comentar esa foto y aviso si ya tiene comentario. En el visor: mismo check y comentario, tecla
  F para marcar y flechas.
- **Barra inferior fija** (`SelectionBar`): "12 / 30 seleccionadas" (respeta `max_selection`),
  filtros Todas / Seleccionadas / Con comentario y botón "Revisar y enviar".
- **Revisar y enviar** (`/my/:slug/selection`): miniaturas con su comentario editable y mensaje
  para el fotógrafo. Al confirmar, `submit-selection` guarda la fecha, bloquea cambios y avisa al
  fotógrafo; el cliente ve "Selección enviada el dd/mm".
- **Guardado inmediato** de cada check y comentario (optimistic update), para dejarlo a medias.
- **Mensajes**: hilo cliente ↔ fotógrafo en `gallery_messages` con Realtime y contador de no leídos.
- **Lado fotógrafo** (`/galleries/:id/selection`): clientes con estado pendiente / enviada, fotos
  elegidas con comentarios, mensaje del cliente, exportar nombres de archivo (CSV o copiar para
  Lightroom), reabrir selección y responder mensajes.
