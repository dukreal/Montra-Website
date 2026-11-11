import { useEffect, useMemo, useRef, useState } from "react";
import { MONTHS, M3, sameDay } from "@/web/dates";
import { fmtAmt } from "@/web/helpers";
import { btnReset } from "@/web/styles";
import { ACCENT, ACCENT_TEXT, BORDER, CARD, CARD2, GREEN_TEXT, ON_ACCENT, RED_TEXT, SUB, TEXT, aTint } from "@/web/theme";
import type { Tx } from "@/web/types";
import { IoSettingsOutline } from "react-icons/io5";
import { IcoChevDown, IcoChevLeft, IcoChevRight } from "@/web/icons";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/* ─── PhoneHomeBar ───────────────────────────────────────────────────────── */
/* Phone-only Home header (shown under 860px, hidden by CSS above that): title and settings,
   month pill with a month/year picker, a scrolling day strip, and an Income / Expense / Balance card.
   It reads and writes the same calendar state as the desktop calendar. */
export function PhoneHomeBar({ year, month, transactions, selectedDay, income, expense, currency, onSelectDay, onJump, onOpenSettings }: {
  year: number;
  month: number;
  transactions: Tx[];
  selectedDay: Date | null;
  income: number;
  expense: number;
  currency: string;
  onSelectDay: (d: Date) => void;
  onJump: (year: number, month: number) => void;
  onOpenSettings: () => void;
}) {
  const [today] = useState(() => new Date());
  const [picking, setPicking] = useState(false);
  const [pickYear, setPickYear] = useState(year);
  const stripRef = useRef<HTMLDivElement>(null);

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  const balance = income - expense;

  const txDays = useMemo(() => {
    const set = new Set<number>();
    transactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) set.add(d.getDate());
    });
    return set;
  }, [transactions, year, month]);

  /* Keep the picked day (or today) centred in the strip */
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>("[data-selected='true']") ?? el.querySelector<HTMLElement>("[data-today='true']");
    el.scrollLeft = target ? target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2 : 0;
  }, [year, month, selectedDay]);

  const summary: [string, string, string][] = [
    ["Income", `+${fmtAmt(income, currency)}`, GREEN_TEXT],
    ["Expense", `-${fmtAmt(expense, currency)}`, RED_TEXT],
    ["Balance", `${balance < 0 ? "-" : ""}${fmtAmt(Math.abs(balance), currency)}`, balance < 0 ? RED_TEXT : TEXT],
  ];

  return (
    <div className="montra-phone-home">
      <div style={{ position: "relative", textAlign: "center", minHeight: 44, marginBottom: 12 }}>
        <h1 style={{ margin: 0, lineHeight: "44px", color: TEXT, fontSize: 24, fontWeight: 800 }}>Montra</h1>
        <button type="button" onClick={onOpenSettings} aria-label="Settings"
          style={{ ...btnReset, position: "absolute", right: 0, top: 0, width: 44, height: 44, borderRadius: "50%", background: CARD, border: `1px solid ${BORDER}` }}>
          <IoSettingsOutline size={22} color={TEXT} />
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
        <button type="button" aria-expanded={picking} onClick={() => { setPickYear(year); setPicking((v) => !v); }}
          style={{ ...btnReset, gap: 8, minHeight: 44, padding: "0 18px", borderRadius: 22, background: aTint(14), color: ACCENT_TEXT, fontWeight: 700, fontSize: 16 }}>
          {MONTHS[month]} {year}
          <IcoChevDown size={16} color={ACCENT_TEXT} />
        </button>
      </div>

      {picking && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button type="button" aria-label="Previous year" onClick={() => setPickYear((y) => y - 1)} style={{ ...btnReset, width: 44, height: 44 }}>
              <IcoChevLeft size={18} color={SUB} />
            </button>
            <span style={{ fontWeight: 800, color: TEXT, fontSize: 16 }}>{pickYear}</span>
            <button type="button" aria-label="Next year" disabled={pickYear >= today.getFullYear()} onClick={() => setPickYear((y) => y + 1)}
              style={{ ...btnReset, width: 44, height: 44, opacity: pickYear >= today.getFullYear() ? 0.25 : 1, cursor: pickYear >= today.getFullYear() ? "not-allowed" : "pointer" }}>
              <IcoChevRight size={18} color={SUB} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {M3.map((m, mi) => {
              const future = pickYear > today.getFullYear() || (pickYear === today.getFullYear() && mi > today.getMonth());
              const cur = pickYear === year && mi === month;
              return (
                <button key={m} type="button" disabled={future} aria-pressed={cur} onClick={() => { onJump(pickYear, mi); setPicking(false); }}
                  style={{ minHeight: 44, borderRadius: 10, border: "none", fontSize: 15, fontWeight: cur ? 700 : 500, background: cur ? ACCENT : CARD2, color: cur ? ON_ACCENT : TEXT, cursor: future ? "not-allowed" : "pointer", opacity: future ? 0.3 : 1 }}>
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div ref={stripRef} className="montra-daystrip" role="group" aria-label="Pick a day"
        style={{ position: "relative", display: "flex", gap: 6, overflowX: "auto", padding: "4px 0 8px", marginBottom: 12 }}>
        {days.map((d) => {
          const isSel = !!selectedDay && sameDay(d, selectedDay);
          const isToday = sameDay(d, today);
          const future = d > todayStart;
          const hasTx = txDays.has(d.getDate());
          return (
            <button key={d.getDate()} type="button" disabled={future} data-selected={isSel} data-today={isToday} aria-pressed={isSel}
              aria-label={`${MONTHS[month]} ${d.getDate()}`} onClick={() => onSelectDay(d)}
              style={{
                flex: "0 0 52px", height: 72, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                padding: 0, borderRadius: 14, border: "none", background: isSel ? ACCENT : "transparent",
                cursor: future ? "not-allowed" : "pointer", opacity: future ? 0.3 : 1,
              }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: isSel ? ON_ACCENT : SUB }}>{WEEKDAYS[d.getDay()]}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: isSel ? ON_ACCENT : isToday ? ACCENT_TEXT : TEXT }}>{d.getDate()}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: hasTx ? (isSel ? ON_ACCENT : ACCENT) : "transparent" }} />
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "16px 8px" }}>
        {summary.map(([label, value, color]) => (
          <div key={label} style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 14, color: SUB, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color, overflowWrap: "anywhere" }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
