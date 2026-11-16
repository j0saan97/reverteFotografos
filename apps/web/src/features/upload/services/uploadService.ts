import { callFunction } from '@/shared/lib/api'

// Flujo: sign-upload -> PUT directo a R2 -> process-photo
// TODO (F3): PUT con XMLHttpRequest para tener progreso real
export async function uploadPhoto(
  galleryId: string,
  file: File,
  _onProgress?: (p: number) => void,
) {
  const { photoId } = await callFunction<{ url: string; photoId: string }>('sign-upload', {
    galleryId,
    filename: file.name,
    mime: file.type,
    size: file.size,
  })
  return photoId
}
