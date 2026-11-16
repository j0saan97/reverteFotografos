import type { ReactNode } from 'react'

// TODO (F1/F7): layout minimalista con la marca del fotógrafo
export function ClientLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-neutral-950 text-white">{children}</div>
}
