import logoUrl from '@/assets/images/logo.png'

export default function Logo({ size = 22, tone = "light" }: { size?: number; tone?: "light" | "dark" }) {
  const chip = size + 18;
  return (
    <div className="flex items-center gap-2.5 select-none">
      <span
        className="grid place-items-center rounded-xl shrink-0"
        style={{
          width: chip,
          height: chip,
          background: tone === "dark" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${tone === "dark" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)"}`,
        }}
      >
        <img src={logoUrl} alt="Montra logo" style={{ width: size + 4, height: size + 4, padding: 0 }} className="object-contain" />
      </span>
      <span className="font-black tracking-tight" style={{ fontSize: size + 3, color: tone === "dark" ? "#0b0b0b" : "#ffffff" }}>
        Montra
      </span>
    </div>
  );
}
