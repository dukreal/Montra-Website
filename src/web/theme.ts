/* ─── Tokens ─────────────────────────────────────────────────────────────── */
/* Theme tokens resolve to CSS variables so the Settings screen can retint the
   whole app live (dark/light mode + accent color). RED / GREEN are semantic and
   stay fixed. Accent tints use color-mix since the accent is a runtime variable. */
export const BG = "var(--bg)";
export const SURFACE = "var(--surface)";
export const CARD = "var(--card)";
export const CARD2 = "var(--card2)";
export const BORDER = "var(--border)";
export const TEXT = "var(--text)";
export const SUB = "var(--sub)";
export const ACCENT = "var(--accent)";
export const RED = "#FF6B6B";
export const GREEN = "#2ECC71";
export const aTint = (pct: number) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

/* Accent themes — mirrors the mobile Settings "Color Theme" swatches */
export const ACCENT_THEMES = [
  { key: "#27AE60", name: "Green" },
  { key: "#3B7DD8", name: "Blue" },
  { key: "#E67E22", name: "Orange" },
  { key: "#E05282", name: "Rose" },
];
export const PALETTES: Record<"dark" | "light", Record<string, string>> = {
  dark: { "--bg": "#0d0d0d", "--surface": "#141414", "--card": "#1c1c1c", "--card2": "#222222", "--border": "#282828", "--text": "#f8f8f8", "--sub": "#b0b0b0" },
  light: { "--bg": "#f3f5f9", "--surface": "#ffffff", "--card": "#ffffff", "--card2": "#eceff5", "--border": "#d3d8e2", "--text": "#10141c", "--sub": "#4a5365" },
};
export const TEXT_SCALE: Record<string, number> = { small: 0.92, medium: 1, large: 1.1 };
