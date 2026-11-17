import { useState, type ReactNode } from 'react'
import {
  ArchiveIcon,
  AtIcon,
  DownloadIcon,
  EuroIcon,
  HeartIcon,
  MailIcon,
  SendIcon,
  TagIcon,
  TrashIcon,
  WhatsAppIcon,
} from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import {
  useDeleteGallery,
  useMoveToTrash,
  useRestoreGallery,
  useSetGalleryStatus,
  useUpdateGallery,
} from '../hooks/useGalleries'
import { useSendGalleryLink } from '../hooks/useSendGalleryLink'
import { formatDate } from '../lib/galleryFormat'
import type { Gallery } from '../services/galleryService'

type Notice = { tone: 'ok' | 'error'; text: string } | null

function useNotice() {
  const [notice, setNotice] = useState<Notice>(null)
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
  return { notice, run }
}

// The 10 icons of a gallery (card and list views). In the trash: restore / delete forever.
export function GalleryActions({ gallery }: { gallery: Gallery }) {
  return gallery.deleted_at ? (
    <TrashActions gallery={gallery} />
  ) : (
    <ActiveActions gallery={gallery} />
  )
}

function ActiveActions({ gallery }: { gallery: Gallery }) {
  const send = useSendGalleryLink(gallery)
  const update = useUpdateGallery(gallery.id)
  const setStatus = useSetGalleryStatus(gallery.id)
  const trash = useMoveToTrash(gallery.id)
  const { notice, run } = useNotice()

  const archived = gallery.status === 'archived'
  const busy = send.isPending || update.isPending || setStatus.isPending || trash.isPending

  return (
    <ActionsBar notice={notice}>
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
        <IconButton
          label="Mover a la papelera"
          danger
          disabled={busy}
          onClick={() => run(() => trash.mutateAsync())}
        >
          <TrashIcon />
        </IconButton>
      </div>
    </ActionsBar>
  )
}

function TrashActions({ gallery }: { gallery: Gallery }) {
  const restore = useRestoreGallery(gallery.id)
  const remove = useDeleteGallery()
  const { notice, run } = useNotice()
  const busy = restore.isPending || remove.isPending

  const onDelete = () => {
    const ok = window.confirm(
      `¿Eliminar definitivamente "${gallery.title}"? Se borrarán también sus fotos, selecciones y mensajes. No se puede deshacer.`,
    )
    if (ok) void run(() => remove.mutateAsync(gallery.id))
  }

  return (
    <ActionsBar notice={notice}>
      <span className="text-xs text-stone-500">
        En la papelera desde el {formatDate(gallery.deleted_at!)}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => restore.mutateAsync())}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 disabled:opacity-40"
        >
          Restaurar
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-40"
        >
          Eliminar definitivamente
        </button>
      </div>
    </ActionsBar>
  )
}

function ActionsBar({ notice, children }: { notice: Notice; children: ReactNode }) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">{children}</div>
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
