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
| R1 | Reservas: calendario con producto, día y franja (solicitud + confirmación) | Diseño |
| R2 | Señal por transferencia/Bizum + bot de WhatsApp que lee el justificante | Diseño |
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
- [~] `AcceptInvitePage` (`/invite/:token`): sin sesión → login/registro y vuelve a la invitación
      (se recuerda en `localStorage`); con sesión de cliente → `accept-invite`; invitación ligada al email
- [~] Invitaciones: migración `gallery_invites` (token de un uso, solo se guarda su hash, caduca a
      los 14 días), Edge Functions `invite-client` y `accept-invite` desplegadas, sección
      "Clientes con acceso" en la galería (invitar, copiar enlace, nuevo enlace, quitar acceso)

## F1b — Web pública

- [x] Home en `/`: carrusel, portfolio con filtros + lightbox, sobre mí, testimonios, contacto,
      footer y enlace "Acceso clientes"
- [x] Contacto directo: WhatsApp, teléfono, email, Instagram
- [~] Formulario → Edge Function `contact` + tabla `contact_requests` (RLS)
- [x] Desplegar `contact` (pública: `verify_jwt = false` en `config.toml`, la publishable key no es un JWT)
- [ ] Cuenta de Resend + dominio verificado y secrets `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`,
      `CONTACT_FROM_EMAIL` *(usuario)* — también activa el email de las invitaciones
- [ ] Probar el formulario de contacto de punta a punta (llega a `contact_requests` y por email)
- [ ] Sustituir fotos de muestra, textos, opiniones y datos de contacto provisionales por los
      reales (`features/public-site/content.ts`)
- [x] SEO básico: title y description, Open Graph, favicon, `robots.txt` (zonas privadas fuera)
- [ ] SEO con dominio real: `og:url`, canonical, `og:image` propia, sitemap
- [ ] *(Más adelante)* gestionar el portfolio y ver las solicitudes de contacto desde el panel

## F2 — Galerías (fotógrafo)

- [~] Listado con filtros por estado, crear y editar
- [~] Ajustes: descarga, selección, máx. selección, caducidad, marca de agua
- [~] PIN: se cifra en la BD con `set_gallery_pin` (bcrypt); la UI solo ve `has_pin`
- [~] Publicar / pasar a borrador / archivar / eliminar; slug único con sufijo aleatorio
- [~] Dashboard con resumen (publicadas, borradores, selecciones recibidas, mensajes sin leer)
- [x] Migración `gallery_settings`: `has_pin`, GRANT por columna (no se escribe `pin_hash` ni `photographer_id`)

## R1 — Reservas (calendario)

Decisiones (2026-11-17):
- Solo reservan **clientes con cuenta** (desde la web pública se manda a login/registro y se vuelve
  al calendario).
- La reserva es una **solicitud**: bloquea la franja como `pending` y el fotógrafo la acepta o
  la rechaza desde el panel.
- Disponibilidad = **horario semanal + bloqueos + duración por producto**. El calendario calcula
  los huecos libres; una boda ocupa el día completo.

Modelo de datos (borrador):
- `booking_products`: nombre (boda, comunión, sesión de fotos…), duración en minutos o
  `full_day`, precio orientativo, importe de señal, activo, orden.
- `availability_rules`: día de la semana + hora de inicio y fin (varias franjas por día).
- `availability_blocks`: días u horas bloqueados (vacaciones, otros compromisos).
- `bookings`: cliente, producto, `starts_at`/`ends_at`, estado (`pending` → `awaiting_payment` →
  `payment_reported` → `confirmed`; o `rejected` / `cancelled` / `expired`), nota del cliente,
  código de reserva corto (p. ej. `RV-7K2P`) para el concepto del pago.
- Constraint de exclusión en Postgres (`btree_gist`) para que dos reservas activas no se solapen,
  aunque lleguen a la vez.

Tareas:
- [ ] Migración: tablas + RLS + función que calcula huecos libres (`available_slots(product, from, to)`)
- [ ] Panel: CRUD de productos, horario semanal y bloqueos
- [ ] Componente `BookingCalendar`: producto → día (mes con días disponibles) → franja → nota → enviar
- [ ] Mis reservas (cliente) y bandeja de reservas (fotógrafo): aceptar / rechazar / cancelar
- [ ] Caducar solicitudes no atendidas (libera la franja)
- [ ] Emails: solicitud recibida, aceptada, rechazada
- [ ] Zona horaria fija del negocio (`Europe/Madrid`)

## R2 — Señal y bot de WhatsApp

Idea: al aceptar la reserva, el cliente paga la señal por transferencia o Bizum con el código de
reserva en el concepto y manda la captura del justificante por WhatsApp. El bot la lee y la
asocia a la reserva.

Decisión (2026-11-17): **la confirmación es siempre manual del fotógrafo.** El bot nunca confirma.
1. El bot recibe la captura, extrae los datos y deja la reserva en `payment_reported`.
2. El bot avisa al fotógrafo: hay un justificante nuevo para la reserva X.
3. El fotógrafo entra en su dashboard, ve la reserva con la captura y los datos extraídos, lo
   comprueba en su banco y pulsa **Confirmar reserva** (o **Rechazar justificante**).
4. Al confirmar: reserva `confirmed` y aviso al cliente.

Avisos:
- **Una captura no prueba el pago**: se puede editar o reutilizar. Por eso confirma el fotógrafo
  tras mirar el banco. (Confirmación automática real solo con datos del banco, API PSD2, o con
  pasarela Stripe / Redsys-Bizum: descartado por ahora.)
- **WhatsApp**: usar la API oficial (WhatsApp Business Cloud API de Meta): número propio,
  verificación del negocio y webhook. Las librerías no oficiales (whatsapp-web.js, etc.) violan
  los términos y el número puede ser bloqueado.
- **Lectura de la imagen**: un OCR clásico (Tesseract/pytesseract) falla bastante con capturas de
  apps bancarias. Mejor un modelo con visión (API de Claude) que devuelva JSON estructurado; se
  llama desde una Edge Function, sin montar un servicio Python. Alternativas: Google Cloud Vision,
  AWS Textract.

Tareas:
- [ ] Cuenta de WhatsApp Business Cloud API + número + webhook (Edge Function `whatsapp-webhook`)
- [ ] Vincular el teléfono del perfil del cliente con su reserva (o por el código de reserva)
- [ ] Extraer importe / fecha / concepto de la captura y cruzarlo con la reserva
- [ ] Respuesta automática al cliente por WhatsApp ("Hemos recibido tu justificante, el fotógrafo
      lo revisará") — nunca "reserva confirmada"
- [ ] Aviso al fotógrafo (WhatsApp a su número + contador en el dashboard)
- [ ] Dashboard: bandeja "Justificantes por revisar" con captura, datos extraídos y reserva
      asociada; botones **Confirmar reserva** / **Rechazar justificante**
- [ ] Al confirmar → reserva `confirmed` + aviso al cliente (WhatsApp y email)
- [ ] Guardar los justificantes en privado (R2 `originals` o bucket aparte) con RLS

## F3 — Subida y procesado

- [ ] Cuenta de Cloudflare + buckets R2 (`originals`, `previews`) + claves
- [ ] `sign-upload` (URL prefirmada R2)
- [ ] Dropzone + cola con concurrencia y reintentos
- [ ] `process-photo` → thumb + preview con marca de agua (decidir: Cloudflare Images o `image-worker` con sharp)
- [ ] Realtime: la foto aparece al pasar a `ready`
- [ ] Orden manual y portada
- [ ] Al eliminar una galería, borrar también sus archivos en R2 (ahora solo se borran las filas)

## F4 — Vista cliente protegida

- [~] `invite-client` (email de invitación) + `AcceptInvitePage` — adelantado en F1 (ver arriba)
- [ ] `ClientHomePage` (`/my`): listar las galerías a las que el cliente tiene acceso
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
