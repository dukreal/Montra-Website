import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import StatStrip from '@/components/sections/StatStrip'
import HowItWorks from '@/components/sections/HowItWorks'
import Benefits from '@/components/sections/Benefits'
import Secure from '@/components/sections/Secure'
import Cta from '@/components/sections/Cta'
import { ACCENT, BG } from '@/constants/theme'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full" style={{ background: BG }}>
      {/* Hero glow lives at page level so it also sits behind the sticky header (no dark band above the hero) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-14 h-[560px] w-[900px] rounded-full blur-[140px] opacity-25"
          style={{ background: ACCENT }}
        />
      </div>
      <Header />
      <main>
        <Hero />
        <StatStrip />
        <HowItWorks />
        <Benefits />
        <Secure />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}