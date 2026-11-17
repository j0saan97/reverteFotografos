import { useQuery } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, FullPageSpinner, Spinner } from '@/shared/components'
import { FunctionError } from '@/shared/lib/api'
import { toMessage } from '@/shared/lib/errors'
import { AuthShell } from '../components/AuthShell'
import { useSession } from '../hooks/useSession'
import { pendingInvite } from '../lib/pendingInvite'
import { authService } from '../services/authService'

const primaryLink =
  'inline-flex w-full items-center justify-center rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800'
const secondaryLink =
  'inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-stone-900 ring-1 ring-stone-300 ring-inset transition-colors hover:bg-stone-50'

export function AcceptInvitePage() {
  const { token = '' } = useParams()
  const { session, profile, loading } = useSession()

  // Remember the invite until it is redeemed (survives login / email confirmation)
  useEffect(() => {
    if (token) pendingInvite.set(token)
  }, [token])

  if (loading) return <FullPageSpinner />

  if (!session) {
    const from = pendingInvite.path(token)
    return (
      <AuthShell
        title="Te han invitado a una galería"
        subtitle="Para verla, entra con el email al que te llegó la invitación."
      >
        <div className="space-y-3">
          <Link to="/login" state={{ from }} className={primaryLink}>
            Iniciar sesión
          </Link>
          <Link to="/register" className={secondaryLink}>
            Crear cuenta
          </Link>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-stone-500">
          Si creas una cuenta, confirma tu email y vuelve a iniciar sesión: te traeremos de vuelta a
          esta invitación.
        </p>
      </AuthShell>
    )
  }

  if (profile?.role === 'photographer') {
    return (
      <InviteResult title="Invitación para clientes">
        <Alert tone="info">
          Has iniciado sesión como fotógrafo. Las invitaciones son para clientes: cierra sesión y
          entra con la cuenta del cliente.
        </Alert>
        <SignOutButton />
      </InviteResult>
    )
  }

  return <AcceptInvite token={token} email={session.user.email ?? ''} userId={session.user.id} />
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_token: 'Este enlace no es válido o ya se ha usado.',
  expired: 'La invitación ha caducado. Pide a tu fotógrafo que te envíe una nueva.',
  not_a_client: 'Esta cuenta no puede aceptar invitaciones de galería.',
}

function AcceptInvite({ token, email, userId }: { token: string; email: string; userId: string }) {
  const accept = useQuery({
    queryKey: ['accept-invite', token, userId],
    queryFn: () => authService.acceptInvite(token),
    retry: false,
    staleTime: Infinity,
  })

  const err = accept.error
  const wrongEmail = err instanceof FunctionError && err.code === 'wrong_email'

  // Done (or definitively failed): stop redirecting here after login.
  // A wrong-email error keeps it, so signing in with the right account resumes it.
  useEffect(() => {
    if (accept.isSuccess || (accept.isError && !wrongEmail)) pendingInvite.clear()
  }, [accept.isSuccess, accept.isError, wrongEmail])

  if (accept.isPending) {
    return (
      <InviteResult title="Aceptando invitación…">
        <div className="flex justify-center py-6 text-stone-400">
          <Spinner className="size-8" />
        </div>
      </InviteResult>
    )
  }

  if (err) {
    if (wrongEmail) {
      return (
        <InviteResult title="Esta invitación es para otra cuenta">
          <Alert tone="error">
            La invitación se envió a <strong>{String(err.data.invitedEmail ?? '')}</strong> y has
            iniciado sesión como <strong>{email}</strong>. Cierra sesión y entra con el email
            correcto.
          </Alert>
          <SignOutButton />
        </InviteResult>
      )
    }
    const message =
      err instanceof FunctionError
        ? (ERROR_MESSAGES[err.code] ?? 'No se pudo aceptar la invitación.')
        : toMessage(err)
    return (
      <InviteResult title="No se pudo aceptar la invitación">
        <Alert tone="error">{message}</Alert>
        <Link to="/my" className={`${secondaryLink} mt-6`}>
          Ir a mis galerías
        </Link>
      </InviteResult>
    )
  }

  const { slug, title, published } = accept.data
  return (
    <InviteResult title="¡Invitación aceptada!">
      <Alert tone="success">
        Ya tienes acceso a <strong>{title}</strong>.
        {!published && ' Tu fotógrafo aún no la ha publicado: podrás verla en cuanto lo haga.'}
      </Alert>
      <div className="mt-6 space-y-3">
        {published && (
          <Link to={`/my/${slug}`} className={primaryLink}>
            Ver galería
          </Link>
        )}
        <Link to="/my" className={published ? secondaryLink : primaryLink}>
          Ir a mis galerías
        </Link>
      </div>
    </InviteResult>
  )
}

function InviteResult({ title, children }: { title: string; children: ReactNode }) {
  return <AuthShell title={title}>{children}</AuthShell>
}

function SignOutButton() {
  return (
    <Button variant="secondary" fullWidth className="mt-6" onClick={() => authService.signOut()}>
      Cerrar sesión
    </Button>
  )
}
