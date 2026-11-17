import { describe, expect, it } from 'vitest'
import type { Gallery } from '../services/galleryService'
import { matchesQuick, matchesSearch, tabOf } from './galleryFilters'

const gallery = (over: Partial<Gallery> = {}): Gallery =>
  ({
    id: 'g1',
    title: 'Boda Ana y Luis',
    client_name: 'Ana García',
    status: 'published',
    deleted_at: null,
    allow_selection: true,
    paid: false,
    sent_at: null,
    ...over,
  }) as Gallery

const ctx = { submittedSelections: new Set<string>() }

describe('tabOf', () => {
  it('puts deleted galleries in the trash whatever their status', () => {
    expect(tabOf(gallery({ deleted_at: '2026-11-17T10:00:00Z', status: 'archived' }))).toBe('trash')
  })

  it('separates archived from active', () => {
    expect(tabOf(gallery({ status: 'archived' }))).toBe('archived')
    expect(tabOf(gallery({ status: 'draft' }))).toBe('active')
    expect(tabOf(gallery({ status: 'published' }))).toBe('active')
  })
})

describe('matchesQuick', () => {
  it('filters by payment and sending', () => {
    expect(matchesQuick(gallery({ paid: true }), 'paid', ctx)).toBe(true)
    expect(matchesQuick(gallery({ paid: true }), 'pending_payment', ctx)).toBe(false)
    expect(matchesQuick(gallery(), 'not_sent', ctx)).toBe(true)
    expect(matchesQuick(gallery({ sent_at: '2026-11-17T10:00:00Z' }), 'not_sent', ctx)).toBe(false)
  })

  it('uses submitted selections for the selection filters', () => {
    const withSelection = { submittedSelections: new Set(['g1']) }
    expect(matchesQuick(gallery(), 'selected', withSelection)).toBe(true)
    expect(matchesQuick(gallery(), 'pending_selection', withSelection)).toBe(false)
    expect(matchesQuick(gallery(), 'pending_selection', ctx)).toBe(true)
    expect(matchesQuick(gallery({ allow_selection: false }), 'pending_selection', ctx)).toBe(false)
  })
})

describe('matchesSearch', () => {
  it('ignores case and accents, and searches the client name', () => {
    expect(matchesSearch(gallery(), 'GARCIA')).toBe(true)
    expect(matchesSearch(gallery(), 'boda luis')).toBe(false)
    expect(matchesSearch(gallery(), 'ana y luis')).toBe(true)
    expect(matchesSearch(gallery(), '   ')).toBe(true)
  })
})
