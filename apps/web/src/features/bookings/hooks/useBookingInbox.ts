import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingInboxService } from '../services/bookingInboxService'

const INBOX_KEY = ['booking', 'inbox'] as const
const MINE_KEY = ['booking', 'mine'] as const

export function usePhotographerBookings() {
  return useQuery({ queryKey: INBOX_KEY, queryFn: bookingInboxService.listForPhotographer })
}

export function useMyBookings() {
  return useQuery({ queryKey: MINE_KEY, queryFn: bookingInboxService.listMine })
}

type Action =
  | { type: 'accept'; id: string; note: string | null }
  | { type: 'reject'; id: string; note: string | null }
  | { type: 'confirm'; id: string }
  | { type: 'cancel'; id: string }

export function useBookingAction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (a: Action) => {
      switch (a.type) {
        case 'accept':
          return bookingInboxService.respond(a.id, true, a.note)
        case 'reject':
          return bookingInboxService.respond(a.id, false, a.note)
        case 'confirm':
          return bookingInboxService.confirm(a.id)
        case 'cancel':
          return bookingInboxService.cancel(a.id)
      }
    },
    // Lists and free slots change with any state change
    onSettled: () => qc.invalidateQueries({ queryKey: ['booking'] }),
  })
}
