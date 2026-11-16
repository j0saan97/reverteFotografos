interface SectionHeadingProps {
  eyebrow: string
  title: string
  intro?: string
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'center',
  tone = 'light',
}: SectionHeadingProps) {
  const center = align === 'center'
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p
        className={`text-xs tracking-[0.3em] uppercase ${tone === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 font-display text-4xl font-light sm:text-5xl ${tone === 'dark' ? 'text-white' : 'text-stone-900'}`}
      >
        {title}
      </h2>
      {intro && (
        <p
          className={`mt-5 leading-relaxed ${tone === 'dark' ? 'text-stone-300' : 'text-stone-600'}`}
        >
          {intro}
        </p>
      )}
    </div>
  )
}
