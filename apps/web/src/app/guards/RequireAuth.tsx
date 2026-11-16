import type { ReactNode } from 'react'

// TODO (F1): redirigir a /login si no hay sesión
export function RequireAuth({ children }: { children: ReactNode }) {
  return <>{children}</>
}
