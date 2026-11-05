import { useState } from 'react'
import Logo from '@/components/ui/Logo'
import DownloadButton from '@/components/ui/DownloadButton'
import WebVersionButton from '@/components/ui/WebVersionButton'
import { SUB, INK, HAIR } from '@/constants/theme'

const LINKS = [
  { label: 'Home', href: '#top' },
  { label: 'How it works', href: '#how' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Reviews', href: '#reviews' },
]

/* ─────────────────────── NAV ─────────────────────── */
export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-0 z-50 pt-4 px-4">
      <header
        className="mx-auto max-w-[1200px] flex items-center justify-between rounded-full pl-5 pr-2 py-2 backdrop-blur-xl"
        style={{ background: "rgba(20,20,20,0.82)", border: `1px solid ${HAIR}` }}
      >
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium" style={{ color: SUB }}>
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition">{link.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex"><WebVersionButton /></span>
          <span className="hidden sm:inline-flex"><DownloadButton /></span>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
            className="md:hidden grid place-items-center rounded-full"
            style={{ width: 40, height: 40, border: `1px solid ${HAIR}`, color: INK }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" className="md:hidden absolute inset-x-4 top-full mt-2">
          <div
            className="mx-auto max-w-[1200px] rounded-3xl p-4 backdrop-blur-xl"
            style={{ background: "rgba(20,20,20,0.96)", border: `1px solid ${HAIR}` }}
          >
            <nav className="flex flex-col text-[16px] font-medium" style={{ color: SUB }}>
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 hover:bg-white/5 hover:text-white transition"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-wrap gap-2.5 sm:hidden">
              <WebVersionButton />
              <DownloadButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
