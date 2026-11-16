import { useEffect } from 'react'

// Disuasorio: no impide capturas del SO, pero oculta un momento y bloquea atajos.
export function usePrintScreenGuard(rootClass = 'gallery-blurred') {
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        document.body.classList.add(rootClass)
        navigator.clipboard?.writeText('').catch(() => {})
        setTimeout(() => document.body.classList.remove(rootClass), 1500)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && (k === 's' || k === 'p')) e.preventDefault()
    }
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [rootClass])
}
