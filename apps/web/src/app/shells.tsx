import { Outlet, useNavigate } from 'react-router-dom'
import { authService, useSession } from '@/features/auth'
import { ClientLayout } from '@/shared/layouts/ClientLayout'
import { PhotographerLayout } from '@/shared/layouts/PhotographerLayout'

// Connects the presentational layouts (shared/) with the auth feature.

function useShellProps() {
  const { profile, session, isPreview } = useSession()
  const navigate = useNavigate()
  return {
    userName: profile?.display_name || session?.user.email || '',
    onSignOut: () => {
      if (isPreview) return
      void authService.signOut().then(() => navigate('/login', { replace: true }))
    },
    banner: isPreview ? <PreviewBanner /> : undefined,
  }
}

function PreviewBanner() {
  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-medium text-amber-950 shadow-lg">
      Vista previa · sin Supabase
    </div>
  )
}

export function PhotographerShell() {
  return (
    <PhotographerLayout {...useShellProps()}>
      <Outlet />
    </PhotographerLayout>
  )
}

export function ClientShell() {
  return (
    <ClientLayout {...useShellProps()}>
      <Outlet />
    </ClientLayout>
  )
}
