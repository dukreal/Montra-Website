import Duo from '@/components/ui/Duo'
import Reveal from '@/components/ui/Reveal'
import PhoneMock from '@/components/ui/PhoneMock'
import FloatCard from '@/components/ui/FloatCard'
import { ShieldCheck, Gift, Globe } from '@/components/ui/icons'
import { ACCENT, INK, SUB, MUTE, HAIR } from '@/constants/theme'
import shotSettings from '@/assets/images/screenshot-settings.png'

/* ─────────────────────── SECURE SECTION ─────────────────────── */
export default function Secure() {
  return (
    <section className="border-t" style={{ borderColor: HAIR }}>
      <div className="mx-auto max-w-[1200px] px-6 py-24 lg:py-32 grid gap-14 lg:grid-cols-2 items-center">
        <Reveal className="flex justify-center order-2 lg:order-1">
          <div className="relative">
            <PhoneMock src={shotSettings} alt="Montra settings" width={280} />
            <FloatCard className="absolute -right-6 top-10 flex items-center gap-2.5 px-4 py-3">
              <span className="grid place-items-center rounded-full" style={{ width: 30, height: 30, background: ACCENT + "22" }}>
                <ShieldCheck size={16} color={ACCENT} />
              </span>
              <div>
                <p className="text-[12px] font-bold" style={{ color: INK }}>Private</p>
                <p className="text-[10px]" style={{ color: MUTE }}>Per-account access</p>
              </div>
            </FloatCard>
          </div>
        </Reveal>
        <Reveal delay={120} className="order-1 lg:order-2">
          <Duo a="Your data" b="stays yours" className="text-[32px] md:text-[46px]" />
          <p className="mt-6 text-lg leading-relaxed max-w-md" style={{ color: SUB }}>
            ESign in with Google and your records are stored under your own account, where only you can read
            them. Prefer not to sign in? Guest mode on the web keeps everything in your browser.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              [ShieldCheck, "Records protected per account"],
              [Globe, "English now, Filipino coming soon"],
              [Gift, "Completely free to use"],
            ].map(([Icon, label], idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="grid place-items-center rounded-full shrink-0" style={{ width: 30, height: 30, background: ACCENT + "1f" }}>
                  <Icon size={16} color={ACCENT} />
                </span>
                <span className="text-[15px]" style={{ color: INK }}>{label as string}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
