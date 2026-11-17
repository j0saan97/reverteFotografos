-- =============================================================
-- R1.4: booking lists
-- The photographer can't read clients' profiles (RLS "profiles: read own"),
-- so the inbox gets client name/email through this security definer function,
-- limited to the caller's own bookings. Both lists expire stale pending
-- requests first (lazy expiry, see R1.5).
-- =============================================================

create or replace function public.list_photographer_bookings()
returns table (
  id                uuid,
  code              text,
  status            public.booking_status,
  starts_at         timestamptz,
  ends_at           timestamptz,
  client_note       text,
  photographer_note text,
  expires_at        timestamptz,
  created_at        timestamptz,
  product_name      text,
  full_day          boolean,
  deposit_cents     int,
  client_name       text,
  client_email      text
)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_photographer() then
    raise exception 'not_a_photographer' using errcode = '42501';
  end if;
  perform public.expire_pending_bookings(auth.uid());

  return query
  select b.id, b.code, b.status, b.starts_at, b.ends_at, b.client_note, b.photographer_note,
         b.expires_at, b.created_at, p.name, p.full_day, p.deposit_cents,
         pr.display_name, u.email::text
    from bookings b
    join booking_products p on p.id = b.product_id
    join profiles pr on pr.id = b.client_id
    join auth.users u on u.id = b.client_id
   where b.photographer_id = auth.uid()
   order by b.starts_at;
end $$;

create or replace function public.list_my_bookings()
returns table (
  id                uuid,
  code              text,
  status            public.booking_status,
  starts_at         timestamptz,
  ends_at           timestamptz,
  client_note       text,
  photographer_note text,
  expires_at        timestamptz,
  created_at        timestamptz,
  product_name      text,
  full_day          boolean,
  deposit_cents     int
)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  update bookings set status = 'expired'
   where client_id = auth.uid() and status = 'pending' and expires_at <= now();

  return query
  select b.id, b.code, b.status, b.starts_at, b.ends_at, b.client_note, b.photographer_note,
         b.expires_at, b.created_at, p.name, p.full_day, p.deposit_cents
    from bookings b
    join booking_products p on p.id = b.product_id
   where b.client_id = auth.uid()
   order by b.starts_at desc;
end $$;

revoke execute on function public.list_photographer_bookings() from public, anon;
revoke execute on function public.list_my_bookings() from public, anon;
grant execute on function public.list_photographer_bookings() to authenticated;
grant execute on function public.list_my_bookings() to authenticated;
