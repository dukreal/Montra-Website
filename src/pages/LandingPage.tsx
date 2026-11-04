import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import StatStrip from '@/components/sections/StatStrip'
import HowItWorks from '@/components/sections/HowItWorks'
import Benefits from '@/components/sections/Benefits'
import Testimonials from '@/components/sections/Testimonials'
import Secure from '@/components/sections/Secure'
import Cta from '@/components/sections/Cta'
import { BG } from '@/constants/theme'

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full" style={{ background: BG }}>
      <Header />
      <main>
        <Hero />
        <StatStrip />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <Secure />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
