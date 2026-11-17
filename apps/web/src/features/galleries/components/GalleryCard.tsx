import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArchiveIcon,
  AtIcon,
  ClockIcon,
  DownloadIcon,
  EuroIcon,
  GalleryIcon,
  HeartIcon,
  LockIcon,
  MailIcon,
  SendIcon,
  TagIcon,
  TrashIcon,
  WhatsAppIcon,
} from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useDeleteGallery, useSetGalleryStatus, useUpdateGallery } from '../hooks/useGalleries'
import { useSendGalleryLink } from '../hooks/useSendGalleryLink'
import { formatDate, isExpired } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'
import { GalleryStatusBadge } from './GalleryStatusBadge'

export function GalleryCard({ gallery }: { gallery: Gallery }) {
  const expired = isExpired(gallery.expires_at)
  const href = `/galleries/${gallery.id}`

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200 bg-white transition-shadow hover:shadow-md">
      <Link to={href} tabIndex={-1} aria-hidden="true" className="block">
        {/* Cover photo arrives with uploads (F3.6) */}
        <div className="flex aspect-[4/3] items-center justify-center bg-stone-100 text-stone-300">
          <GalleryIcon className="size-10" />
        </div>
      </Link>

      <div className="space-y-2 px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate font-medium text-stone-900">
              <Link to={href} className="hover:underline">
                {gallery.title}
              </Link>
            </h2>
            <p className="truncate text-sm text-stone-500">
              {gallery.client_name ?? 'Sin cliente asignado'}
            </p>
          </div>
          <GalleryStatusBadge status={gallery.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
          <span>Creada el {formatDate(gallery.created_at)}</span>
          {gallery.has_pin && (
            <span className="inline-flex items-center gap-1">
              <LockIcon className="size-3.5" /> PIN
            </span>
          )}
          {gallery.expires_at && (
            <span
              className={`inline-flex items-center gap-1 ${expired ? 'font-medium text-red-600' : ''}`}
            >
              <ClockIcon className="size-3.5" />
              {expired ? 'Caducada' : `Caduca el ${formatDate(gallery.expires_at)}`}
            </span>
          )}
        </div>
      </div>

      <CardActions gallery={gallery} />
    </article>
  )
}

function CardActions({ gallery }: { gallery: Gallery }) {
  const send = useSendGalleryLink(gallery)
  const update = useUpdateGallery(gallery.id)
  const setStatus = useSetGalleryStatus(gallery.id)
  const remove = useDeleteGallery()
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  const run = async (action: () => Promise<unknown>, ok?: string) => {
    setNotice(null)
    try {
      const result = await action()
      const text = typeof result === 'string' ? result : ok
      if (text) setNotice({ tone: 'ok', text })
    } catch (err) {
      setNotice({ tone: 'error', text: toMessage(err) })
    }
  }

  const archived = gallery.status === 'archived'
  const busy = send.isPending || update.isPending || setStatus.isPending || remove.isPending

  const onDelete = () => {
    const ok = window.confirm(
      `¿Eliminar la galería "${gallery.title}"? Se borrarán también sus fotos, selecciones y mensajes. No se puede deshacer.`,
    )
    if (ok) void run(() => remove.mutateAsync(gallery.id))
  }

  return (
    <div className="px-4 pt-3 pb-4">
      <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
        {/* Status indicators (left) */}
        <div className="flex items-center gap-0.5">
          <Indicator
            on={gallery.sent_at !== null}
            label={
              gallery.sent_at
                ? `Enlace enviado el ${formatDate(gallery.sent_at)}`
                : 'Enlace no enviado'
            }
          >
            <SendIcon />
          </Indicator>
          {/* Live selection count arrives with F5 */}
          <Indicator on={false} label="Fotos seleccionadas por el cliente: 0">
            <HeartIcon />
            <span className="text-[11px] font-medium tabular-nums">0</span>
          </Indicator>
          <IconButton
            label={
              gallery.paid
                ? 'Pagada (pulsa para marcar pendiente)'
                : 'Pago pendiente (pulsa para marcar pagada)'
            }
            pressed={gallery.paid}
            on={gallery.paid}
            disabled={busy}
            onClick={() => run(() => update.mutateAsync({ paid: !gallery.paid }))}
          >
            <EuroIcon />
          </IconButton>
          <Indicator on={false} label="Productos extra: ninguno">
            <TagIcon />
          </Indicator>
          <Indicator on={false} label="Permiso para publicar: no concedido">
            <AtIcon />
          </Indicator>
          <IconButton label="Descargar (próximamente)" disabled>
            <DownloadIcon />
          </IconButton>
        </div>

        {/* Actions (right) */}
        <div className="flex items-center gap-0.5">
          <IconButton
            label="Enviar enlace por email"
            disabled={busy}
            onClick={() => run(() => send.mutateAsync('email'))}
          >
            <MailIcon />
          </IconButton>
          <IconButton
            label="Enviar enlace por WhatsApp"
            disabled={busy}
            onClick={() => run(() => send.mutateAsync('whatsapp'))}
          >
            <WhatsAppIcon />
          </IconButton>
          <IconButton
            label={archived ? 'Restaurar como borrador' : 'Archivar'}
            disabled={busy}
            onClick={() =>
              run(
                () => setStatus.mutateAsync(archived ? 'draft' : 'archived'),
                archived ? 'Galería restaurada como borrador.' : 'Galería archivada.',
              )
            }
          >
            <ArchiveIcon />
          </IconButton>
          <IconButton label="Eliminar" danger disabled={busy} onClick={onDelete}>
            <TrashIcon />
          </IconButton>
        </div>
      </div>

      {notice && (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`mt-2 text-xs ${notice.tone === 'error' ? 'text-red-600' : 'text-emerald-700'}`}
        >
          {notice.text}
        </p>
      )}
    </div>
  )
}

const ICON_BOX =
  'inline-flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-md px-1.5 [&_svg]:size-4'
const toneClass = (on: boolean) => (on ? 'text-emerald-600' : 'text-stone-300')

function Indicator({ on, label, children }: { on: boolean; label: string; children: ReactNode }) {
  return (
    <span role="img" aria-label={label} title={label} className={`${ICON_BOX} ${toneClass(on)}`}>
      {children}
    </span>
  )
}

interface IconButtonProps {
  label: string
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  pressed?: boolean
  on?: boolean
  danger?: boolean
}

function IconButton({ label, children, onClick, disabled, pressed, on, danger }: IconButtonProps) {
  const color =
    on !== undefined
      ? toneClass(on)
      : danger
        ? 'text-stone-500 hover:bg-red-50 hover:text-red-700'
        : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={`${ICON_BOX} transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 ${color}`}
    >
      {children}
    </button>
  )
}
