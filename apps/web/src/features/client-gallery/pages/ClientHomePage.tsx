import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSession } from '@/features/auth'
import {
  ACTIVE_STATUSES,
  BOOKING_STATUS_LABEL,
  madridLongDate,
  madridTime,
  useMyBookings,
} from '@/features/bookings'
import { GalleryIcon, Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { clientGalleryService } from '../services/clientGalleryService'

const UPCOMING_LIMIT = 3

const dateFmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' })

export function ClientHomePage() {
  const { session, profile } = useSession()
  const userId = session?.user.id ?? ''
  const galleries = useQuery({
    queryKey: ['client', 'galleries'],
    queryFn: clientGalleryService.listMine,
  })
  const accepted = useQuery({
    queryKey: ['client', 'accepted-access', userId],
    queryFn: () => clientGalleryService.acceptedAccessCount(userId),
    enabled: userId !== '',
  })
  const bookings = useMyBookings()

  const visible = galleries.data ?? []
  // Accepted invitations whose gallery isn't visible yet (draft, archived or expired)
  const notYetVisible = Math.max(0, (accepted.data ?? 0) - visible.length)
  const upcoming = (bookings.data ?? [])
    .filter((b) => ACTIVE_STATUSES.includes(b.status) && new Date(b.ends_at) > new Date())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, UPCOMING_LIMIT)

  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-4xl">
          {profile?.display_name ? `Hola, ${profile.display_name}` : 'Tu espacio'}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Tus galerías y tus reservas, en un solo sitio.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-medium">Mis galerías</h2>
        {galleries.isPending ? (
          <Loading />
        ) : galleries.error ? (
          <ErrorText>{toMessage(galleries.error)}</ErrorText>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-neutral-900 px-6 py-12 text-center">
            <GalleryIcon className="mx-auto size-10 text-neutral-600" />
            <p className="mt-3 text-sm text-neutral-300">Todavía no tienes galerías disponibles.</p>
            <p className="mt-1 text-sm text-neutral-500">
              {notYetVisible > 0
                ? 'Tu fotógrafo está preparando tu galería: aparecerá aquí en cuanto la publique.'
                : 'Cuando tu fotógrafo te envíe una invitación, la verás aquí.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((g) => (
                <Link
                  key={g.id}
                  to={`/my/${g.slug}`}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-neutral-900 transition-colors hover:border-white/30"
                >
                  {/* Cover photo arrives with uploads (F3.6) */}
                  <div className="flex aspect-[4/3] items-center justify-center bg-neutral-800 text-neutral-600">
                    <GalleryIcon className="size-10" />
                  </div>
                  <div className="p-4">
                    <p className="font-medium group-hover:underline">{g.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {g.expires_at
                        ? `Disponible hasta el ${dateFmt.format(new Date(g.expires_at))}`
                        : `Desde el ${dateFmt.format(new Date(g.created_at))}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {notYetVisible > 0 && (
              <p className="mt-4 text-sm text-neutral-500">
                Tienes {notYetVisible === 1 ? 'otra galería' : `${notYetVisible} galerías más`} que
                tu fotógrafo aún no ha publicado.
              </p>
            )}
          </>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-lg font-medium">Próximas reservas</h2>
          <div className="flex gap-4 text-sm">
            <Link to="/my/reservas" className="text-neutral-400 hover:text-white">
              Ver todas
            </Link>
            <Link to="/my/reservar" className="text-white hover:underline">
              Reservar sesión
            </Link>
          </div>
        </div>
        {bookings.isPending ? (
          <Loading />
        ) : bookings.error ? (
          <ErrorText>{toMessage(bookings.error)}</ErrorText>
        ) : upcoming.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-neutral-900 px-6 py-8 text-center text-sm text-neutral-400">
            No tienes reservas próximas.
          </p>
        ) : (
          <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-neutral-900">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium first-letter:uppercase">
                    {madridLongDate(b.starts_at)}
                    {!b.full_day && ` · ${madridTime(b.starts_at)}`}
                  </p>
                  <p className="text-sm text-neutral-400">{b.product_name}</p>
                </div>
                <span className="text-sm text-neutral-300">{BOOKING_STATUS_LABEL[b.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex justify-center py-8 text-neutral-500">
      <Spinner />
    </div>
  )
}

function ErrorText({ children }: { children: string }) {
  return (
    <p role="alert" className="text-sm text-red-400">
      {children}
    </p>
  )
}
