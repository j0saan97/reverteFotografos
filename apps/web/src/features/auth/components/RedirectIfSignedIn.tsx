import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/shared/components'
import { useSession } from '../hooks/useSession'
import { pendingInvite } from '../lib/pendingInvite'
import { homePathFor } from '../services/authService'

// Public auth pages: once the session and profile are ready, go to the
// page the user came from, a pending invitation, or the role's home.
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useSession()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (loading && session) return <FullPageSpinner />
  if (session && profile) {
    const invite = profile.role === 'client' ? pendingInvite.get() : null
    const target = from ?? (invite ? pendingInvite.path(invite) : homePathFor(profile.role))
    return <Navigate to={target} replace />
  }
  return <>{children}</>
}
