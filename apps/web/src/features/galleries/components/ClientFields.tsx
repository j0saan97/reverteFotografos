import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { TextField } from '@/shared/components'
import { emptyToNull } from '../lib/formValues'

interface ClientValues {
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
}

interface ClientFieldsProps<T extends ClientValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
}

// Shared by "Nueva galería" and gallery settings
export function ClientFields<T extends ClientValues>({ register, errors }: ClientFieldsProps<T>) {
  // Generic forms: narrow to the client fields this component owns
  const reg = register as unknown as UseFormRegister<ClientValues>
  const err = errors as FieldErrors<ClientValues>
  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 text-sm font-medium text-stone-900">Cliente</legend>
      <TextField
        label="Nombre del cliente"
        placeholder="Ana García"
        autoComplete="off"
        error={err.clientName?.message}
        {...reg('clientName')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Email"
          type="email"
          autoComplete="off"
          placeholder="cliente@email.com"
          hint="Para enviarle el enlace por email."
          error={err.clientEmail?.message}
          {...reg('clientEmail', { setValueAs: emptyToNull })}
        />
        <TextField
          label="Teléfono"
          type="tel"
          autoComplete="off"
          placeholder="600 123 456"
          hint="Para enviarle el enlace por WhatsApp."
          error={err.clientPhone?.message}
          {...reg('clientPhone', { setValueAs: emptyToNull })}
        />
      </div>
    </fieldset>
  )
}
