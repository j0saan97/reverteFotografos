import type { ReactNode } from 'react'
import type { Role } from '@galeria/shared'

// TODO (F1): comprobar profiles.role y redirigir si no coincide
export function RequireRole({ children }: { role: Role; children: ReactNode }) {
  return <>{children}</>
}
