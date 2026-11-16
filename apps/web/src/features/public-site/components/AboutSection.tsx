import { ABOUT, photo } from '../content'
import { SectionHeading } from './SectionHeading'

export function AboutSection() {
  return (
    <section id="sobre-mi" className="scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="absolute -right-4 -bottom-4 -z-10 hidden h-full w-full rounded-sm ring-1 ring-stone-300 lg:block"
          />
          <img
            src={photo(ABOUT.photoId, 900, 1100)}
            width={900}
            height={1100}
            alt="Fotógrafa con su cámara"
            loading="lazy"
            className="aspect-[9/11] w-full rounded-sm object-cover"
          />
        </div>

        <div>
          <SectionHeading eyebrow="Sobre mí" title={ABOUT.title} align="left" />
          <div className="mt-6 space-y-4 leading-relaxed text-stone-600">
            {ABOUT.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-stone-200 pt-8">
            {ABOUT.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-4xl text-stone-900 lining-nums">{s.value}</dd>
                <dd className="mt-1 text-xs text-stone-500 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
