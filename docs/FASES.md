# Fases

## F0 — Setup
- [x] Revisar versiones de dependencias y `pnpm install` (se mantienen las mayores actuales)
- [x] Supabase CLI en el proyecto (`pnpm supabase`) — se usa Supabase en la nube, sin Docker
- [ ] Crear proyecto en supabase.com, `pnpm supabase login` y `pnpm supabase link`
- [ ] Aplicar migraciones (`pnpm db:push`) y generar tipos (`pnpm db:types:remote`)
- [ ] `.env.local` con URL + anon key reales
- [x] ESLint (flat config) + Prettier + Vitest funcionando
- [x] `pnpm dev` levanta la app con el router y las páginas placeholder

## F1 — Auth y roles
- [ ] Registro/login/reset con Supabase Auth — UI y lógica hechas; falta probar contra Supabase local
- [ ] Perfil con rol (trigger `handle_new_user`) — falta probar contra Supabase local
- [x] `RequireAuth` / `RequireRole` funcionales + `AuthProvider`
- [x] Layouts fotógrafo y cliente
- [x] Decidir cómo se da de alta un fotógrafo: código de invitación (`PHOTOGRAPHER_INVITE_CODE`)
      validado por la Edge Function `claim-photographer` (falta probarla con `supabase functions serve`)
- Vista previa sin Supabase (solo dev): `VITE_DEV_PREVIEW_ROLE=photographer|client` en `apps/web/.env.local`

## F1b — Web pública (portfolio)
- [x] Home pública en `/`: carrusel, portfolio por categorías con lightbox, sobre mí,
      testimonios, contacto y footer (contenido editable en `features/public-site/content.ts`)
- [x] Contacto directo: WhatsApp, teléfono, email, Instagram
- [ ] Formulario de contacto → Edge Function `contact` + tabla `contact_requests` (RLS) + aviso
      por Resend — hecho, falta probar contra Supabase local
- [ ] Sustituir fotos de muestra (Unsplash) y datos de contacto provisionales por los reales
- [ ] (Más adelante) gestionar portfolio y ver solicitudes de contacto desde el panel

## F2 — Galerías (fotógrafo)
- [ ] Listado, crear, editar, ajustes (descarga, selección, máx. selección, PIN, caducidad, marca de agua)
- [ ] Publicar / archivar, slug único

## F3 — Subida y procesado
- [ ] `sign-upload` (URL prefirmada R2)
- [ ] Dropzone + cola con concurrencia y reintentos
- [ ] `process-photo` → thumb + preview con marca de agua
- [ ] Realtime: la foto aparece al pasar a `ready`
- [ ] Orden manual y portada

## F4 — Vista cliente protegida
- [ ] Invitación por email (`invite-client`) y acceso por `/g/:slug` + PIN (`verify-pin`)
- [ ] `sign-view` + Worker que valida token
- [ ] `ProtectedImage`, `ProtectedLightbox` y hooks de `shared/protection`

## F5 — Selección, comentarios y mensajes
- [ ] Check en cada `PhotoCard` y en el lightbox (tecla F)
- [ ] Comentario por foto
- [ ] `SelectionBar` con contador / máximo y filtros
- [ ] Revisar y enviar con mensaje general (`submit-selection`)
- [ ] Hilo de mensajes (`gallery_messages`) con Realtime y no leídos
- [ ] Vista del fotógrafo: selecciones, comentarios, exportar nombres, reabrir (`reopen-selection`)

## F6 — Descargas
- [ ] `sign-download` (URLs firmadas / ZIP) + auditoría

## F7 — Branding y emails
- [ ] Logo/nombre del fotógrafo en la vista cliente
- [ ] Emails con Resend (invitación, selección enviada, nuevo mensaje)
- [ ] Caducidad de galerías

## F8 — Extras
- [ ] Estadísticas, tienda de impresiones, etc.
