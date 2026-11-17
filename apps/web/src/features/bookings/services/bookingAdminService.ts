import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
export type BookingProduct = Tables['booking_products']['Row']
export type AvailabilityRule = Tables['availability_rules']['Row']
export type AvailabilityBlock = Tables['availability_blocks']['Row']

export type ProductInput = Omit<
  Tables['booking_products']['Insert'],
  'id' | 'photographer_id' | 'created_at'
>

const PRODUCT_COLUMNS =
  'id, photographer_id, name, description, full_day, duration_minutes, price_cents, deposit_cents, active, position, created_at'
const RULE_COLUMNS = 'id, photographer_id, weekday, start_time, end_time'
const BLOCK_COLUMNS = 'id, photographer_id, starts_at, ends_at, reason, created_at'

const FK_VIOLATION = '23503'

// Photographer-side configuration (RLS limits everything to the owner)
export const bookingAdminService = {
  async listProducts(photographerId: string): Promise<BookingProduct[]> {
    const { data, error } = await supabase
      .from('booking_products')
      .select(PRODUCT_COLUMNS)
      .eq('photographer_id', photographerId)
      .order('position')
      .order('created_at')
    if (error) throw error
    return data
  },

  async createProduct(photographerId: string, input: ProductInput): Promise<void> {
    const { error } = await supabase
      .from('booking_products')
      .insert({ ...input, photographer_id: photographerId })
    if (error) throw error
  },

  async updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
    const { error } = await supabase.from('booking_products').update(input).eq('id', id)
    if (error) throw error
  },

  // Products with bookings can't be deleted (history): deactivate them instead
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('booking_products').delete().eq('id', id)
    if (error?.code === FK_VIOLATION) {
      throw new Error('Este producto tiene reservas: desactívalo en lugar de eliminarlo.')
    }
    if (error) throw error
  },

  async listRules(photographerId: string): Promise<AvailabilityRule[]> {
    const { data, error } = await supabase
      .from('availability_rules')
      .select(RULE_COLUMNS)
      .eq('photographer_id', photographerId)
      .order('weekday')
      .order('start_time')
    if (error) throw error
    return data
  },

  async createRule(
    photographerId: string,
    rule: { weekday: number; startTime: string; endTime: string },
  ): Promise<void> {
    const { error } = await supabase.from('availability_rules').insert({
      photographer_id: photographerId,
      weekday: rule.weekday,
      start_time: rule.startTime,
      end_time: rule.endTime,
    })
    if (error) throw error
  },

  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase.from('availability_rules').delete().eq('id', id)
    if (error) throw error
  },

  async listBlocks(photographerId: string): Promise<AvailabilityBlock[]> {
    const { data, error } = await supabase
      .from('availability_blocks')
      .select(BLOCK_COLUMNS)
      .eq('photographer_id', photographerId)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at')
    if (error) throw error
    return data
  },

  async createBlock(
    photographerId: string,
    block: { startsAt: string; endsAt: string; reason: string | null },
  ): Promise<void> {
    const { error } = await supabase.from('availability_blocks').insert({
      photographer_id: photographerId,
      starts_at: block.startsAt,
      ends_at: block.endsAt,
      reason: block.reason,
    })
    if (error) throw error
  },

  async deleteBlock(id: string): Promise<void> {
    const { error } = await supabase.from('availability_blocks').delete().eq('id', id)
    if (error) throw error
  },
}
