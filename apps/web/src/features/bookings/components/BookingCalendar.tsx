import { formatEuros } from '@galeria/shared'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon, Spinner } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useActiveProducts, useMonthSlots, useRequestBooking } from '../hooks/useBooking'
import { formatDuration } from '../lib/bookingFormat'
import {
  addMonths,
  madridDateKey,
  madridLongDate,
  madridTime,
  madridToday,
  monthGrid,
  monthLabel,
} from '../lib/madridTime'
import type { BookingProduct } from '../services/bookingAdminService'
import type { Booking, Slot } from '../services/bookingService'

const panel = 'rounded-xl border border-white/10 bg-neutral-900 p-5 sm:p-6'
const WEEK_HEADER = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Product -> day -> slot -> note -> request. Times are always shown in Madrid.
export function BookingCalendar() {
  const products = useActiveProducts()
  const [product, setProduct] = useState<BookingProduct | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [done, setDone] = useState<Booking | null>(null)

  if (done && product) return <BookingRequested booking={done} product={product} />

  return (
    <div className="space-y-6">
      <section className={panel}>
        <StepTitle n={1}>¿Qué quieres reservar?</StepTitle>
        {products.isPending ? (
          <Loading />
        ) : products.error ? (
          <ErrorText>{toMessage(products.error)}</ErrorText>
        ) : products.data.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Ahora mismo no hay servicios disponibles para reservar.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {products.data.map((p) => (
              <ProductOption
                key={p.id}
                product={p}
                selected={product?.id === p.id}
                onSelect={() => {
                  setProduct(p)
                  setSlot(null)
                }}
              />
            ))}
          </div>
        )}
      </section>

      {product && <DayAndSlot key={product.id} product={product} slot={slot} onSlot={setSlot} />}

      {product && slot && (
        <Confirm product={product} slot={slot} onDone={setDone} onSlotLost={() => setSlot(null)} />
      )}
    </div>
  )
}

function ProductOption({
  product,
  selected,
  onSelect,
}: {
  product: BookingProduct
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-lg border p-4 text-left transition-colors ${
        selected
          ? 'border-white bg-white text-neutral-950'
          : 'border-white/15 hover:border-white/40 hover:bg-white/5'
      }`}
    >
      <p className="font-medium">{product.name}</p>
      <p className={`mt-1 text-sm ${selected ? 'text-neutral-600' : 'text-neutral-400'}`}>
        {product.full_day ? 'Día completo' : formatDuration(product.duration_minutes ?? 0)}
        {product.price_cents !== null && ` · ${formatEuros(product.price_cents)}`}
      </p>
      {product.description && (
        <p className={`mt-2 text-xs ${selected ? 'text-neutral-600' : 'text-neutral-500'}`}>
          {product.description}
        </p>
      )}
    </button>
  )
}

function DayAndSlot({
  product,
  slot,
  onSlot,
}: {
  product: BookingProduct
  slot: Slot | null
  onSlot: (s: Slot | null) => void
}) {
  const today = madridToday()
  const [ym, setYm] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)),
  }))
  const [day, setDay] = useState<string | null>(null)
  const slots = useMonthSlots(product.id, ym.year, ym.month)

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>()
    for (const s of slots.data ?? []) {
      const key = madridDateKey(s.starts_at)
      map.set(key, [...(map.get(key) ?? []), s])
    }
    return map
  }, [slots.data])

  const isCurrentMonth = `${ym.year}-${String(ym.month).padStart(2, '0')}` === today.slice(0, 7)
  const changeMonth = (delta: number) => {
    setYm(addMonths(ym.year, ym.month, delta))
    setDay(null)
    onSlot(null)
  }
  const pickDay = (key: string) => {
    setDay(key)
    // Full-day products: the day is the slot
    onSlot(product.full_day ? (byDay.get(key)?.[0] ?? null) : null)
  }

  const daySlots = day ? (byDay.get(day) ?? []) : []

  return (
    <section className={panel}>
      <StepTitle n={2}>{product.full_day ? 'Elige el día' : 'Elige día y hora'}</StepTitle>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={isCurrentMonth}
              onClick={() => changeMonth(-1)}
              className="rounded-lg p-2 text-neutral-300 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeftIcon />
            </button>
            <p className="font-medium capitalize">{monthLabel(ym.year, ym.month)}</p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => changeMonth(1)}
              className="rounded-lg p-2 text-neutral-300 hover:bg-white/10"
            >
              <ChevronRightIcon />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500">
            {WEEK_HEADER.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="relative">
            {slots.isFetching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-900/60">
                <Spinner />
              </div>
            )}
            <div className="grid grid-cols-7 gap-1">
              {monthGrid(ym.year, ym.month)
                .flat()
                .map((key, i) => {
                  if (!key) return <span key={`pad-${i}`} />
                  const available = byDay.has(key)
                  const selected = key === day
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!available}
                      aria-pressed={selected}
                      aria-label={`${Number(key.slice(8))}${available ? ', disponible' : ', sin huecos'}`}
                      onClick={() => pickDay(key)}
                      className={`aspect-square rounded-lg text-sm transition-colors ${
                        selected
                          ? 'bg-white font-semibold text-neutral-950'
                          : available
                            ? 'bg-white/10 font-medium text-white hover:bg-white/20'
                            : 'cursor-default text-neutral-600'
                      }`}
                    >
                      {Number(key.slice(8))}
                    </button>
                  )
                })}
            </div>
          </div>
          {slots.error && <ErrorText>{toMessage(slots.error)}</ErrorText>}
          {slots.data && byDay.size === 0 && (
            <p className="mt-3 text-sm text-neutral-400">
              No quedan huecos este mes. Prueba con el siguiente.
            </p>
          )}
        </div>

        <div>
          {!day ? (
            <p className="text-sm text-neutral-400">
              Los días resaltados tienen huecos libres. Elige uno.
            </p>
          ) : product.full_day ? (
            <p className="text-sm text-neutral-300">
              Has elegido el{' '}
              <span className="font-medium text-white">
                {madridLongDate(daySlots[0]!.starts_at)}
              </span>{' '}
              (día completo).
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-neutral-300 first-letter:uppercase">
                {madridLongDate(daySlots[0]!.starts_at)}
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {daySlots.map((s) => {
                  const selected = slot?.starts_at === s.starts_at
                  return (
                    <button
                      key={s.starts_at}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSlot(s)}
                      className={`rounded-lg border px-2 py-2 text-sm tabular-nums transition-colors ${
                        selected
                          ? 'border-white bg-white font-semibold text-neutral-950'
                          : 'border-white/15 hover:border-white/40 hover:bg-white/5'
                      }`}
                    >
                      {madridTime(s.starts_at)}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-xs text-neutral-500">Horas de España peninsular.</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function Confirm({
  product,
  slot,
  onDone,
  onSlotLost,
}: {
  product: BookingProduct
  slot: Slot
  onDone: (b: Booking) => void
  onSlotLost: () => void
}) {
  const request = useRequestBooking()
  const [note, setNote] = useState('')

  const submit = async () => {
    try {
      const booking = await request.mutateAsync({
        productId: product.id,
        startsAt: slot.starts_at,
        note: note.trim() || null,
      })
      onDone(booking)
    } catch (err) {
      if (toMessage(err).startsWith('Ese hueco')) onSlotLost()
    }
  }

  return (
    <section className={panel}>
      <StepTitle n={3}>Confirma tu solicitud</StepTitle>
      <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
        <dt className="text-neutral-400">Servicio</dt>
        <dd>{product.name}</dd>
        <dt className="text-neutral-400">Fecha</dt>
        <dd className="first-letter:uppercase">
          {madridLongDate(slot.starts_at)}
          {!product.full_day && `, de ${madridTime(slot.starts_at)} a ${madridTime(slot.ends_at)}`}
        </dd>
        {product.deposit_cents ? (
          <>
            <dt className="text-neutral-400">Señal</dt>
            <dd>{formatEuros(product.deposit_cents)} (se paga cuando el fotógrafo acepte)</dd>
          </>
        ) : null}
      </dl>
      <label htmlFor="booking-note" className="mb-1.5 block text-sm text-neutral-300">
        Comentarios (opcional)
      </label>
      <textarea
        id="booking-note"
        rows={3}
        maxLength={1000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Lugar, número de personas, ideas…"
        className="block w-full rounded-lg border border-white/15 bg-neutral-950 px-3.5 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none"
      />
      {request.error && <ErrorText>{toMessage(request.error)}</ErrorText>}
      <button
        type="button"
        onClick={submit}
        disabled={request.isPending}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-200 disabled:opacity-60"
      >
        {request.isPending && <Spinner className="size-4" />}
        Solicitar reserva
      </button>
      <p className="mt-3 text-xs text-neutral-500">
        Tu solicitud reserva el hueco durante 48 horas mientras el fotógrafo la revisa.
      </p>
    </section>
  )
}

function BookingRequested({ booking, product }: { booking: Booking; product: BookingProduct }) {
  return (
    <section className={`${panel} text-center`}>
      <p className="text-sm tracking-widest text-neutral-400 uppercase">Solicitud enviada</p>
      <h2 className="mt-2 font-display text-3xl">¡Gracias!</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-neutral-300">
        Hemos reservado tu hueco para <strong className="text-white">{product.name}</strong> el{' '}
        <span className="first-letter:lowercase">{madridLongDate(booking.starts_at)}</span>
        {!product.full_day && ` a las ${madridTime(booking.starts_at)}`}. El fotógrafo revisará tu
        solicitud y te avisaremos cuando la acepte.
      </p>
      <p className="mt-4 text-sm text-neutral-400">
        Código de reserva:{' '}
        <span className="font-mono text-base font-semibold text-white">{booking.code}</span>
      </p>
      <Link
        to="/my/reservas"
        className="mt-6 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-neutral-950 hover:bg-neutral-200"
      >
        Ver mis reservas
      </Link>
    </section>
  )
}

function StepTitle({ n, children }: { n: number; children: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-3 font-medium">
      <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-sm">
        {n}
      </span>
      {children}
    </h2>
  )
}

function Loading() {
  return (
    <div className="flex justify-center py-6 text-neutral-500">
      <Spinner />
    </div>
  )
}

function ErrorText({ children }: { children: string }) {
  return (
    <p role="alert" className="mt-3 text-sm text-red-400">
      {children}
    </p>
  )
}
