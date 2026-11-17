import { describe, expect, it } from 'vitest'
import { inboxTabOf } from './bookingStatus'

const now = new Date('2026-11-20T12:00:00Z')
const future = '2026-12-01T10:00:00Z'
const past = '2026-11-01T10:00:00Z'

describe('inboxTabOf', () => {
  it('groups by what the photographer has to do', () => {
    expect(inboxTabOf({ status: 'pending', ends_at: future }, now)).toBe('pending')
    expect(inboxTabOf({ status: 'awaiting_payment', ends_at: future }, now)).toBe('payment')
    expect(inboxTabOf({ status: 'payment_reported', ends_at: future }, now)).toBe('payment')
    expect(inboxTabOf({ status: 'confirmed', ends_at: future }, now)).toBe('upcoming')
  })

  it('sends finished and closed bookings to the history', () => {
    expect(inboxTabOf({ status: 'confirmed', ends_at: past }, now)).toBe('history')
    expect(inboxTabOf({ status: 'rejected', ends_at: future }, now)).toBe('history')
    expect(inboxTabOf({ status: 'cancelled', ends_at: future }, now)).toBe('history')
    expect(inboxTabOf({ status: 'expired', ends_at: future }, now)).toBe('history')
  })
})
