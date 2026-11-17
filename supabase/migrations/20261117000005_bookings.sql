-- =============================================================
-- R1.1: bookings (calendar)
-- - Products (wedding, communion, session…) with a duration or full day
-- - Weekly availability + blocked periods per photographer
-- - Bookings: requested by signed-in clients, accepted/rejected by the photographer
-- - No overlapping active bookings (exclusion constraint)
-- - Every state change goes through a security definer function: the client
--   can't insert/update bookings directly.
-- Business rules: time zone Europe/Madrid, 30-min slot step, 24 h minimum
-- notice, pending requests expire after 48 h, max 3 pending per client.
-- =============================================================

create extension if not exists btree_gist with schema extensions;

create type public.booking_status as enum (
  'pending',           -- requested by the client, holds the slot
  'awaiting_payment',  -- accepted, waiting for the deposit (R2)
  'payment_reported',  -- client sent the receipt (R2)
  'confirmed',
  'rejected',
  'cancelled',
  'expired'
);

-- ---------- products ----------
create table public.booking_products (
  id               uuid primary key default gen_random_uuid(),
  photographer_id  uuid not null references public.profiles (id) on delete cascade,
  name             text not null check (length(name) between 1 and 80),
  description      text check (description is null or length(description) <= 1000),
  full_day         boolean not null default false,
  duration_minutes int check (duration_minutes is null or duration_minutes between 15 and 720),
  price_cents      int check (price_cents is null or price_cents >= 0),
  deposit_cents    int check (deposit_cents is null or deposit_cents >= 0),
  active           boolean not null default true,
  position         int not null default 0,
  created_at       timestamptz not null default now(),
  constraint booking_products_duration check (full_day or duration_minutes is not null)
);
create index on public.booking_products (photographer_id, position);

-- ---------- weekly availability ----------
create table public.availability_rules (
  id              uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  weekday         smallint not null check (weekday between 1 and 7), -- ISO: 1 = Monday
  start_time      time not null,
  end_time        time not null,
  check (start_time < end_time)
);
create index on public.availability_rules (photographer_id, weekday);

-- ---------- blocked periods ----------
create table public.availability_blocks (
  id              uuid primary key default gen_random_uuid(),
  photographer_id uuid not null references public.profiles (id) on delete cascade,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  reason          text check (reason is null or length(reason) <= 200),
  created_at      timestamptz not null default now(),
  check (starts_at < ends_at)
);
create index on public.availability_blocks (photographer_id, starts_at);

-- ---------- bookings ----------
create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  photographer_id   uuid not null references public.profiles (id) on delete cascade,
  client_id         uuid not null references public.profiles (id) on delete cascade,
  product_id        uuid not null references public.booking_products (id) on delete restrict,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  status            public.booking_status not null default 'pending',
  client_note       text check (client_note is null or length(client_note) <= 1000),
  photographer_note text check (photographer_note is null or length(photographer_note) <= 1000),
  expires_at        timestamptz, -- only for 'pending'
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (starts_at < ends_at),
  constraint bookings_no_overlap exclude using gist (
    photographer_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending', 'awaiting_payment', 'payment_reported', 'confirmed'))
);
create index on public.bookings (client_id, starts_at);
create index on public.bookings (photographer_id, starts_at);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- ---------- RLS ----------
alter table public.booking_products    enable row level security;
alter table public.availability_rules  enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.bookings            enable row level security;

-- Products: the photographer manages them; anyone can see the active ones
create policy "products: owner all" on public.booking_products
  for all using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and public.is_photographer());
create policy "products: read active" on public.booking_products
  for select using (active);

-- Availability: only the photographer. Clients see free slots via available_slots()
create policy "rules: owner all" on public.availability_rules
  for all using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and public.is_photographer());
create policy "blocks: owner all" on public.availability_blocks
  for all using (photographer_id = auth.uid())
  with check (photographer_id = auth.uid() and public.is_photographer());
revoke all on public.availability_rules, public.availability_blocks from anon;

-- Bookings: read own (client) or own calendar (photographer). Writes only via functions.
create policy "bookings: participants read" on public.bookings
  for select using (client_id = auth.uid() or photographer_id = auth.uid());
revoke insert, update, delete on public.bookings from anon, authenticated;

-- ---------- helpers ----------
create or replace function public.business_tz()
returns text language sql immutable set search_path = public as $$ select 'Europe/Madrid' $$;

-- Pending requests past their expiry stop holding the slot
create or replace function public.expire_pending_bookings(p_photographer uuid)
returns void language sql security definer set search_path = public as $$
  update bookings set status = 'expired'
   where photographer_id = p_photographer and status = 'pending' and expires_at <= now();
$$;
revoke execute on function public.expire_pending_bookings(uuid) from public, anon, authenticated;

-- Free slots of a product between two local dates (inclusive, max ~2 months)
create or replace function public.available_slots(p_product uuid, p_from date, p_to date)
returns table (starts_at timestamptz, ends_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
#variable_conflict use_column
declare
  prod public.booking_products;
  tz   text := public.business_tz();
begin
  select * into prod from public.booking_products p where p.id = p_product and p.active;
  if not found then return; end if;
  if p_to < p_from or p_to - p_from > 62 then
    raise exception 'invalid range' using errcode = '22023';
  end if;

  return query
  with days as (
    select d::date as day from generate_series(p_from, p_to, interval '1 day') d
  ),
  windows as (
    select dy.day,
           (dy.day + r.start_time) at time zone tz as w_start,
           (dy.day + r.end_time)   at time zone tz as w_end
      from days dy
      join public.availability_rules r
        on r.photographer_id = prod.photographer_id
       and r.weekday = extract(isodow from dy.day)
  ),
  candidates as (
    select (w.day::timestamp at time zone tz)       as s,
           ((w.day + 1)::timestamp at time zone tz) as e
      from (select distinct day from windows) w
     where prod.full_day
    union all
    select gs as s, gs + make_interval(mins => prod.duration_minutes) as e
      from windows w,
           generate_series(w.w_start,
                           w.w_end - make_interval(mins => prod.duration_minutes),
                           interval '30 minutes') gs
     where not prod.full_day
  )
  select distinct c.s, c.e
    from candidates c
   where c.s >= now() + interval '24 hours'
     and not exists (
       select 1 from public.bookings b
        where b.photographer_id = prod.photographer_id
          and b.status in ('pending', 'awaiting_payment', 'payment_reported', 'confirmed')
          and not (b.status = 'pending' and b.expires_at <= now())
          and tstzrange(b.starts_at, b.ends_at) && tstzrange(c.s, c.e)
     )
     and not exists (
       select 1 from public.availability_blocks k
        where k.photographer_id = prod.photographer_id
          and tstzrange(k.starts_at, k.ends_at) && tstzrange(c.s, c.e)
     )
   order by c.s;
end $$;

revoke execute on function public.available_slots(uuid, date, date) from public;
grant execute on function public.available_slots(uuid, date, date) to anon, authenticated;

-- Short human code for the booking (used as payment reference in R2)
create or replace function public.new_booking_code()
returns text language plpgsql volatile set search_path = public as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text := 'RV-';
begin
  for i in 1..5 loop
    code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return code;
end $$;

-- ---------- state changes ----------

-- Client requests a slot. Returns the new booking.
create or replace function public.request_booking(p_product uuid, p_starts_at timestamptz, p_note text)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  prod    public.booking_products;
  slot_end timestamptz;
  local_day date;
  pending_count int;
  result  public.bookings;
begin
  if auth.uid() is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  if not exists (select 1 from profiles where id = auth.uid() and role = 'client') then
    raise exception 'not_a_client' using errcode = '42501';
  end if;

  select * into prod from booking_products where id = p_product and active;
  if not found then
    raise exception 'product_not_found' using errcode = 'P0002';
  end if;

  perform public.expire_pending_bookings(prod.photographer_id);

  select count(*) into pending_count
    from bookings where client_id = auth.uid() and status = 'pending';
  if pending_count >= 3 then
    raise exception 'too_many_pending' using errcode = 'P0001';
  end if;

  local_day := (p_starts_at at time zone public.business_tz())::date;
  select s.ends_at into slot_end
    from public.available_slots(p_product, local_day, local_day) s
   where s.starts_at = p_starts_at;
  if slot_end is null then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  for attempt in 1..5 loop
    begin
      insert into bookings (code, photographer_id, client_id, product_id, starts_at, ends_at,
                            client_note, expires_at)
      values (public.new_booking_code(), prod.photographer_id, auth.uid(), prod.id,
              p_starts_at, slot_end, nullif(trim(p_note), ''), now() + interval '48 hours')
      returning * into result;
      return result;
    exception
      when unique_violation then
        if attempt = 5 then raise; end if; -- code collision: try another code
      when exclusion_violation then
        raise exception 'slot_unavailable' using errcode = 'P0001';
    end;
  end loop;
  return result;
end $$;

-- Photographer accepts or rejects a pending request.
-- Accepting a product without deposit confirms it directly.
create or replace function public.respond_booking(p_booking uuid, p_accept boolean, p_note text)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  b public.bookings;
  deposit int;
begin
  select * into b from bookings where id = p_booking and photographer_id = auth.uid() for update;
  if not found then raise exception 'booking_not_found' using errcode = 'P0002'; end if;
  if b.status <> 'pending' or b.expires_at <= now() then
    raise exception 'invalid_state' using errcode = 'P0001';
  end if;

  select deposit_cents into deposit from booking_products where id = b.product_id;

  update bookings
     set status = case
                    when not p_accept then 'rejected'
                    when coalesce(deposit, 0) = 0 then 'confirmed'
                    else 'awaiting_payment'
                  end::public.booking_status,
         photographer_note = nullif(trim(p_note), ''),
         expires_at = null
   where id = p_booking
  returning * into b;
  return b;
end $$;

-- Photographer confirms after checking the payment (manual, see R2)
create or replace function public.confirm_booking(p_booking uuid)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  b public.bookings;
begin
  update bookings set status = 'confirmed'
   where id = p_booking and photographer_id = auth.uid()
     and status in ('awaiting_payment', 'payment_reported')
  returning * into b;
  if not found then raise exception 'invalid_state' using errcode = 'P0001'; end if;
  return b;
end $$;

-- Client cancels their own active booking, or the photographer cancels one of theirs
create or replace function public.cancel_booking(p_booking uuid)
returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  b public.bookings;
begin
  update bookings set status = 'cancelled', expires_at = null
   where id = p_booking
     and (client_id = auth.uid() or photographer_id = auth.uid())
     and status in ('pending', 'awaiting_payment', 'payment_reported', 'confirmed')
  returning * into b;
  if not found then raise exception 'invalid_state' using errcode = 'P0001'; end if;
  return b;
end $$;

revoke execute on function public.request_booking(uuid, timestamptz, text) from public, anon;
revoke execute on function public.respond_booking(uuid, boolean, text) from public, anon;
revoke execute on function public.confirm_booking(uuid) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.request_booking(uuid, timestamptz, text) to authenticated;
grant execute on function public.respond_booking(uuid, boolean, text) to authenticated;
grant execute on function public.confirm_booking(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;
