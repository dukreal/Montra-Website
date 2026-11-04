import Logo from '@/components/ui/Logo'
import { SUB, MUTE, HAIR } from '@/constants/theme'

/* ─────────────────────── FOOTER ─────────────────────── */
export default function Footer() {
  const cols = [
    ["Product", ["Features", "How it works", "Benefits", "Reviews"]],
    ["Company", ["About", "Privacy Policy", "Terms", "Contact"]],
  ] as const;
  return (
    <footer className="border-t" style={{ borderColor: HAIR }}>
      <div className="mx-auto max-w-[1200px] px-6 py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 text-sm max-w-xs" style={{ color: SUB }}>
            Money clarity, one tap at a time. A personal money tracker built for real, everyday spending.
          </p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: MUTE }}>{title}</p>
            <ul className="space-y-3">
              {links.map((l) => (
                <li key={l}><span className="text-sm hover:text-white transition cursor-default" style={{ color: SUB }}>{l}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t" style={{ borderColor: HAIR }}>
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: MUTE }}>© 2026 Motra. All rights reserved.</p>
          <p className="text-xs" style={{ color: MUTE }}>Rent by clarity. Rewards in savings.</p>
        </div>
      </div>
    </footer>
  );
}
