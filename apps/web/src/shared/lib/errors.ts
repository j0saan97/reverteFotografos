export function toMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Error inesperado'
}
