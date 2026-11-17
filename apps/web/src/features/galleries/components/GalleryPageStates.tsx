import { Link } from 'react-router-dom'
import { Spinner } from '@/shared/components'

export function PageSpinner() {
  return (
    <div className="flex justify-center py-16 text-stone-400">
      <Spinner className="size-8" />
    </div>
  )
}

export function GalleryNotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-3xl text-stone-900">Galería no encontrada</h1>
      <p className="mt-2 text-sm text-stone-500">No existe o no tienes permiso para verla.</p>
      <Link
        to="/galleries"
        className="mt-6 inline-block text-sm font-medium text-stone-900 hover:underline"
      >
        Volver a galerías
      </Link>
    </div>
  )
}
