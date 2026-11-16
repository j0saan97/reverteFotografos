import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'
import type { Profile } from '../services/authService'

export interface AuthState {
  session: Session | null
  profile: Profile | null
  /** True while the session or its profile is being resolved */
  loading: boolean
  /** Dev-only fake session (VITE_DEV_PREVIEW_ROLE) */
  isPreview: boolean
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
