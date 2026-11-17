import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/types/database'

export type ContactRequest = Database['public']['Tables']['contact_requests']['Row']

const COLUMNS = 'id, name, email, phone, session_type, event_date, message, handled, created_at'

// RLS: only photographers read them and can change `handled`
export const contactRequestsService = {
  async list(): Promise<ContactRequest[]> {
    const { data, error } = await supabase
      .from('contact_requests')
      .select(COLUMNS)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async setHandled(id: string, handled: boolean): Promise<void> {
    const { error } = await supabase.from('contact_requests').update({ handled }).eq('id', id)
    if (error) throw error
  },
}
