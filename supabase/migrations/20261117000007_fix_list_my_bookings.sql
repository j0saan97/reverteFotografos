-- Fix: in list_my_bookings the UPDATE's unqualified status/expires_at clashed
-- with the function's OUT columns ("column reference is ambiguous").
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
#variable_conflict use_column
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  update bookings bk set status = 'expired'
   where bk.client_id = auth.uid() and bk.status = 'pending' and bk.expires_at <= now();

  return query
  select b.id, b.code, b.status, b.starts_at, b.ends_at, b.client_note, b.photographer_note,
         b.expires_at, b.created_at, p.name, p.full_day, p.deposit_cents
    from bookings b
    join booking_products p on p.id = b.product_id
   where b.client_id = auth.uid()
   order by b.starts_at desc;
end $$;
