import { INK, MUTE, BG, HAIR } from '@/constants/theme'

/* ─────────────────────── STAT STRIP ─────────────────────── */
export default function StatStrip() {
  const stats = [
    ["100%", "Offline-first"],
    ["₱", "Peso native"],
    ["12", "Categories"],
    ["2", "Languages"],
  ];
  return (
    <section className="border-y" style={{ borderColor: HAIR, position: "relative", zIndex: 10, background: BG }}>
      <div className="mx-auto max-w-[1200px] px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="text-3xl md:text-4xl font-black" style={{ color: INK }}>{n}</div>
            <div className="text-sm mt-1.5" style={{ color: MUTE }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
