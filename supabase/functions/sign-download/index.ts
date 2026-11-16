import { corsHeaders, json } from '../_shared/cors.ts'

// sign-download — F6
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Comprobar acceso y galleries.allow_download
  // 2. Generar URLs firmadas de originales (60 s) o ZIP
  // 3. Insertar en downloads (auditoría, adminClient)
  return json({ error: 'not implemented' }, 501)
})
