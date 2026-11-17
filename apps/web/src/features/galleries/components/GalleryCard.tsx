import { Link } from 'react-router-dom'
import { ClockIcon, GalleryIcon, LockIcon } from '@/shared/components'
import { formatDate, isExpired } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'
import { GalleryStatusBadge } from './GalleryStatusBadge'

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  const expired = isExpired(gallery.expires_at)

  return (
    <Link
      to={`/galleries/${gallery.id}`}
      className="group block overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
    >
      {/* Cover photo arrives with uploads (F3) */}
      <div className="flex aspect-[4/3] items-center justify-center bg-stone-100 text-stone-300">
        <GalleryIcon className="size-10" />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 truncate font-medium text-stone-900 group-hover:underline">
            {gallery.title}
          </h2>
          <GalleryStatusBadge status={gallery.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
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
      </div>
    </Link>
  )
}
