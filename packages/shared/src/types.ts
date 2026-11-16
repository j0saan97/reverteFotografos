import type { ROLES, GALLERY_STATUS, PHOTO_STATUS, CONTACT_SESSION_TYPES } from './constants.ts'

export type Role = (typeof ROLES)[number]
export type GalleryStatus = (typeof GALLERY_STATUS)[number]
export type PhotoStatus = (typeof PHOTO_STATUS)[number]
export type ContactSessionType = (typeof CONTACT_SESSION_TYPES)[number]
