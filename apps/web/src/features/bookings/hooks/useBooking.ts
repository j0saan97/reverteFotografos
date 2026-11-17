import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { monthRange } from '../lib/madridTime'
import { bookingService } from '../services/bookingService'

export function useActiveProducts() {
  return useQuery({ queryKey: ['booking', 'products'], queryFn: bookingService.listActiveProducts })
}

export function useMonthSlots(productId: string | null, year: number, month: number) {
  const { from, to } = monthRange(year, month)
  return useQuery({
    queryKey: ['booking', 'slots', productId, from],
    queryFn: () => bookingService.availableSlots(productId!, from, to),
    enabled: productId !== null,
    staleTime: 15_000,
  })
}

export function useRequestBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { productId: string; startsAt: string; note: string | null }) =>
      bookingService.request(v.productId, v.startsAt, v.note),
    // Slots changed (ours, or someone else's if it failed)
    onSettled: () => qc.invalidateQueries({ queryKey: ['booking', 'slots'] }),
  })
}
