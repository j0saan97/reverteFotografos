import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contactRequestsService } from '../services/contactRequestsService'

const KEY = ['contact-requests'] as const

export function useContactRequests() {
  return useQuery({ queryKey: KEY, queryFn: contactRequestsService.list })
}

export function useSetHandled() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      contactRequestsService.setHandled(id, handled),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
