import type { Session } from '@supabase/supabase-js'
import { ROLES, type Role } from '@galeria/shared'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '@/shared/lib/supabase'
import { authService, type Profile } from '../services/authService'
import { AuthContext, type AuthState } from './authContext'

// Dev-only: VITE_DEV_PREVIEW_ROLE=photographer|client fakes a signed-in user so the
// protected screens can be previewed without Supabase. Stripped from prod builds.
function devPreviewRole(): Role | null {
  if (!import.meta.env.DEV) return null
  const role = import.meta.env.VITE_DEV_PREVIEW_ROLE as string | undefined
  return (ROLES as readonly string[]).includes(role ?? '') ? (role as Role) : null
}

function previewState(role: Role): AuthState {
  const profile: Profile = {
    id: 'preview',
    role,
    display_name: role === 'photographer' ? 'Fotógrafo (vista previa)' : 'Cliente (vista previa)',
    brand_name: null,
  }
  const session = { user: { id: 'preview', email: 'preview@local' } } as unknown as Session
  return { session, profile, loading: false, isPreview: true, refreshProfile: async () => {} }
}

async function loadProfile(session: Session): Promise<Profile | null> {
  let profile = await authService.getProfile(session.user.id)
  const code: unknown = session.user.user_metadata?.photographer_code
  if (profile?.role === 'client' && typeof code === 'string' && code) {
    try {
      await authService.claimPhotographer(code)
      profile = await authService.getProfile(session.user.id)
    } catch {
      // Wrong code: the account simply stays as client
    }
    await authService.clearPendingPhotographerCode()
  }
  return profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const preview = devPreviewRole()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(!preview)
  const userIdRef = useRef<string | null>(null)

  const sync = useCallback(async (next: Session | null) => {
    setSession(next)
    const nextUserId = next?.user.id ?? null
    // Token refreshes and metadata updates keep the same user: no profile reload
    if (nextUserId === userIdRef.current) return
    userIdRef.current = nextUserId
    if (!next) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setProfile(await loadProfile(next))
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (preview) return
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) void sync(data.session)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      // Defer: awaiting Supabase calls inside this callback can deadlock the client
      setTimeout(() => {
        if (active) void sync(next)
      }, 0)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [preview, sync])

  const refreshProfile = useCallback(async () => {
    if (session) setProfile(await authService.getProfile(session.user.id))
  }, [session])

  const value = useMemo<AuthState>(
    () =>
      preview
        ? previewState(preview)
        : { session, profile, loading, isPreview: false, refreshProfile },
    [preview, session, profile, loading, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
