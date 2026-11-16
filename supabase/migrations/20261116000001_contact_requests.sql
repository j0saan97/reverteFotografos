-- =============================================================
-- Contact requests from the public website
-- Inserts only through the `contact` Edge Function (service role).
-- Photographers can read them and mark them as handled.
-- =============================================================

create table public.contact_requests (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 2 and 120),
  email        text not null check (char_length(email) <= 320),
  phone        text check (phone is null or char_length(phone) <= 30),
  session_type text not null check (session_type in ('wedding', 'portrait', 'event', 'family', 'other')),
  event_date   date,
  message      text not null check (char_length(message) between 10 and 3000),
  handled      boolean not null default false,
  created_at   timestamptz not null default now()
);
create index on public.contact_requests (created_at desc);

alter table public.contact_requests enable row level security;

create or replace function public.is_photographer()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'photographer');
$$;

-- Only `handled` can be changed from the app; nobody inserts/deletes from the client
revoke insert, update, delete on public.contact_requests from anon, authenticated;
grant update (handled) on public.contact_requests to authenticated;

create policy "contact: photographer read" on public.contact_requests
  for select using (public.is_photographer());
create policy "contact: photographer update" on public.contact_requests
  for update using (public.is_photographer()) with check (public.is_photographer());
