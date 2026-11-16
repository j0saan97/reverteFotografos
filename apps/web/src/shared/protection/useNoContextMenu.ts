import { useEffect, useRef } from 'react'

export function useNoContextMenu<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const block = (e: Event) => e.preventDefault()
    el.addEventListener('contextmenu', block)
    el.addEventListener('dragstart', block)
    el.addEventListener('selectstart', block)
    return () => {
      el.removeEventListener('contextmenu', block)
      el.removeEventListener('dragstart', block)
      el.removeEventListener('selectstart', block)
    }
  }, [])
  return ref
}
