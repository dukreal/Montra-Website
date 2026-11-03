import { BG } from '@/constants/theme'

export default function PhoneMock({ src, alt, width = 300, tilt3D = false }: { src: string; alt: string; width?: number; tilt3D?: boolean }) {
  const s = width / 300;
  const r = Math.round(44 * s);
  const rInner = Math.round(36 * s);
  const topBezel = Math.round(13 * s);
  const botBezel = Math.round(12 * s);
  const sideBezel = Math.round(6 * s);
  const camSize = Math.round(10 * s);

  return (
    <div
      style={
        tilt3D
          ? {
              transform: "perspective(1000px) rotateY(-20deg) rotateX(6deg)",
              transformOrigin: "center center",
              willChange: "transform",
            }
          : undefined
      }
    >
      {/* Outer frame — Samsung Galaxy flat-edge aluminum */}
      <div
        className="relative"
        style={{
          width,
          borderRadius: r,
          background: "linear-gradient(160deg, #2c2c2e 0%, #1c1c1e 50%, #141416 100%)",
          padding: `${topBezel}px ${sideBezel}px ${botBezel}px`,
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: tilt3D
            ? "28px 40px 90px rgba(0,0,0,0.75), 6px 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)"
            : "0 50px 130px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.09)",
        }}
      >
        {/* Volume buttons — left side */}
        {[60, 96].map((top) => (
          <div
            key={top}
            className="absolute"
            style={{
              left: -3 * s,
              top: top * s,
              width: 3 * s,
              height: 28 * s,
              background: "linear-gradient(90deg, #222 0%, #2e2e2e 100%)",
              borderRadius: `${2 * s}px 0 0 ${2 * s}px`,
              boxShadow: "-1px 0 4px rgba(0,0,0,0.6)",
            }}
          />
        ))}
        {/* Power button — right side */}
        <div
          className="absolute"
          style={{
            right: -3 * s,
            top: 78 * s,
            width: 3 * s,
            height: 44 * s,
            background: "linear-gradient(90deg, #2e2e2e 0%, #222 100%)",
            borderRadius: `0 ${2 * s}px ${2 * s}px 0`,
            boxShadow: "1px 0 4px rgba(0,0,0,0.6)",
          }}
        />

        {/* Top bezel with punch-hole camera */}
        <div className="flex items-center justify-center" style={{ height: topBezel, marginBottom: 2 * s }}>
          <div
            style={{
              width: camSize,
              height: camSize,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #1a1a1a, #0a0a0a)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 0 5px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* Screen */}
        <div className="overflow-hidden" style={{ borderRadius: rInner, background: BG }}>
          <img src={src} alt={alt} className="block w-full h-auto" />
        </div>

        {/* Bottom bezel with USB-C pill */}
        <div className="flex items-center justify-center" style={{ height: botBezel, marginTop: 2 * s }}>
          <div
            style={{
              width: 22 * s,
              height: 3 * s,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
