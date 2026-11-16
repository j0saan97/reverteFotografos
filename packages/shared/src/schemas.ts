import { z } from 'zod'
import { ALLOWED_MIME, CONTACT_SESSION_TYPES, MAX_UPLOAD_BYTES } from './constants.ts'

const emailField = z.string().trim().email('Introduce un email válido')
const passwordField = z.string().min(8, 'Mínimo 8 caracteres')

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Introduce tu contraseña'),
})

export const registerSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    photographerCode: z.string().trim().max(64).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export const resetRequestSchema = z.object({ email: emailField })

export const newPasswordSchema = z
  .object({ password: passwordField, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export const claimPhotographerSchema = z.object({
  code: z.string().trim().min(1, 'Introduce el código').max(64),
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

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  email: z.string().trim().email('Introduce un email válido'),
  phone: z.string().trim().max(30, 'Máximo 30 caracteres').optional(),
  sessionType: z.enum(CONTACT_SESSION_TYPES, {
    errorMap: () => ({ message: 'Elige un tipo de sesión' }),
  }),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida')
    .optional()
    .or(z.literal('')),
  message: z.string().trim().min(10, 'Cuéntanos un poco más (mín. 10 caracteres)').max(3000),
  // Honeypot: real users never fill it (hidden field)
  website: z.string().max(0).optional(),
})
