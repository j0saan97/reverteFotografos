import type { ReactNode } from 'react'

// TODO (F1): sidebar (Galerías, Clientes, Ajustes) + topbar
export function PhotographerLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
