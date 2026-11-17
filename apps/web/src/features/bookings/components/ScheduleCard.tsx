import { zodResolver } from '@hookform/resolvers/zod'
import { availabilityRuleSchema, WEEKDAYS } from '@galeria/shared'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Alert, Button, CloseIcon, Select, Spinner, TextField } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useCreateRule, useDeleteRule, useRules } from '../hooks/useBookingAdmin'
import { shortTime } from '../lib/bookingFormat'
import { SectionCard } from './SectionCard'

type Values = z.infer<typeof availabilityRuleSchema>

const WEEKDAY_OPTIONS = WEEKDAYS.map((d) => ({ value: String(d.value), label: d.label }))

export function ScheduleCard() {
  const rules = useRules()
  const create = useCreateRule()
  const remove = useDeleteRule()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(availabilityRuleSchema),
    defaultValues: { weekday: 1, startTime: '10:00', endTime: '14:00' },
  })

  const onSubmit = handleSubmit((v) => create.mutate(v))
  const error = create.error ?? remove.error ?? rules.error

  return (
    <SectionCard
      title="Horario semanal"
      description="Franjas en las que aceptas reservas. Puedes poner varias por día (mañana y tarde)."
    >
      {error && <Alert tone="error">{toMessage(error)}</Alert>}

      {rules.isPending ? (
        <div className="flex justify-center py-4 text-stone-400">
          <Spinner />
        </div>
      ) : (
        <ul className="divide-y divide-stone-100">
          {WEEKDAYS.map((day) => {
            const ranges = rules.data?.filter((r) => r.weekday === day.value) ?? []
            return (
              <li key={day.value} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="w-24 text-sm font-medium text-stone-700">{day.label}</span>
                {ranges.length === 0 ? (
                  <span className="text-sm text-stone-400">Cerrado</span>
                ) : (
                  ranges.map((r) => (
                    <span
                      key={r.id}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-100 py-1 pr-1 pl-3 text-sm text-stone-800"
                    >
                      {shortTime(r.start_time)}–{shortTime(r.end_time)}
                      <button
                        type="button"
                        aria-label={`Quitar ${day.label} ${shortTime(r.start_time)}–${shortTime(r.end_time)}`}
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(r.id)}
                        className="rounded-full p-1 text-stone-500 hover:bg-stone-200 hover:text-stone-900"
                      >
                        <CloseIcon className="size-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </li>
            )
          })}
        </ul>
      )}

      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start"
      >
        <Select
          label="Día"
          options={WEEKDAY_OPTIONS}
          {...register('weekday', { valueAsNumber: true })}
        />
        <TextField
          label="Desde"
          type="time"
          error={errors.startTime?.message}
          {...register('startTime')}
        />
        <TextField
          label="Hasta"
          type="time"
          error={errors.endTime?.message}
          {...register('endTime')}
        />
        <Button type="submit" className="sm:mt-7" loading={create.isPending}>
          Añadir franja
        </Button>
      </form>
    </SectionCard>
  )
}
