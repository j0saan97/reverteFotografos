import { zodResolver } from '@hookform/resolvers/zod'
import { availabilityBlockSchema } from '@galeria/shared'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Alert, Button, Spinner, TextField } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useBlocks, useCreateBlock, useDeleteBlock } from '../hooks/useBookingAdmin'
import { blockRange, formatBlock, toDateInput } from '../lib/bookingFormat'
import { SectionCard } from './SectionCard'

type Values = z.infer<typeof availabilityBlockSchema>

const emptyToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)

export function BlocksCard() {
  const blocks = useBlocks()
  const create = useCreateBlock()
  const remove = useDeleteBlock()
  const today = toDateInput(new Date())
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(availabilityBlockSchema),
    defaultValues: { startDate: today, endDate: today, reason: null },
  })

  const onSubmit = handleSubmit(async (v) => {
    try {
      await create.mutateAsync({ ...blockRange(v.startDate, v.endDate), reason: v.reason })
      reset({ startDate: today, endDate: today, reason: null })
    } catch {
      // Shown through create.error
    }
  })

  const error = create.error ?? remove.error ?? blocks.error

  return (
    <SectionCard
      title="Días bloqueados"
      description="Vacaciones u otros compromisos: esos días no se podrá reservar nada."
    >
      {error && <Alert tone="error">{toMessage(error)}</Alert>}

      {blocks.isPending ? (
        <div className="flex justify-center py-4 text-stone-400">
          <Spinner />
        </div>
      ) : blocks.data?.length ? (
        <ul className="divide-y divide-stone-100">
          {blocks.data.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-stone-900">
                  {formatBlock(b.starts_at, b.ends_at)}
                </p>
                {b.reason && <p className="text-xs text-stone-500">{b.reason}</p>}
              </div>
              <Button
                variant="ghost"
                className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
                disabled={remove.isPending}
                onClick={() => remove.mutate(b.id)}
              >
                Quitar
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-500">No tienes días bloqueados.</p>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-start"
      >
        <TextField
          label="Desde"
          type="date"
          min={today}
          error={errors.startDate?.message}
          {...register('startDate')}
        />
        <TextField
          label="Hasta"
          type="date"
          min={today}
          error={errors.endDate?.message}
          {...register('endDate')}
        />
        <TextField
          label="Motivo (opcional)"
          placeholder="Vacaciones"
          error={errors.reason?.message}
          {...register('reason', { setValueAs: emptyToNull })}
        />
        <Button type="submit" className="sm:mt-7" loading={create.isPending}>
          Bloquear
        </Button>
      </form>
    </SectionCard>
  )
}
