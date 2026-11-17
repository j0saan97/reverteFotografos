// Local-day helpers. The business runs in Europe/Madrid and so do the
// photographer's browser and its clients (showing explicit Madrid time is R1.7).

const pad = (n: number) => String(n).padStart(2, '0')

export function dayStart(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y!, m! - 1, d!)
}

// Whole-day block [startDate 00:00, endDate+1 00:00)
export function blockRange(startDate: string, endDate: string) {
  const end = dayStart(endDate)
  end.setDate(end.getDate() + 1)
  return { startsAt: dayStart(startDate).toISOString(), endsAt: end.toISOString() }
}

export function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "10:00:00" (Postgres time) -> "10:00"
export const shortTime = (t: string) => t.slice(0, 5)

const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

// Human label for a whole-day block: "3 dic 2026" or "3 dic 2026 – 7 dic 2026"
export function formatBlock(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const lastDay = new Date(new Date(endsAt).getTime() - 1)
  const a = dateFmt.format(start)
  const b = dateFmt.format(lastDay)
  return a === b ? a : `${a} – ${b}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
