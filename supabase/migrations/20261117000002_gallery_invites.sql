-- =============================================================
-- Gallery invitations (/invite/:token)
-- - Single-use token per (gallery, email). Only its SHA-256 hash is stored.
-- - Created by invite-client and redeemed by accept-invite (service role):
--   clients and photographers can't insert/update rows directly.
-- - The photographer can still revoke access (DELETE, policy "access: owner all").
-- =============================================================

alter table public.gallery_access
  add column token_hash       text unique,
  add column token_expires_at timestamptz;

-- Emails are compared case-insensitively: store them lowercased
update public.gallery_access set email = lower(email);
alter table public.gallery_access
  add constraint gallery_access_email_lower check (email = lower(email));

revoke select, insert, update on public.gallery_access from anon, authenticated;
grant select (gallery_id, email, client_id, invited_at, accepted_at, token_expires_at)
  on public.gallery_access to authenticated;
