import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/types/database'

type Fns = Database['public']['Functions']
export type InboxBooking = Fns['list_photographer_bookings']['Returns'][number]
export type MyBooking = Fns['list_my_bookings']['Returns'][number]
export type BookingStatus = Database['public']['Enums']['booking_status']

const ERRORS: Record<string, string> = {
  invalid_state: 'Esta reserva ya cambió de estado. Recarga la página.',
  booking_not_found: 'No se encontró la reserva.',
}

async function call<T>(promise: PromiseLike<{ data: T; error: { message: string } | null }>) {
  const { data, error } = await promise
  if (error) throw new Error(ERRORS[error.message] ?? error.message)
  return data
}

export const bookingInboxService = {
  listForPhotographer: async (): Promise<InboxBooking[]> =>
    (await call(supabase.rpc('list_photographer_bookings'))) ?? [],

  listMine: async (): Promise<MyBooking[]> => (await call(supabase.rpc('list_my_bookings'))) ?? [],

  respond: (id: string, accept: boolean, note: string | null) =>
    call(supabase.rpc('respond_booking', { p_booking: id, p_accept: accept, p_note: note ?? '' })),

  confirm: (id: string) => call(supabase.rpc('confirm_booking', { p_booking: id })),

  cancel: (id: string) => call(supabase.rpc('cancel_booking', { p_booking: id })),
}
