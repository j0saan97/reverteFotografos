import type { GalleryStatus } from '@galeria/shared'

export const STATUS_LABEL: Record<GalleryStatus, string> = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' })

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function isExpired(expiresAt: string | null, now = new Date()): boolean {
  return expiresAt !== null && new Date(expiresAt) <= now
}

// The form works with calendar dates; the DB stores the end of that day (local time).
export function dateInputToExpiresAt(date: string | null): string | null {
  if (!date) return null
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y!, m! - 1, d!, 23, 59, 59).toISOString()
}

export function expiresAtToDateInput(expiresAt: string | null): string | null {
  if (!expiresAt) return null
  const d = new Date(expiresAt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
