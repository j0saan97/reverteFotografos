import { GALLERY_STATUS, type GalleryStatus } from '@galeria/shared'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, GalleryIcon, PageHeader, PlusIcon, Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { GalleryCard } from '../components/GalleryCard'
import { useGalleries } from '../hooks/useGalleries'
import { STATUS_LABEL } from '../lib/galleryFormat'

type Filter = 'all' | GalleryStatus

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...GALLERY_STATUS.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
]

const newGalleryLinkClass =
  'inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800'

export function GalleriesListPage() {
  const { data: galleries, isPending, error } = useGalleries()
  const [filter, setFilter] = useState<Filter>('all')

  const visible = galleries?.filter((g) => filter === 'all' || g.status === filter) ?? []
  const countFor = (f: Filter) =>
    galleries?.filter((g) => f === 'all' || g.status === f).length ?? 0

  return (
    <>
      <PageHeader
        title="Galerías"
        description="Crea galerías, configúralas y publícalas para tus clientes."
        actions={
          <Link to="/galleries/new" className={newGalleryLinkClass}>
            <PlusIcon className="size-4" />
            Nueva galería
          </Link>
        }
      />

      {error && <Alert tone="error">No se pudieron cargar las galerías: {toMessage(error)}</Alert>}

      {isPending && (
        <div className="flex justify-center py-16 text-stone-400">
          <Spinner className="size-8" />
        </div>
      )}

      {galleries && galleries.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <GalleryIcon className="mx-auto size-10 text-stone-300" />
          <h2 className="mt-4 font-medium text-stone-900">Aún no tienes galerías</h2>
          <p className="mt-1 text-sm text-stone-500">
            Crea la primera y después configura sus opciones.
          </p>
          <Link to="/galleries/new" className={`${newGalleryLinkClass} mt-6`}>
            <PlusIcon className="size-4" />
            Crear galería
          </Link>
        </div>
      )}

      {galleries && galleries.length > 0 && (
        <>
          <div role="tablist" aria-label="Filtrar por estado" className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  filter === f.value
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 ring-1 ring-stone-200 ring-inset hover:bg-stone-100'
                }`}
              >
                {f.label} <span className="opacity-60">{countFor(f.value)}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone-500">
              No hay galerías en este estado.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((g) => (
                <GalleryCard key={g.id} gallery={g} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
