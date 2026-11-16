import { z } from 'zod'
import { ALLOWED_MIME, MAX_UPLOAD_BYTES } from './constants'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const gallerySettingsSchema = z.object({
  title: z.string().min(1).max(120),
  allowDownload: z.boolean(),
  allowSelection: z.boolean(),
  maxSelection: z.number().int().positive().nullable(),
  pin: z
    .string()
    .regex(/^\d{4,8}$/)
    .nullable(),
  watermarkText: z.string().max(60).nullable(),
  expiresAt: z.string().datetime().nullable(),
})

export const signUploadSchema = z.object({
  galleryId: z.string().uuid(),
  filename: z.string().min(1),
  mime: z.enum(ALLOWED_MIME),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
})

export const inviteClientSchema = z.object({
  galleryId: z.string().uuid(),
  email: z.string().email(),
})

export const verifyPinSchema = z.object({
  slug: z.string().min(1),
  pin: z.string().regex(/^\d{4,8}$/),
})

export const photoCommentSchema = z.object({
  photoId: z.string().uuid(),
  comment: z.string().max(500),
})

export const submitSelectionSchema = z.object({
  galleryId: z.string().uuid(),
  clientNote: z.string().max(2000).nullable(),
})

export const messageSchema = z.object({
  galleryId: z.string().uuid(),
  photoId: z.string().uuid().nullable(),
  body: z.string().min(1).max(2000),
})
