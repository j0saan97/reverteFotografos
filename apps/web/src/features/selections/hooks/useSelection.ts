// TODO (F5): selección del cliente en una galería
// - toggle(photoId) con optimistic update (TanStack Query)
// - setComment(photoId, text)
// - submit(clientNote) -> Edge Function submit-selection
// - isLocked cuando submitted_at != null
export function useSelection(_galleryId: string) {
  return { selected: new Set<string>(), isLocked: false }
}
