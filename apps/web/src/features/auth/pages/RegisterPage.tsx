import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema } from '@galeria/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { z } from 'zod'
import { Alert, Button, TextField } from '@/shared/components'
import { AuthShell } from '../components/AuthShell'
import { RedirectIfSignedIn } from '../components/RedirectIfSignedIn'
import { authErrorMessage, authService } from '../services/authService'

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [isPhotographer, setIsPhotographer] = useState(false)
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    if (isPhotographer && !values.photographerCode) {
      return setFieldError('photographerCode', { message: 'Introduce el código' })
    }
    try {
      const { data, error } = await authService.signUp(
        values.email,
        values.password,
        values.displayName,
        isPhotographer ? values.photographerCode : undefined,
      )
      if (error) return setError(authErrorMessage(error))
      // Without a session, email confirmation is required before signing in
      if (!data.session) setPendingEmail(values.email)
    } catch (err) {
      setError(authErrorMessage(err))
    }
  })

  if (pendingEmail) {
    return (
      <AuthShell title="Revisa tu email">
        <Alert tone="success">
          Te hemos enviado un enlace de confirmación a <strong>{pendingEmail}</strong>. Ábrelo para
          activar tu cuenta y después inicia sesión.
        </Alert>
        <Link
          to="/login"
          className="mt-6 inline-block text-sm font-medium text-stone-900 hover:underline"
        >
          Ir a iniciar sesión
        </Link>
      </AuthShell>
    )
  }

  return (
    <RedirectIfSignedIn>
      <AuthShell
        title="Crear cuenta"
        subtitle="Regístrate para acceder a tus galerías."
        footer={
          <>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-stone-900 hover:underline">
              Inicia sesión
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField
            label="Nombre"
            autoComplete="name"
            placeholder="Ana García"
            error={errors.displayName?.message}
            {...register('displayName')}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Contraseña"
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

          <div className="rounded-lg border border-stone-200 p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={isPhotographer}
                onChange={(e) => setIsPhotographer(e.target.checked)}
                className="size-4 rounded border-stone-300 accent-stone-900"
              />
              Soy fotógrafo/a y tengo un código de invitación
            </label>
            {isPhotographer && (
              <TextField
                className="mt-4"
                label="Código de invitación"
                autoComplete="off"
                error={errors.photographerCode?.message}
                {...register('photographerCode')}
              />
            )}
          </div>

          <Button type="submit" fullWidth loading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>
      </AuthShell>
    </RedirectIfSignedIn>
  )
}
