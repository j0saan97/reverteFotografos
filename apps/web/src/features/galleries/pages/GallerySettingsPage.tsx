import { zodResolver } from '@hookform/resolvers/zod'
import { galleryPinSchema, gallerySettingsSchema } from '@galeria/shared'
import { forwardRef, useState, type InputHTMLAttributes } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import type { z } from 'zod'
import { Alert, Button, LockIcon, PageHeader, TextField } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { GalleryNotFound, PageSpinner } from '../components/GalleryPageStates'
import { useGallery, useSetGalleryPin, useUpdateGallery } from '../hooks/useGalleries'
import { ClientFields } from '../components/ClientFields'
import { emptyToNull, toNumberOrNull } from '../lib/formValues'
import { dateInputToExpiresAt, expiresAtToDateInput } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'

type SettingsValues = z.infer<typeof gallerySettingsSchema>
type PinValues = z.infer<typeof galleryPinSchema>

const card = 'rounded-xl border border-stone-200 bg-white p-6'

export function GallerySettingsPage() {
  const { id = '' } = useParams()
  const { data: gallery, isPending, error } = useGallery(id)

  if (isPending) return <PageSpinner />
  if (error) return <Alert tone="error">No se pudo cargar la galería: {toMessage(error)}</Alert>
  if (!gallery) return <GalleryNotFound />

  return (
    <>
      <PageHeader
        back={{ to: `/galleries/${gallery.id}`, label: gallery.title }}
        title="Ajustes de la galería"
        description="Qué pueden hacer tus clientes y cómo acceden."
      />
      <div className="max-w-2xl space-y-6">
        <SettingsForm gallery={gallery} />
        <PinCard gallery={gallery} />
      </div>
    </>
  )
}

function SettingsForm({ gallery }: { gallery: Gallery }) {
  const update = useUpdateGallery(gallery.id)
  const [saved, setSaved] = useState(false)
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(gallerySettingsSchema),
    defaultValues: {
      title: gallery.title,
      // Galleries created before F2.7 have no client yet: the form asks for it
      clientName: gallery.client_name ?? '',
      clientEmail: gallery.client_email,
      clientPhone: gallery.client_phone,
      paid: gallery.paid,
      allowSelection: gallery.allow_selection,
      maxSelection: gallery.max_selection,
      allowDownload: gallery.allow_download,
      watermarkText: gallery.watermark_text,
      expiresAt: expiresAtToDateInput(gallery.expires_at),
    },
  })
  const allowSelection = watch('allowSelection')

  const onSubmit = handleSubmit(async (v) => {
    setSaved(false)
    try {
      await update.mutateAsync({
        title: v.title,
        client_name: v.clientName,
        client_email: v.clientEmail,
        client_phone: v.clientPhone,
        paid: v.paid,
        allow_selection: v.allowSelection,
        max_selection: v.allowSelection ? v.maxSelection : null,
        allow_download: v.allowDownload,
        watermark_text: v.watermarkText,
        expires_at: dateInputToExpiresAt(v.expiresAt),
      })
      reset(v)
      setSaved(true)
    } catch {
      // Shown through update.error
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className={`${card} space-y-6`}>
      {update.error && <Alert tone="error">No se pudo guardar: {toMessage(update.error)}</Alert>}
      {saved && !isDirty && <Alert tone="success">Cambios guardados.</Alert>}

      <TextField label="Título" error={errors.title?.message} {...register('title')} />

      <ClientFields register={register} errors={errors} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-stone-900">Pago</legend>
        <Checkbox label="El cliente ha pagado esta galería" {...register('paid')} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-medium text-stone-900">Selección de fotos</legend>
        <Checkbox
          label="El cliente puede marcar sus fotos favoritas"
          {...register('allowSelection', {
            // A hidden, invalid max would block saving without a visible error
            onChange: (e: { target: { checked: boolean } }) => {
              if (!e.target.checked) setValue('maxSelection', null, { shouldValidate: true })
            },
          })}
        />
        {allowSelection && (
          <TextField
            label="Máximo de fotos a elegir"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Sin límite"
            hint="Déjalo vacío para no poner límite."
            error={errors.maxSelection?.message}
            {...register('maxSelection', { setValueAs: toNumberOrNull })}
          />
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-medium text-stone-900">Descargas y protección</legend>
        <Checkbox label="El cliente puede descargar las fotos" {...register('allowDownload')} />
        <TextField
          label="Texto de la marca de agua"
          placeholder="Sin marca de agua"
          hint="Se aplica a las vistas previas que ve el cliente."
          error={errors.watermarkText?.message}
          {...register('watermarkText', { setValueAs: emptyToNull })}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-stone-900">Caducidad</legend>
        <TextField
          label="Disponible hasta"
          type="date"
          hint="Después de ese día los clientes dejan de verla. Vacío: no caduca."
          error={errors.expiresAt?.message}
          {...register('expiresAt', { setValueAs: emptyToNull })}
        />
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" loading={update.isPending} disabled={!isDirty}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

function PinCard({ gallery }: { gallery: Gallery }) {
  const setPin = useSetGalleryPin(gallery.id)
  const [notice, setNotice] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PinValues>({ resolver: zodResolver(galleryPinSchema) })

  const save = async (pin: string | null, message: string) => {
    setNotice(null)
    try {
      await setPin.mutateAsync(pin)
      reset({ pin: '' })
      setNotice(message)
    } catch {
      // Shown through setPin.error
    }
  }

  const onSubmit = handleSubmit(({ pin }) =>
    save(pin, gallery.has_pin ? 'PIN cambiado.' : 'PIN activado.'),
  )

  return (
    <section className={`${card} space-y-4`}>
      <div className="flex items-start gap-3">
        <LockIcon className="mt-0.5 text-stone-500" />
        <div>
          <h2 className="text-sm font-medium text-stone-900">PIN de acceso</h2>
          <p className="mt-1 text-sm text-stone-500">
            {gallery.has_pin
              ? 'Esta galería tiene PIN. Por seguridad no se puede mostrar: si lo has olvidado, pon uno nuevo.'
              : 'Opcional. Si lo activas, el cliente tendrá que introducirlo para abrir la galería.'}
          </p>
        </div>
      </div>

      {setPin.error && (
        <Alert tone="error">No se pudo guardar el PIN: {toMessage(setPin.error)}</Alert>
      )}
      {notice && <Alert tone="success">{notice}</Alert>}

      <form onSubmit={onSubmit} noValidate className="flex flex-wrap items-start gap-3">
        <TextField
          className="w-48"
          label={gallery.has_pin ? 'Nuevo PIN' : 'PIN'}
          inputMode="numeric"
          autoComplete="off"
          maxLength={8}
          placeholder="4 a 8 dígitos"
          error={errors.pin?.message}
          {...register('pin')}
        />
        <div className="flex gap-2 pt-7">
          <Button type="submit" loading={setPin.isPending && setPin.variables !== null}>
            {gallery.has_pin ? 'Cambiar PIN' : 'Activar PIN'}
          </Button>
          {gallery.has_pin && (
            <Button
              variant="ghost"
              loading={setPin.isPending && setPin.variables === null}
              onClick={() => save(null, 'PIN eliminado.')}
            >
              Quitar PIN
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: string }

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, ...rest },
  ref,
) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700">
      <input
        ref={ref}
        type="checkbox"
        className="size-4 rounded border-stone-300 accent-stone-900"
        {...rest}
      />
      {label}
    </label>
  )
})
