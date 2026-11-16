import type { ReactNode } from 'react'
import { Brand } from '@/shared/components'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial side panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-stone-950 text-stone-100 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(214,195,165,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(120,113,108,0.25),transparent_60%)]"
        />
        <Brand className="relative" />
        <div className="relative max-w-md">
          <p className="font-display text-4xl leading-tight font-light">
            Tus fotos, entregadas con el cuidado con el que fueron hechas.
          </p>
          <p className="mt-6 text-sm leading-relaxed text-stone-400">
            Galerías privadas para que tus clientes vean, elijan y comenten sus fotos en un espacio
            protegido.
          </p>
        </div>
        <p className="relative text-xs text-stone-500">© {new Date().getFullYear()}</p>
      </aside>

      <main className="flex flex-col justify-center px-4 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Brand className="mb-10 block text-stone-900 lg:hidden" />
          <h1 className="font-display text-3xl font-medium text-stone-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-stone-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-stone-500">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
