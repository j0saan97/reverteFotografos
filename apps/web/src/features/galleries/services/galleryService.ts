import { buildGallerySlug, type GalleryStatus } from '@galeria/shared'
import { supabase } from '@/shared/lib/supabase'
import type { Database } from '@/types/database'

// Explicit columns: pin_hash has no read GRANT (see RLS migrations).
const GALLERY_COLUMNS =
  'id, photographer_id, title, slug, cover_photo_id, allow_download, allow_selection, max_selection, watermark_text, expires_at, status, has_pin, client_name, client_email, client_phone, paid, sent_at, created_at'

type GalleryRow = Database['public']['Tables']['galleries']['Row']
export type Gallery = Omit<GalleryRow, 'pin_hash' | 'has_pin'> & { has_pin: boolean }

export interface GalleryClient {
  client_name: string
  client_email: string | null
  client_phone: string | null
}

export type GalleryUpdate = Partial<
  Pick<
    GalleryRow,
    | 'title'
    | 'allow_download'
    | 'allow_selection'
    | 'max_selection'
    | 'watermark_text'
    | 'expires_at'
    | 'status'
    | 'client_name'
    | 'client_email'
    | 'client_phone'
    | 'paid'
    | 'sent_at'
  >
>

const UNIQUE_VIOLATION = '23505'
const SLUG_ATTEMPTS = 3

function toGallery(row: Omit<GalleryRow, 'pin_hash'>): Gallery {
  return { ...row, has_pin: row.has_pin ?? false }
}

export const galleryService = {
  async list(): Promise<Gallery[]> {
    const { data, error } = await supabase
      .from('galleries')
      .select(GALLERY_COLUMNS)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(toGallery)
  },

  async get(id: string): Promise<Gallery | null> {
    const { data, error } = await supabase
      .from('galleries')
      .select(GALLERY_COLUMNS)
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? toGallery(data) : null
  },

  // New galleries start as drafts. Retries on the (unlikely) slug collision.
  async create(photographerId: string, title: string, client: GalleryClient): Promise<Gallery> {
    for (let attempt = 1; ; attempt++) {
      const { data, error } = await supabase
        .from('galleries')
        .insert({
          photographer_id: photographerId,
          title,
          slug: buildGallerySlug(title),
          ...client,
        })
        .select(GALLERY_COLUMNS)
        .single()
      if (!error) return toGallery(data)
      if (error.code !== UNIQUE_VIOLATION || attempt >= SLUG_ATTEMPTS) throw error
    }
  },

  async update(id: string, changes: GalleryUpdate): Promise<Gallery> {
    const { data, error } = await supabase
      .from('galleries')
      .update(changes)
      .eq('id', id)
      .select(GALLERY_COLUMNS)
      .single()
    if (error) throw error
    return toGallery(data)
  },

  setStatus: (id: string, status: GalleryStatus) => galleryService.update(id, { status }),

  // The PIN is hashed in the database (set_gallery_pin). null removes it.
  async setPin(id: string, pin: string | null): Promise<void> {
    const { error } = await supabase.rpc('set_gallery_pin', { gallery_id: id, pin: pin as string })
    if (error) throw error
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('galleries').delete().eq('id', id)
    if (error) throw error
  },
}
