/* ─── Types ──────────────────────────────────────────────────────────────── */
export type TxType = "expense" | "income";
export interface Tx {
  id: string;
  amount: number;
  type: TxType;
  parent_category: string;
  sub_category: string;
  notes: string;
  created_at: string;
  is_edited?: boolean;
  last_edited_at?: string | null;
  original_amount?: number | null;
  original_notes?: string | null;
}
export type ThemeMode = "dark" | "light";
export type TextSize = "small" | "medium" | "large";
export type Language = "english" | "filipino";
export interface Settings {
  currency: string;
  theme: ThemeMode;
  accent: string;
  textSize: TextSize;
  language: Language;
}

/* ─── Date selection (single day or range) ───────────────────────────────── */
export type DateSel = { start: Date; end: Date };
export type DateMode = "day" | "range";

export type Tab = "home" | "add" | "analytics" | "search" | "profile" | "settings";
