import Reveal from '@/components/ui/Reveal'
import PhoneMock from '@/components/ui/PhoneMock'
import { Download, Monitor } from '@/components/ui/icons'
import { ACCENT } from '@/constants/theme'
import shotSaved from '@/assets/images/screenshot-saved.png'

/* ─────────────────────── CTA BAND ─────────────────────── */
export default function Cta() {
  return (
    <section className="px-6 pb-8">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div
            className="relative overflow-hidden rounded-[32px] px-8 py-16 lg:px-16 lg:py-20"
            style={{ background: `linear-gradient(120deg, ${ACCENT} 0%, #1e7a44 100%)` }}
          >
            {/* watermark */}
            <span className="pointer-events-none absolute -bottom-10 -right-4 font-black opacity-10 select-none" style={{ fontSize: 220, color: "#03130a", lineHeight: 1 }}>
              ₱
            </span>
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm font-semibold mb-3" style={{ color: "#04220f" }}>Join the money-clarity movement</p>
                <h2 className="text-[34px] md:text-[48px] font-black leading-[1.05]" style={{ color: "#03130a" }}>
                  Start tracking smarter today.
                </h2>
                <p className="mt-4 text-lg max-w-md" style={{ color: "#053b1c" }}>
                  Free to use, and built for the way you actually spend.
                </p>
                <div className="mt-8 flex flex-col items-start gap-2">
                  <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                    <a
                      href="#/app"
                      title="Open the web version"
                      className="inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-6 py-4 text-base font-bold cursor-pointer bg-white active:scale-[0.98] transition hover:brightness-95 sm:w-auto"
                      style={{ color: "#03130a", boxShadow: "0 14px 40px rgba(0,0,0,0.25)" }}
                    >
                      <Monitor size={20} color="#03130a" strokeWidth={2.2} />
                      Web Version
                    </a>
                    <button
                      type="button"
                      disabled
                      title="Android and iOS apps are coming soon"
                      className="inline-flex w-full items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-6 py-4 text-base font-bold cursor-not-allowed sm:w-auto"
                      style={{ color: "#03130a", background: "transparent", border: "1.5px dashed rgba(3,19,10,0.5)" }}
                    >
                      <Download size={20} color="#03130a" strokeWidth={2.4} />
                      <span className="sm:hidden">App coming soon</span>
                      <span className="hidden sm:inline">Download App</span>
                      <span className="hidden sm:inline rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "rgba(3,19,10,0.14)" }}>Coming soon</span>
                    </button>
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: "#04220f" }}>Web version available now · Android and iOS coming soon</span>
                </div>
              </div>
              <div className="hidden lg:flex justify-end">
                <div style={{ transform: "rotate(6deg)" }}>
                  <PhoneMock src={shotSaved} alt="Transaction saved" width={230} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
