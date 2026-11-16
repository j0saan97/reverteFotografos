-- =============================================================
-- Esquema base
-- =============================================================
create extension if not exists pgcrypto;

create type public.user_role as enum ('photographer', 'client');
create type public.gallery_status as enum ('draft', 'published', 'archived');
create type public.photo_status as enum ('uploading', 'processing', 'ready', 'error');

-- ---------- profiles ----------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  role           public.user_role not null default 'client',
  display_name   text,
  brand_name     text,
  brand_logo_key text,
  created_at     timestamptz not null default now()
);

-- Crea el perfil al registrarse. El rol siempre es 'client';
-- los fotógrafos se promocionan aparte (ver F1 en docs/FASES-IMPLEMENTACION.md).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- galleries ----------
create table public.galleries (
  id              uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  title           text not null,
  slug            text not null unique,
  pin_hash        text,
  cover_photo_id  uuid,
  allow_download  boolean not null default false,
  allow_selection boolean not null default true,
  max_selection   int check (max_selection is null or max_selection > 0),
  watermark_text  text,
  expires_at      timestamptz,
  status          public.gallery_status not null default 'draft',
  created_at      timestamptz not null default now()
);
create index on public.galleries (photographer_id);

-- ---------- gallery_access ----------
create table public.gallery_access (
  gallery_id  uuid not null references public.galleries (id) on delete cascade,
  email       text not null,
  client_id   uuid references public.profiles (id) on delete cascade,
  invited_at  timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (gallery_id, email)
);
create index on public.gallery_access (client_id);

-- ---------- photos ----------
create table public.photos (
  id           uuid primary key default gen_random_uuid(),
  gallery_id   uuid not null references public.galleries (id) on delete cascade,
  filename     text not null,
  original_key text not null,
  preview_key  text,
  thumb_key    text,
  width        int,
  height       int,
  size_bytes   bigint,
  position     int not null default 0,
  status       public.photo_status not null default 'uploading',
  created_at   timestamptz not null default now()
);
create index on public.photos (gallery_id, position);

alter table public.galleries
  add constraint galleries_cover_fk foreign key (cover_photo_id)
  references public.photos (id) on delete set null;

-- ---------- selections ----------
create table public.selections (
  id           uuid primary key default gen_random_uuid(),
  gallery_id   uuid not null references public.galleries (id) on delete cascade,
  client_id    uuid not null references public.profiles (id) on delete cascade,
  client_note  text,
  submitted_at timestamptz,
  reopened_at  timestamptz,
  created_at   timestamptz not null default now(),
  unique (gallery_id, client_id)
);

create table public.selection_items (
  selection_id uuid not null references public.selections (id) on delete cascade,
  photo_id     uuid not null references public.photos (id) on delete cascade,
  comment      text check (comment is null or length(comment) <= 500),
  created_at   timestamptz not null default now(),
  primary key (selection_id, photo_id)
);

-- ---------- gallery_messages ----------
create table public.gallery_messages (
  id         uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references public.galleries (id) on delete cascade,
  photo_id   uuid references public.photos (id) on delete set null,
  author_id  uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (length(body) between 1 and 2000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index on public.gallery_messages (gallery_id, created_at);

-- ---------- downloads (auditoría) ----------
create table public.downloads (
  id         uuid primary key default gen_random_uuid(),
  photo_id   uuid not null references public.photos (id) on delete cascade,
  client_id  uuid references public.profiles (id) on delete set null,
  ip         inet,
  created_at timestamptz not null default now()
);
