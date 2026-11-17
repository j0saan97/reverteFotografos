// Amounts are stored as integer cents; forms work in euros
export const eurosToCents = (euros: number | null): number | null =>
  euros === null ? null : Math.round(euros * 100)

export const centsToEuros = (cents: number | null): number | null =>
  cents === null ? null : cents / 100

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export const formatEuros = (cents: number): string => eur.format(cents / 100)
