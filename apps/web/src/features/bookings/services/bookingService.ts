import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/types/database'
import type { BookingProduct } from './bookingAdminService'

export type Booking = Database['public']['Tables']['bookings']['Row']

export interface Slot {
  starts_at: string
  ends_at: string
}

const PRODUCT_COLUMNS =
  'id, photographer_id, name, description, full_day, duration_minutes, price_cents, deposit_cents, active, position, created_at'

// Errors raised by the booking functions (see migration bookings)
const BOOKING_ERRORS: Record<string, string> = {
  slot_unavailable: 'Ese hueco ya no está disponible. Elige otro, por favor.',
  too_many_pending:
    'Ya tienes 3 solicitudes pendientes. Espera a que el fotógrafo responda antes de pedir otra.',
  not_a_client: 'Solo los clientes pueden hacer reservas.',
  product_not_found: 'Este servicio ya no está disponible.',
}

export class BookingError extends Error {}

// Client side: products, free slots and booking requests
export const bookingService = {
  async listActiveProducts(): Promise<BookingProduct[]> {
    const { data, error } = await supabase
      .from('booking_products')
      .select(PRODUCT_COLUMNS)
      .eq('active', true)
      .order('position')
      .order('created_at')
    if (error) throw error
    return data
  },

  async availableSlots(productId: string, from: string, to: string): Promise<Slot[]> {
    const { data, error } = await supabase.rpc('available_slots', {
      p_product: productId,
      p_from: from,
      p_to: to,
    })
    if (error) throw error
    return data
  },

  async request(productId: string, startsAt: string, note: string | null): Promise<Booking> {
    const { data, error } = await supabase.rpc('request_booking', {
      p_product: productId,
      p_starts_at: startsAt,
      p_note: note ?? '',
    })
    if (error) throw new BookingError(BOOKING_ERRORS[error.message] ?? error.message)
    return data
  },
}
