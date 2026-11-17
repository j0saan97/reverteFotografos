import { formatEuros } from '@galeria/shared'
import { Link } from 'react-router-dom'
import { Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useBookingAction, useMyBookings } from '../hooks/useBookingInbox'
import { ACTIVE_STATUSES, BOOKING_STATUS_LABEL, BOOKING_STATUS_TONE } from '../lib/bookingStatus'
import { madridLongDate, madridTime } from '../lib/madridTime'
import type { MyBooking } from '../services/bookingInboxService'

const NEXT_STEP: Partial<Record<MyBooking['status'], string>> = {
  pending: 'El fotógrafo revisará tu solicitud en menos de 48 horas.',
  awaiting_payment:
    'Aceptada. Para confirmarla, paga la señal indicando el código de reserva en el concepto.',
  payment_reported: 'Hemos recibido tu justificante. El fotógrafo lo está revisando.',
  confirmed: '¡Reserva confirmada!',
}

export function MyBookingsPage() {
  const bookings = useMyBookings()

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Mis reservas</h1>
          <p className="mt-2 text-sm text-neutral-400">Horas de España peninsular.</p>
        </div>
        <Link
          to="/my/reservar"
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
        >
          Nueva reserva
        </Link>
      </header>

      {bookings.isPending ? (
        <div className="flex justify-center py-16 text-neutral-500">
          <Spinner className="size-8" />
        </div>
      ) : bookings.error ? (
        <p role="alert" className="text-sm text-red-400">
          {toMessage(bookings.error)}
        </p>
      ) : bookings.data.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-neutral-900 px-6 py-12 text-center text-sm text-neutral-400">
          Aún no tienes reservas.
        </p>
      ) : (
        <ul className="space-y-3">
          {bookings.data.map((b) => (
            <MyBookingRow key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </div>
  )
}

function MyBookingRow({ booking: b }: { booking: MyBooking }) {
  const action = useBookingAction()
  const canCancel = ACTIVE_STATUSES.includes(b.status) && new Date(b.starts_at) > new Date()

  const onCancel = () => {
    if (window.confirm(`¿Cancelar la reserva ${b.code}?`))
      action.mutate({ type: 'cancel', id: b.id })
  }

  return (
    <li className="rounded-xl border border-white/10 bg-neutral-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-medium first-letter:uppercase">
            {madridLongDate(b.starts_at)}
            {!b.full_day && ` · ${madridTime(b.starts_at)}`}
          </p>
          <p className="text-sm text-neutral-300">
            {b.product_name}
            {b.deposit_cents ? ` · señal ${formatEuros(b.deposit_cents)}` : ''}
          </p>
          <p className="text-xs text-neutral-500">
            Código <span className="font-mono text-neutral-300">{b.code}</span>
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BOOKING_STATUS_TONE[b.status].dark}`}
        >
          {BOOKING_STATUS_LABEL[b.status]}
        </span>
      </div>

      {NEXT_STEP[b.status] && (
        <p className="mt-3 text-sm text-neutral-300">{NEXT_STEP[b.status]}</p>
      )}
      {b.photographer_note && (
        <p className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-neutral-300">
          Nota del fotógrafo: “{b.photographer_note}”
        </p>
      )}

      {canCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={action.isPending}
          className="mt-4 rounded-lg px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          Cancelar reserva
        </button>
      )}
      {action.error && (
        <p role="alert" className="mt-2 text-sm text-red-400">
          {toMessage(action.error)}
        </p>
      )}
    </li>
  )
}
