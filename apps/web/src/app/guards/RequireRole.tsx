import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '@galeria/shared'
import { authService, homePathFor, useSession } from '@/features/auth'
import { Button, FullPageSpinner } from '@/shared/components'

// Must be nested inside RequireAuth
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { profile, loading } = useSession()

  if (loading) return <FullPageSpinner />
  if (!profile) return <ProfileError />
  if (profile.role !== role) return <Navigate to={homePathFor(profile.role)} replace />
  return <>{children}</>
}

function ProfileError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-stone-700">No se ha podido cargar tu perfil.</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
        <Button variant="ghost" onClick={() => void authService.signOut()}>
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
