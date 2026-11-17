import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { GalleryCard, useGalleries } from '@/features/galleries'
import { useSession } from '@/features/auth'
import { Alert, PageHeader, PlusIcon } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { dashboardService } from '../services/dashboardService'

const RECENT_LIMIT = 3

export function DashboardPage() {
  const { session, profile } = useSession()
  const userId = session?.user.id ?? ''
  const galleries = useGalleries()
  const counts = useQuery({
    queryKey: ['dashboard', 'counts', userId],
    queryFn: () => dashboardService.counts(userId),
    enabled: userId !== '',
  })

  const list = (galleries.data ?? []).filter((g) => g.deleted_at === null)
  const published = list.filter((g) => g.status === 'published').length
  const drafts = list.filter((g) => g.status === 'draft').length
  const error = galleries.error ?? counts.error

  const stats = [
    { label: 'Galerías publicadas', value: galleries.data ? published : null },
    { label: 'Borradores', value: galleries.data ? drafts : null },
    { label: 'Selecciones recibidas', value: counts.data?.submittedSelections ?? null },
    { label: 'Mensajes sin leer', value: counts.data?.unreadMessages ?? null },
  ]

  return (
    <>
      <PageHeader
        title={profile?.display_name ? `Hola, ${profile.display_name}` : 'Panel'}
        description="Resumen de tus galerías y de la actividad de tus clientes."
        actions={
          <Link
            to="/galleries/new"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
          >
            <PlusIcon className="size-4" />
            Nueva galería
          </Link>
        }
      />

      {error && <Alert tone="error">No se pudo cargar el resumen: {toMessage(error)}</Alert>}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-stone-200 bg-white p-5">
            <dt className="text-sm text-stone-500">{s.label}</dt>
            <dd className="mt-2 font-display text-4xl font-medium text-stone-900">
              {s.value ?? <span className="text-stone-300">—</span>}
            </dd>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-medium text-stone-900">Galerías recientes</h2>
          {list.length > 0 && (
            <Link to="/galleries" className="text-sm text-stone-500 hover:text-stone-900">
              Ver todas
            </Link>
          )}
        </div>
        {galleries.data && list.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center text-sm text-stone-500">
            Aún no tienes galerías.{' '}
            <Link to="/galleries/new" className="font-medium text-stone-900 hover:underline">
              Crea la primera
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.slice(0, RECENT_LIMIT).map((g) => (
              <GalleryCard key={g.id} gallery={g} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
