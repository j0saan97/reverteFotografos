import { corsHeaders, json } from '../_shared/cors.ts'

// verify-pin — F4
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Validar con verifyPinSchema
  // 2. Comparar con pin_hash (adminClient) + rate limit de intentos
  // 3. Vincular gallery_access al usuario y marcar accepted_at
  return json({ error: 'not implemented' }, 501)
})
