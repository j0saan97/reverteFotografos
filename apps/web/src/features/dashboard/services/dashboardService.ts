import { supabase } from '@/shared/lib/supabase'

export interface DashboardCounts {
  submittedSelections: number
  unreadMessages: number
}

// RLS limits both counts to the photographer's own galleries
export const dashboardService = {
  async counts(userId: string): Promise<DashboardCounts> {
    const [selections, messages] = await Promise.all([
      supabase
        .from('selections')
        .select('id', { count: 'exact', head: true })
        .not('submitted_at', 'is', null),
      supabase
        .from('gallery_messages')
        .select('id', { count: 'exact', head: true })
        .is('read_at', null)
        .neq('author_id', userId),
    ])
    if (selections.error) throw selections.error
    if (messages.error) throw messages.error
    return { submittedSelections: selections.count ?? 0, unreadMessages: messages.count ?? 0 }
  },
}
