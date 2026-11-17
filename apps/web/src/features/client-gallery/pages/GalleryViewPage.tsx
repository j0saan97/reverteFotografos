import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeftIcon, GalleryIcon, Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { clientGalleryService } from '../services/clientGalleryService'

// Minimal gallery page until the protected viewer lands (F3/F4) and selection (F5)
export function GalleryViewPage() {
  const { slug = '' } = useParams()
  const gallery = useQuery({
    queryKey: ['client', 'gallery', slug],
    queryFn: () => clientGalleryService.getBySlug(slug),
  })

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/my"
        className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white"
      >
        <ChevronLeftIcon className="size-4" />
        Mis galerías
      </Link>

      {gallery.isPending ? (
        <div className="flex justify-center py-16 text-neutral-500">
          <Spinner className="size-8" />
        </div>
      ) : gallery.error ? (
        <p role="alert" className="text-sm text-red-400">
          {toMessage(gallery.error)}
        </p>
      ) : !gallery.data ? (
        <div className="py-16 text-center">
          <h1 className="font-display text-3xl">Galería no disponible</h1>
          <p className="mt-2 text-sm text-neutral-400">
            No existe, ha caducado o tu fotógrafo la ha retirado.
          </p>
        </div>
      ) : (
        <>
          <h1 className="font-display text-4xl">{gallery.data.title}</h1>
          <div className="mt-8 rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
            <GalleryIcon className="mx-auto size-10 text-neutral-600" />
            <p className="mt-3 text-sm text-neutral-300">Tus fotos estarán aquí muy pronto.</p>
            <p className="mt-1 text-sm text-neutral-500">
              Te avisaremos en cuanto tu fotógrafo las suba.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
