import { zodResolver } from '@hookform/resolvers/zod'
import { newPasswordSchema, resetRequestSchema } from '@galeria/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import type { z } from 'zod'
import { Alert, Button, FullPageSpinner, TextField } from '@/shared/components'
import { AuthShell } from '../components/AuthShell'
import { useSession } from '../hooks/useSession'
import { authErrorMessage, authService, homePathFor } from '../services/authService'

// Two steps on the same route:
//  - no session: ask for the email and send the recovery link
//  - session (the recovery link signs the user in): set a new password
export function ResetPasswordPage() {
  const { session, loading } = useSession()
  if (loading) return <FullPageSpinner />
  return session ? <NewPasswordForm /> : <RequestResetForm />
}

const backToLogin = (
  <Link to="/login" className="font-medium text-stone-900 hover:underline">
    Volver a iniciar sesión
  </Link>
)

function RequestResetForm() {
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetRequestSchema>>({ resolver: zodResolver(resetRequestSchema) })

  const onSubmit = handleSubmit(async ({ email }) => {
    setError(null)
    try {
      const { error } = await authService.requestPasswordReset(email)
      if (error) return setError(authErrorMessage(error))
      setSentTo(email)
    } catch (err) {
      setError(authErrorMessage(err))
    }
  })

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para crear una nueva."
      footer={backToLogin}
    >
      {sentTo ? (
        <Alert tone="success">
          Si existe una cuenta con <strong>{sentTo}</strong>, recibirás un email con el enlace en
          unos minutos.
        </Alert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" fullWidth loading={isSubmitting}>
            Enviar enlace
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

function NewPasswordForm() {
  const navigate = useNavigate()
  const { profile } = useSession()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof newPasswordSchema>>({ resolver: zodResolver(newPasswordSchema) })

  const onSubmit = handleSubmit(async ({ password }) => {
    setError(null)
    try {
      const { error } = await authService.updatePassword(password)
      if (error) return setError(authErrorMessage(error))
      navigate(profile ? homePathFor(profile.role) : '/login', { replace: true })
    } catch (err) {
      setError(authErrorMessage(err))
    }
  })

  return (
    <AuthShell title="Nueva contraseña" subtitle="Elige una contraseña nueva para tu cuenta.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          hint="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Repite la contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Guardar contraseña
        </Button>
      </form>
    </AuthShell>
  )
}
