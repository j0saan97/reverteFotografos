import type { GalleryStatus } from '@galeria/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth'
import {
  galleryService,
  type Gallery,
  type GalleryClient,
  type GalleryUpdate,
} from '../services/galleryService'

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
    mutationFn: ({ title, client }: { title: string; client: GalleryClient }) => {
      if (!session) throw new Error('No hay sesión')
      return galleryService.create(session.user.id, title, client)
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

export function useMoveToTrash(id: string) {
  const sync = useSyncGallery()
  return useMutation({ mutationFn: () => galleryService.moveToTrash(id), onSuccess: sync })
}

export function useRestoreGallery(id: string) {
  const sync = useSyncGallery()
  return useMutation({ mutationFn: () => galleryService.restore(id), onSuccess: sync })
}

// Permanent delete
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

export function useEmptyTrash() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: galleryService.emptyTrash,
    onSuccess: () => qc.invalidateQueries({ queryKey: galleryKeys.all }),
  })
}

export function useSubmittedSelections() {
  return useQuery({
    queryKey: ['galleries', 'submitted-selections'],
    queryFn: galleryService.submittedSelectionGalleryIds,
  })
}
