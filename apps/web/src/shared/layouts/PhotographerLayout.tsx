import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Brand,
  BrushIcon,
  CalendarIcon,
  CloseIcon,
  GalleryIcon,
  HomeIcon,
  LogoutIcon,
  MailIcon,
  MenuIcon,
  UsersIcon,
} from '@/shared/components'

const NAV = [
  { to: '/dashboard', label: 'Panel', icon: HomeIcon },
  { to: '/galleries', label: 'Galerías', icon: GalleryIcon },
  { to: '/bookings', label: 'Reservas', icon: CalendarIcon },
  { to: '/contacts', label: 'Contactos', icon: MailIcon },
  { to: '/clients', label: 'Clientes', icon: UsersIcon },
  { to: '/settings/branding', label: 'Marca', icon: BrushIcon },
]

interface PhotographerLayoutProps {
  userName: string
  onSignOut: () => void
  banner?: ReactNode
  children: ReactNode
}

export function PhotographerLayout({
  userName,
  onSignOut,
  banner,
  children,
}: PhotographerLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <Brand className="text-xl text-stone-900" />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Principal">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-stone-200 p-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-stone-200 text-sm font-medium text-stone-700">
            {userName.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-stone-700">{userName}</span>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
        >
          <LogoutIcon />
          Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      {banner}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-stone-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile top bar + drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <Brand className="text-lg text-stone-900" />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-stone-950/40" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute top-4 right-3 rounded-lg p-2 text-stone-500 hover:bg-stone-100"
              aria-label="Cerrar menú"
            >
              <CloseIcon />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  )
}
