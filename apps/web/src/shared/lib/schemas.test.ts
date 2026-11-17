import { describe, expect, it } from 'vitest'
import {
  acceptInviteSchema,
  buildGallerySlug,
  galleryCreateSchema,
  toWhatsAppNumber,
  inviteClientSchema,
  galleryPinSchema,
  gallerySettingsSchema,
  newPasswordSchema,
  registerSchema,
  verifyPinSchema,
} from '@galeria/shared'

describe('auth schemas', () => {
  const valid = {
    displayName: 'Ana García',
    email: 'ana@example.com',
    password: 'secreta123',
    confirmPassword: 'secreta123',
  }

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects mismatched passwords on confirmPassword', () => {
    const r = registerSchema.safeParse({ ...valid, confirmPassword: 'otra12345' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.path).toEqual(['confirmPassword'])
  })

  it('requires passwords of at least 8 characters', () => {
    expect(
      newPasswordSchema.safeParse({ password: 'corta', confirmPassword: 'corta' }).success,
    ).toBe(false)
  })
})

describe('shared schemas', () => {
  it('accepts a numeric PIN of 4-8 digits', () => {
    expect(verifyPinSchema.safeParse({ slug: 'boda', pin: '1234' }).success).toBe(true)
  })

  it('rejects a non-numeric or too short PIN', () => {
    expect(verifyPinSchema.safeParse({ slug: 'boda', pin: '12a4' }).success).toBe(false)
    expect(verifyPinSchema.safeParse({ slug: 'boda', pin: '123' }).success).toBe(false)
  })

  it('validates gallery settings', () => {
    const base = {
      title: 'Boda Ana y Luis',
      allowDownload: false,
      clientName: 'Ana García',
      clientEmail: 'ana@example.com',
      clientPhone: '600123456',
      paid: false,
      allowSelection: true,
      maxSelection: 50,
      watermarkText: null,
      expiresAt: null,
    }
    expect(gallerySettingsSchema.safeParse(base).success).toBe(true)
    expect(gallerySettingsSchema.safeParse({ ...base, title: '   ' }).success).toBe(false)
    expect(gallerySettingsSchema.safeParse({ ...base, maxSelection: 0 }).success).toBe(false)
    expect(gallerySettingsSchema.safeParse({ ...base, maxSelection: 2.5 }).success).toBe(false)
    expect(gallerySettingsSchema.safeParse({ ...base, expiresAt: '2027-06-30' }).success).toBe(true)
    expect(gallerySettingsSchema.safeParse({ ...base, expiresAt: '30/06/2027' }).success).toBe(
      false,
    )
  })

  it('validates gallery PIN', () => {
    expect(galleryPinSchema.safeParse({ pin: '1234' }).success).toBe(true)
    expect(galleryPinSchema.safeParse({ pin: '12345678' }).success).toBe(true)
    expect(galleryPinSchema.safeParse({ pin: '123' }).success).toBe(false)
    expect(galleryPinSchema.safeParse({ pin: '123456789' }).success).toBe(false)
  })
})

describe('invite schemas', () => {
  const galleryId = '7b0e6a52-3f0e-4c8e-9d7a-2a1b3c4d5e6f'

  it('normalizes the invited email', () => {
    const r = inviteClientSchema.safeParse({ galleryId, email: '  Ana@Example.COM ' })
    expect(r.success && r.data.email).toBe('ana@example.com')
  })

  it('rejects malformed invite tokens', () => {
    expect(acceptInviteSchema.safeParse({ token: 'a'.repeat(43) }).success).toBe(true)
    expect(acceptInviteSchema.safeParse({ token: 'short' }).success).toBe(false)
    expect(acceptInviteSchema.safeParse({ token: `${'a'.repeat(40)}/..` }).success).toBe(false)
  })
})

describe('gallery client fields', () => {
  const base = { title: 'Boda', clientName: 'Ana', clientEmail: null, clientPhone: null }

  it('requires the client name and accepts empty contact data', () => {
    expect(galleryCreateSchema.safeParse(base).success).toBe(true)
    expect(galleryCreateSchema.safeParse({ ...base, clientName: ' ' }).success).toBe(false)
  })

  it('validates email and phone when present', () => {
    expect(galleryCreateSchema.safeParse({ ...base, clientPhone: '+34 600 123 456' }).success).toBe(
      true,
    )
    expect(galleryCreateSchema.safeParse({ ...base, clientPhone: '600-12' }).success).toBe(false)
    expect(galleryCreateSchema.safeParse({ ...base, clientEmail: 'nope' }).success).toBe(false)
  })
})

describe('toWhatsAppNumber', () => {
  it('adds the Spanish prefix to 9-digit numbers', () => {
    expect(toWhatsAppNumber('600 123 456')).toBe('34600123456')
  })

  it('keeps explicit international prefixes', () => {
    expect(toWhatsAppNumber('+34 600 123 456')).toBe('34600123456')
    expect(toWhatsAppNumber('0034600123456')).toBe('34600123456')
    expect(toWhatsAppNumber('+44 7700 900123')).toBe('447700900123')
  })

  it('rejects numbers that are too short', () => {
    expect(toWhatsAppNumber('12345')).toBeNull()
  })
})

describe('gallery slug', () => {
  it('builds a URL-safe slug with a random suffix', () => {
    const slug = buildGallerySlug('Boda Ana & Luis — Málaga 2026')
    expect(slug).toMatch(/^boda-ana-luis-malaga-2026-[a-z0-9]{6}$/)
  })

  it('falls back to "galeria" when the title has no usable characters', () => {
    expect(buildGallerySlug('¡¡!!')).toMatch(/^galeria-[a-z0-9]{6}$/)
  })

  it('truncates long titles', () => {
    expect(buildGallerySlug('a'.repeat(200)).length).toBeLessThanOrEqual(48 + 7)
  })
})
