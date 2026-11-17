import type { BookingStatus } from '../services/bookingInboxService'

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pendiente de aceptar',
  awaiting_payment: 'Pendiente de pago',
  payment_reported: 'Justificante recibido',
  confirmed: 'Confirmada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
  expired: 'Caducada',
}

// Light (photographer panel) and dark (client area) badge tones
export const BOOKING_STATUS_TONE: Record<BookingStatus, { light: string; dark: string }> = {
  pending: {
    light: 'bg-amber-50 text-amber-800 ring-amber-200',
    dark: 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
  },
  awaiting_payment: {
    light: 'bg-sky-50 text-sky-800 ring-sky-200',
    dark: 'bg-sky-400/10 text-sky-300 ring-sky-400/30',
  },
  payment_reported: {
    light: 'bg-violet-50 text-violet-800 ring-violet-200',
    dark: 'bg-violet-400/10 text-violet-300 ring-violet-400/30',
  },
  confirmed: {
    light: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    dark: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30',
  },
  rejected: {
    light: 'bg-stone-100 text-stone-600 ring-stone-200',
    dark: 'bg-white/5 text-neutral-400 ring-white/10',
  },
  cancelled: {
    light: 'bg-stone-100 text-stone-600 ring-stone-200',
    dark: 'bg-white/5 text-neutral-400 ring-white/10',
  },
  expired: {
    light: 'bg-stone-100 text-stone-600 ring-stone-200',
    dark: 'bg-white/5 text-neutral-400 ring-white/10',
  },
}

export const ACTIVE_STATUSES: BookingStatus[] = [
  'pending',
  'awaiting_payment',
  'payment_reported',
  'confirmed',
]

export type InboxTab = 'pending' | 'payment' | 'upcoming' | 'history'

export const INBOX_TABS: { value: InboxTab; label: string }[] = [
  { value: 'pending', label: 'Por aceptar' },
  { value: 'payment', label: 'Pendientes de pago' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'history', label: 'Historial' },
]

export function inboxTabOf(
  b: { status: BookingStatus; ends_at: string },
  now = new Date(),
): InboxTab {
  if (b.status === 'pending') return 'pending'
  if (b.status === 'awaiting_payment' || b.status === 'payment_reported') return 'payment'
  if (b.status === 'confirmed' && new Date(b.ends_at) > now) return 'upcoming'
  return 'history'
}
