-- =============================================================
-- F2.11: trash (soft delete)
-- "Eliminar" sets deleted_at; the photographer can restore it or delete it
-- for good (DELETE, policy "galleries: owner all"). Clients lose access to a
-- gallery as soon as it is in the trash.
-- =============================================================

alter table public.galleries add column deleted_at timestamptz;

grant select (deleted_at), update (deleted_at) on public.galleries to authenticated;

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
      and g.deleted_at is null
      and (g.expires_at is null or g.expires_at > now())
  );
$$;
