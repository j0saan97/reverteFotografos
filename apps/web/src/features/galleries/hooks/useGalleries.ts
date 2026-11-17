import type { GalleryStatus } from '@galeria/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth'
import { galleryService, type Gallery, type GalleryUpdate } from '../services/galleryService'

export const galleryKeys = {
  all: ['galleries'] as const,
  detail: (id: string) => ['galleries', id] as const,
}

export function useGalleries() {
  return useQuery({ queryKey: galleryKeys.all, queryFn: galleryService.list })
}

export function useGallery(id: string) {
  return useQuery({ queryKey: galleryKeys.detail(id), queryFn: () => galleryService.get(id) })
}

// Keeps the list and the detail cache in sync after any write
function useSyncGallery() {
  const qc = useQueryClient()
  return (gallery: Gallery) => {
    qc.setQueryData(galleryKeys.detail(gallery.id), gallery)
    void qc.invalidateQueries({ queryKey: galleryKeys.all, exact: true })
  }
}

export function useCreateGallery() {
  const { session } = useSession()
  const sync = useSyncGallery()
  return useMutation({
    mutationFn: (title: string) => {
      if (!session) throw new Error('No hay sesión')
      return galleryService.create(session.user.id, title)
    },
    onSuccess: sync,
  })
}

export function useUpdateGallery(id: string) {
  const sync = useSyncGallery()
  return useMutation({
    mutationFn: (changes: GalleryUpdate) => galleryService.update(id, changes),
    onSuccess: sync,
  })
}

export function useSetGalleryStatus(id: string) {
  const sync = useSyncGallery()
  return useMutation({
    mutationFn: (status: GalleryStatus) => galleryService.setStatus(id, status),
    onSuccess: sync,
  })
}

export function useSetGalleryPin(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pin: string | null) => galleryService.setPin(id, pin),
    onSuccess: () => qc.invalidateQueries({ queryKey: galleryKeys.all }),
  })
}

export function useDeleteGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: galleryService.remove,
    onSuccess: (_data, id) => {
      qc.removeQueries({ queryKey: galleryKeys.detail(id) })
      void qc.invalidateQueries({ queryKey: galleryKeys.all, exact: true })
    },
  })
}
