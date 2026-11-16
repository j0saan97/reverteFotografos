import { createClient } from '@supabase/supabase-js'

// Solo anon key. La service role key NUNCA va al frontend.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
