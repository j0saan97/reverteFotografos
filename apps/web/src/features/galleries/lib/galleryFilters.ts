import type { Gallery } from '../services/galleryService'

export type GalleryTab = 'active' | 'archived' | 'trash'

export const TABS: { value: GalleryTab; label: string }[] = [
  { value: 'active', label: 'Activas' },
  { value: 'archived', label: 'Archivadas' },
  { value: 'trash', label: 'Papelera' },
]

export type QuickFilter =
  | 'all'
  | 'selected'
  | 'extras'
  | 'pending_selection'
  | 'paid'
  | 'pending_payment'
  | 'not_sent'
  | 'downloaded'

export const QUICK_FILTERS: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'selected', label: 'Seleccionadas' },
  { value: 'extras', label: 'Con extras' },
  { value: 'pending_selection', label: 'Pte. selección' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'pending_payment', label: 'Pte. pago' },
  { value: 'not_sent', label: 'No enviadas' },
  { value: 'downloaded', label: 'Descargadas' },
]

export interface FilterContext {
  /** Galleries whose client submitted a selection */
  submittedSelections: Set<string>
}

export function tabOf(g: Pick<Gallery, 'status' | 'deleted_at'>): GalleryTab {
  if (g.deleted_at) return 'trash'
  return g.status === 'archived' ? 'archived' : 'active'
}

export function matchesQuick(g: Gallery, filter: QuickFilter, ctx: FilterContext): boolean {
  const selected = ctx.submittedSelections.has(g.id)
  switch (filter) {
    case 'all':
      return true
    case 'selected':
      return selected
    case 'pending_selection':
      return g.allow_selection && !selected
    case 'paid':
      return g.paid
    case 'pending_payment':
      return !g.paid
    case 'not_sent':
      return g.sent_at === null
    // Data arrives with F5.7 (extras) and F6 (downloads)
    case 'extras':
    case 'downloaded':
      return false
  }
}

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

// Accent- and case-insensitive search over title and client name
export function matchesSearch(g: Pick<Gallery, 'title' | 'client_name'>, query: string): boolean {
  const q = normalize(query)
  if (!q) return true
  return normalize(`${g.title} ${g.client_name ?? ''}`).includes(q)
}
