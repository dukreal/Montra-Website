import Logo from '@/components/ui/Logo'
import { SUB, MUTE_TEXT, HAIR } from '@/constants/theme'

/* ─────────────────────── FOOTER ─────────────────────── */
const PRODUCT_LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Benefits", href: "#benefits" },
  { label: "Web Version", href: "#/app" },
];

export default function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: HAIR }}>
      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 text-sm max-w-xs" style={{ color: SUB }}>
            Money clarity, one tap at a time. A personal money tracker built for real, everyday spending.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: MUTE_TEXT }}>Product</p>
          <ul className="space-y-3">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm hover:text-white transition" style={{ color: SUB }}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: HAIR }}>
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: MUTE_TEXT }}>© 2026 Montra. All rights reserved.</p>
          <p className="text-xs" style={{ color: MUTE_TEXT }}>Track every peso. Spend with clarity.</p>
        </div>
      </div>
    </footer>
  );
}
