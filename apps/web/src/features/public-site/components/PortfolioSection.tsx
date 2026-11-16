import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { CATEGORIES, PORTFOLIO, photo, type PortfolioItem } from '../content'
import { SectionHeading } from './SectionHeading'

type Filter = 'all' | PortfolioItem['category']

const SIZE = {
  portrait: { w: 800, h: 1000 },
  landscape: { w: 900, h: 600 },
} as const

export function PortfolioSection() {
  const [filter, setFilter] = useState<Filter>('all')
  const [openIndex, setOpenIndex] = useState(-1)

  const items = useMemo(
    () => (filter === 'all' ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter)),
    [filter],
  )

  const slides = useMemo(
    () =>
      items.map((p) => {
        const big = p.orientation === 'portrait' ? { w: 1400, h: 1750 } : { w: 2000, h: 1333 }
        return { src: photo(p.id, big.w, big.h), alt: p.alt, width: big.w, height: big.h }
      }),
    [items],
  )

  const filters: { id: Filter; label: string }[] = [{ id: 'all', label: 'Todo' }, ...CATEGORIES]

  return (
    <section id="portfolio" className="scroll-mt-20 bg-stone-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading
          eyebrow="Portfolio"
          title="Nuestro trabajo"
          intro="Una selección de bodas, retratos, eventos y sesiones familiares. Pulsa en cualquier foto para verla a pantalla completa."
        />

        <div
          className="mt-12 flex flex-wrap justify-center gap-2"
          role="tablist"
          aria-label="Categorías"
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-5 py-2 text-sm transition-colors ${
                filter === f.id
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 ring-1 ring-stone-300 hover:bg-white hover:text-stone-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Masonry via CSS columns */}
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((p, i) => {
            const s = SIZE[p.orientation]
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpenIndex(i)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-sm bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                aria-label={`Ampliar: ${p.alt}`}
              >
                <img
                  src={photo(p.id, s.w, s.h)}
                  width={s.w}
                  height={s.h}
                  alt={p.alt}
                  loading="lazy"
                  className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-stone-950/0 transition-colors duration-500 group-hover:bg-stone-950/15" />
              </button>
            )
          })}
        </div>
      </div>

      <Lightbox
        open={openIndex >= 0}
        index={openIndex}
        close={() => setOpenIndex(-1)}
        slides={slides}
      />
    </section>
  )
}
