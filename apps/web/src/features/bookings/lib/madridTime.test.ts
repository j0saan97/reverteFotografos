import { describe, expect, it } from 'vitest'
import { addMonths, madridDateKey, madridTime, monthGrid, monthRange } from './madridTime'

describe('Madrid time', () => {
  it('uses the Madrid calendar day, not UTC', () => {
    // 23:30 UTC on 19 Nov = 00:30 on 20 Nov in Madrid (UTC+1)
    expect(madridDateKey('2026-11-19T23:30:00Z')).toBe('2026-11-20')
    expect(madridTime('2026-11-20T09:00:00Z')).toBe('10:00')
  })

  it('handles summer time', () => {
    // UTC+2 in July
    expect(madridTime('2026-07-10T08:00:00Z')).toBe('10:00')
  })
})

describe('month helpers', () => {
  it('computes month ranges, including leap years', () => {
    expect(monthRange(2028, 2)).toEqual({ from: '2028-02-01', to: '2028-02-29' })
    expect(monthRange(2026, 11)).toEqual({ from: '2026-11-01', to: '2026-11-30' })
  })

  it('builds a Monday-first grid', () => {
    // 1 Nov 2026 is a Sunday -> 6 padding cells before it
    const weeks = monthGrid(2026, 11)
    expect(weeks[0]!.slice(0, 6)).toEqual([null, null, null, null, null, null])
    expect(weeks[0]![6]).toBe('2026-11-01')
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })

  it('moves across years', () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(addMonths(2027, 1, -1)).toEqual({ year: 2026, month: 12 })
  })
})
