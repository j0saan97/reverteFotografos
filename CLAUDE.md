# CLAUDE.md — contexto del proyecto

## Qué es
Galería privada de fotos fotógrafo → cliente (referencia: Oh My Photo / Pixpa / Pic-Time).
- Fotógrafo: crea galerías, sube fotos, invita clientes, ve selecciones y mensajes.
- Cliente: ve fotos protegidas, marca con check, comenta por foto, envía selección con
  mensaje, hilo de dudas con el fotógrafo, descarga solo si está permitido.

Documentación en `docs/`:
- `docs/STACK-Y-METODOLOGIA.md`: stack, forma de trabajar, seguridad y decisiones.
- `docs/ESTRUCTURA-PROYECTO.md`: monorepo, carpetas, rutas, Edge Functions, datos/RLS y flujos.
- `docs/FASES-IMPLEMENTACION.md`: roadmap y checklist de estado (único checklist).

## Stack
- `apps/web`: React 18 + TS + Vite, React Router, TanStack Query, Zustand, Tailwind v4,
  React Hook Form + Zod, yet-another-react-lightbox, react-dropzone.
- `packages/shared`: tipos, esquemas Zod y constantes compartidos front ↔ functions.
- `supabase/`: migraciones SQL (tablas + RLS), Edge Functions (Deno/TS).
- `apps/image-worker`: (opcional) procesado con `sharp` si no se usa Cloudflare Images.
- Fotos en Cloudflare R2: `originals` privado, `previews`/`thumbs` servidos con token.

## Reglas
1. **Se trabaja por fases** (`docs/FASES-IMPLEMENTACION.md`). Una fase cada vez; al terminar, marcar el
   checklist y no adelantar trabajo de fases futuras.
2. **RLS primero**: toda tabla nueva lleva RLS activado y políticas en una migración.
3. **Nunca** usar la service role key en el frontend. Lo que necesite secretos → Edge Function.
4. El cliente **nunca** recibe `original_key`, `pin_hash` ni URLs permanentes de imágenes.
   Esas columnas no tienen GRANT de lectura: hacer `select` con columnas explícitas, no `*`.
5. Migraciones ya aplicadas no se editan: se crea una nueva (`supabase migration new x`).
6. Frontend por features (`src/features/*`). Una feature no importa archivos internos
   de otra: solo su `index.ts`. Dependencias: pages → components → hooks → services → shared/lib.
7. Validación con Zod en `packages/shared`, usada en front y en functions.
8. Código, nombres y comentarios técnicos en inglés; textos de UI en español.
9. Tras cambiar la BD: `pnpm db:types`.
10. Antes de cerrar una fase: `pnpm typecheck && pnpm lint && pnpm test`.

## Comandos
- `pnpm dev` · `pnpm typecheck` · `pnpm lint` · `pnpm test`
- `supabase start` · `supabase db reset` · `pnpm db:types` · `supabase functions serve`
