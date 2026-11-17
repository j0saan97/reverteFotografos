// Dates and times shown in the business time zone, whatever the viewer's zone.
export const BUSINESS_TZ = 'Europe/Madrid'

const keyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const timeFmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: BUSINESS_TZ,
  hour: '2-digit',
  minute: '2-digit',
})
const longDateFmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: BUSINESS_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** "2026-11-20" (Madrid calendar day of an instant) */
export const madridDateKey = (iso: string | Date) => keyFmt.format(new Date(iso))

/** "10:30" in Madrid */
export const madridTime = (iso: string | Date) => timeFmt.format(new Date(iso))

/** "viernes, 20 de noviembre de 2026" in Madrid */
export const madridLongDate = (iso: string | Date) => longDateFmt.format(new Date(iso))

/** Today's date key in Madrid */
export const madridToday = () => madridDateKey(new Date())

/** First and last date keys of a month (month: 1-12) */
export function monthRange(year: number, month: number): { from: string; to: string } {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const mm = String(month).padStart(2, '0')
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${String(last).padStart(2, '0')}` }
}

/**
 * Calendar grid for a month, weeks starting on Monday.
 * Cells are date keys, or null for padding days.
 */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const { to } = monthRange(year, month)
  const daysInMonth = Number(to.slice(8))
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay() // 0 = Sunday
  const offset = (firstWeekday + 6) % 7 // Monday-based
  const mm = String(month).padStart(2, '0')
  const cells: (string | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${mm}-${String(d).padStart(2, '0')}`)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function addMonths(year: number, month: number, delta: number) {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

const monthFmt = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
export const monthLabel = (year: number, month: number) =>
  monthFmt.format(new Date(Date.UTC(year, month - 1, 1)))
