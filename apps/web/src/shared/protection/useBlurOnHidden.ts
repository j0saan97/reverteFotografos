import { useEffect } from 'react'

// Difumina la galería cuando la pestaña pierde foco o visibilidad.
export function useBlurOnHidden(rootClass = 'gallery-blurred') {
  useEffect(() => {
    const on = () => document.body.classList.add(rootClass)
    const off = () => document.body.classList.remove(rootClass)
    const onVis = () => (document.hidden ? on() : off())
    window.addEventListener('blur', on)
    window.addEventListener('focus', off)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('blur', on)
      window.removeEventListener('focus', off)
      document.removeEventListener('visibilitychange', onVis)
      off()
    }
  }, [rootClass])
}
