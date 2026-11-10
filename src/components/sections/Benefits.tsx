import Duo from '@/components/ui/Duo'
import Reveal from '@/components/ui/Reveal'
import MiniDonut from '@/components/ui/MiniDonut'
import IconTile from '@/components/ui/IconTile'
import BenefitCard from '@/components/ui/BenefitCard'
import { Wallet, BarChart3, MapPin, Palette, Zap } from '@/components/ui/icons'
import { ACCENT, ACCENT_SOFT, INK, SUB, PANEL, PANEL2, HAIR } from '@/constants/theme'

export default function Benefits() {
  return (
    <section id="benefits" className="border-t" style={{ borderColor: HAIR }}>
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
        <Reveal>
          <div className="text-center">
            <Duo a="Key" b="benefits" className="text-[34px] md:text-[52px]" />
            <p className="mt-4 text-lg" style={{ color: SUB }}>Everything you need to understand your money.</p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {/* row 1 */}
          <Reveal>
            <BenefitCard icon={<Wallet size={24} color={ACCENT} />} tint={ACCENT} title="Track every peso" body="Log income and expenses in seconds and always know your daily balance." />
          </Reveal>
          <Reveal delay={90}>
            <div className="h-full rounded-3xl border p-7 flex flex-col" style={{ background: PANEL, borderColor: HAIR }}>
              <div className="flex items-center justify-between">
                <IconTile icon={<BarChart3 size={24} color="#4A90E2" />} tint="#4A90E2" />
                <MiniDonut />
              </div>
              <h3 className="mt-6 text-xl font-bold" style={{ color: INK }}>Visual analytics</h3>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: SUB }}>See exactly where your money goes with weekly, monthly and yearly breakdowns.</p>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <BenefitCard icon={<Zap size={24} color="#F5A623" />} tint="#F5A623" title="Instant capture" body="Snap a receipt and attach up to three photos to any transaction." />
          </Reveal>

          {/* row 2 — wide split */}
          <Reveal className="md:col-span-2">
            <div className="h-full rounded-3xl border p-7 flex flex-col md:flex-row md:items-center gap-6" style={{ background: PANEL, borderColor: HAIR }}>
              <div className="flex-1">
                <IconTile icon={<MapPin size={24} color="#E05282" />} tint="#E05282" />
                <h3 className="mt-5 text-xl font-bold" style={{ color: INK }}>Location tagging</h3>
                <p className="mt-2 text-[15px] leading-relaxed max-w-sm" style={{ color: SUB }}>
                  Pin each spend to a place — remember exactly where it happened, right on the map.
                </p>
              </div>
              <div className="rounded-2xl border p-4 md:w-64" style={{ background: PANEL2, borderColor: HAIR }}>
                <div className="flex items-center gap-2">
                  <MapPin size={16} color={ACCENT} />
                  <span className="text-[13px] font-semibold" style={{ color: INK }}>Current location</span>
                </div>
                <div className="mt-3 rounded-xl h-20 grid place-items-center" style={{ background: "#0f0f0f", border: `1px solid ${HAIR}` }}>
                  <MapPin size={22} color={ACCENT} />
                </div>
                <p className="mt-2.5 text-[12px]" style={{ color: SUB }}>9W37+4QQ, Cebu City</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="h-full rounded-3xl border p-7 flex flex-col" style={{ background: `radial-gradient(120% 120% at 100% 0%, ${ACCENT}22 0%, ${PANEL} 55%)`, borderColor: ACCENT + "33" }}>
              <IconTile icon={<Palette size={24} color={ACCENT_SOFT} />} tint={ACCENT_SOFT} />
              <h3 className="mt-5 text-xl font-bold" style={{ color: INK }}>Make it yours</h3>
              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: SUB }}>Dark mode, four accent themes, text sizing, and English or Filipino.</p>
              <div className="mt-5 flex gap-2.5">
                {["#27AE60", "#3B7DD8", "#E67E22", "#E05282"].map((c) => (
                  <span key={c} className="rounded-full" style={{ width: 26, height: 26, background: c, border: "2px solid rgba(255,255,255,0.15)" }} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
