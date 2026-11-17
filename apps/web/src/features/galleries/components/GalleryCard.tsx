import { Link } from 'react-router-dom'
import { ClockIcon, GalleryIcon, LockIcon } from '@/shared/components'
import { formatDate, isExpired } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'
import { GalleryActions } from './GalleryActions'
import { GalleryStatusBadge } from './GalleryStatusBadge'

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  const href = `/galleries/${gallery.id}`

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
        {/* Cover photo arrives with uploads (F3.6) */}
        <div className="flex aspect-[4/3] items-center justify-center bg-stone-100 text-stone-300">
          <GalleryIcon className="size-10" />
        </div>
      </Link>

      <div className="space-y-2 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <GalleryTitle gallery={gallery} />
          <GalleryStatusBadge status={gallery.status} />
        </div>
        <GalleryMeta gallery={gallery} />
      </div>

      <div className="mx-4 mt-3 border-t border-stone-100 pt-3 pb-4">
        <GalleryActions gallery={gallery} />
      </div>
    </article>
  )
}

// Compact row for the list view
export function GalleryRow({ gallery }: { gallery: Gallery }) {
  return (
    <li className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0 flex-1">
          <GalleryTitle gallery={gallery} />
          <GalleryMeta gallery={gallery} />
        </div>
        <GalleryStatusBadge status={gallery.status} />
      </div>
      <div className="lg:w-[25rem] lg:shrink-0">
        <GalleryActions gallery={gallery} />
      </div>
    </li>
  )
}

function GalleryTitle({ gallery }: { gallery: Gallery }) {
  return (
    <div className="min-w-0">
      <h2 className="truncate font-medium text-stone-900">
        <Link to={`/galleries/${gallery.id}`} className="hover:underline">
          {gallery.title}
        </Link>
      </h2>
      <p className="truncate text-sm text-stone-500">
        {gallery.client_name ?? 'Sin cliente asignado'}
      </p>
    </div>
  )
}

function GalleryMeta({ gallery }: { gallery: Gallery }) {
  const expired = isExpired(gallery.expires_at)
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
      <span>Creada el {formatDate(gallery.created_at)}</span>
      {gallery.has_pin && (
        <span className="inline-flex items-center gap-1">
          <LockIcon className="size-3.5" /> PIN
        </span>
      )}
      {gallery.expires_at && (
        <span
          className={`inline-flex items-center gap-1 ${expired ? 'font-medium text-red-600' : ''}`}
        >
          <ClockIcon className="size-3.5" />
          {expired ? 'Caducada' : `Caduca el ${formatDate(gallery.expires_at)}`}
        </span>
      )}
    </div>
  )
}
