import { toWhatsAppNumber } from '@galeria/shared'
import { useMutation } from '@tanstack/react-query'
import { galleryAccessService } from '../services/galleryAccessService'
import type { Gallery } from '../services/galleryService'
import { useUpdateGallery } from './useGalleries'

export type SendChannel = 'email' | 'whatsapp'

export class SendLinkError extends Error {}

// Invitation link for the gallery's client. If the client already accepted,
// the invite can't be renewed: send them straight to the gallery instead.
async function clientLink(gallery: Gallery): Promise<{ link: string; emailed: boolean }> {
  if (!gallery.client_email) {
    throw new SendLinkError(
      'Añade el email del cliente en Ajustes: el enlace de acceso va ligado a su email.',
    )
  }
  const res = await galleryAccessService.invite(gallery.id, gallery.client_email)
  if (res.status === 'already_member') {
    return { link: `${window.location.origin}/my/${gallery.slug}`, emailed: false }
  }
  return { link: res.link, emailed: res.emailed }
}

function message(gallery: Gallery, link: string) {
  const hello = gallery.client_name ? `Hola ${gallery.client_name}` : 'Hola'
  return `${hello}, ya tienes disponible tu galería «${gallery.title}». Puedes verla aquí: ${link}`
}

export function useSendGalleryLink(gallery: Gallery) {
  const update = useUpdateGallery(gallery.id)

  return useMutation({
    mutationFn: async (channel: SendChannel): Promise<string> => {
      if (channel === 'whatsapp') {
        const phone = gallery.client_phone && toWhatsAppNumber(gallery.client_phone)
        if (!phone) throw new SendLinkError('Añade el teléfono del cliente en Ajustes.')
        // Open the tab now (inside the click) so the popup blocker allows it
        const tab = window.open('', '_blank')
        try {
          const { link } = await clientLink(gallery)
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message(gallery, link))}`
          if (tab) tab.location.href = url
          else window.location.href = url
        } catch (err) {
          tab?.close()
          throw err
        }
        await update.mutateAsync({ sent_at: new Date().toISOString() })
        return 'WhatsApp abierto con el mensaje listo para enviar.'
      }

      const { link, emailed } = await clientLink(gallery)
      if (!emailed) {
        // No email service configured yet: open the photographer's mail app
        const subject = `Tu galería «${gallery.title}»`
        window.location.href = `mailto:${gallery.client_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message(gallery, link))}`
      }
      await update.mutateAsync({ sent_at: new Date().toISOString() })
      return emailed
        ? `Enlace enviado por email a ${gallery.client_email}.`
        : 'Se ha abierto tu programa de correo con el mensaje listo para enviar.'
    },
  })
}
