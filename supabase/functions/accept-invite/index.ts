import { acceptInviteSchema } from '@galeria/shared'
import { adminClient, userClient } from '../_shared/clients.ts'
import { corsHeaders, json } from '../_shared/cors.ts'
import { sha256Hex } from '../_shared/tokens.ts'

// accept-invite
// A signed-in client redeems an invitation link. The invite is bound to the
// email it was sent to; on success the token is burned (single use).
// Error codes are stable strings the frontend maps to Spanish messages.

// Shows only the first letter of the local part: a***@gmail.com
const maskEmail = (email: string) => email.replace(/^(.)[^@]*/, '$1***')

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const { data: auth, error: authError } = await userClient(req).auth.getUser()
  if (authError || !auth.user?.email) return json({ error: 'unauthorized' }, 401)

  const parsed = acceptInviteSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'invalid_token' }, 400)

  const admin = adminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle()
  if (profile?.role !== 'client') return json({ error: 'not_a_client' }, 403)

  const { data: invite } = await admin
    .from('gallery_access')
    .select('gallery_id, email, token_expires_at')
    .eq('token_hash', await sha256Hex(parsed.data.token))
    .maybeSingle()
  if (!invite) return json({ error: 'invalid_token' }, 404)

  if (invite.token_expires_at && new Date(invite.token_expires_at) <= new Date()) {
    return json({ error: 'expired' }, 410)
  }
  if (invite.email !== auth.user.email.toLowerCase()) {
    return json({ error: 'wrong_email', invitedEmail: maskEmail(invite.email) }, 403)
  }

  const { error } = await admin
    .from('gallery_access')
    .update({
      client_id: auth.user.id,
      accepted_at: new Date().toISOString(),
      token_hash: null,
      token_expires_at: null,
    })
    .eq('gallery_id', invite.gallery_id)
    .eq('email', invite.email)
  if (error) return json({ error: 'could_not_accept' }, 500)

  const { data: gallery } = await admin
    .from('galleries')
    .select('slug, title, status')
    .eq('id', invite.gallery_id)
    .single()

  return json({
    slug: gallery?.slug,
    title: gallery?.title,
    published: gallery?.status === 'published',
  })
})
