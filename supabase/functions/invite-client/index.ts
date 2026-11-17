import { INVITE_TTL_DAYS, inviteClientSchema } from '@galeria/shared'
import { adminClient, userClient } from '../_shared/clients.ts'
import { corsHeaders, json } from '../_shared/cors.ts'
import { escapeHtml, sendEmail } from '../_shared/email.ts'
import { randomToken, sha256Hex } from '../_shared/tokens.ts'

// invite-client
// The gallery owner invites a client by email. Creates (or renews) a single-use
// token for (gallery, email), stores only its hash and returns the link so the
// photographer can share it. If Resend is configured the link is also emailed.

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const user = userClient(req)
  const { data: auth, error: authError } = await user.auth.getUser()
  if (authError || !auth.user) return json({ error: 'unauthorized' }, 401)

  const parsed = inviteClientSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'invalid body' }, 400)
  const { galleryId, email } = parsed.data

  // RLS-aware read: only returns the gallery if the caller owns it
  const { data: gallery } = await user
    .from('galleries')
    .select('id, title, photographer_id')
    .eq('id', galleryId)
    .eq('photographer_id', auth.user.id)
    .maybeSingle()
  if (!gallery) return json({ error: 'gallery not found' }, 404)

  const admin = adminClient()
  const { data: existing } = await admin
    .from('gallery_access')
    .select('accepted_at')
    .eq('gallery_id', galleryId)
    .eq('email', email)
    .maybeSingle()
  if (existing?.accepted_at) return json({ status: 'already_member' })

  const token = randomToken()
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000).toISOString()
  const { error } = await admin.from('gallery_access').upsert(
    {
      gallery_id: galleryId,
      email,
      token_hash: await sha256Hex(token),
      token_expires_at: expiresAt,
      invited_at: new Date().toISOString(),
    },
    { onConflict: 'gallery_id,email' },
  )
  if (error) return json({ error: 'could not create invite' }, 500)

  const appUrl = Deno.env.get('APP_URL') ?? req.headers.get('origin') ?? ''
  const link = `${appUrl}/invite/${token}`

  const { data: profile } = await admin
    .from('profiles')
    .select('display_name, brand_name')
    .eq('id', auth.user.id)
    .maybeSingle()
  const from = profile?.brand_name || profile?.display_name || 'Tu fotógrafo'

  const emailed = await sendEmail({
    to: email,
    replyTo: auth.user.email,
    subject: `${from} te ha invitado a ver «${gallery.title}»`,
    html: `<p>Hola,</p>
<p><strong>${escapeHtml(from)}</strong> te ha invitado a ver la galería
<strong>${escapeHtml(gallery.title)}</strong>.</p>
<p><a href="${link}">Abrir la galería</a></p>
<p>Tendrás que iniciar sesión o crear una cuenta con este email (${escapeHtml(email)}).
El enlace caduca en ${INVITE_TTL_DAYS} días.</p>`,
  })

  return json({ status: 'invited', link, emailed, expiresAt })
})
