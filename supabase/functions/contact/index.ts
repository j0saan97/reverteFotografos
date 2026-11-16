import { contactSchema } from '@galeria/shared'
import { adminClient } from '../_shared/clients.ts'
import { corsHeaders, json } from '../_shared/cors.ts'

// contact — public website contact form
// 1. Validate with contactSchema (honeypot `website` must be empty)
// 2. Store in contact_requests (service role; no client insert grant)
// 3. Notify the studio by email via Resend if configured

const SESSION_LABELS: Record<string, string> = {
  wedding: 'Boda',
  portrait: 'Retrato',
  event: 'Evento',
  family: 'Familia',
  other: 'Otro',
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const body = await req.json().catch(() => null)
  // Bots fill the hidden field: pretend success and drop it
  if (body && typeof body.website === 'string' && body.website.length > 0) {
    return json({ ok: true })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) return json({ error: 'invalid body' }, 400)
  const c = parsed.data

  const { error } = await adminClient()
    .from('contact_requests')
    .insert({
      name: c.name,
      email: c.email,
      phone: c.phone || null,
      session_type: c.sessionType,
      event_date: c.eventDate || null,
      message: c.message,
    })
  if (error) return json({ error: 'could not save request' }, 500)

  const resendKey = Deno.env.get('RESEND_API_KEY')
  const notifyTo = Deno.env.get('CONTACT_NOTIFY_EMAIL')
  if (resendKey && notifyTo) {
    const rows = [
      ['Nombre', c.name],
      ['Email', c.email],
      ['Teléfono', c.phone || '—'],
      ['Tipo de sesión', SESSION_LABELS[c.sessionType] ?? c.sessionType],
      ['Fecha', c.eventDate || '—'],
    ]
    const html = `<h2>Nueva solicitud de contacto</h2>
<table>${rows.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v!)}</td></tr>`).join('')}</table>
<p>${escapeHtml(c.message).replace(/\n/g, '<br>')}</p>`
    // Email failure must not lose the request: it is already stored
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('CONTACT_FROM_EMAIL') ?? 'Web <onboarding@resend.dev>',
        to: notifyTo,
        reply_to: c.email,
        subject: `Contacto web: ${c.name} (${SESSION_LABELS[c.sessionType] ?? c.sessionType})`,
        html,
      }),
    }).catch(() => null)
  }

  return json({ ok: true })
})
