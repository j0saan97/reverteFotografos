import { CONTACT_SESSION_LABELS, toWhatsAppNumber, type ContactSessionType } from '@galeria/shared'
import { useState } from 'react'
import { Alert, Button, PageHeader, Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useContactRequests, useSetHandled } from '../hooks/useContactRequests'
import type { ContactRequest } from '../services/contactRequestsService'

type Tab = 'open' | 'handled'

const dateTimeFmt = new Intl.DateTimeFormat('es-ES', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Europe/Madrid',
})
const dateFmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' })

export function ContactRequestsPage() {
  const requests = useContactRequests()
  const [tab, setTab] = useState<Tab>('open')

  const all = requests.data ?? []
  const open = all.filter((r) => !r.handled)
  const handled = all.filter((r) => r.handled)
  const visible = tab === 'open' ? open : handled

  return (
    <>
      <PageHeader
        title="Contactos"
        description="Mensajes del formulario de tu web. Márcalos como atendidos cuando respondas."
      />

      <div role="tablist" className="mb-6 flex gap-6 border-b border-stone-200">
        {(
          [
            ['open', 'Sin atender', open.length],
            ['handled', 'Atendidos', handled.length],
          ] as const
        ).map(([value, label, count]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              tab === value
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            {label} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {requests.error && <Alert tone="error">{toMessage(requests.error)}</Alert>}
      {requests.isPending ? (
        <div className="flex justify-center py-16 text-stone-400">
          <Spinner className="size-8" />
        </div>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-stone-500">
          {tab === 'open'
            ? 'No tienes mensajes pendientes.'
            : 'Aún no has atendido ningún mensaje.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <ContactRow key={r.id} request={r} />
          ))}
        </ul>
      )}
    </>
  )
}

function ContactRow({ request: r }: { request: ContactRequest }) {
  const setHandled = useSetHandled()
  const whatsapp = r.phone ? toWhatsAppNumber(r.phone) : null
  const sessionLabel =
    CONTACT_SESSION_LABELS[r.session_type as ContactSessionType] ?? r.session_type

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-stone-900">{r.name}</p>
          <p className="text-sm text-stone-600">
            {sessionLabel}
            {r.event_date && ` · ${dateFmt.format(new Date(r.event_date))}`}
          </p>
          <p className="flex flex-wrap gap-x-3 text-sm text-stone-500">
            <a href={`mailto:${r.email}`} className="hover:underline">
              {r.email}
            </a>
            {r.phone && (
              <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="hover:underline">
                {r.phone}
              </a>
            )}
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline"
              >
                WhatsApp
              </a>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-stone-400">
            {dateTimeFmt.format(new Date(r.created_at))}
          </span>
          <Button
            variant={r.handled ? 'ghost' : 'secondary'}
            loading={setHandled.isPending}
            onClick={() => setHandled.mutate({ id: r.id, handled: !r.handled })}
          >
            {r.handled ? 'Marcar sin atender' : 'Marcar atendido'}
          </Button>
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-sm whitespace-pre-line text-stone-700">
        {r.message}
      </p>
      {setHandled.error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {toMessage(setHandled.error)}
        </p>
      )}
    </li>
  )
}
