# Fases de implementación

> Plan de trabajo y estado de avance. Es el **único checklist** del proyecto: se actualiza al
> terminar cada tarea. Forma de trabajar en [STACK-Y-METODOLOGIA.md](STACK-Y-METODOLOGIA.md);
> organización del código en [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md).

**Actualizado:** 2026-11-17

**Leyenda:** `[x]` hecho y comprobado · `[~]` hecho en código, falta probarlo contra Supabase ·
`[ ]` pendiente

## Roadmap

| Fase | Objetivo | Estado |
|---|---|---|
| F0 | Setup: monorepo, Supabase, migraciones, tipos | Hecha |
| F1 | Auth, roles, layouts y guards | Hecha |
| F1b | Web pública: carrusel, portfolio, contacto | Hecha, falta contenido real |
| F2 | Galerías CRUD (fotógrafo) | Código hecho, falta probar |
| F3 | Subida a R2 + procesado (thumb, preview, marca de agua) | Pendiente |
| F4 | Vista cliente protegida + acceso por invitación / PIN | Pendiente |
| F5 | Selección, comentarios por foto, envío y mensajes | Pendiente |
| F6 | Descargas firmadas + ZIP + auditoría | Pendiente |
| F7 | Branding del fotógrafo, emails y caducidades | Pendiente |
| F8 | Extras: estadísticas, tienda de impresiones | Pendiente |

## F0 — Setup

- [x] Node 26, pnpm 9.12, `pnpm install` sin errores
- [x] Versiones revisadas: se mantienen las mayores actuales
- [x] ESLint (flat config) + Prettier (`format`, `format:check`)
- [x] Vitest con tests de los esquemas Zod
- [x] `pnpm dev` levanta la app
- [x] Git + GitHub, ramas `main` y `dev`
- [x] Supabase CLI en el proyecto (`pnpm supabase`), sin Docker
- [x] Proyecto `reverteFotografos` en supabase.com (Europa, ref `gbymaufmavdvgfqmoeof`)
- [x] `supabase login` y `supabase link --project-ref gbymaufmavdvgfqmoeof`
- [x] `pnpm db:push`: 4 migraciones aplicadas (CLI v3: los scripts usan `--remote`)
- [x] `pnpm db:types:remote`: `apps/web/src/types/database.ts` generado
- [x] `apps/web/.env.local` con URL + publishable key reales

## F1 — Auth y roles

- [x] Login, registro y recuperar contraseña (UI + lógica)
- [x] Trigger `handle_new_user` crea el perfil con rol `client`
- [x] Edge Function `claim-photographer` (código de invitación)
- [x] `AuthProvider` + `useSession`, `RequireAuth` / `RequireRole`
- [x] Layouts fotógrafo (barra lateral) y cliente (oscuro)
- [x] Vista previa sin Supabase solo en desarrollo (`VITE_DEV_PREVIEW_ROLE`)
- [x] Decisión: alta de fotógrafo por código de invitación
- [x] Panel de Supabase: Site URL y Redirect URLs (`http://localhost:5173/**`)
- [x] Secret `PHOTOGRAPHER_INVITE_CODE` y desplegar `claim-photographer`
      (`pnpm fn:deploy <nombre>`: necesita `--import-map` para resolver `@galeria/shared`)
- [x] Probado: registro de cliente, registro de fotógrafo con código, login, reset y redirección por rol
- [ ] `AcceptInvitePage` (`/invite/:token`): se completa en F4

## F1b — Web pública

- [x] Home en `/`: carrusel, portfolio con filtros + lightbox, sobre mí, testimonios, contacto,
      footer y enlace "Acceso clientes"
- [x] Contacto directo: WhatsApp, teléfono, email, Instagram
- [~] Formulario → Edge Function `contact` + tabla `contact_requests` (RLS)
- [ ] Desplegar `contact` y configurar `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`, `CONTACT_FROM_EMAIL`
- [ ] Sustituir fotos de muestra, textos, opiniones y datos de contacto provisionales por los
      reales (`features/public-site/content.ts`)
- [ ] SEO básico: title y description, Open Graph, favicon
- [ ] *(Más adelante)* gestionar el portfolio y ver las solicitudes de contacto desde el panel

## F2 — Galerías (fotógrafo)

- [~] Listado con filtros por estado, crear y editar
- [~] Ajustes: descarga, selección, máx. selección, caducidad, marca de agua
- [~] PIN: se cifra en la BD con `set_gallery_pin` (bcrypt); la UI solo ve `has_pin`
- [~] Publicar / pasar a borrador / archivar / eliminar; slug único con sufijo aleatorio
- [~] Dashboard con resumen (publicadas, borradores, selecciones recibidas, mensajes sin leer)
- [x] Migración `gallery_settings`: `has_pin`, GRANT por columna (no se escribe `pin_hash` ni `photographer_id`)

## F3 — Subida y procesado

- [ ] Cuenta de Cloudflare + buckets R2 (`originals`, `previews`) + claves
- [ ] `sign-upload` (URL prefirmada R2)
- [ ] Dropzone + cola con concurrencia y reintentos
- [ ] `process-photo` → thumb + preview con marca de agua (decidir: Cloudflare Images o `image-worker` con sharp)
- [ ] Realtime: la foto aparece al pasar a `ready`
- [ ] Orden manual y portada
- [ ] Al eliminar una galería, borrar también sus archivos en R2 (ahora solo se borran las filas)

## F4 — Vista cliente protegida

- [ ] `invite-client` (email de invitación) + `AcceptInvitePage`
- [ ] Acceso por `/g/:slug` + PIN (`verify-pin` con hash + límite de intentos)
- [ ] `sign-view` + Worker de Cloudflare que valida el token
- [ ] `ProtectedImage`, `ProtectedLightbox` y hooks de `shared/protection`

## F5 — Selección, comentarios y mensajes

- [ ] Check en cada `PhotoCard` y en el lightbox (tecla F)
- [ ] Comentario por foto
- [ ] `SelectionBar` con contador / máximo y filtros
- [ ] Revisar y enviar con mensaje general (`submit-selection`)
- [ ] Hilo de mensajes (`gallery_messages`) con Realtime y no leídos
- [ ] Vista del fotógrafo: selecciones, comentarios, exportar nombres, reabrir (`reopen-selection`)

## F6 — Descargas

- [ ] `sign-download` (URLs firmadas / ZIP) + auditoría en `downloads`

## F7 — Branding y emails

- [ ] Logo y nombre del fotógrafo en la vista cliente
- [ ] Emails con Resend (invitación, selección enviada, nuevo mensaje)
- [ ] Plantillas de email de Supabase Auth en español (confirmar cuenta, reset) + SMTP propio
- [ ] Caducidad de galerías

## F8 — Extras

- [ ] Estadísticas, tienda de impresiones, etc.

## Transversal / despliegue

- [ ] Dominio propio y hosting del front (Vercel / Netlify / Cloudflare Pages)
- [ ] CORS de las Edge Functions restringido al dominio (`APP_URL`)
- [ ] CI en GitHub Actions: revisar que pasa con el código actual
- [ ] Sentry (front + functions)
- [ ] Tests e2e con Playwright de los flujos principales
