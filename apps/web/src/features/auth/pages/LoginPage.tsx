import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@galeria/shared'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { z } from 'zod'
import { Alert, Button, TextField } from '@/shared/components'
import { AuthShell } from '../components/AuthShell'
import { RedirectIfSignedIn } from '../components/RedirectIfSignedIn'
import { authErrorMessage, authService } from '../services/authService'

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError(null)
    try {
      const { error } = await authService.signIn(email, password)
      if (error) setError(authErrorMessage(error))
      // On success AuthProvider updates the session and RedirectIfSignedIn navigates
    } catch (err) {
      setError(authErrorMessage(err))
    }
  })

  return (
    <RedirectIfSignedIn>
      <AuthShell
        title="Iniciar sesión"
        subtitle="Accede a tus galerías."
        footer={
          <>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-medium text-stone-900 hover:underline">
              Regístrate
            </Link>
          </>
        }
      >
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
          <div>
            <TextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="mt-2 text-right">
              <Link
                to="/reset-password"
                className="text-xs text-stone-500 hover:text-stone-900 hover:underline"
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </div>
          </div>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </AuthShell>
    </RedirectIfSignedIn>
  )
}
