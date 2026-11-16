import { corsHeaders, json } from '../_shared/cors.ts'

// sign-view — F4
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Comprobar has_gallery_access o dueño
  // 2. Firmar token HMAC con VIEW_TOKEN_SECRET (gallery_id, exp)
  // 3. Devolver { token, expiresAt }
  return json({ error: 'not implemented' }, 501)
})
