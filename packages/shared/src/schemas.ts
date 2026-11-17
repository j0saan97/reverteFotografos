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

const galleryTitleField = z
  .string()
  .trim()
  .min(1, 'Ponle un título a la galería')
  .max(120, 'Máximo 120 caracteres')

// Each gallery belongs to one client. Email and phone are optional but needed
// to send the link by email / WhatsApp. Empty inputs arrive as null.
const galleryClientFields = {
  clientName: z
    .string()
    .trim()
    .min(1, 'Indica el nombre del cliente')
    .max(120, 'Máximo 120 caracteres'),
  clientEmail: z.string().trim().toLowerCase().email('Introduce un email válido').nullable(),
  clientPhone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{6,20}$/, 'Teléfono no válido (solo números, opcionalmente con +34)')
    .nullable(),
}

export const galleryCreateSchema = z.object({ title: galleryTitleField, ...galleryClientFields })

// Form shape. maxSelection/watermarkText/expiresAt are null when left empty.
// expiresAt is a calendar date (YYYY-MM-DD): the gallery expires at the end of that day.
export const gallerySettingsSchema = z.object({
  title: galleryTitleField,
  ...galleryClientFields,
  paid: z.boolean(),
  allowDownload: z.boolean(),
  allowSelection: z.boolean(),
  maxSelection: z
    .number({ invalid_type_error: 'Introduce un número' })
    .int('Introduce un número entero')
    .positive('Debe ser mayor que 0')
    .max(10000, 'Máximo 10000')
    .nullable(),
  watermarkText: z.string().trim().max(60, 'Máximo 60 caracteres').nullable(),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida')
    .nullable(),
})

export const galleryPinSchema = z.object({
  pin: z.string().regex(/^\d{4,8}$/, 'El PIN debe tener entre 4 y 8 dígitos'),
})

export const signUploadSchema = z.object({
  galleryId: z.string().uuid(),
  filename: z.string().min(1),
  mime: z.enum(ALLOWED_MIME),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
})

export const inviteClientSchema = z.object({
  galleryId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email('Introduce un email válido'),
})

export const acceptInviteSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/),
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

// ---------- Bookings (R1) ----------

const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no válida')
const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha no válida')
const eurosField = z
  .number({ invalid_type_error: 'Introduce un importe' })
  .min(0, 'No puede ser negativo')
  .max(100000, 'Importe demasiado alto')
  .nullable()

// Form shape (euros). The service stores cents.
export const bookingProductSchema = z
  .object({
    name: z.string().trim().min(1, 'Ponle un nombre').max(80, 'Máximo 80 caracteres'),
    description: z.string().trim().max(1000, 'Máximo 1000 caracteres').nullable(),
    fullDay: z.boolean(),
    durationMinutes: z
      .number({ invalid_type_error: 'Introduce los minutos' })
      .int('Minutos enteros')
      .min(15, 'Mínimo 15 minutos')
      .max(720, 'Máximo 12 horas')
      .nullable(),
    priceEuros: eurosField,
    depositEuros: eurosField,
    active: z.boolean(),
  })
  .refine((p) => p.fullDay || p.durationMinutes !== null, {
    path: ['durationMinutes'],
    message: 'Indica la duración o marca "día completo"',
  })

export const availabilityRuleSchema = z
  .object({
    weekday: z.number().int().min(1).max(7), // ISO: 1 = Monday
    startTime: timeField,
    endTime: timeField,
  })
  .refine((r) => r.startTime < r.endTime, {
    path: ['endTime'],
    message: 'Debe ser posterior al inicio',
  })

// Blocks are whole days (from/to inclusive)
export const availabilityBlockSchema = z
  .object({
    startDate: dateField,
    endDate: dateField,
    reason: z.string().trim().max(200, 'Máximo 200 caracteres').nullable(),
  })
  .refine((b) => b.startDate <= b.endDate, {
    path: ['endDate'],
    message: 'Debe ser igual o posterior al inicio',
  })
