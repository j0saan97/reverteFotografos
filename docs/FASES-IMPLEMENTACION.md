# Fases de implementación

> Plan de trabajo y estado de avance. Es el **único checklist** del proyecto: se actualiza al
> terminar cada tarea. Forma de trabajar en [STACK-Y-METODOLOGIA.md](STACK-Y-METODOLOGIA.md);
> organización del código en [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md).

**Actualizado:** 2026-11-17

**Leyenda:** `[x]` hecho y comprobado · `[~]` hecho en código, falta probarlo contra Supabase ·
`[ ]` pendiente

**Índices:** cada tarea se identifica como `<fase>.<n>` (p. ej. `F1.3`, `R2.4`; `T.n` para
transversal). Las tareas nuevas se añaden al final de su fase con el siguiente número, sin
renumerar las existentes, para que las referencias (commits, conversaciones) sigan valiendo.

## Roadmap

| Fase | Objetivo | Estado |
|---|---|---|
| F0 | Setup: monorepo, Supabase, migraciones, tipos | Hecha |
| F1 | Auth, roles, layouts y guards | Hecha |
| F1b | Web pública: carrusel, portfolio, contacto | Hecha, falta contenido real |
| F2 | Galerías CRUD (fotógrafo) | Hecha (falta probar el PIN, F2.3) |
| R1 | Reservas: calendario con producto, día y franja (solicitud + confirmación) | Hecha (pendientes: R1.5 job, R1.6 emails) |
| R2 | Señal por transferencia/Bizum + bot de WhatsApp que lee el justificante | Diseño |
| F3 | Subida a R2 + procesado (thumb, preview, marca de agua) | Pendiente |
| F4 | Vista cliente protegida + acceso por invitación / PIN | Pendiente |
| F5 | Selección, comentarios por foto, envío y mensajes | Pendiente |
| F6 | Descargas firmadas + ZIP + auditoría | Pendiente |
| F7 | Branding del fotógrafo, emails y caducidades | Pendiente |
| F8 | Extras: estadísticas, tienda de impresiones | Pendiente |
| M1 | Separar web pública y app de galerías (siguiente sprint) | Pendiente |

## F0 — Setup

- [x] **F0.1** Node 26, pnpm 9.12, `pnpm install` sin errores
- [x] **F0.2** Versiones revisadas: se mantienen las mayores actuales
- [x] **F0.3** ESLint (flat config) + Prettier (`format`, `format:check`)
- [x] **F0.4** Vitest con tests de los esquemas Zod
- [x] **F0.5** `pnpm dev` levanta la app
- [x] **F0.6** Git + GitHub, ramas `main` y `dev`
- [x] **F0.7** Supabase CLI en el proyecto (`pnpm supabase`), sin Docker
- [x] **F0.8** Proyecto `reverteFotografos` en supabase.com (Europa, ref `gbymaufmavdvgfqmoeof`)
- [x] **F0.9** `supabase login` y `supabase link --project-ref gbymaufmavdvgfqmoeof`
- [x] **F0.10** `pnpm db:push`: 4 migraciones aplicadas (CLI v3: los scripts usan `--remote`)
- [x] **F0.11** `pnpm db:types:remote`: `apps/web/src/types/database.ts` generado
- [x] **F0.12** `apps/web/.env.local` con URL + publishable key reales

## F1 — Auth y roles

- [x] **F1.1** Login, registro y recuperar contraseña (UI + lógica)
- [x] **F1.2** Trigger `handle_new_user` crea el perfil con rol `client`
- [x] **F1.3** Edge Function `claim-photographer` (código de invitación)
- [x] **F1.4** `AuthProvider` + `useSession`, `RequireAuth` / `RequireRole`
- [x] **F1.5** Layouts fotógrafo (barra lateral) y cliente (oscuro)
- [x] **F1.6** Vista previa sin Supabase solo en desarrollo (`VITE_DEV_PREVIEW_ROLE`)
- [x] **F1.7** Decisión: alta de fotógrafo por código de invitación
- [x] **F1.8** Panel de Supabase: Site URL y Redirect URLs (`http://localhost:5173/**`)
- [x] **F1.9** Secret `PHOTOGRAPHER_INVITE_CODE` y desplegar `claim-photographer`
      (`pnpm fn:deploy <nombre>`: necesita `--import-map` para resolver `@galeria/shared`)
- [x] **F1.10** Probado: registro de cliente, registro de fotógrafo con código, login, reset y redirección por rol
- [x] **F1.11** `AcceptInvitePage` (`/invite/:token`): sin sesión → login/registro y vuelve a la invitación
      (se recuerda en `localStorage`); con sesión de cliente → `accept-invite`; invitación ligada al email
- [x] **F1.12** Invitaciones: migración `gallery_invites` (token de un uso, solo se guarda su hash, caduca a
      los 14 días), Edge Functions `invite-client` y `accept-invite` desplegadas, sección
      "Clientes con acceso" en la galería (invitar, copiar enlace, nuevo enlace, quitar acceso)

## F1b — Web pública

- [x] **F1b.1** Home en `/`: carrusel, portfolio con filtros + lightbox, sobre mí, testimonios, contacto,
      footer y enlace "Acceso clientes"
- [x] **F1b.2** Contacto directo: WhatsApp, teléfono, email, Instagram
- [x] **F1b.3** Formulario → Edge Function `contact` + tabla `contact_requests` (RLS)
- [x] **F1b.4** Desplegar `contact` (pública: `verify_jwt = false` en `config.toml`, la publishable key no es un JWT)
- [ ] **F1b.5** Cuenta de Resend + dominio verificado y secrets `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`,
      `CONTACT_FROM_EMAIL` *(usuario)* — también activa el email de las invitaciones
- [~] **F1b.6** Probar el formulario de contacto de punta a punta (llega a `contact_requests` y por email) — llega a `contact_requests` ✔; falta el email (depende de F1b.5)
- [ ] **F1b.7** Sustituir fotos de muestra, textos, opiniones y datos de contacto provisionales por los
      reales (`features/public-site/content.ts`)
- [x] **F1b.8** SEO básico: title y description, Open Graph, favicon, `robots.txt` (zonas privadas fuera)
- [ ] **F1b.9** SEO con dominio real: `og:url`, canonical, `og:image` propia, sitemap
- [~] **F1b.10** Solicitudes de contacto en el panel (`/contacts`): sin atender / atendidos, email, teléfono y WhatsApp; contador en el dashboard. *(Gestionar el portfolio desde el panel: más adelante)*

## F2 — Galerías (fotógrafo)

- [x] **F2.1** Listado con filtros por estado, crear y editar
- [x] **F2.2** Ajustes: descarga, selección, máx. selección, caducidad, marca de agua
- [~] **F2.3** PIN: se cifra en la BD con `set_gallery_pin` (bcrypt); la UI solo ve `has_pin` — *prueba aplazada*
- [x] **F2.4** Publicar / pasar a borrador / archivar / eliminar; slug único con sufijo aleatorio
- [x] **F2.5** Dashboard con resumen (publicadas, borradores, selecciones recibidas, mensajes sin leer)
- [x] **F2.6** Migración `gallery_settings`: `has_pin`, GRANT por columna (no se escribe `pin_hash` ni `photographer_id`)

Ampliación según la referencia ([inventario](referencias/iphoto-galeria/README.md), captura 01):
- [x] **F2.7** Cliente principal de la galería (nombre, email, teléfono); se muestra como subtítulo
      en la tarjeta y es el destinatario por defecto de email/WhatsApp
- [x] **F2.8** Tarjeta con 10 iconos: enviada · ♥ N seleccionadas · € pagada · extras · @ permiso
      de publicación · descargar (sin funcionalidad) · email · WhatsApp · archivar · eliminar.
      Los indicadores sin datos todavía (selección, extras, @) se muestran apagados
- [x] **F2.9** Estado de pago de la galería: pagada / pendiente (lo marca el fotógrafo a mano)
- [x] **F2.10** Enviar enlace al cliente principal: por email (`invite-client`) y por WhatsApp
      (`wa.me` con mensaje y enlace); registra la fecha de envío → indicador "enviada"
- [x] **F2.11** Papelera: eliminar = mover a papelera (restaurable); vaciar = borrado definitivo.
      Pestañas Activas / Archivadas / Papelera
- [x] **F2.12** Filtros rápidos (Todas, Seleccionadas, Con extras, Pte. selección, Pagadas, Pte. pago,
      No enviadas, Descargadas), buscador por título o cliente y vista cuadrícula / lista

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
- [x] **R1.1** Migración `bookings`: tablas + RLS + `available_slots(product, from, to)` y funciones
      `request_booking` / `respond_booking` / `confirm_booking` / `cancel_booking`. Probada con un
      test SQL que se deshace solo (huecos, día completo, doble reserva rechazada, aceptar, confirmar, cancelar)
- [x] **R1.2** Panel: CRUD de productos, horario semanal y bloqueos
- [x] **R1.3** Componente `BookingCalendar`: producto → día (mes con días disponibles) → franja → nota → enviar
- [x] **R1.4** Mis reservas (cliente) y bandeja de reservas (fotógrafo): aceptar / rechazar / cancelar
- [ ] **R1.5** Caducar solicitudes no atendidas (libera la franja) (ya caducan a las 48 h al consultar/reservar; falta el job periódico)
- [ ] **R1.6** Emails: solicitud recibida, aceptada, rechazada
- [x] **R1.7** Zona horaria fija del negocio (`Europe/Madrid`): en la BD (`business_tz()`) y en la UI (calendario, bandeja y Mis reservas con `madridTime`)

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
- [ ] **R2.1** Cuenta de WhatsApp Business Cloud API + número + webhook (Edge Function `whatsapp-webhook`)
- [ ] **R2.2** Vincular el teléfono del perfil del cliente con su reserva (o por el código de reserva)
- [ ] **R2.3** Extraer importe / fecha / concepto de la captura y cruzarlo con la reserva
- [ ] **R2.4** Respuesta automática al cliente por WhatsApp ("Hemos recibido tu justificante, el fotógrafo
      lo revisará") — nunca "reserva confirmada"
- [ ] **R2.5** Aviso al fotógrafo (WhatsApp a su número + contador en el dashboard)
- [ ] **R2.6** Dashboard: bandeja "Justificantes por revisar" con captura, datos extraídos y reserva
      asociada; botones **Confirmar reserva** / **Rechazar justificante**
- [ ] **R2.7** Al confirmar → reserva `confirmed` + aviso al cliente (WhatsApp y email)
- [ ] **R2.8** Guardar los justificantes en privado (R2 `originals` o bucket aparte) con RLS

## F3 — Subida y procesado

- [ ] **F3.1** Cuenta de Cloudflare + buckets R2 (`originals`, `previews`) + claves
- [ ] **F3.2** `sign-upload` (URL prefirmada R2)
- [ ] **F3.3** Dropzone + cola con concurrencia y reintentos
- [ ] **F3.4** `process-photo` → thumb + preview con marca de agua (decidir: Cloudflare Images o `image-worker` con sharp)
- [ ] **F3.5** Realtime: la foto aparece al pasar a `ready`
- [ ] **F3.6** Orden manual y portada
- [ ] **F3.7** Al eliminar una galería, borrar también sus archivos en R2 (ahora solo se borran las filas)

## F4 — Vista cliente protegida

- [x] **F4.1** `invite-client` (email de invitación) + `AcceptInvitePage` — adelantado en F1 (ver F1.11 y F1.12)
- [~] **F4.2** `ClientHomePage` (`/my`): galerías del cliente (publicadas, no caducadas), aviso de las aún no publicadas y próximas reservas. `/my/:slug` muestra el título hasta que haya fotos (F3/F4)
- [ ] **F4.3** Acceso por `/g/:slug` + PIN (`verify-pin` con hash + límite de intentos)
- [ ] **F4.4** `sign-view` + Worker de Cloudflare que valida el token
- [ ] **F4.5** `ProtectedImage`, `ProtectedLightbox` y hooks de `shared/protection`

## F5 — Selección, comentarios y mensajes

- [ ] **F5.1** Check en cada `PhotoCard` y en el lightbox (tecla F)
- [ ] **F5.2** Comentario por foto
- [ ] **F5.3** `SelectionBar` con contador / máximo y filtros
- [ ] **F5.4** Revisar y enviar con mensaje general (`submit-selection`)
- [ ] **F5.5** Hilo de mensajes (`gallery_messages`) con Realtime y no leídos
- [ ] **F5.6** Vista del fotógrafo: selecciones, comentarios, exportar nombres, reabrir (`reopen-selection`)
- [ ] **F5.7** Productos extra que el cliente puede pedir desde la galería (álbum, copias…) → indicador "extras"
- [ ] **F5.8** Consentimiento del cliente para publicar sus fotos → indicador "@"

## F6 — Descargas

- [ ] **F6.1** `sign-download` (URLs firmadas / ZIP) + auditoría en `downloads`

## F7 — Branding y emails

- [ ] **F7.1** Logo y nombre del fotógrafo en la vista cliente
- [ ] **F7.2** Emails con Resend (invitación, selección enviada, nuevo mensaje)
- [ ] **F7.3** Plantillas de email de Supabase Auth en español (confirmar cuenta, reset) + SMTP propio
- [ ] **F7.4** Caducidad de galerías

## F8 — Extras

- [ ] **F8.1** Estadísticas, tienda de impresiones, etc.

## M1 — Separar web pública y app (siguiente sprint)

Decisión (2026-11-17): se hace en el sprint 3, no en el actual. Monorepo, no ramas.
Pendiente de decidir: ¿la app es solo para Reverte o un producto para otros fotógrafos (multi-fotógrafo)?

- [ ] **M1.1** `apps/site`: web pública (portada, portfolio, contacto, botón Reservar); valorar Astro para SEO
- [ ] **M1.2** `apps/app`: galerías, reservas y panel con nombre/dominio propios
- [ ] **M1.3** `packages/ui`: componentes y tokens de diseño compartidos (Button, campos, iconos, Checkbox)
- [ ] **M1.4** Login y "Reservar" entre dominios; Site URL / Redirect URLs de Supabase para ambos
- [ ] **M1.5** Despliegue independiente de cada app

## Transversal / despliegue

- [ ] **T.1** Dominio propio y hosting del front (Vercel / Netlify / Cloudflare Pages)
- [ ] **T.2** CORS de las Edge Functions restringido al dominio (`APP_URL`)
- [ ] **T.3** CI en GitHub Actions: revisar que pasa con el código actual
- [ ] **T.4** Sentry (front + functions)
- [ ] **T.5** Tests e2e con Playwright de los flujos principales
- [ ] **T.6** Antes de abrir a clientes reales: reactivar *Confirm email* en Supabase Auth
      (desactivado temporalmente para pruebas por el límite de ~2 emails/hora del SMTP por defecto)
