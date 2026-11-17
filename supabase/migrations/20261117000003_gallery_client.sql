-- =============================================================
-- F2.7 / F2.9 / F2.10: each gallery belongs to one client
-- - client_name (required for new galleries in the UI), client_email, client_phone
-- - paid: toggled by the photographer
-- - sent_at: last time the link was sent to the client (email or WhatsApp)
-- =============================================================

alter table public.galleries
  add column client_name  text check (client_name is null or length(client_name) between 1 and 120),
  add column client_email text check (client_email is null or client_email = lower(client_email)),
  add column client_phone text check (client_phone is null or client_phone ~ '^\+?[0-9 ]{6,20}$'),
  add column paid         boolean not null default false,
  add column sent_at      timestamptz;

grant select (client_name, client_email, client_phone, paid, sent_at)
  on public.galleries to authenticated;
grant insert (client_name, client_email, client_phone, paid)
  on public.galleries to authenticated;
grant update (client_name, client_email, client_phone, paid, sent_at)
  on public.galleries to authenticated;
