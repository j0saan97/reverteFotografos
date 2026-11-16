import { corsHeaders, json } from '../_shared/cors.ts'

// reopen-selection — F5
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Comprobar dueño de la galería
  // 2. submitted_at = null, reopened_at = now() (adminClient)
  // 3. Avisar al cliente
  return json({ error: 'not implemented' }, 501)
})
