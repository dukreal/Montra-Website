import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'

export default function LandingPage() {
  return (
    <div className="bg-[#0b0b0b] content-stretch flex flex-col items-start min-h-[903px] relative shrink-0 w-[1337px]">
      <Header />
      <main className="content-stretch flex flex-col items-start relative shrink-0 w-full">
        <Hero />
      </main>
    </div>
  )
}