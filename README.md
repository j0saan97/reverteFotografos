# Reverte Fotógrafos — web y galería privada

Web pública del estudio (portfolio y contacto) y galería privada donde el **fotógrafo** sube
sesiones y el **cliente** las ve protegidas, marca su selección, comenta y la envía.

## Documentación

- [Stack y metodología](docs/STACK-Y-METODOLOGIA.md): tecnologías, forma de trabajar, seguridad y decisiones.
- [Estructura del proyecto](docs/ESTRUCTURA-PROYECTO.md): carpetas, rutas, Edge Functions, datos y flujos.
- [Fases de implementación](docs/FASES-IMPLEMENTACION.md): roadmap y estado de avance.
- [CLAUDE.md](CLAUDE.md): contexto y reglas para Claude Code.

## Stack

React + TS + Vite · TanStack Query · Zustand · Tailwind · Supabase (Postgres, Auth, RLS,
Edge Functions) · Cloudflare R2 · pnpm monorepo

## Requisitos

Node 20+ y pnpm. La Supabase CLI va incluida en el proyecto (`pnpm supabase`); la base de datos
está en Supabase en la nube, así que no hace falta Docker.

## Arranque

```bash
pnpm install
cp .env.example apps/web/.env.local      # rellenar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
pnpm supabase login                      # una vez
pnpm db:link --project-ref <ref>         # vincular el proyecto de supabase.com
pnpm db:push                             # aplicar migraciones
pnpm db:types:remote                     # generar tipos TS de la BD
pnpm dev                                 # http://localhost:5173
```
