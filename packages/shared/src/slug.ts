const SLUG_MAX_BASE = 48
const SUFFIX_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

function randomSuffix(length = 6): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => SUFFIX_ALPHABET[b % SUFFIX_ALPHABET.length]).join('')
}

// "Boda Ana & Luis — Málaga" -> "boda-ana-luis-malaga-x7k2p9".
// The random suffix keeps slugs unique and hard to guess (/g/:slug is shareable).
export function buildGallerySlug(title: string): string {
  const base =
    title
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, SLUG_MAX_BASE)
      .replace(/-+$/, '') || 'galeria'
  return `${base}-${randomSuffix()}`
}
