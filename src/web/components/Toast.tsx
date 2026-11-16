import { ACCENT, ON_ACCENT, ON_RED, RED } from "@/web/theme";
import { IcoCheck, IcoX } from "@/web/icons";

/* ─── Toast ──────────────────────────────────────────────────────────────── */
export function Toast({ message, error = false }: { message: string; error?: boolean }) {
  const ink = error ? ON_RED : ON_ACCENT;
  return (
    <div className="montra-toast" style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      maxWidth: "min(420px, calc(100vw - 56px))",
      background: error ? RED : ACCENT, color: ink, padding: "12px 20px", borderRadius: 14,
      fontWeight: 700, fontSize: 16, lineHeight: 1.35, boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "slideUp 0.2s ease",
    }}>
      <span style={{ display: "flex", flexShrink: 0 }}>
        {error ? <IcoX size={16} color={ink} /> : <IcoCheck size={16} color={ink} />}
      </span>
      <span>{message}</span>
    </div>
  );
}