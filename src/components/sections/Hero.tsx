import Reveal from '@/components/ui/Reveal'
import DownloadButton from '@/components/ui/DownloadButton'
import WebVersionButton from '@/components/ui/WebVersionButton'
import FloatCard from '@/components/ui/FloatCard'
import { Utensils, MapPin, Check } from '@/components/ui/icons'
import { ACCENT, ACCENT_SOFT, INK, SUB, MUTE } from '@/constants/theme'
import phone3d from '@/assets/images/phone-3d.png'

/* ─────────────────────── HERO ─────────────────────── */
export default function Hero() {
  return (
    <section id="top" className="relative">
      {/* Glow confined to its own clip container so removing overflow-hidden from section is safe */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-32 h-[560px] w-[900px] rounded-full blur-[140px] opacity-25"
          style={{ background: ACCENT }}
        />
      </div>
      <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-8 lg:pt-28 text-center relative">
        <Reveal>
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-8"
            style={{ background: ACCENT + "18", color: ACCENT_SOFT, border: `1px solid ${ACCENT}30` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT_SOFT }} /> Personal money tracker
          </span>
          <h1 className="mx-auto max-w-4xl text-[46px] leading-[1.02] md:text-[68px] lg:text-[80px] font-black tracking-tight">
            <span style={{ color: INK }}>Track every peso.</span>
            <br />
            <span style={{ color: MUTE }}>Spend with clarity.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg lg:text-xl leading-relaxed" style={{ color: SUB }}>
            Montra makes it effortless to log income and expenses — with analytics, receipt photos and
            location tagging, all in your pocket.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <DownloadButton size="lg" />
            <WebVersionButton size="lg" />
          </div>
          <p className="mt-3 text-[13px]" style={{ color: MUTE }}>Coming soon to Android, iOS &amp; web</p>
        </Reveal>

        {/* Phone with floating cards */}
        <Reveal delay={140}>
          <div className="relative mt-16 flex justify-center">
            {/*
              Two-layer phone mount.
              Source image: 2000×1500, phone body measured at x=763–1257, y=158–1286.
              Displayed at 1:1 native scale (2000 px wide).

              Layer 1 — clip wrapper (absolute, overflow:hidden):
                Positioned left=-763, top=-158 inside the 494px reference container.
                overflow:hidden crops the 2000px image to just the phone body (494px wide).
                Height = phone body height (1128px) → bleeds into StatStrip below container.

              Layer 2 — float cards (absolute children of reference container):
                Positioned with negative left/right offsets so they hug the phone edge.
                Reference container has no overflow clip, so cards are always visible.
            */}
            <div style={{ position: "relative", width: 494, height: 780 }}>
              {/* Image clip layer — must not contain the cards */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: 494,
                  height: 1128,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <img
                  src={phone3d}
                  alt="Montra app on phone"
                  style={{
                    position: "absolute",
                    width: 2000,
                    maxWidth: "none",
                    height: "auto",
                    left: -752.5,
                    top: -130,
                    display: "block",
                  }}
                />
              </div>

              {/* Floating cards: sizes and positions measured from the Figma design (px, so they do not depend on the browser's font-size setting).
                  Shown from lg (1024px) up, where they fit on screen. */}

              {/* Saved! chip — upper left */}
              <FloatCard
                className="hidden lg:flex absolute items-center"
                style={{ left: -141, top: 178, width: 262, height: 90, paddingLeft: 28, paddingRight: 24, gap: 12, borderRadius: 22 }}
              >
                <span className="grid place-items-center rounded-full shrink-0" style={{ width: 46, height: 46, background: ACCENT + "25" }}>
                  <Check size={21} color={ACCENT_SOFT} strokeWidth={3} />
                </span>
                <div className="flex-1 text-center">
                  <p className="font-bold" style={{ fontSize: 20, lineHeight: "24px", color: INK }}>Saved!</p>
                  <p style={{ fontSize: 16, lineHeight: "22px", color: MUTE }}>Transaction added</p>
                </div>
              </FloatCard>

              {/* Food & Dining card — lower left */}
              <FloatCard
                className="hidden lg:flex absolute items-center"
                style={{ left: -202, top: 645, width: 327, height: 99, paddingLeft: 21, paddingRight: 22, gap: 16, borderRadius: 20 }}
              >
                <span className="grid place-items-center shrink-0" style={{ width: 54, height: 54, borderRadius: 16, background: "#F5A62320" }}>
                  <Utensils size={24} color="#F5A623" />
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-bold" style={{ fontSize: 18, lineHeight: "22px", color: INK }}>Food &amp; Dining</p>
                  <p style={{ fontSize: 15, lineHeight: "20px", marginTop: 4, color: MUTE }}>12:40 PM</p>
                </div>
                <span className="font-bold" style={{ fontSize: 22, lineHeight: "28px", color: "#E05252" }}>-₱340</span>
              </FloatCard>

              {/* Summary card — upper right */}
              <FloatCard
                className="hidden lg:block absolute text-left"
                style={{ left: 391, top: 145, width: 342, height: 132, padding: 24, borderRadius: 18 }}
              >
                <p className="font-semibold" style={{ fontSize: 14, lineHeight: "20px", marginBottom: 16, color: MUTE }}>Summary this month</p>
                <div className="grid grid-cols-3" style={{ columnGap: 12 }}>
                  {[
                    { label: "Income", value: "+₱3,000", color: "#2ECC71" },
                    { label: "Expense", value: "-₱213", color: "#FF6B6B" },
                    { label: "Balance", value: "₱2,787", color: INK },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="font-medium" style={{ fontSize: 13, lineHeight: "18px", color: MUTE }}>{label}</p>
                      <p className="font-bold" style={{ fontSize: 17, lineHeight: "24px", marginTop: 5, color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </FloatCard>

              {/* Banilad chip — lower right */}
              <FloatCard
                className="hidden lg:flex absolute items-center"
                style={{ left: 349, top: 640, width: 353, height: 85, paddingLeft: 25, paddingRight: 20, gap: 18, borderRadius: 22 }}
              >
                <span className="grid place-items-center shrink-0" style={{ width: 48, height: 48, borderRadius: 14, background: ACCENT + "20" }}>
                  <MapPin size={22} color={ACCENT} />
                </span>
                <span className="font-semibold truncate" style={{ fontSize: 20, color: INK }}>Banilad, Cebu City</span>
              </FloatCard>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
