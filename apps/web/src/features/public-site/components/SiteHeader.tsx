import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand, CloseIcon, MenuIcon } from '@/shared/components'

const LINKS = [
  { href: '#portfolio', label: 'Portfolio' },
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#contacto', label: 'Contacto' },
]

// Transparent over the hero, solid once the page scrolls
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const solid = scrolled || open

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${
        solid ? 'bg-white/95 text-stone-900 shadow-sm backdrop-blur' : 'bg-transparent text-white'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8 lg:h-20">
        <a href="#inicio" onClick={() => setOpen(false)}>
          <Brand className="text-xl sm:text-2xl" />
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Secciones">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm tracking-wide opacity-90 transition-opacity hover:opacity-100"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/my/reservar"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              solid
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-white text-stone-900 hover:bg-stone-100'
            }`}
          >
            Reservar
          </Link>
          <Link
            to="/login"
            className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors ${
              solid
                ? 'ring-stone-900 hover:bg-stone-900 hover:text-white'
                : 'ring-white/70 hover:bg-white hover:text-stone-900'
            }`}
          >
            Acceso clientes
          </Link>
        </nav>

        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-stone-200 bg-white px-4 pb-6 md:hidden"
          aria-label="Secciones"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-stone-100 py-3.5 text-base"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/my/reservar"
            className="mt-5 block rounded-full bg-stone-900 py-3 text-center text-sm font-medium text-white"
          >
            Reservar
          </Link>
          <Link
            to="/login"
            className="mt-3 block rounded-full py-3 text-center text-sm font-medium ring-1 ring-stone-900"
          >
            Acceso clientes
          </Link>
        </nav>
      )}
    </header>
  )
}
