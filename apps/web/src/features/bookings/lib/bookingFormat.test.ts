import { describe, expect, it } from 'vitest'
import { blockRange, formatBlock, formatDuration, shortTime, toDateInput } from './bookingFormat'

describe('blockRange', () => {
  it('covers whole days, end exclusive', () => {
    const { startsAt, endsAt } = blockRange('2027-03-10', '2027-03-12')
    expect(toDateInput(new Date(startsAt))).toBe('2027-03-10')
    expect(toDateInput(new Date(endsAt))).toBe('2027-03-13')
    expect(new Date(startsAt).getHours()).toBe(0)
  })

  it('labels single and multi-day blocks', () => {
    const one = blockRange('2027-03-10', '2027-03-10')
    expect(formatBlock(one.startsAt, one.endsAt)).not.toContain('–')
    const many = blockRange('2027-03-10', '2027-03-12')
    expect(formatBlock(many.startsAt, many.endsAt)).toContain('–')
  })
})

describe('formatting', () => {
  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(90)).toBe('1 h 30 min')
  })

  it('shortens Postgres times', () => {
    expect(shortTime('10:00:00')).toBe('10:00')
  })
})
