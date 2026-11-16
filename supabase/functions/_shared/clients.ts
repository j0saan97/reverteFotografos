import { createClient } from 'npm:@supabase/supabase-js@2'

// Cliente con los permisos del usuario que llama (respeta RLS)
export function userClient(req: Request) {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
}

// Cliente admin (salta RLS). Usar solo tras comprobar permisos.
export function adminClient() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
}
