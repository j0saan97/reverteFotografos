import { formatEuros } from '@galeria/shared'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, PageHeader, SettingsIcon, Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useBookingAction, usePhotographerBookings } from '../hooks/useBookingInbox'
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_TONE,
  INBOX_TABS,
  inboxTabOf,
  type InboxTab,
} from '../lib/bookingStatus'
import { madridLongDate, madridTime } from '../lib/madridTime'
import type { InboxBooking } from '../services/bookingInboxService'

export function BookingsInboxPage() {
  const bookings = usePhotographerBookings()
  const [tab, setTab] = useState<InboxTab>('pending')

  const all = bookings.data ?? []
  const count = (t: InboxTab) => all.filter((b) => inboxTabOf(b) === t).length
  // History: most recent first; the rest: soonest first
  const visible = all
    .filter((b) => inboxTabOf(b) === tab)
    .sort((a, b) =>
      tab === 'history'
        ? b.starts_at.localeCompare(a.starts_at)
        : a.starts_at.localeCompare(b.starts_at),
    )

  return (
    <>
      <PageHeader
        title="Reservas"
        description="Solicitudes de tus clientes. Las pendientes caducan a las 48 h si no respondes."
        actions={
          <Link
            to="/bookings/settings"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-stone-900 ring-1 ring-stone-300 ring-inset transition-colors hover:bg-stone-50"
          >
            <SettingsIcon className="size-4" />
            Productos y horario
          </Link>
        }
      />

      <div role="tablist" className="mb-6 flex flex-wrap gap-6 border-b border-stone-200">
        {INBOX_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === t.value
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {t.label} <span className="opacity-60">{count(t.value)}</span>
          </button>
        ))}
      </div>

      {bookings.error && <Alert tone="error">{toMessage(bookings.error)}</Alert>}
      {bookings.isPending ? (
        <div className="flex justify-center py-16 text-stone-400">
          <Spinner className="size-8" />
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-stone-500">No hay reservas aquí.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((b) => (
            <InboxRow key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </>
  )
}

function InboxRow({ booking: b }: { booking: InboxBooking }) {
  const action = useBookingAction()
  const busy = action.isPending

  const onReject = () => {
    const note = window.prompt('Motivo del rechazo (opcional, lo verá el cliente):', '')
    if (note !== null) action.mutate({ type: 'reject', id: b.id, note: note.trim() || null })
  }
  const onCancel = () => {
    if (window.confirm(`¿Cancelar la reserva ${b.code}? El hueco quedará libre.`)) {
      action.mutate({ type: 'cancel', id: b.id })
    }
  }

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-stone-900 first-letter:uppercase">
            {madridLongDate(b.starts_at)}
            {!b.full_day && ` · ${madridTime(b.starts_at)}–${madridTime(b.ends_at)}`}
          </p>
          <p className="text-sm text-stone-700">
            {b.product_name}
            {b.full_day && ' (día completo)'}
            {b.deposit_cents ? ` · señal ${formatEuros(b.deposit_cents)}` : ''}
          </p>
          <p className="text-sm text-stone-500">
            {b.client_name ?? 'Cliente'} ·{' '}
            <a href={`mailto:${b.client_email}`} className="hover:underline">
              {b.client_email}
            </a>
          </p>
          {b.client_note && (
            <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-700">
              “{b.client_note}”
            </p>
          )}
          <p className="pt-1 text-xs text-stone-400">
            Código <span className="font-mono">{b.code}</span>
            {b.status === 'pending' &&
              b.expires_at &&
              ` · caduca ${madridLongDate(b.expires_at)} a las ${madridTime(b.expires_at)}`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BOOKING_STATUS_TONE[b.status].light}`}
          >
            {BOOKING_STATUS_LABEL[b.status]}
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {b.status === 'pending' && (
              <>
                <Button variant="ghost" disabled={busy} onClick={onReject}>
                  Rechazar
                </Button>
                <Button
                  loading={busy && action.variables?.type === 'accept'}
                  disabled={busy}
                  onClick={() => action.mutate({ type: 'accept', id: b.id, note: null })}
                >
                  Aceptar
                </Button>
              </>
            )}
            {(b.status === 'awaiting_payment' || b.status === 'payment_reported') && (
              <Button
                loading={busy && action.variables?.type === 'confirm'}
                disabled={busy}
                onClick={() => action.mutate({ type: 'confirm', id: b.id })}
              >
                Confirmar pago
              </Button>
            )}
            {['awaiting_payment', 'payment_reported', 'confirmed'].includes(b.status) && (
              <Button variant="ghost" disabled={busy} onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
      {action.error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {toMessage(action.error)}
        </p>
      )}
    </li>
  )
}
