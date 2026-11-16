import { supabase } from '@/shared/lib/supabase'

// Columnas explícitas: pin_hash no tiene GRANT de lectura (ver migración RLS).
const GALLERY_COLUMNS =
  'id, photographer_id, title, slug, cover_photo_id, allow_download, allow_selection, max_selection, watermark_text, expires_at, status, created_at'

// TODO (F2): CRUD de galerías (RLS limita a las del fotógrafo)
export const galleryService = {
  list: () =>
    supabase.from('galleries').select(GALLERY_COLUMNS).order('created_at', { ascending: false }),
}
