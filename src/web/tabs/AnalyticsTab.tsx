import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { mondayOf, MONTHS, isoWeekNum, fmtShort, fmtDate } from "@/web/dates";
import { fmtAmt, getCat } from "@/web/helpers";
import { btnReset, navBtnStyle } from "@/web/styles";
import { SUB, BORDER, TEXT, CARD, ACCENT, CARD2, aTint, GREEN, RED } from "@/web/theme";
import type { Tx, TxType } from "@/web/types";
import { IcoChevLeft, IcoChevRight, CatIcon } from "@/web/icons";

/* ─── DonutChart ─────────────────────────────────────────────────────────── */
interface Segment { value: number; color: string; name: string; icon: string }

function DonutChart({ segments, size = 220, hole = 110, currency, activeName, onSelect }: {
  segments: Segment[];
  size?: number;
  hole?: number;
  currency: string;
  activeName?: string | null;
  onSelect?: (seg: Segment | null) => void;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const total = segments.reduce((s, d) => s + d.value, 0);
  const pad = 10; // room for the pop-out offset
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - pad;
  const ri = hole / 2;

  if (total === 0) {
    return (
      <div style={{ width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ color: SUB, fontSize: 16 }}>No data yet</span>
      </div>
    );
  }

  const gap = segments.length > 1 ? 2.2 : 0; // degrees between slices
  let ang = -90;
  const arcs = segments.map((seg, i) => {
    const sweep = (seg.value / total) * 360;
    const start = ang;
    ang += sweep;
    const g = Math.min(gap, sweep * 0.4) / 2;
    return { ...seg, start: start + g, end: ang - g, mid: (start + ang) / 2, i };
  });

  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });
  const arcPath = (start: number, end: number) => {
    // A full circle needs two half arcs to render
    if (end - start >= 359.9) {
      const a1 = toXY(start, R), a2 = toXY(start + 180, R), b1 = toXY(start + 180, ri), b2 = toXY(start, ri);
      return `M ${a1.x} ${a1.y} A ${R} ${R} 0 1 1 ${a2.x} ${a2.y} A ${R} ${R} 0 1 1 ${a1.x} ${a1.y} M ${b2.x} ${b2.y} A ${ri} ${ri} 0 1 0 ${b1.x} ${b1.y} A ${ri} ${ri} 0 1 0 ${b2.x} ${b2.y} Z`;
    }
    const p1 = toXY(start, R), p2 = toXY(end, R), p3 = toXY(end, ri), p4 = toXY(start, ri);
    const lg = end - start > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${lg} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ri} ${ri} 0 ${lg} 0 ${p4.x} ${p4.y} Z`;
  };

  const activeIdx = activeName ? segments.findIndex((x) => x.name === activeName) : -1;
  const focus = hov !== null ? hov : activeIdx >= 0 ? activeIdx : null;
  const focusSeg = focus !== null ? segments[focus] : null;
  const amtStr = fmtAmt(focusSeg ? focusSeg.value : total, currency);
  const amtSize = Math.max(14, Math.min(26, Math.floor(((hole - 28) / (amtStr.length * 0.62)))));

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, animation: "donutIn 0.6s cubic-bezier(.2,.8,.2,1) both" }}>
      <svg width={size} height={size} style={{ display: "block", overflow: "visible" }} role="img" aria-label="Category breakdown chart">
        <circle cx={cx} cy={cy} r={(R + ri) / 2} fill="none" stroke={BORDER} strokeOpacity={0.35} strokeWidth={R - ri} />
        {arcs.map((arc) => {
          const on = focus === arc.i;
          const off = on ? 8 : 0;
          const dx = Math.cos((arc.mid * Math.PI) / 180) * off;
          const dy = Math.sin((arc.mid * Math.PI) / 180) * off;
          return (
            <path
              key={arc.i}
              d={arcPath(arc.start, arc.end)}
              fill={arc.color}
              opacity={focus === null || on ? 1 : 0.35}
              style={{ transition: "opacity 0.2s ease, transform 0.25s ease", transform: `translate(${dx}px, ${dy}px)`, cursor: "pointer" }}
              onMouseEnter={() => setHov(arc.i)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onSelect?.(activeName === arc.name ? null : segments[arc.i])}
            />
          );
        })}
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        textAlign: "center", pointerEvents: "none", width: hole - 16,
      }}>
        <div style={{ fontSize: 13, color: SUB, marginBottom: 4, fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {focusSeg ? focusSeg.name.split(" & ")[0].toUpperCase() : "TOTAL"}
        </div>
        <div style={{ fontSize: amtSize, fontWeight: 800, color: focusSeg ? focusSeg.color : TEXT, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          {amtStr}
        </div>
        {focusSeg && (
          <div style={{ fontSize: 14, color: SUB, marginTop: 4, fontWeight: 600 }}>
            {((focusSeg.value / total) * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── AnalyticsTab ───────────────────────────────────────────────────────── */
function GhostPie({ size = 64 }: { size?: number }) {
  // Three slices: 0°→110°→230°→360° (from 12 o'clock, clockwise)
  // Point on circle: x = 32 + 28·sin(θ°), y = 32 − 28·cos(θ°)
  // p0 = 0°  → (32, 4)
  // p1 = 110° → (58.31, 41.58)   110° span → large-arc 0
  // p2 = 230° → (10.55, 50.00)   120° span → large-arc 0
  // back to p0                    130° span → large-arc 0
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3 }}>
      <path d="M32 32 L32 4 A28 28 0 0 1 58.31 41.58 Z" fill="#888" />
      <path d="M32 32 L58.31 41.58 A28 28 0 0 1 10.55 50 Z" fill="#888" opacity="0.65" />
      <path d="M32 32 L10.55 50 A28 28 0 0 1 32 4 Z" fill="#888" opacity="0.38" />
      <line x1="32" y1="32" x2="32" y2="4" stroke="var(--bg,#111)" strokeWidth="1.5" />
      <line x1="32" y1="32" x2="58.31" y2="41.58" stroke="var(--bg,#111)" strokeWidth="1.5" />
      <line x1="32" y1="32" x2="10.55" y2="50" stroke="var(--bg,#111)" strokeWidth="1.5" />
    </svg>
  );
}

/* Wraps content in a card whose height animates smoothly as the content changes */
function AnimatedCard({ children, style, padding = 20 }: { children: React.ReactNode; style?: React.CSSProperties; padding?: number }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    setH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);
  return (
    <div style={{
      background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden",
      height: h === null ? "auto" : h + 2, transition: "height 0.45s cubic-bezier(.2,.8,.2,1)", ...style,
    }}>
      <div ref={innerRef} style={{ padding }}>{children}</div>
    </div>
  );
}

export function AnalyticsTab({ txs, currency }: { txs: Tx[]; currency: string }) {
  const [txType, setTxType] = useState<TxType>("expense");
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("month");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedSeg, setSelectedSeg] = useState<Segment | null>(null);

  // The donut is 280px, but shrinks to fit the card on narrow phones.
  const [viewportW, setViewportW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const donutSize = Math.max(200, Math.min(280, viewportW - 76 - 32 - 40 - 2));

  // Smoothly animate the breakdown card's height as its content changes size
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState<number | null>(null);
  useEffect(() => {
    const el = cardInnerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickYear, setPickYear] = useState(today.getFullYear());
  const [pickMonth, setPickMonth] = useState(today.getMonth());
  const isCurrentYear = (y: number) => y >= today.getFullYear();

  const inPeriod = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    if (viewMode === "month") return d.getFullYear() === year && d.getMonth() === month;
    if (viewMode === "year") return d.getFullYear() === year;
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    return d >= weekStart && d < end;
  }, [viewMode, year, month, weekStart]);

  const periodTxs = useMemo(() => txs.filter(tx => inPeriod(tx.created_at)), [txs, inPeriod]);
  const totalIncome = useMemo(() => periodTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [periodTxs]);
  const totalExpense = useMemo(() => periodTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [periodTxs]);
  const balance = totalIncome - totalExpense;

  const filtered = useMemo(() => periodTxs.filter(tx => tx.type === txType), [periodTxs, txType]);

  const segments: Segment[] = useMemo(() => {
    const map: Record<string, Segment> = {};
    filtered.forEach((tx) => {
      const cat = getCat(tx.type, tx.parent_category);
      if (!map[tx.parent_category]) {
        map[tx.parent_category] = { value: 0, color: cat?.color ?? "#888", name: tx.parent_category, icon: cat?.icon ?? "cash" };
      }
      map[tx.parent_category].value += tx.amount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const total = segments.reduce((s, d) => s + d.value, 0);

  const segTxs = useMemo(() => {
    if (!selectedSeg) return [];
    return filtered
      .filter(tx => tx.parent_category === selectedSeg.name)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [filtered, selectedSeg]);

  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const periodLabel = viewMode === "month"
    ? `${MONTHS[month]} ${year}`
    : viewMode === "year"
    ? `${year}`
    : `Week ${isoWeekNum(weekStart)} · ${fmtShort(weekStart)} - ${fmtShort(weekEnd)}`;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const atEnd = viewMode === "month"
    ? year === today.getFullYear() && month === today.getMonth()
    : viewMode === "year"
    ? year >= today.getFullYear()
    : new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7) > todayStart;

  function shiftWeek(n: number) { setWeekStart(w => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7 * n)); }
  function prevPeriod() {
    setSelectedSeg(null);
    if (viewMode === "month") { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
    else if (viewMode === "year") setYear(y => y - 1);
    else shiftWeek(-1);
  }
  function nextPeriod() {
    if (atEnd) return;
    setSelectedSeg(null);
    if (viewMode === "month") { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }
    else if (viewMode === "year") setYear(y => y + 1);
    else shiftWeek(1);
  }
  function togglePicker() {
    if (!pickerOpen) { setPickYear(viewMode === "week" ? weekStart.getFullYear() : year); setPickMonth(viewMode === "week" ? weekStart.getMonth() : month); }
    setPickerOpen(o => !o);
  }

  // Mondays of weeks touching the picked month (no future weeks)
  const weekOptions: Date[] = [];
  {
    let w = mondayOf(new Date(pickYear, pickMonth, 1));
    const lastDay = new Date(pickYear, pickMonth + 1, 0);
    while (w <= lastDay) { if (w <= todayStart) weekOptions.push(w); w = new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7); }
  }
  const yearOptions = Array.from({ length: 12 }, (_, i) => today.getFullYear() - 11 + i);
  const pickBtn = (on: boolean, disabled = false): React.CSSProperties => ({
    padding: "11px 0", borderRadius: 10, fontSize: 15, fontWeight: on ? 700 : 500,
    background: on ? ACCENT : CARD2, color: on ? "#fff" : TEXT, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Period pill with nav arrows */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, position: "relative" }}>
        <button onClick={prevPeriod} style={{ ...btnReset, ...navBtnStyle }}>
          <IcoChevLeft size={15} color={TEXT} />
        </button>
        <button className="montra-period" onClick={togglePicker} aria-expanded={pickerOpen} style={{
          background: aTint(12), border: `1px solid ${aTint(35)}`,
          borderRadius: 100, padding: "8px 0", width: 320, minWidth: 0, textAlign: "center",
          whiteSpace: "nowrap", color: ACCENT, fontWeight: 700, fontSize: 17, letterSpacing: 0.2, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {periodLabel}
          <span style={{ fontSize: 11, transform: pickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
        </button>
        <button onClick={nextPeriod} disabled={atEnd} style={{ ...btnReset, ...navBtnStyle, opacity: atEnd ? 0.3 : 1, cursor: atEnd ? "not-allowed" : "pointer" }}>
          <IcoChevRight size={15} color={TEXT} />
        </button>

        {pickerOpen && <div onClick={() => setPickerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}
        <div className="montra-tab" style={{
          position: "absolute", top: "calc(100% + 10px)", left: 0, right: 0, marginLeft: "auto", marginRight: "auto", width: "min(340px, 100%)", zIndex: 21,
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          opacity: pickerOpen ? 1 : 0, visibility: pickerOpen ? "visible" : "hidden",
          transform: pickerOpen ? "none" : "translateY(-6px)",
          transition: "opacity 0.18s ease, transform 0.18s ease, visibility 0.18s",
          animation: "none",
        }}>
          {viewMode === "year" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {yearOptions.map(y => (
                <button key={y} onClick={() => { setYear(y); setSelectedSeg(null); setPickerOpen(false); }} style={pickBtn(y === year)}>{y}</button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <button onClick={() => setPickYear(y => y - 1)} style={btnReset}><IcoChevLeft size={16} color={SUB} /></button>
                <span style={{ fontWeight: 800, color: TEXT, fontSize: 16 }}>{viewMode === "week" ? `${MONTHS[pickMonth]} ${pickYear}` : pickYear}</span>
                <button onClick={() => !isCurrentYear(pickYear) && setPickYear(y => y + 1)} disabled={isCurrentYear(pickYear)}
                  style={{ ...btnReset, opacity: isCurrentYear(pickYear) ? 0.25 : 1, cursor: isCurrentYear(pickYear) ? "not-allowed" : "pointer" }}>
                  <IcoChevRight size={16} color={SUB} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {MONTHS.map((m, mi) => {
                  const future = pickYear > today.getFullYear() || (pickYear === today.getFullYear() && mi > today.getMonth());
                  const on = viewMode === "week" ? mi === pickMonth : pickYear === year && mi === month;
                  return (
                    <button key={m} disabled={future} style={pickBtn(on, future)} onClick={() => {
                      if (viewMode === "week") setPickMonth(mi);
                      else { setYear(pickYear); setMonth(mi); setSelectedSeg(null); setPickerOpen(false); }
                    }}>{m.slice(0, 3)}</button>
                  );
                })}
              </div>
              {viewMode === "week" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                  {weekOptions.length === 0 && <div style={{ color: SUB, fontSize: 15, textAlign: "center" }}>No weeks available</div>}
                  {weekOptions.map(w => {
                    const e = new Date(w.getFullYear(), w.getMonth(), w.getDate() + 6);
                    const on = +w === +weekStart;
                    return (
                      <button key={+w} onClick={() => { setWeekStart(w); setSelectedSeg(null); setPickerOpen(false); }}
                        style={{ ...pickBtn(on), padding: "10px 14px", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                        <span>Week {isoWeekNum(w)}</span><span style={{ opacity: 0.85 }}>{fmtShort(w)} - {fmtShort(e)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Week / Month / Year segmented */}
      <div style={{ display: "flex", background: CARD, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}` }}>
        {(["Week", "Month", "Year"] as const).map(v => {
          const key = v.toLowerCase() as "week" | "month" | "year";
          const active = viewMode === key;
          return (
            <button key={v} onClick={() => { setViewMode(key); setSelectedSeg(null); setPickerOpen(false); }} style={{
              flex: 1, padding: "9px 0", borderRadius: 9,
              background: active ? CARD2 : "transparent",
              color: active ? TEXT : SUB,
              border: "none", fontWeight: active ? 700 : 500, fontSize: 16, cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}>{v}</button>
          );
        })}
      </div>

      {/* Income / Expense / Balance summary */}
      <div style={{ background: CARD, borderRadius: 16, padding: "18px 12px", border: `1px solid ${BORDER}` }}>
        <div className="montra-sum" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: SUB, fontSize: 15, marginBottom: 6 }}>Income</div>
            <div style={{ color: GREEN, fontWeight: 700, fontSize: 16 }}>+{fmtAmt(totalIncome, currency)}</div>
          </div>
          <div style={{ textAlign: "center", borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ color: SUB, fontSize: 15, marginBottom: 6 }}>Expense</div>
            <div style={{ color: RED, fontWeight: 700, fontSize: 16 }}>-{fmtAmt(totalExpense, currency)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: SUB, fontSize: 15, marginBottom: 6 }}>Balance</div>
            <div style={{ color: balance >= 0 ? TEXT : RED, fontWeight: 700, fontSize: 16 }}>
              {balance >= 0 ? "+" : "-"}{fmtAmt(Math.abs(balance), currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown card */}
      <div style={{
        background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden",
        height: cardH === null ? "auto" : cardH + 2, transition: "height 0.45s cubic-bezier(.2,.8,.2,1)",
      }}>
       <div ref={cardInnerRef} style={{ padding: 20 }}>
        {/* Header row: title + internal Expense/Income toggle */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>
              {txType === "expense" ? "Expense" : "Income"} Breakdown
            </div>
            <div style={{ color: SUB, fontSize: 15, marginTop: 3 }}>Top categories this period</div>
          </div>
          <div style={{ display: "flex", background: CARD2, borderRadius: 10, padding: 3, gap: 2, border: `1px solid ${BORDER}` }}>
            <button onClick={() => { setTxType("expense"); setSelectedSeg(null); }} style={{
              padding: "6px 13px", borderRadius: 8,
              background: txType === "expense" ? RED : "transparent",
              color: txType === "expense" ? "#fff" : SUB,
              border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.2s",
            }}>Expense</button>
            <button onClick={() => { setTxType("income"); setSelectedSeg(null); }} style={{
              padding: "6px 13px", borderRadius: 8,
              background: txType === "income" ? GREEN : "transparent",
              color: txType === "income" ? "#fff" : SUB,
              border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.2s",
            }}>Income</button>
          </div>
        </div>

        {segments.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
            <GhostPie size={72} />
            <div style={{ fontWeight: 700, fontSize: 18, color: TEXT, marginTop: 18, marginBottom: 6 }}>
              No {txType === "expense" ? "Expenses" : "Income"}
            </div>
            <div style={{ color: SUB, fontSize: 16 }}>No records for this period</div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <DonutChart segments={segments} size={donutSize} hole={Math.round(donutSize * 170 / 280)} currency={currency} activeName={selectedSeg?.name ?? null} onSelect={setSelectedSeg} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {segments.map((seg, i) => {
                const pct = total > 0 ? (seg.value / total) * 100 : 0;
                const isActive = selectedSeg?.name === seg.name;
                return (
                  <div key={i} onClick={() => setSelectedSeg(isActive ? null : seg)} style={{
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    opacity: selectedSeg && !isActive ? 0.45 : 1, transition: "opacity 0.2s",
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${seg.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CatIcon name={seg.icon} color={seg.color} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", columnGap: 8, justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span className="montra-segname" style={{ fontSize: 16, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.name}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: seg.color, marginLeft: "auto", flexShrink: 0 }}>{fmtAmt(seg.value, currency)}</span>
                      </div>
                      <div style={{ height: 5, background: BORDER, borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: seg.color, borderRadius: 100, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 15, color: SUB, flexShrink: 0, width: 40, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
       </div>
      </div>

      {/* Slice detail / tap-a-slice card */}
      <AnimatedCard>
        {selectedSeg ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${selectedSeg.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CatIcon name={selectedSeg.icon} color={selectedSeg.color} size={16} />
              </div>
              <span style={{ fontWeight: 700, color: TEXT, fontSize: 18 }}>{selectedSeg.name}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: selectedSeg.color }}>{fmtAmt(selectedSeg.value, currency)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {segTxs.map(tx => (
                <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: CARD2, borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{tx.sub_category || tx.parent_category}</div>
                    {tx.notes ? <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>{tx.notes}</div> : null}
                    <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>{fmtDate(tx.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: tx.type === "expense" ? RED : GREEN }}>
                    {tx.type === "expense" ? "-" : "+"}{fmtAmt(tx.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "14px 0" }}>
            <GhostPie size={52} />
            <span style={{ color: SUB, fontSize: 16 }}>Tap a slice to see transactions</span>
          </div>
        )}
      </AnimatedCard>

    </div>
  );
}
