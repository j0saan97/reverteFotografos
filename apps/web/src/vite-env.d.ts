/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_IMAGES_BASE_URL: string
  /** Dev only: 'photographer' | 'client' fakes a session to preview protected screens */
  readonly VITE_DEV_PREVIEW_ROLE?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
