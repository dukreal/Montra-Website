import { useEffect, useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { MONTHS, M3, sameDay } from "@/web/dates";
import { ACCENT, ACCENT_TEXT, BORDER, CARD, ON_ACCENT, SUB, TEXT, aTint } from "@/web/theme";
import type { Tx } from "@/web/types";
import { IcoChevLeft, IcoChevRight } from "@/web/icons";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const cellBtn: React.CSSProperties = { border: "none", background: "none", padding: 0, cursor: "pointer", font: "inherit" };

/* ─── PhoneDateSheet ─────────────────────────────────────────────────────── */
/* Phone bottom sheet opened from the Home month pill: year arrows, a 4 x 3 month grid and a full
   month calendar. It only edits a DRAFT date (`draft`): the page behind does not change while you
   browse. "Done" applies the draft (onDone); the dimmed area and Escape close it and throw the draft away.
   Rendered inside the app shell (not inside the scrolling page) so the Text Size zoom and the
   page's overflow can never shift or clip it. */
export function PhoneDateSheet({ open, draft, today, transactions, showDots, onDraft, onDone, onCancel }: {
  open: boolean;
  draft: Date;
  today: Date;
  transactions: Tx[];
  showDots: boolean;
  onDraft: (d: Date) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const host = typeof document === "undefined" ? null : document.querySelector(".montra-shell");

  const year = draft.getFullYear();
  const month = draft.getMonth();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const atNow = year >= today.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  /* Always 6 week rows, so the sheet keeps the same height whichever month is shown */
  const cells: (number | null)[] = Array.from({ length: 42 }, (_, i) => (i >= firstDay && i < firstDay + daysInMonth ? i - firstDay + 1 : null));

  /* Days with transactions in the month shown in the sheet */
  const txDays = useMemo(() => {
    const set = new Set<number>();
    transactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate());
    });
    return set;
  }, [transactions, year, month]);

  /* New draft in another month/year: keep the same day number, but never past the month's end or past today */
  const moveTo = (y: number, m: number) => {
    const cap = y === today.getFullYear() && m === today.getMonth() ? today.getDate() : new Date(y, m + 1, 0).getDate();
    onDraft(new Date(y, m, Math.min(draft.getDate(), cap)));
  };
  const changeYear = (delta: number) => {
    const y = year + delta;
    moveTo(y, y === today.getFullYear() ? Math.min(month, today.getMonth()) : month);
  };

  /* While open: move focus into the sheet, cancel on Escape, keep Tab inside, and give focus back on close */
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onCancel(); return; }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const items = [...sheetRef.current.querySelectorAll<HTMLElement>("button:not(:disabled)")];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); before?.focus?.(); };
  }, [open, onCancel]);

  if (!host) return null;
  return createPortal(
    <>
      <div className="montra-scrim" onClick={onCancel} aria-hidden="true" style={{
        position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.6)",
        opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", transition: open ? "opacity 0.22s ease" : "opacity 0.22s ease, visibility 0s linear 0.22s",
      }} />
      <div ref={sheetRef} className="montra-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 1101, margin: "0 auto", maxWidth: 560, outline: "none",
        maxHeight: "calc(100dvh - 24px)", overflowY: "auto", overscrollBehavior: "contain",
        background: CARD, border: `1px solid ${BORDER}`, borderBottom: "none", borderRadius: "24px 24px 0 0",
        padding: "10px 16px calc(8px + env(safe-area-inset-bottom))", boxShadow: "0 -18px 48px rgba(0,0,0,0.4)",
        transform: open ? "none" : "translateY(100%)", visibility: open ? "visible" : "hidden",
        /* Visible at once when opening (so focus can move in); hidden only after the slide-down ends */
        transition: open ? "transform 0.26s cubic-bezier(.2,.8,.2,1)" : "transform 0.26s cubic-bezier(.2,.8,.2,1), visibility 0s linear 0.26s",
      }}>
        <div aria-hidden="true" style={{ width: 40, height: 4, borderRadius: 2, margin: "0 auto 10px", background: "color-mix(in srgb, var(--sub) 55%, transparent)" }} />
        <h2 id={titleId} style={{ margin: "0 0 4px", textAlign: "center", fontSize: 18, fontWeight: 800, color: TEXT }}>Select Date</h2>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <button type="button" aria-label="Previous year" onClick={() => changeYear(-1)} style={{ ...cellBtn, width: 48, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcoChevLeft size={22} color={TEXT} />
          </button>
          <span aria-live="polite" style={{ fontSize: 18, fontWeight: 800, color: TEXT }}>{year}</span>
          <button type="button" aria-label="Next year" disabled={atNow} onClick={() => changeYear(1)}
            style={{ ...cellBtn, width: 48, height: 44, display: "flex", alignItems: "center", justifyContent: "center", opacity: atNow ? 0.25 : 1, cursor: atNow ? "not-allowed" : "pointer" }}>
            <IcoChevRight size={22} color={TEXT} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
          {M3.map((m, mi) => {
            const future = year > today.getFullYear() || (year === today.getFullYear() && mi > today.getMonth());
            const cur = mi === month;
            return (
              <button key={m} type="button" disabled={future} aria-pressed={cur} aria-label={`${MONTHS[mi]} ${year}`} onClick={() => moveTo(year, mi)} style={{
                ...cellBtn, height: 44, borderRadius: 12, fontSize: 16, fontWeight: cur ? 800 : 600,
                background: cur ? ACCENT : "transparent", color: cur ? ON_ACCENT : TEXT,
                opacity: future ? 0.3 : 1, cursor: future ? "not-allowed" : "pointer",
              }}>{m}</button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "10px 0 2px" }}>
          {WEEKDAYS.map((d) => <span key={d} aria-hidden="true" style={{ textAlign: "center", fontSize: 14, fontWeight: 600, color: SUB }}>{d}</span>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
          {cells.map((day, i) => {
            if (!day) return <span key={i} aria-hidden="true" style={{ height: 44 }} />;
            const date = new Date(year, month, day);
            const future = date > todayStart;
            const isSel = sameDay(date, draft);
            const isToday = sameDay(date, today);
            return (
              <button key={i} type="button" disabled={future} aria-pressed={isSel} aria-label={`${MONTHS[month]} ${day}, ${year}`} onClick={() => onDraft(date)} style={{
                ...cellBtn, position: "relative", height: 44, borderRadius: 12, fontSize: 16, fontWeight: isSel || isToday ? 800 : 500,
                background: isSel ? ACCENT : "transparent", color: isSel ? ON_ACCENT : isToday ? ACCENT_TEXT : TEXT,
                boxShadow: isToday && !isSel ? `inset 0 0 0 1.5px ${aTint(40)}` : "none",
                opacity: future ? 0.3 : 1, cursor: future ? "not-allowed" : "pointer",
              }}>
                {day}
                {showDots && txDays.has(day) && (
                  <span aria-hidden="true" style={{ position: "absolute", bottom: 4, left: "50%", marginLeft: -2, width: 4, height: 4, borderRadius: "50%", background: isSel ? ON_ACCENT : ACCENT }} />
                )}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={onDone} style={{ ...cellBtn, position: "sticky", bottom: 0, background: CARD, width: "100%", height: 52, fontSize: 17, fontWeight: 800, color: ACCENT_TEXT }}>Done</button>
      </div>
    </>,
    host,
  );
}