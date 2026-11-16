import { corsHeaders, json } from '../_shared/cors.ts'

// process-photo — F3
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Recibir photoId (tras subida o webhook R2)
  // 2. status='processing'
  // 3. Generar thumb + preview con watermark (Cloudflare Images o image-worker)
  // 4. Actualizar keys, width, height y status='ready'
  return json({ error: 'not implemented' }, 501)
})
