import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from './icons'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  back?: { to: string; label: string }
  actions?: ReactNode
}

export function PageHeader({ title, description, back, actions }: PageHeaderProps) {
  return (
    <header className="mb-8">
      {back && (
        <Link
          to={back.to}
          className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-stone-900"
        >
          <ChevronLeftIcon className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-medium text-stone-900 sm:text-4xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
