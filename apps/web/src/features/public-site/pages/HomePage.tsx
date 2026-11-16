import { AboutSection } from '../components/AboutSection'
import { ContactSection } from '../components/ContactSection'
import { HeroCarousel } from '../components/HeroCarousel'
import { PortfolioSection } from '../components/PortfolioSection'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { TestimonialsSection } from '../components/TestimonialsSection'

export function HomePage() {
  return (
    <div className="bg-stone-50">
      <SiteHeader />
      <main>
        <HeroCarousel />
        <PortfolioSection />
        <AboutSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  )
}
