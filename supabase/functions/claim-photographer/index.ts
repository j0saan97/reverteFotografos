import { claimPhotographerSchema } from '@galeria/shared'
import { adminClient, userClient } from '../_shared/clients.ts'
import { corsHeaders, json } from '../_shared/cors.ts'

// claim-photographer — F1
// Promotes the calling user to role='photographer' if they provide the secret
// invite code (env PHOTOGRAPHER_INVITE_CODE). Clients can never set their own role:
// profiles.role has no UPDATE grant, so this must go through the service role.

function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const x = enc.encode(a)
  const y = enc.encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const expected = Deno.env.get('PHOTOGRAPHER_INVITE_CODE')
  if (!expected) return json({ error: 'photographer signup disabled' }, 503)

  const { data: auth, error: authError } = await userClient(req).auth.getUser()
  if (authError || !auth.user) return json({ error: 'unauthorized' }, 401)

  const parsed = claimPhotographerSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'invalid body' }, 400)

  if (!safeEqual(parsed.data.code, expected)) return json({ error: 'invalid code' }, 403)

  const { error } = await adminClient()
    .from('profiles')
    .update({ role: 'photographer' })
    .eq('id', auth.user.id)
  if (error) return json({ error: 'could not update role' }, 500)

  return json({ role: 'photographer' })
})
