import type { GalleryStatus } from '@galeria/shared'
import { STATUS_LABEL } from '../lib/galleryFormat'

const TONE: Record<GalleryStatus, string> = {
  draft: 'bg-amber-50 text-amber-800 ring-amber-200',
  published: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  archived: 'bg-stone-100 text-stone-600 ring-stone-200',
}

export function GalleryStatusBadge({ status }: { status: GalleryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
