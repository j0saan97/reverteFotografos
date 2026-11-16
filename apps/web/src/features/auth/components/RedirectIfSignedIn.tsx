import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { FullPageSpinner } from '@/shared/components'
import { useSession } from '../hooks/useSession'
import { homePathFor } from '../services/authService'

// Public auth pages: once the session and profile are ready, go to the
// page the user came from or to their role's home.
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useSession()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  if (loading && session) return <FullPageSpinner />
  if (session && profile) return <Navigate to={from ?? homePathFor(profile.role)} replace />
  return <>{children}</>
}
