import { corsHeaders, json } from '../_shared/cors.ts'

// submit-selection — F5
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Validar con submitSelectionSchema
  // 2. Comprobar que la selección es del usuario y respeta max_selection
  // 3. Guardar client_note y submitted_at (adminClient)
  // 4. Notificar al fotógrafo (email)
  return json({ error: 'not implemented' }, 501)
})
