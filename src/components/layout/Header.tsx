import Logo from '@/components/ui/Logo'
import DownloadButton from '@/components/ui/DownloadButton'
import WebVersionButton from '@/components/ui/WebVersionButton'
import { SUB, HAIR } from '@/constants/theme'

/* ─────────────────────── NAV ─────────────────────── */
export default function Header() {
  return (
    <div className="sticky top-0 z-50 pt-4 px-4">
      <header
        className="mx-auto max-w-[1200px] flex items-center justify-between rounded-full pl-5 pr-2 py-2 backdrop-blur-xl"
        style={{ background: "rgba(20,20,20,0.82)", border: `1px solid ${HAIR}` }}
      >
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium" style={{ color: SUB }}>
          <a href="#top" className="hover:text-white transition">Home</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#benefits" className="hover:text-white transition">Benefits</a>
          <a href="#reviews" className="hover:text-white transition">Reviews</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex"><WebVersionButton /></span>
          <DownloadButton />
        </div>
      </header>
    </div>
  );
}
