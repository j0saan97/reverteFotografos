import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Brand, LogoutIcon } from '@/shared/components'

interface ClientLayoutProps {
  userName: string
  onSignOut: () => void
  banner?: ReactNode
  children: ReactNode
}

// Minimal dark layout so photos stand out. TODO (F7): photographer branding
export function ClientLayout({ userName, onSignOut, banner, children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {banner}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <Link to="/my">
            <Brand className="text-xl text-white" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/my/reservar"
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10"
            >
              Reservar sesión
            </Link>
            <span className="hidden text-sm text-neutral-400 sm:inline">{userName}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  )
}
