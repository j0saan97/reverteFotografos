import { supabase } from '@/shared/lib/supabase'

export const authService = {
  signIn: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  resetPassword: (email: string) => supabase.auth.resetPasswordForEmail(email),
}
