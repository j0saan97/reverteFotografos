import { BookingCalendar } from '../components/BookingCalendar'

export function BookingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="font-display text-4xl">Reservar sesión</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Elige el servicio, el día y la hora. El fotógrafo confirmará tu reserva.
        </p>
      </header>
      <BookingCalendar />
    </div>
  )
}
