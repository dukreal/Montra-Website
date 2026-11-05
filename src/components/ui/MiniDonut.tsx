import { INK, PANEL2 } from '@/constants/theme'

/* ─────────────────────── BENEFITS (BENTO) ─────────────────────── */
export default function MiniDonut() {
  const stops = "conic-gradient(#F5A623 0% 34%, #4A90E2 34% 60%, #7B61FF 60% 80%, #FF6B6B 80% 92%, #6f6f6f 92% 100%)";
  return (
    <div className="relative" style={{ width: 92, height: 92 }}>
      <div className="rounded-full w-full h-full" style={{ background: stops }} />
      <div className="absolute inset-0 m-auto rounded-full grid place-items-center" style={{ width: 54, height: 54, background: PANEL2 }}>
        <span className="text-[11px] font-bold" style={{ color: INK }}>₱8.4k</span>
      </div>
    </div>
  );
}
