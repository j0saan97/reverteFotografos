import { describe, expect, it } from 'vitest'
import { dateInputToExpiresAt, expiresAtToDateInput, isExpired } from './galleryFormat'

describe('gallery expiry dates', () => {
  it('round-trips a calendar date through the stored timestamp', () => {
    const stored = dateInputToExpiresAt('2027-06-30')
    expect(stored).not.toBeNull()
    expect(expiresAtToDateInput(stored)).toBe('2027-06-30')
  })

  it('stores the end of the chosen day', () => {
    const d = new Date(dateInputToExpiresAt('2027-06-30')!)
    expect([d.getHours(), d.getMinutes()]).toEqual([23, 59])
  })

  it('maps empty values to null', () => {
    expect(dateInputToExpiresAt(null)).toBeNull()
    expect(dateInputToExpiresAt('')).toBeNull()
    expect(expiresAtToDateInput(null)).toBeNull()
  })

  it('detects expired galleries', () => {
    const now = new Date('2027-01-01T12:00:00Z')
    expect(isExpired(null, now)).toBe(false)
    expect(isExpired('2026-12-31T12:00:00Z', now)).toBe(true)
    expect(isExpired('2027-01-02T12:00:00Z', now)).toBe(false)
  })
})
