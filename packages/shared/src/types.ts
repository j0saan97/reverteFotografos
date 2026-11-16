import type { ROLES, GALLERY_STATUS, PHOTO_STATUS } from './constants'

export type Role = (typeof ROLES)[number]
export type GalleryStatus = (typeof GALLERY_STATUS)[number]
export type PhotoStatus = (typeof PHOTO_STATUS)[number]
