export const ROLES = ['photographer', 'client'] as const
export const GALLERY_STATUS = ['draft', 'published', 'archived'] as const
export const PHOTO_STATUS = ['uploading', 'processing', 'ready', 'error'] as const

export const CONTACT_SESSION_TYPES = ['wedding', 'portrait', 'event', 'family', 'other'] as const

export const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'] as const
export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024
export const PREVIEW_MAX_PX = 1600
export const THUMB_MAX_PX = 400
export const VIEW_TOKEN_TTL_SECONDS = 15 * 60
export const DOWNLOAD_URL_TTL_SECONDS = 60
export const INVITE_TTL_DAYS = 14
