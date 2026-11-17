import { zodResolver } from '@hookform/resolvers/zod'
import { inviteClientSchema } from '@galeria/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Alert, Button, Spinner, TextField } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useGalleryAccess, useInviteClient, useRevokeAccess } from '../hooks/useGalleryAccess'
import { formatDate, isExpired } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'
import type { GalleryAccess, InviteResult } from '../services/galleryAccessService'

const emailOnlySchema = inviteClientSchema.pick({ email: true })
type EmailValues = z.infer<typeof emailOnlySchema>

export function GalleryClientsCard({ gallery }: { gallery: Gallery }) {
  const access = useGalleryAccess(gallery.id)
  const invite = useInviteClient(gallery.id)
  const revoke = useRevokeAccess(gallery.id)
  const [result, setResult] = useState<{ email: string; data: InviteResult } | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailValues>({ resolver: zodResolver(emailOnlySchema) })

  const sendInvite = async (email: string) => {
    setResult(null)
    try {
      const data = await invite.mutateAsync(email)
      setResult({ email, data })
      reset({ email: '' })
    } catch {
      // Shown through invite.error
    }
  }

  const onRevoke = (row: GalleryAccess) => {
    const ok = window.confirm(`¿Quitar el acceso de ${row.email} a esta galería?`)
    if (ok) revoke.mutate(row.email)
  }

  const error = invite.error ?? revoke.error ?? access.error

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="font-medium text-stone-900">Clientes con acceso</h2>
      <p className="mt-1 text-sm text-stone-500">
        Invita por email. El cliente entra con ese email y la galería aparece en su cuenta.
        {gallery.status !== 'published' && ' No la verá hasta que la publiques.'}
      </p>

      <form
        onSubmit={handleSubmit(({ email }) => sendInvite(email))}
        noValidate
        className="mt-4 flex flex-wrap items-start gap-3"
      >
        <TextField
          className="min-w-60 flex-1"
          label="Email del cliente"
          type="email"
          autoComplete="off"
          placeholder="cliente@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" className="mt-7" loading={invite.isPending}>
          Invitar
        </Button>
      </form>

      <div className="mt-4 space-y-3">
        {error && <Alert tone="error">{toMessage(error)}</Alert>}
        {result && <InviteNotice email={result.email} result={result.data} />}
      </div>

      <div className="mt-6">
        {access.isPending ? (
          <div className="flex justify-center py-4 text-stone-400">
            <Spinner />
          </div>
        ) : access.data?.length ? (
          <ul className="divide-y divide-stone-100">
            {access.data.map((row) => (
              <AccessRow
                key={row.email}
                row={row}
                busy={invite.isPending || revoke.isPending}
                onRenew={() => sendInvite(row.email)}
                onRevoke={() => onRevoke(row)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-500">Todavía no has invitado a nadie.</p>
        )}
      </div>
    </section>
  )
}

function InviteNotice({ email, result }: { email: string; result: InviteResult }) {
  const [copied, setCopied] = useState(false)

  if (result.status === 'already_member') {
    return <Alert tone="info">{email} ya tiene acceso a esta galería.</Alert>
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.link)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <Alert tone="success">
      <p>
        {result.emailed
          ? `Invitación enviada a ${email}. También puedes compartir el enlace:`
          : `Invitación creada para ${email}. Copia el enlace y envíaselo (por ejemplo, por WhatsApp):`}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded bg-white/70 px-2 py-1 text-xs">
          {result.link}
        </code>
        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={copy}>
          {copied ? 'Copiado' : 'Copiar enlace'}
        </Button>
      </div>
      <p className="mt-2 text-xs opacity-80">
        Solo se muestra ahora. Caduca el {formatDate(result.expiresAt)}.
      </p>
    </Alert>
  )
}

interface AccessRowProps {
  row: GalleryAccess
  busy: boolean
  onRenew: () => void
  onRevoke: () => void
}

function AccessRow({ row, busy, onRenew, onRevoke }: AccessRowProps) {
  const accepted = row.accepted_at !== null
  const expired = !accepted && isExpired(row.token_expires_at)

  let status: string
  if (accepted) status = `Aceptó el ${formatDate(row.accepted_at!)}`
  else if (expired) status = 'Invitación caducada'
  else if (row.token_expires_at)
    status = `Pendiente · caduca el ${formatDate(row.token_expires_at)}`
  else status = 'Pendiente'

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-stone-900">{row.email}</p>
        <p className={`text-xs ${expired ? 'text-red-600' : 'text-stone-500'}`}>{status}</p>
      </div>
      <div className="flex gap-2">
        {!accepted && (
          <Button variant="ghost" className="px-3 py-1.5 text-xs" disabled={busy} onClick={onRenew}>
            Nuevo enlace
          </Button>
        )}
        <Button
          variant="ghost"
          className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
          disabled={busy}
          onClick={onRevoke}
        >
          Quitar acceso
        </Button>
      </div>
    </li>
  )
}
