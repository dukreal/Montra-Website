import { useState, useRef, useEffect, useMemo } from "react";
import { isRange, MONTHS, sameDay, fmtDateSel } from "@/web/dates";
import { btnReset } from "@/web/styles";
import { CARD, BORDER, SUB, aTint, ACCENT, TEXT, CARD2, SURFACE } from "@/web/theme";
import type { Tx, DateSel, DateMode } from "@/web/types";
import { IcoChevLeft, IcoChevRight } from "@/web/icons";

/* ─── MiniCalendar ───────────────────────────────────────────────────────── */
/* The visible panel (days or month/year picker) sits in normal flow and sets the card height;
   the hidden one is lifted out of flow while it fades, so the card can shrink/grow to fit. */
const calLayer = (active: boolean): React.CSSProperties => ({
  gridArea: "1 / 1",
  position: active ? "relative" : "absolute", top: 0, left: 0, right: 0,
  opacity: active ? 1 : 0, visibility: active ? "visible" : "hidden",
  pointerEvents: active ? "auto" : "none",
  transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
});
export function MiniCalendar({ year, month, transactions, selection, pending = null, mode = "day", onModeChange, onSelectDay, onPrevMonth, onNextMonth, onJump }: {
  year: number;
  month: number;
  transactions: Tx[];
  selection: DateSel | null;
  pending?: Date | null;
  mode?: DateMode;
  onModeChange?: (m: DateMode) => void;
  onSelectDay: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJump: (year: number, month: number) => void;
}) {
  const today = new Date();
  const [picking, setPicking] = useState(false);
  // Animate the card height when the month needs 5 vs 6 week rows
  const innerRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState<number | null>(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);
  const [pickYear, setPickYear] = useState(year);
  const [hoverDay, setHoverDay] = useState<Date | null>(null);
  // While picking a range end, preview the range up to the hovered day
  const shown: DateSel | null = pending
    ? hoverDay
      ? (pending <= hoverDay ? { start: pending, end: hoverDay } : { start: hoverDay, end: pending })
      : { start: pending, end: pending }
    : selection;
  const spans = isRange(shown);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const atCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const txDays = useMemo(() => {
    const set = new Set<number>();
    const txExpDays = new Set<number>();
    transactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
        if (tx.type === "expense") txExpDays.add(d.getDate());
      }
    });
    return { any: set, exp: txExpDays };
  }, [transactions, year, month]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{
      background: CARD, borderRadius: 18, border: `1px solid ${BORDER}`, overflow: "hidden",
      height: cardH === null ? "auto" : cardH + 2, transition: "height 0.4s cubic-bezier(.2,.8,.2,1)",
    }}>
     <div ref={innerRef} style={{ padding: "18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={onPrevMonth} style={btnReset}>
          <IcoChevLeft size={17} color={SUB} />
        </button>
        <button onClick={() => { setPickYear(year); setPicking((v) => !v); }} aria-expanded={picking}
          style={{ ...btnReset, gap: 6, padding: "6px 12px", borderRadius: 10, background: picking ? aTint(14) : "transparent", fontWeight: 700, color: picking ? ACCENT : TEXT, fontSize: 16 }}>
          {MONTHS[month]} {year}
          <span style={{ fontSize: 11, transform: picking ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
        </button>
        <button onClick={() => !atCurrentMonth && onNextMonth()} disabled={atCurrentMonth} style={{ ...btnReset, opacity: atCurrentMonth ? 0.25 : 1, cursor: atCurrentMonth ? "not-allowed" : "pointer" }}>
          <IcoChevRight size={17} color={SUB} />
        </button>
      </div>

      <div style={{ display: "grid", position: "relative" }}>
        <div style={{ ...calLayer(picking), transform: picking ? "none" : "scale(0.97)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => setPickYear((y) => y - 1)} style={btnReset}><IcoChevLeft size={16} color={SUB} /></button>
            <span style={{ fontWeight: 800, color: TEXT, fontSize: 16 }}>{pickYear}</span>
            <button onClick={() => pickYear < today.getFullYear() && setPickYear((y) => y + 1)} disabled={pickYear >= today.getFullYear()}
              style={{ ...btnReset, opacity: pickYear >= today.getFullYear() ? 0.25 : 1, cursor: pickYear >= today.getFullYear() ? "not-allowed" : "pointer" }}>
              <IcoChevRight size={16} color={SUB} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {MONTHS.map((m, mi) => {
              const future = pickYear > today.getFullYear() || (pickYear === today.getFullYear() && mi > today.getMonth());
              const cur = pickYear === year && mi === month;
              return (
                <button key={m} disabled={future} onClick={() => { onJump(pickYear, mi); setPicking(false); }} style={{
                  padding: "12px 0", borderRadius: 10, fontSize: 15, fontWeight: cur ? 700 : 500,
                  background: cur ? ACCENT : CARD2, color: cur ? "#fff" : TEXT,
                  border: "none", cursor: future ? "not-allowed" : "pointer", opacity: future ? 0.3 : 1,
                }}>{m.slice(0, 3)}</button>
              );
            })}
          </div>
        </div>
        <div style={{ ...calLayer(!picking), transform: picking ? "scale(1.03)" : "none" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 14, color: SUB, fontWeight: 700, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }} onMouseLeave={() => setHoverDay(null)}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} style={{ aspectRatio: "1" }} />;
          const date = new Date(year, month, day);
          const isToday = sameDay(date, today);
          const isStart = !!shown && sameDay(date, shown.start);
          const isEnd = !!shown && sameDay(date, shown.end);
          const isSel = isStart || isEnd;
          const inside = spans && !!shown && date > shown.start && date < shown.end;
          const band = spans && (inside || isSel);
          // Round the range band at its ends and where a week row starts/ends
          const col = i % 7;
          const roundL = band && (isStart || col === 0 || day === 1) ? 8 : 0;
          const roundR = band && (isEnd || col === 6 || day === daysInMonth) ? 8 : 0;
          const hasTx = txDays.any.has(day);
          const future = date > todayStart;
          return (
            <div key={i} style={{
              background: band ? aTint(16) : "transparent",
              borderRadius: `${roundL}px ${roundR}px ${roundR}px ${roundL}px`,
              transition: "background 0.15s",
            }}>
              <button
                disabled={future}
                onClick={() => { setHoverDay(date); onSelectDay(date); }}
                onMouseEnter={() => { if (pending) setHoverDay(date); }}
                style={{
                  width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", aspectRatio: "1", borderRadius: 8,
                  background: isSel ? ACCENT : isToday && !band ? aTint(9) : "transparent",
                  border: isToday && !isSel && !band ? `1px solid ${aTint(33)}` : "none",
                  cursor: future ? "not-allowed" : "pointer", gap: 2, padding: 0,
                  opacity: future ? 0.3 : 1,
                  transition: "background 0.15s",
                }}
              >
                <span style={{
                  fontSize: 15,
                  fontWeight: isSel || isToday ? 700 : 400,
                  color: isSel ? "#fff" : isToday ? ACCENT : TEXT,
                }}>
                  {day}
                </span>
                {hasTx && !isSel && (
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: ACCENT, display: "block" }} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {onModeChange && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
          <div role="group" aria-label="Selection mode" style={{ display: "flex", gap: 2, padding: 3, borderRadius: 10, background: CARD2, flexShrink: 0 }}>
            {(["day", "range"] as const).map((m) => (
              <button key={m} onClick={() => onModeChange(m)} aria-pressed={mode === m} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                background: mode === m ? SURFACE : "transparent", color: mode === m ? ACCENT : SUB,
              }}>{m === "day" ? "Day" : "Range"}</button>
            ))}
          </div>
          <span style={{ fontSize: 14, color: pending ? ACCENT : SUB, fontWeight: pending ? 600 : 400, textAlign: "right" }}>
            {mode === "day"
              ? "Pick a day"
              : pending
              ? "Now pick an end date"
              : selection && isRange(selection)
              ? fmtDateSel(selection)
              : "Pick a start date"}
          </span>
        </div>
      )}
        </div>
      </div>
     </div>
    </div>
  );
}
