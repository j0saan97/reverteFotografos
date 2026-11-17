import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { galleryAccessService } from '../services/galleryAccessService'

const accessKey = (galleryId: string) => ['galleries', galleryId, 'access'] as const

export function useGalleryAccess(galleryId: string) {
  return useQuery({
    queryKey: accessKey(galleryId),
    queryFn: () => galleryAccessService.list(galleryId),
  })
}

export function useInviteClient(galleryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => galleryAccessService.invite(galleryId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: accessKey(galleryId) }),
  })
}

export function useRevokeAccess(galleryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => galleryAccessService.revoke(galleryId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: accessKey(galleryId) }),
  })
}
