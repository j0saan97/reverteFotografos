import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@/shared/components'
import { HERO_SLIDES, photo } from '../content'

const INTERVAL_MS = 6000

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef<number | null>(null)
  const count = HERO_SLIDES.length

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  // Autoplay; restarts after each manual change, stops on hover/focus or reduced motion
  useEffect(() => {
    if (paused || prefersReducedMotion()) return
    const t = window.setTimeout(() => go(index + 1), INTERVAL_MS)
    return () => window.clearTimeout(t)
  }, [index, paused, go])

  return (
    <section
      id="inicio"
      aria-roledescription="carrusel"
      aria-label="Fotografías destacadas"
      className="relative h-[100svh] max-h-[1100px] min-h-[560px] overflow-hidden bg-stone-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1)
        if (e.key === 'ArrowRight') go(index + 1)
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        const start = touchX.current
        const end = e.changedTouches[0]?.clientX
        touchX.current = null
        if (start == null || end == null || Math.abs(end - start) < 50) return
        go(end < start ? index + 1 : index - 1)
      }}
    >
      {HERO_SLIDES.map((s, i) => {
        const active = i === index
        return (
          <div
            key={s.id}
            role="group"
            aria-roledescription="diapositiva"
            aria-label={`${i + 1} de ${count}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              active ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={photo(s.id, 2000, 1300)}
              srcSet={`${photo(s.id, 900, 1400)} 900w, ${photo(s.id, 1600, 1040)} 1600w, ${photo(s.id, 2400, 1560)} 2400w`}
              sizes="100vw"
              alt={s.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              className={`h-full w-full object-cover transition-transform duration-[7000ms] ease-out motion-reduce:transition-none ${
                active ? 'scale-105' : 'scale-100'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/65" />
          </div>
        )
      })}

      {/* Caption of the active slide */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-28 sm:px-8 sm:pb-32">
        <p className="mb-4 text-xs tracking-[0.3em] text-white/80 uppercase">
          {HERO_SLIDES[index]?.subtitle}
        </p>
        <h1
          key={index}
          className="max-w-3xl font-display text-4xl leading-[1.05] font-light motion-safe:animate-[fadeUp_900ms_ease-out] sm:text-6xl lg:text-7xl"
        >
          {HERO_SLIDES[index]?.title}
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#portfolio"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200"
          >
            Ver portfolio
          </a>
          <a
            href="#contacto"
            className="rounded-full px-6 py-3 text-sm font-medium ring-1 ring-white/70 transition-colors hover:bg-white/10"
          >
            Pide presupuesto
          </a>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-8 z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8">
        <div className="flex gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Ir a la foto ${i + 1}`}
              aria-current={i === index}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === index ? 'w-10 bg-white' : 'w-5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Foto anterior"
            className="rounded-full p-2.5 ring-1 ring-white/40 transition-colors hover:bg-white/15"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Foto siguiente"
            className="rounded-full p-2.5 ring-1 ring-white/40 transition-colors hover:bg-white/15"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}
