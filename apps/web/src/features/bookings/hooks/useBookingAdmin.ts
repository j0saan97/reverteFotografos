import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/features/auth'
import { bookingAdminService, type ProductInput } from '../services/bookingAdminService'

const keys = {
  products: (uid: string) => ['booking-admin', uid, 'products'] as const,
  rules: (uid: string) => ['booking-admin', uid, 'rules'] as const,
  blocks: (uid: string) => ['booking-admin', uid, 'blocks'] as const,
}

function useUserId(): string {
  const { session } = useSession()
  return session?.user.id ?? ''
}

// Runs a write and refreshes one list
function useWrite<T>(key: readonly unknown[], fn: (input: T) => Promise<void>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
}

export function useProducts() {
  const uid = useUserId()
  return useQuery({
    queryKey: keys.products(uid),
    queryFn: () => bookingAdminService.listProducts(uid),
    enabled: uid !== '',
  })
}

export function useSaveProduct() {
  const uid = useUserId()
  return useWrite(keys.products(uid), ({ id, input }: { id?: string; input: ProductInput }) =>
    id
      ? bookingAdminService.updateProduct(id, input)
      : bookingAdminService.createProduct(uid, input),
  )
}

export function useDeleteProduct() {
  const uid = useUserId()
  return useWrite(keys.products(uid), bookingAdminService.deleteProduct)
}

export function useRules() {
  const uid = useUserId()
  return useQuery({
    queryKey: keys.rules(uid),
    queryFn: () => bookingAdminService.listRules(uid),
    enabled: uid !== '',
  })
}

export function useCreateRule() {
  const uid = useUserId()
  return useWrite(
    keys.rules(uid),
    (rule: { weekday: number; startTime: string; endTime: string }) =>
      bookingAdminService.createRule(uid, rule),
  )
}

export function useDeleteRule() {
  const uid = useUserId()
  return useWrite(keys.rules(uid), bookingAdminService.deleteRule)
}

export function useBlocks() {
  const uid = useUserId()
  return useQuery({
    queryKey: keys.blocks(uid),
    queryFn: () => bookingAdminService.listBlocks(uid),
    enabled: uid !== '',
  })
}

export function useCreateBlock() {
  const uid = useUserId()
  return useWrite(
    keys.blocks(uid),
    (block: { startsAt: string; endsAt: string; reason: string | null }) =>
      bookingAdminService.createBlock(uid, block),
  )
}

export function useDeleteBlock() {
  const uid = useUserId()
  return useWrite(keys.blocks(uid), bookingAdminService.deleteBlock)
}
