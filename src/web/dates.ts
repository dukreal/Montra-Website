import type { DateSel } from "@/web/types";

/* ─── Date Helpers ────────────────────────────────────────────────────────── */
export const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const M3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function fmtDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${M3[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

export function fmtTime(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
export const isRange = (s: DateSel | null) => !!s && !sameDay(s.start, s.end);
export function inDateSel(iso: string, s: DateSel) {
  const t = new Date(iso);
  const from = new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate());
  const to = new Date(s.end.getFullYear(), s.end.getMonth(), s.end.getDate() + 1);
  return t >= from && t < to;
}
export function fmtDateSel(s: DateSel) {
  if (!isRange(s)) return fmtDate(s.start);
  const a = s.start, b = s.end;
  if (a.getFullYear() === b.getFullYear()) return `${M3[a.getMonth()]} ${a.getDate()} – ${M3[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}

export function mondayOf(src: Date) {
  const d = new Date(src.getFullYear(), src.getMonth(), src.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}
export function isoWeekNum(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((+t - +y0) / 864e5 + 1) / 7);
}
export const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
