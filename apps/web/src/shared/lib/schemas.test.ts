import { describe, expect, it } from 'vitest'
import { gallerySettingsSchema, verifyPinSchema } from '@galeria/shared'

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
      pin: null,
      watermarkText: null,
      expiresAt: null,
    }
    expect(gallerySettingsSchema.safeParse(base).success).toBe(true)
    expect(gallerySettingsSchema.safeParse({ ...base, title: '' }).success).toBe(false)
    expect(gallerySettingsSchema.safeParse({ ...base, maxSelection: 0 }).success).toBe(false)
  })
})
