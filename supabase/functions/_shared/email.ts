// Transactional email through Resend. Returns false (never throws) when Resend
// isn't configured or the request fails: callers decide whether that matters.

export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

interface EmailInput {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: EmailInput): Promise<boolean> {
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('CONTACT_FROM_EMAIL') ?? 'Galería <onboarding@resend.dev>',
        to,
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
