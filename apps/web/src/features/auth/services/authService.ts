import type { Role } from '@galeria/shared'
import { callFunction } from '@/shared/lib/api'
import { toMessage } from '@/shared/lib/errors'
import { supabase } from '@/shared/lib/supabase'

export interface Profile {
  id: string
  role: Role
  display_name: string | null
  brand_name: string | null
}

// Explicit columns: never select('*') (see CLAUDE.md rule 4)
const PROFILE_COLUMNS = 'id, role, display_name, brand_name'

const redirect = (path: string) => `${window.location.origin}${path}`

export const authService = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  // The photographer code travels in user metadata; AuthProvider redeems it
  // through the claim-photographer Edge Function after the first sign-in.
  signUp: (email: string, password: string, displayName: string, photographerCode?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirect('/login'),
        data: { display_name: displayName, photographer_code: photographerCode || null },
      },
    }),

  signOut: () => supabase.auth.signOut(),

  requestPasswordReset: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect('/reset-password') }),

  updatePassword: (password: string) => supabase.auth.updateUser({ password }),

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    return data as Profile | null
  },

  claimPhotographer: (code: string) => callFunction<{ role: Role }>('claim-photographer', { code }),

  clearPendingPhotographerCode: () =>
    supabase.auth.updateUser({ data: { photographer_code: null } }),
}

export function homePathFor(role: Role): string {
  return role === 'photographer' ? '/dashboard' : '/my'
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email o contraseña incorrectos',
  user_already_exists: 'Ya existe una cuenta con ese email',
  email_exists: 'Ya existe una cuenta con ese email',
  email_not_confirmed: 'Confirma tu email antes de entrar',
  weak_password: 'La contraseña es demasiado débil',
  same_password: 'La nueva contraseña debe ser distinta de la actual',
  over_email_send_rate_limit: 'Demasiados intentos. Espera unos minutos',
  over_request_rate_limit: 'Demasiados intentos. Espera unos minutos',
}

export function authErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const { code, name } = err as { code?: string; name?: string }
    if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code]
    if (name === 'AuthRetryableFetchError') return 'No se puede conectar con el servidor'
  }
  return toMessage(err)
}
