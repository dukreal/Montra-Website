import Duo from '@/components/ui/Duo'
import Reveal from '@/components/ui/Reveal'
import PhoneMock from '@/components/ui/PhoneMock'
import StepCard from '@/components/ui/StepCard'
import { ShieldCheck, STEPS } from '@/components/ui/icons'
import { ACCENT, INK, SUB, PANEL2, HAIR } from '@/constants/theme'
import shotAdd from '@/assets/images/screenshot-add.png'

export default function HowItWorks() {
  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
        <Reveal>
          <Duo a="How it" b="works" className="text-center text-[34px] md:text-[52px]" />
        </Reveal>
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_auto_1fr] items-center">
          {/* left steps */}
          <div className="flex flex-col gap-5 lg:items-end order-2 lg:order-1">
            {STEPS.slice(0, 2).map((s, i) => (
              <Reveal key={s.n} delay={i * 100} className="w-full lg:max-w-xs">
                <StepCard {...s} />
              </Reveal>
            ))}
          </div>
          {/* phone */}
          <Reveal delay={80} className="order-1 lg:order-2 flex justify-center">
            <PhoneMock src={shotAdd} alt="Add a transaction" width={300} />
          </Reveal>
          {/* right step */}
          <div className="flex flex-col gap-5 order-3">
            <Reveal delay={160} className="w-full lg:max-w-xs">
              <StepCard {...STEPS[2]} />
            </Reveal>
            <Reveal delay={220} className="w-full lg:max-w-xs">
              <div className="rounded-2xl border p-6" style={{ background: PANEL2, borderColor: HAIR }}>
                <ShieldCheck size={26} color={ACCENT} />
                <p className="mt-3 font-bold" style={{ color: INK }}>Private by default</p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: SUB }}>
                  Your data lives on your device first — no account required to start.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
