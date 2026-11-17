import { supabase } from '@/shared/lib/supabase'

// Client side. RLS ("galleries: client read") only returns galleries the client
// accepted an invitation to, that are published, not expired and not in the trash.
const CLIENT_GALLERY_COLUMNS =
  'id, title, slug, cover_photo_id, allow_selection, allow_download, expires_at, created_at'

export interface ClientGallery {
  id: string
  title: string
  slug: string
  cover_photo_id: string | null
  allow_selection: boolean
  allow_download: boolean
  expires_at: string | null
  created_at: string
}

export const clientGalleryService = {
  async listMine(): Promise<ClientGallery[]> {
    const { data, error } = await supabase
      .from('galleries')
      .select(CLIENT_GALLERY_COLUMNS)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  async getBySlug(slug: string): Promise<ClientGallery | null> {
    const { data, error } = await supabase
      .from('galleries')
      .select(CLIENT_GALLERY_COLUMNS)
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return data
  },

  // Accepted invitations, including galleries the photographer hasn't published yet
  async acceptedAccessCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('gallery_access')
      .select('gallery_id', { count: 'exact', head: true })
      .eq('client_id', userId)
      .not('accepted_at', 'is', null)
    if (error) throw error
    return count ?? 0
  },
}
