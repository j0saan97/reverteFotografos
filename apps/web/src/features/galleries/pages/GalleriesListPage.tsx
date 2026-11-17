import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Alert,
  Button,
  GalleryIcon,
  GridIcon,
  ListIcon,
  PageHeader,
  PlusIcon,
  SearchIcon,
  Spinner,
  controlClass,
} from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { GalleryCard, GalleryRow } from '../components/GalleryCard'
import { useEmptyTrash, useGalleries, useSubmittedSelections } from '../hooks/useGalleries'
import {
  QUICK_FILTERS,
  TABS,
  matchesQuick,
  matchesSearch,
  tabOf,
  type GalleryTab,
  type QuickFilter,
} from '../lib/galleryFilters'

type View = 'grid' | 'list'
const VIEW_KEY = 'galleriesView'

function readView(): View {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid'
  } catch {
    return 'grid'
  }
}

const newGalleryLinkClass =
  'inline-flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800'

const pill = (active: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm transition-colors ${
    active
      ? 'bg-stone-900 text-white'
      : 'bg-white text-stone-600 ring-1 ring-stone-200 ring-inset hover:bg-stone-100'
  }`

export function GalleriesListPage() {
  const { data: galleries, isPending, error } = useGalleries()
  const submitted = useSubmittedSelections()
  const emptyTrash = useEmptyTrash()
  const [tab, setTab] = useState<GalleryTab>('active')
  const [quick, setQuick] = useState<QuickFilter>('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState<View>(readView)

  const changeView = (v: View) => {
    setView(v)
    try {
      localStorage.setItem(VIEW_KEY, v)
    } catch {
      // Only a convenience
    }
  }

  const ctx = useMemo(
    () => ({ submittedSelections: submitted.data ?? new Set<string>() }),
    [submitted.data],
  )
  const all = galleries ?? []
  const inTab = all.filter((g) => tabOf(g) === tab && matchesSearch(g, search))
  const visible = tab === 'trash' ? inTab : inTab.filter((g) => matchesQuick(g, quick, ctx))
  const tabCount = (t: GalleryTab) => all.filter((g) => tabOf(g) === t).length
  const quickCount = (q: QuickFilter) => inTab.filter((g) => matchesQuick(g, q, ctx)).length

  const onEmptyTrash = () => {
    const ok = window.confirm(
      `¿Vaciar la papelera? Se eliminarán definitivamente ${tabCount('trash')} galerías con sus fotos, selecciones y mensajes. No se puede deshacer.`,
    )
    if (ok) emptyTrash.mutate()
  }

  return (
    <>
      <PageHeader
        title="Galerías"
        description="Crea galerías, configúralas y envíaselas a tus clientes."
        actions={
          <Link to="/galleries/new" className={newGalleryLinkClass}>
            <PlusIcon className="size-4" />
            Nueva galería
          </Link>
        }
      />

      {error && <Alert tone="error">No se pudieron cargar las galerías: {toMessage(error)}</Alert>}
      {emptyTrash.error && (
        <Alert tone="error">No se pudo vaciar la papelera: {toMessage(emptyTrash.error)}</Alert>
      )}

      {isPending && (
        <div className="flex justify-center py-16 text-stone-400">
          <Spinner className="size-8" />
        </div>
      )}

      {galleries && galleries.length === 0 && <EmptyState />}

      {galleries && galleries.length > 0 && (
        <>
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Galerías"
            className="mb-5 flex gap-6 border-b border-stone-200"
          >
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                  tab === t.value
                    ? 'border-stone-900 text-stone-900'
                    : 'border-transparent text-stone-500 hover:text-stone-900'
                }`}
              >
                {t.label} <span className="opacity-60">{tabCount(t.value)}</span>
              </button>
            ))}
          </div>

          {/* Search, view and trash actions */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-60 flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título o cliente…"
                aria-label="Buscar galerías"
                className={`${controlClass()} pl-9`}
              />
            </div>
            <div
              className="flex rounded-lg bg-white p-0.5 ring-1 ring-stone-200 ring-inset"
              role="group"
              aria-label="Vista"
            >
              {(
                [
                  ['grid', 'Cuadrícula', GridIcon],
                  ['list', 'Lista', ListIcon],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  aria-label={label}
                  title={label}
                  aria-pressed={view === v}
                  onClick={() => changeView(v)}
                  className={`rounded-md p-2 transition-colors ${
                    view === v ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
            {tab === 'trash' && tabCount('trash') > 0 && (
              <Button
                variant="secondary"
                className="text-red-700 ring-red-200 hover:bg-red-50"
                loading={emptyTrash.isPending}
                onClick={onEmptyTrash}
              >
                Vaciar papelera
              </Button>
            )}
          </div>

          {/* Quick filters (not in the trash) */}
          {tab !== 'trash' && (
            <div aria-label="Filtros rápidos" className="mb-6 flex flex-wrap gap-2">
              {QUICK_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={quick === f.value}
                  onClick={() => setQuick(f.value)}
                  className={pill(quick === f.value)}
                >
                  {f.label} <span className="opacity-60">{quickCount(f.value)}</span>
                </button>
              ))}
            </div>
          )}

          {tab === 'trash' && (
            <p className="mb-6 text-sm text-stone-500">
              Las galerías de la papelera no son visibles para los clientes. Puedes restaurarlas o
              eliminarlas definitivamente.
            </p>
          )}

          {visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-stone-500">
              {search ? 'Ninguna galería coincide con la búsqueda.' : 'No hay galerías aquí.'}
            </p>
          ) : view === 'grid' ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((g) => (
                <GalleryCard key={g.id} gallery={g} />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
              {visible.map((g) => (
                <GalleryRow key={g.id} gallery={g} />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <GalleryIcon className="mx-auto size-10 text-stone-300" />
      <h2 className="mt-4 font-medium text-stone-900">Aún no tienes galerías</h2>
      <p className="mt-1 text-sm text-stone-500">Crea la primera y envíasela a tu cliente.</p>
      <Link to="/galleries/new" className={`${newGalleryLinkClass} mt-6`}>
        <PlusIcon className="size-4" />
        Crear galería
      </Link>
    </div>
  )
}
