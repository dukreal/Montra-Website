import { ACCENT, BORDER, CARD, RED, SUB, SURFACE, TEXT } from "@/web/theme";

export const profileRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, width: "100%",
  padding: "14px 16px", background: "none", border: "none",
  borderBottom: `1px solid ${BORDER}`, cursor: "pointer",
};

/* ─── Shared style helpers ────────────────────────────────────────────────── */
export const btnReset: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", padding: 4,
  display: "flex", alignItems: "center", justifyContent: "center",
};
export const navBtnStyle: React.CSSProperties = {
  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
  padding: "7px 10px",
};
export const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, backdropFilter: "blur(6px)",
};
export const modalBox: React.CSSProperties = {
  background: CARD, borderRadius: 24, padding: 32, maxWidth: "90vw",
  border: `1px solid ${BORDER}`, position: "relative",
};
export const fieldLabel: React.CSSProperties = {
  fontSize: 14, color: SUB, fontWeight: 700, letterSpacing: "0.07em",
  display: "block", marginBottom: 8,
};
export const inputStyle: React.CSSProperties = {
  width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
  padding: "12px 14px", color: TEXT, fontSize: 16, outline: "none",
  boxSizing: "border-box",
};
export const primaryBtn: React.CSSProperties = {
  background: ACCENT, color: "#fff", border: "none", borderRadius: 12,
  padding: "12px 20px", fontWeight: 700, fontSize: 16, cursor: "pointer",
};
export const outlineBtn: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${BORDER}`,
  background: SURFACE, color: TEXT, cursor: "pointer", fontWeight: 600, fontSize: 16,
};
export const dangerBtn: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${RED}55`,
  background: "#FF6B6B14", color: RED, cursor: "pointer", fontWeight: 600, fontSize: 16,
};
