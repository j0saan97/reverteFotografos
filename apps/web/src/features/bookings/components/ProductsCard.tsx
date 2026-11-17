import { zodResolver } from '@hookform/resolvers/zod'
import { bookingProductSchema, centsToEuros, eurosToCents, formatEuros } from '@galeria/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Alert, Button, Checkbox, Spinner, TextArea, TextField } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useDeleteProduct, useProducts, useSaveProduct } from '../hooks/useBookingAdmin'
import { formatDuration } from '../lib/bookingFormat'
import type { BookingProduct } from '../services/bookingAdminService'
import { SectionCard } from './SectionCard'

type Values = z.infer<typeof bookingProductSchema>

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)
const toNumberOrNull = (v: unknown) =>
  v === '' || v === null || v === undefined ? null : Number(String(v).replace(',', '.'))

const EMPTY: Values = {
  name: '',
  description: null,
  fullDay: false,
  durationMinutes: 60,
  priceEuros: null,
  depositEuros: null,
  active: true,
}

function toValues(p: BookingProduct): Values {
  return {
    name: p.name,
    description: p.description,
    fullDay: p.full_day,
    durationMinutes: p.duration_minutes,
    priceEuros: centsToEuros(p.price_cents),
    depositEuros: centsToEuros(p.deposit_cents),
    active: p.active,
  }
}

export function ProductsCard() {
  const products = useProducts()
  const remove = useDeleteProduct()
  const [editing, setEditing] = useState<BookingProduct | 'new' | null>(null)

  const onDelete = (p: BookingProduct) => {
    if (window.confirm(`¿Eliminar el producto "${p.name}"?`)) remove.mutate(p.id)
  }

  return (
    <SectionCard
      title="Productos"
      description="Lo que tus clientes pueden reservar: boda, comunión, sesión de fotos…"
      action={
        editing === null && (
          <Button variant="secondary" onClick={() => setEditing('new')}>
            Añadir producto
          </Button>
        )
      }
    >
      {remove.error && <Alert tone="error">{toMessage(remove.error)}</Alert>}

      {editing !== null && (
        <ProductForm
          key={editing === 'new' ? 'new' : editing.id}
          product={editing === 'new' ? null : editing}
          onDone={() => setEditing(null)}
        />
      )}

      {products.isPending ? (
        <div className="flex justify-center py-4 text-stone-400">
          <Spinner />
        </div>
      ) : products.data?.length ? (
        <ul className="divide-y divide-stone-100">
          {products.data.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-medium text-stone-900">
                  {p.name}
                  {!p.active && (
                    <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-normal text-stone-500">
                      Inactivo
                    </span>
                  )}
                </p>
                <p className="text-sm text-stone-500">
                  {p.full_day ? 'Día completo' : formatDuration(p.duration_minutes ?? 0)}
                  {p.price_cents !== null && ` · ${formatEuros(p.price_cents)}`}
                  {p.deposit_cents ? ` · señal ${formatEuros(p.deposit_cents)}` : ' · sin señal'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setEditing(p)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  disabled={remove.isPending}
                  onClick={() => onDelete(p)}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        editing === null && <p className="text-sm text-stone-500">Aún no hay productos.</p>
      )}
    </SectionCard>
  )
}

function ProductForm({ product, onDone }: { product: BookingProduct | null; onDone: () => void }) {
  const save = useSaveProduct()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(bookingProductSchema),
    defaultValues: product ? toValues(product) : EMPTY,
  })
  const fullDay = watch('fullDay')

  const onSubmit = handleSubmit(async (v) => {
    try {
      await save.mutateAsync({
        id: product?.id,
        input: {
          name: v.name,
          description: v.description,
          full_day: v.fullDay,
          duration_minutes: v.fullDay ? null : v.durationMinutes,
          price_cents: eurosToCents(v.priceEuros),
          deposit_cents: eurosToCents(v.depositEuros),
          active: v.active,
        },
      })
      onDone()
    } catch {
      // Shown through save.error
    }
  })

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mb-6 space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-4"
    >
      {save.error && <Alert tone="error">No se pudo guardar: {toMessage(save.error)}</Alert>}
      <TextField
        label="Nombre"
        placeholder="Sesión de fotos"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextArea
        label="Descripción (opcional)"
        rows={2}
        error={errors.description?.message}
        {...register('description', { setValueAs: emptyToNull })}
      />
      <Checkbox
        label="Ocupa el día completo (bodas, eventos…)"
        {...register('fullDay', {
          onChange: (e: { target: { checked: boolean } }) => {
            if (e.target.checked) setValue('durationMinutes', null, { shouldValidate: true })
          },
        })}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {!fullDay && (
          <TextField
            label="Duración (minutos)"
            type="number"
            min={15}
            step={15}
            inputMode="numeric"
            error={errors.durationMinutes?.message}
            {...register('durationMinutes', { setValueAs: toNumberOrNull })}
          />
        )}
        <TextField
          label="Precio (€)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Opcional"
          error={errors.priceEuros?.message}
          {...register('priceEuros', { setValueAs: toNumberOrNull })}
        />
        <TextField
          label="Señal para reservar (€)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Sin señal"
          hint="Vacío o 0: al aceptar queda confirmada."
          error={errors.depositEuros?.message}
          {...register('depositEuros', { setValueAs: toNumberOrNull })}
        />
      </div>
      <Checkbox label="Activo (los clientes pueden reservarlo)" {...register('active')} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" loading={save.isPending}>
          {product ? 'Guardar cambios' : 'Añadir producto'}
        </Button>
      </div>
    </form>
  )
}
