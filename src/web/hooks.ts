import { useState } from "react";
import { isRange, sameDay } from "@/web/dates";
import type { DateSel, DateMode } from "@/web/types";

/* Click logic shared by Home and Search. Day mode picks one day (click it again to clear);
   range mode takes a start click, then an end click. */
export function useDateSelection(initial: DateSel | null) {
  const [sel, setSel] = useState<DateSel | null>(initial);
  const [mode, setModeState] = useState<DateMode>("day");
  const [pending, setPending] = useState<Date | null>(null);
  /** Returns true once the selection is complete */
  const pick = (d: Date) => {
    if (mode === "day") {
      setSel(sel && !isRange(sel) && sameDay(sel.start, d) ? null : { start: d, end: d });
      return true;
    }
    if (!pending) { setPending(d); setSel({ start: d, end: d }); return false; }
    setSel(pending <= d ? { start: pending, end: d } : { start: d, end: pending });
    setPending(null);
    return true;
  };
  const setMode = (m: DateMode) => {
    setModeState(m);
    setPending(null);
    if (m === "day" && isRange(sel)) setSel(null);
  };
  const clear = () => { setSel(null); setPending(null); };
  /* Stop waiting for an end date; keeps the start day selected */
  const settle = () => setPending(null);
  return { sel, mode, pending, pick, setMode, clear, settle };
}

/* ─── HomeTab ─────────────────────────────────────────────────────────────── */
/* Home's calendar state lives in AppShell so the shown month and the picked day/range
   survive switching to other tabs and back. */
export function useHomeCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const dates = useDateSelection((() => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return { start: d, end: d };
  })());
  return { year, setYear, month, setMonth, dates };
}
export type HomeCalendar = ReturnType<typeof useHomeCalendar>;
