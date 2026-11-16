import type { contactSchema } from '@galeria/shared'
import type { z } from 'zod'
import { callFunction } from '@/shared/lib/api'

export type ContactValues = z.infer<typeof contactSchema>

export const contactService = {
  send: (values: ContactValues) => callFunction<{ ok: true }>('contact', values),
}

export const whatsappUrl = (number: string, message: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`
