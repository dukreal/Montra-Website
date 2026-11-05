import { useEffect, useState } from 'react'
import Duo from '@/components/ui/Duo'
import Reveal from '@/components/ui/Reveal'
import RoundBtn from '@/components/ui/RoundBtn'
import { Star, REVIEWS } from '@/components/ui/icons'
import { ACCENT, ACCENT_SOFT, INK, MUTE, PANEL, HAIR } from '@/constants/theme'

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(3); // cards shown at once: 1 on phones, 2 on tablets, 3 on desktop
  useEffect(() => {
    const update = () => setVisible(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const maxIndex = Math.max(0, REVIEWS.length - visible);
  const pos = Math.min(i, maxIndex); // keeps the position valid when the number of visible cards changes
  const GAP = 24; // px gap between cards
  const clamp = (v: number) => Math.min(maxIndex, Math.max(0, v));

  return (
    <section id="reviews" className="border-t" style={{ borderColor: HAIR }}>
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <Reveal>
            <div>
              <Duo a="What our" b="users say" className="text-[34px] md:text-[52px]" />
              <div className="mt-4 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((s) => <Star key={s} size={18} color={ACCENT_SOFT} fill={ACCENT_SOFT} strokeWidth={0} />)}
                </div>
                <span className="text-sm font-semibold" style={{ color: INK }}>4.9</span>
                <span className="text-sm" style={{ color: MUTE }}>· 1,200+ reviews</span>
              </div>
            </div>
          </Reveal>
          <div className="flex gap-3">
            <RoundBtn disabled={pos === 0} onClick={() => setI(clamp(pos - 1))} dir="left" />
            <RoundBtn disabled={pos === maxIndex} onClick={() => setI(clamp(pos + 1))} dir="right" />
          </div>
        </div>

        <div className="mt-12 overflow-hidden">
          <div className="flex transition-transform duration-500" style={{ gap: GAP, transform: `translateX(calc(${-pos} * (100% + ${GAP}px) / ${visible}))` }}>
            {REVIEWS.map((r) => (
              <div key={r.name} className="shrink-0" style={{ width: `calc((100% - ${(visible - 1) * GAP}px) / ${visible})` }}>
                <div className="h-full rounded-3xl border p-7" style={{ background: PANEL, borderColor: HAIR }}>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: r.stars }).map((_, s) => <Star key={s} size={16} color={ACCENT_SOFT} fill={ACCENT_SOFT} strokeWidth={0} />)}
                  </div>
                  <p className="text-[15px] leading-relaxed" style={{ color: INK }}>{"“"}{r.quote}{"”"}</p>
                  <div className="mt-6 flex items-center gap-3">
                    <span className="grid place-items-center rounded-full font-bold" style={{ width: 40, height: 40, background: ACCENT + "22", color: ACCENT_SOFT }}>
                      {r.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: INK }}>{r.name}</p>
                      <p className="text-xs" style={{ color: MUTE }}>{r.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-10 h-1 rounded-full overflow-hidden" style={{ background: HAIR }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((pos + visible) / REVIEWS.length) * 100}%`, background: ACCENT }}
          />
        </div>
      </div>
    </section>
  );
}
