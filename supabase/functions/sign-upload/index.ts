import { corsHeaders, json } from '../_shared/cors.ts'

// sign-upload — F3
Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  // 1. Validar body con signUploadSchema
  // 2. Comprobar que auth.uid() es dueño de la galería (userClient + RLS)
  // 3. Insertar photos(status='uploading') y generar original_key
  // 4. Devolver { url: presignPut(...), photoId }
  return json({ error: 'not implemented' }, 501)
})
