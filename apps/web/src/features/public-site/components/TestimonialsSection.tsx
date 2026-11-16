import { TESTIMONIALS } from '../content'
import { SectionHeading } from './SectionHeading'

export function TestimonialsSection() {
  return (
    <section id="opiniones" className="scroll-mt-20 bg-stone-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <SectionHeading eyebrow="Opiniones" title="Lo que dicen nuestros clientes" tone="dark" />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-sm bg-white/[0.04] p-8 ring-1 ring-white/10"
            >
              <span
                aria-hidden="true"
                className="font-display text-6xl leading-none text-stone-500"
              >
                “
              </span>
              <blockquote className="mt-2 flex-1 font-display text-xl leading-relaxed font-light text-stone-100">
                {t.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-5">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-stone-400">{t.context}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
