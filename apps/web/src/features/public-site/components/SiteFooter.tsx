import { Link } from 'react-router-dom'
import { Brand, InstagramIcon, MailIcon, WhatsAppIcon } from '@/shared/components'
import { SITE } from '../content'
import { whatsappUrl } from '../services/contactService'

export function SiteFooter() {
  return (
    <footer className="bg-stone-950 text-stone-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Brand className="text-white" />
          <p className="mt-2 text-sm">{SITE.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`https://instagram.com/${SITE.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="rounded-full p-2.5 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            <InstagramIcon />
          </a>
          <a
            href={whatsappUrl(SITE.whatsapp, SITE.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="rounded-full p-2.5 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            <WhatsAppIcon />
          </a>
          <a
            href={`mailto:${SITE.email}`}
            aria-label="Email"
            className="rounded-full p-2.5 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
          >
            <MailIcon />
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Reverte Fotógrafos. Todos los derechos reservados.</p>
          <Link to="/login" className="hover:text-white">
            Acceso clientes
          </Link>
        </div>
      </div>
    </footer>
  )
}
