import { callFunction } from '@/shared/lib/api'
import { supabase } from '@/shared/lib/supabase'

// token_hash is never readable from the client (column grants)
const ACCESS_COLUMNS = 'gallery_id, email, client_id, invited_at, accepted_at, token_expires_at'

export interface GalleryAccess {
  gallery_id: string
  email: string
  client_id: string | null
  invited_at: string
  accepted_at: string | null
  token_expires_at: string | null
}

export type InviteResult =
  | { status: 'invited'; link: string; emailed: boolean; expiresAt: string }
  | { status: 'already_member' }

export const galleryAccessService = {
  async list(galleryId: string): Promise<GalleryAccess[]> {
    const { data, error } = await supabase
      .from('gallery_access')
      .select(ACCESS_COLUMNS)
      .eq('gallery_id', galleryId)
      .order('invited_at', { ascending: false })
    if (error) throw error
    return data
  },

  invite: (galleryId: string, email: string) =>
    callFunction<InviteResult>('invite-client', { galleryId, email }),

  async revoke(galleryId: string, email: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_access')
      .delete()
      .eq('gallery_id', galleryId)
      .eq('email', email)
    if (error) throw error
  },
}
