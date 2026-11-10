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
/* Accent colour for TEXT and icons. Light theme uses a deeper shade, dark theme a slightly lighter one for blue and rose,
   so the text stays readable (4.5:1 or more) on every surface. Fills and borders keep ACCENT. */
export const ACCENT_TEXT = "var(--accent-text)";
export const RED = "#FF6B6B";
export const GREEN = "#2ECC71";
/* Text drawn on a solid accent / green / red fill. White fails contrast on all of these (2.1 to 4.1:1),
   so the text is near-black (4.7 to 9.2:1). */
export const ON_ACCENT = "#0b0f0c";
export const ON_RED = "#2b0a0a";
export const aTint = (pct: number) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

/* Accent themes — mirrors the mobile Settings "Color Theme" swatches */
export const ACCENT_THEMES = [
  { key: "#27AE60", name: "Green", text: { dark: "#2db065", light: "#19713e" } },
  { key: "#3B7DD8", name: "Blue", text: { dark: "#6297e0", light: "#2d60a6" } },
  { key: "#E67E22", name: "Orange", text: { dark: "#e68126", light: "#965216" } },
  { key: "#E05282", name: "Rose", text: { dark: "#e56f97", light: "#a43c5f" } },
];
/* Readable text shade of an accent colour for the given theme (falls back to the accent itself). */
export const accentTextFor = (accent: string, theme: "dark" | "light") =>
  ACCENT_THEMES.find((a) => a.key.toLowerCase() === accent.toLowerCase())?.text[theme] ?? accent;
export const PALETTES: Record<"dark" | "light", Record<string, string>> = {
  dark: { "--bg": "#0d0d0d", "--surface": "#141414", "--card": "#1c1c1c", "--card2": "#222222", "--border": "#282828", "--text": "#f8f8f8", "--sub": "#b0b0b0" },
  light: { "--bg": "#f3f5f9", "--surface": "#ffffff", "--card": "#ffffff", "--card2": "#eceff5", "--border": "#d3d8e2", "--text": "#10141c", "--sub": "#4a5365" },
};
export const TEXT_SCALE: Record<string, number> = { small: 0.92, medium: 1, large: 1.1 };
