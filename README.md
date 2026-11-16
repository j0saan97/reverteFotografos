# Galería privada para fotógrafos

App web donde el **fotógrafo** sube sesiones a galerías privadas y el **cliente** las ve
protegidas, marca su selección, comenta y la envía.

- Arquitectura completa: [`docs/ARQUITECTURA.txt`](docs/ARQUITECTURA.txt)
- Fases y checklist: [`docs/FASES.md`](docs/FASES.md)
- Contexto para Claude Code: [`CLAUDE.md`](CLAUDE.md)

## Stack
React + TS + Vite · TanStack Query · Zustand · Tailwind · Supabase (Postgres, Auth, RLS,
Edge Functions) · Cloudflare R2 · pnpm monorepo

## Requisitos
Node 20+, pnpm, Docker, Supabase CLI.

## Arranque local
```bash
pnpm install
cp .env.example apps/web/.env.local      # rellenar VITE_*
supabase start
supabase db reset                        # aplica migraciones + seed
pnpm db:types                            # genera tipos TS de la BD
pnpm dev                                 # http://localhost:5173
```

> Las versiones de dependencias son orientativas: se revisan en la F0.
