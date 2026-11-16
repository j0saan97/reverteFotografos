import { useNoContextMenu } from '@/shared/protection'

type Props = { src: string; alt: string; className?: string }

// Imagen con overlay transparente: el clic/arrastre no llega al <img>.
// La protección real es en servidor (preview con marca de agua + token).
// TODO (F4): opción de pintar en <canvas>
export function ProtectedImage({ src, alt, className }: Props) {
  const ref = useNoContextMenu<HTMLDivElement>()
  return (
    <div ref={ref} className={`protected ${className ?? ''}`}>
      <img src={src} alt={alt} draggable={false} loading="lazy" />
      <div className="protected-overlay" aria-hidden />
    </div>
  )
}
