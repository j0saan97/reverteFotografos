import { corsHeaders, json } from '../_shared/cors.ts'

// invite-client — F4
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Validar con inviteClientSchema
  // 2. Comprobar dueño de la galería
  // 3. Upsert gallery_access(email)
  // 4. Enviar email con link (Resend)
  return json({ error: 'not implemented' }, 501)
})
