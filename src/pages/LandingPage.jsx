import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import StatStrip from '@/components/sections/StatStrip'
import HowItWorks from '@/components/sections/HowItWorks'
import Benefits from '@/components/sections/Benefits'
import Testimonials from '@/components/sections/Testimonials'
import Secure from '@/components/sections/Secure'
import Cta from '@/components/sections/Cta'

export default function LandingPage() {
  return (
    <div className="bg-[#0b0b0b] content-stretch flex flex-col items-start min-h-[903px] relative shrink-0 w-[1337px]">
      <Header />
      <main className="content-stretch flex flex-col items-start relative shrink-0 w-full">
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
  )
}