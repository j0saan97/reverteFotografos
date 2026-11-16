export const APP_NAME = 'Reverte Fotógrafos'

export function Brand({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-2xl font-medium tracking-wide ${className}`}>
      {APP_NAME}
    </span>
  )
}
