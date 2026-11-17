-- =============================================================
-- F2: gallery settings
-- - has_pin: readable flag so the UI knows whether a PIN is set (pin_hash stays hidden)
-- - Column-level INSERT/UPDATE grants: pin_hash and photographer_id can't be
--   changed directly from the client
-- - set_gallery_pin(): hashes the PIN with bcrypt inside the database
-- =============================================================

alter table public.galleries
  add column has_pin boolean generated always as (pin_hash is not null) stored;

grant select (has_pin) on public.galleries to authenticated;

-- INSERT: photographer_id is required by RLS (must equal auth.uid()); pin_hash is not insertable
revoke insert, update on public.galleries from anon, authenticated;
grant insert (photographer_id, title, slug, allow_download, allow_selection, max_selection,
              watermark_text, expires_at, status)
  on public.galleries to authenticated;
grant update (title, cover_photo_id, allow_download, allow_selection, max_selection,
              watermark_text, expires_at, status)
  on public.galleries to authenticated;

-- Sets or clears (pin = null) the gallery PIN. Only the gallery owner.
create or replace function public.set_gallery_pin(gallery_id uuid, pin text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_gallery_owner(gallery_id) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  if pin is not null and pin !~ '^\d{4,8}$' then
    raise exception 'invalid pin' using errcode = '22023';
  end if;

  update public.galleries
     set pin_hash = case when pin is null then null else crypt(pin, gen_salt('bf')) end
   where id = gallery_id;
end $$;

revoke execute on function public.set_gallery_pin(uuid, text) from public, anon;
grant execute on function public.set_gallery_pin(uuid, text) to authenticated;
