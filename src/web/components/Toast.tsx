import { ACCENT } from "@/web/theme";
import { IcoCheck } from "@/web/icons";

/* ─── Toast ──────────────────────────────────────────────────────────────── */
export function Toast({ message }: { message: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      background: ACCENT, color: "#fff", padding: "12px 20px", borderRadius: 14,
      fontWeight: 700, fontSize: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", gap: 8,
      animation: "slideUp 0.2s ease",
    }}>
      <IcoCheck size={16} color="#fff" />
      {message}
    </div>
  );
}
