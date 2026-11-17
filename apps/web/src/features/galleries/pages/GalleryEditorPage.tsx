import type { GalleryStatus } from '@galeria/shared'
import type { ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, GalleryIcon, PageHeader, SettingsIcon } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { GalleryClientsCard } from '../components/GalleryClientsCard'
import { GalleryNotFound, PageSpinner } from '../components/GalleryPageStates'
import { GalleryStatusBadge } from '../components/GalleryStatusBadge'
import {
  useDeleteGallery,
  useGallery,
  useMoveToTrash,
  useRestoreGallery,
  useSetGalleryStatus,
} from '../hooks/useGalleries'
import { formatDate, isExpired } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'

const STATUS_ACTIONS: Record<
  GalleryStatus,
  { to: GalleryStatus; label: string; variant: 'primary' | 'secondary' }[]
> = {
  draft: [{ to: 'published', label: 'Publicar', variant: 'primary' }],
  published: [
    { to: 'draft', label: 'Pasar a borrador', variant: 'secondary' },
    { to: 'archived', label: 'Archivar', variant: 'secondary' },
  ],
  archived: [{ to: 'draft', label: 'Restaurar como borrador', variant: 'secondary' }],
}

const STATUS_HINT: Record<GalleryStatus, string> = {
  draft: 'Borrador: solo tú puedes verla.',
  published: 'Publicada: los clientes invitados pueden verla.',
  archived: 'Archivada: oculta para los clientes, se conserva para ti.',
}

export function GalleryEditorPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { data: gallery, isPending, error } = useGallery(id)
  const setStatus = useSetGalleryStatus(id)
  const trash = useMoveToTrash(id)
  const restore = useRestoreGallery(id)
  const remove = useDeleteGallery()

  if (isPending) return <PageSpinner />
  if (error) return <Alert tone="error">No se pudo cargar la galería: {toMessage(error)}</Alert>
  if (!gallery) return <GalleryNotFound />

  const inTrash = gallery.deleted_at !== null

  const onTrash = async () => {
    try {
      await trash.mutateAsync()
      navigate('/galleries', { replace: true })
    } catch {
      // Shown through trash.error
    }
  }

  const onDeleteForever = async () => {
    const ok = window.confirm(
      `¿Eliminar definitivamente "${gallery.title}"? Se borrarán también sus fotos, selecciones y mensajes. No se puede deshacer.`,
    )
    if (!ok) return
    try {
      await remove.mutateAsync(gallery.id)
      navigate('/galleries', { replace: true })
    } catch {
      // Shown through remove.error
    }
  }

  const mutationError = setStatus.error ?? trash.error ?? restore.error ?? remove.error

  return (
    <>
      <PageHeader
        back={{ to: '/galleries', label: 'Galerías' }}
        title={gallery.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <GalleryStatusBadge status={gallery.status} />
            {STATUS_HINT[gallery.status]}
          </span>
        }
        actions={
          <>
            <Link
              to={`/galleries/${gallery.id}/settings`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-stone-900 ring-1 ring-stone-300 ring-inset transition-colors hover:bg-stone-50"
            >
              <SettingsIcon className="size-4" />
              Ajustes
            </Link>
            {!inTrash &&
              STATUS_ACTIONS[gallery.status].map((a) => (
                <Button
                  key={a.to}
                  variant={a.variant}
                  loading={setStatus.isPending && setStatus.variables === a.to}
                  disabled={setStatus.isPending}
                  onClick={() => setStatus.mutate(a.to)}
                >
                  {a.label}
                </Button>
              ))}
          </>
        }
      />

      <div className="space-y-6">
        {mutationError && <Alert tone="error">{toMessage(mutationError)}</Alert>}
        {inTrash && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200 ring-inset">
            <span>
              Esta galería está en la papelera desde el {formatDate(gallery.deleted_at!)}. Tus
              clientes no pueden verla.
            </span>
            <Button
              variant="secondary"
              loading={restore.isPending}
              onClick={() => restore.mutate()}
            >
              Restaurar
            </Button>
          </div>
        )}
        {gallery.status === 'published' && isExpired(gallery.expires_at) && (
          <Alert tone="error">
            Esta galería está caducada: los clientes ya no pueden verla. Cambia la fecha en Ajustes
            para reactivarla.
          </Alert>
        )}

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 font-medium text-stone-900">Resumen</h2>
          <SettingsSummary gallery={gallery} />
        </section>

        <GalleryClientsCard gallery={gallery} />

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-4 font-medium text-stone-900">Fotos</h2>
          <div className="rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center">
            <GalleryIcon className="mx-auto size-10 text-stone-300" />
            <p className="mt-3 text-sm text-stone-500">
              Aún no hay fotos. La subida de fotos estará disponible próximamente.
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-red-200 bg-white p-6">
          <h2 className="font-medium text-stone-900">Eliminar galería</h2>
          <p className="mt-1 text-sm text-stone-500">
            {inTrash
              ? 'Borra la galería para siempre con todas sus fotos, selecciones y mensajes.'
              : 'La galería pasa a la papelera: tus clientes dejan de verla y puedes restaurarla cuando quieras.'}
          </p>
          <Button
            variant="secondary"
            className="mt-4 text-red-700 ring-red-200 hover:bg-red-50"
            loading={inTrash ? remove.isPending : trash.isPending}
            onClick={inTrash ? onDeleteForever : onTrash}
          >
            {inTrash ? 'Eliminar definitivamente' : 'Mover a la papelera'}
          </Button>
        </section>
      </div>
    </>
  )
}

function SettingsSummary({ gallery }: { gallery: Gallery }) {
  const rows: [string, ReactNode][] = [
    ['Cliente', gallery.client_name ?? 'Sin asignar'],
    ['Email del cliente', gallery.client_email ?? '—'],
    ['Teléfono del cliente', gallery.client_phone ?? '—'],
    ['Pago', gallery.paid ? 'Pagada' : 'Pendiente'],
    ['Enlace enviado', gallery.sent_at ? formatDate(gallery.sent_at) : 'No'],
    ['Selección de fotos', gallery.allow_selection ? 'Permitida' : 'Desactivada'],
    [
      'Máximo de fotos a elegir',
      gallery.allow_selection ? (gallery.max_selection ?? 'Sin límite') : '—',
    ],
    ['Descargas', gallery.allow_download ? 'Permitidas' : 'Desactivadas'],
    ['PIN de acceso', gallery.has_pin ? 'Activado' : 'Sin PIN'],
    ['Marca de agua', gallery.watermark_text || 'Sin marca de agua'],
    [
      'Caducidad',
      gallery.expires_at
        ? `${isExpired(gallery.expires_at) ? 'Caducó' : 'Caduca'} el ${formatDate(gallery.expires_at)}`
        : 'No caduca',
    ],
    ['Creada', formatDate(gallery.created_at)],
  ]
  return (
    <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-stone-100 pb-2">
          <dt className="text-stone-500">{label}</dt>
          <dd className="text-right font-medium text-stone-900">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
