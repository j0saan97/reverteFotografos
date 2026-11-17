import { describe, expect, it } from 'vitest'
import {
  buildGallerySlug,
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
