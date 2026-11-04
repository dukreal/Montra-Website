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
            <PhoneMock src={shotSettings} alt="Motra settings" width={280} />
            <FloatCard className="absolute -right-6 top-10 flex items-center gap-2.5 px-4 py-3">
              <span className="grid place-items-center rounded-full" style={{ width: 30, height: 30, background: ACCENT + "22" }}>
                <ShieldCheck size={16} color={ACCENT} />
              </span>
              <div>
                <p className="text-[12px] font-bold" style={{ color: INK }}>Encrypted</p>
                <p className="text-[10px]" style={{ color: MUTE }}>On-device storage</p>
              </div>
            </FloatCard>
          </div>
        </Reveal>
        <Reveal delay={120} className="order-1 lg:order-2">
          <Duo a="Your money data is" b="safe with Motra" className="text-[32px] md:text-[46px]" />
          <p className="mt-6 text-lg leading-relaxed max-w-md" style={{ color: SUB }}>
            Everything is stored locally on your device first. No account is required to get started, and your
            records never leave your phone unless you choose to back them up.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              [ShieldCheck, "Offline-first, on-device storage"],
              [Globe, "Available in English and Filipino"],
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
