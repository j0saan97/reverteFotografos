-- =============================================================
-- Row Level Security + privilegios por columna
-- =============================================================

-- Helpers (security definer para evitar recursión de RLS)
create or replace function public.is_gallery_owner(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from galleries where id = gid and photographer_id = auth.uid());
$$;

create or replace function public.has_gallery_access(gid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from gallery_access ga
    join galleries g on g.id = ga.gallery_id
    where ga.gallery_id = gid
      and ga.client_id = auth.uid()
      and ga.accepted_at is not null
      and g.status = 'published'
      and (g.expires_at is null or g.expires_at > now())
  );
$$;

alter table public.profiles         enable row level security;
alter table public.galleries        enable row level security;
alter table public.gallery_access   enable row level security;
alter table public.photos           enable row level security;
alter table public.selections       enable row level security;
alter table public.selection_items  enable row level security;
alter table public.gallery_messages enable row level security;
alter table public.downloads        enable row level security;

-- ---------- Privilegios por columna ----------
-- En Postgres un REVOKE de columna no anula un GRANT de tabla, así que se quita
-- el privilegio de tabla y se concede columna a columna. Desde el cliente hay que
-- hacer select con columnas explícitas (no '*').

-- profiles: el usuario no puede cambiarse el rol
revoke update on public.profiles from anon, authenticated;
grant update (display_name, brand_name, brand_logo_key) on public.profiles to authenticated;

-- galleries: pin_hash no se lee nunca desde el cliente (se valida en verify-pin)
revoke select on public.galleries from anon, authenticated;
grant select (id, photographer_id, title, slug, cover_photo_id, allow_download, allow_selection,
              max_selection, watermark_text, expires_at, status, created_at)
  on public.galleries to authenticated;

-- photos: original_key nunca sale al cliente (descargas por sign-download)
revoke select on public.photos from anon, authenticated;
grant select (id, gallery_id, filename, preview_key, thumb_key, width, height, size_bytes,
              position, status, created_at)
  on public.photos to authenticated;

-- downloads: solo la service role inserta
revoke insert, update, delete on public.downloads from anon, authenticated;

-- ---------- profiles ----------
create policy "profiles: read own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- galleries ----------
create policy "galleries: owner all" on public.galleries
  for all using (photographer_id = auth.uid()) with check (photographer_id = auth.uid());
create policy "galleries: client read" on public.galleries
  for select using (public.has_gallery_access(id));

-- ---------- gallery_access ----------
create policy "access: owner all" on public.gallery_access
  for all using (public.is_gallery_owner(gallery_id))
  with check (public.is_gallery_owner(gallery_id));
create policy "access: client read own" on public.gallery_access
  for select using (client_id = auth.uid());

-- ---------- photos ----------
create policy "photos: owner all" on public.photos
  for all using (public.is_gallery_owner(gallery_id))
  with check (public.is_gallery_owner(gallery_id));
create policy "photos: client read ready" on public.photos
  for select using (status = 'ready' and public.has_gallery_access(gallery_id));

-- ---------- selections ----------
create policy "selections: client own" on public.selections
  for select using (client_id = auth.uid());
create policy "selections: client create" on public.selections
  for insert with check (client_id = auth.uid() and public.has_gallery_access(gallery_id));
create policy "selections: client update while open" on public.selections
  for update using (client_id = auth.uid() and submitted_at is null)
  with check (client_id = auth.uid() and submitted_at is null);
-- El envío (submitted_at) y la reapertura los hacen las Edge Functions con service role.
create policy "selections: owner read" on public.selections
  for select using (public.is_gallery_owner(gallery_id));

-- ---------- selection_items ----------
create policy "items: client manage while open" on public.selection_items
  for all using (
    exists (select 1 from selections s
            where s.id = selection_id and s.client_id = auth.uid() and s.submitted_at is null)
  ) with check (
    exists (select 1 from selections s
            where s.id = selection_id and s.client_id = auth.uid() and s.submitted_at is null)
  );
create policy "items: client read" on public.selection_items
  for select using (
    exists (select 1 from selections s where s.id = selection_id and s.client_id = auth.uid())
  );
create policy "items: owner read" on public.selection_items
  for select using (
    exists (select 1 from selections s
            where s.id = selection_id and public.is_gallery_owner(s.gallery_id))
  );

-- ---------- gallery_messages ----------
create policy "messages: participants read" on public.gallery_messages
  for select using (public.is_gallery_owner(gallery_id) or public.has_gallery_access(gallery_id));
create policy "messages: participants write" on public.gallery_messages
  for insert with check (
    author_id = auth.uid()
    and (public.is_gallery_owner(gallery_id) or public.has_gallery_access(gallery_id))
  );
-- Marcar como leído: solo mensajes ajenos y solo la columna read_at
revoke update on public.gallery_messages from anon, authenticated;
grant update (read_at) on public.gallery_messages to authenticated;
create policy "messages: mark read" on public.gallery_messages
  for update using (
    author_id <> auth.uid()
    and (public.is_gallery_owner(gallery_id) or public.has_gallery_access(gallery_id))
  );

-- ---------- downloads ----------
create policy "downloads: owner read" on public.downloads
  for select using (
    exists (select 1 from photos p where p.id = photo_id and public.is_gallery_owner(p.gallery_id))
  );
