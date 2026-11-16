# Fases

## F0 — Setup
- [ ] Revisar/actualizar versiones de dependencias y `pnpm install`
- [ ] `supabase start` (si falta config, `supabase init` conservando migraciones)
- [ ] Aplicar migraciones (`supabase db reset`) y generar tipos
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
