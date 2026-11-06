import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useReducedMotion, AnimatePresence, motion } from "motion/react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import logoUrl from "@/assets/images/logo.png";
import { IoCash, IoArrowDownCircle, IoArrowUpCircle } from "react-icons/io5";
import { CATS } from "@/web/categories";
import { fmtDate, fmtTime, inDateSel, MONTHS, fmtDateSel, mondayOf, isoWeekNum, fmtShort, isRange, sameDay } from "@/web/dates";
import { fmtAmt, getCat } from "@/web/helpers";
import { loadSet, saveSet, saveTx, loadTx } from "@/web/storage";
import { btnReset, fieldLabel, inputStyle, primaryBtn, navBtnStyle, dangerBtn, outlineBtn, profileRow, overlay, modalBox } from "@/web/styles";
import { SUB, BORDER, TEXT, RED, GREEN, CARD2, CARD, ACCENT, aTint, ACCENT_THEMES, SURFACE, BG, PALETTES, TEXT_SCALE } from "@/web/theme";
import type { Tx, TxType, Settings, ThemeMode, TextSize, Tab } from "@/web/types";
import { EditModal } from "@/web/components/EditModal";
import { MiniCalendar } from "@/web/components/MiniCalendar";
import { Toast } from "@/web/components/Toast";
import { TxDetailModal } from "@/web/components/TxDetailModal";
import { TxRow } from "@/web/components/TxRow";
import { useDateSelection, useHomeCalendar } from "@/web/hooks";
import type { HomeCalendar } from "@/web/hooks";
import { CatIcon, IcoArrowLeft, IcoBarChart, IcoCalendar, IcoCash, IcoCheck, IcoChevDown, IcoChevLeft, IcoChevR, IcoChevRight, IcoDoc, IcoFlash, IcoGlobe, IcoGrid, IcoHelp, IcoHome, IcoList, IcoLogout, IcoMoon, IcoPalette, IcoPlus, IcoSearch, IcoSettings, IcoSort, IcoSun, IcoTag, IcoTrendDown, IcoTrendUp, IcoUser, IcoWallet, IcoX } from "@/web/icons";
import type { IP } from "@/web/icons";

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

/* Square card used by the Search grid view */
function TxCard({ tx, currency, onClick }: { tx: Tx; currency: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const isExp = tx.type === "expense";
  const tone = isExp ? RED : GREEN;
  const cat = getCat(tx.type, tx.parent_category);
  const clip: React.CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", aspectRatio: "1 / 1", overflow: "hidden", minWidth: 0,
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10,
        padding: 18, borderRadius: 16, textAlign: "left", cursor: "pointer",
        background: hov ? CARD2 : CARD, border: `1px solid ${hov ? "#333" : BORDER}`,
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, width: "100%" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${cat?.color ?? tone}20`, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {cat ? <CatIcon name={cat.icon} color={cat.color} size={22} /> : <IoCash size={22} color={tone} />}
        </div>
        <span style={{ fontSize: 13, color: SUB, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtDate(tx.created_at)}</span>
      </div>
      <div style={{ width: "100%", minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, ...clip }}>{tx.sub_category || tx.parent_category || "Uncategorized"}</div>
        <div style={{ fontSize: 14, color: SUB, marginTop: 2, ...clip }}>{tx.sub_category ? tx.parent_category : fmtTime(tx.created_at)}</div>
        {tx.notes && <div style={{ fontSize: 14, color: SUB, marginTop: 6, ...clip }}>{tx.notes}</div>}
      </div>
      <div style={{ width: "100%", fontSize: 20, fontWeight: 800, color: tone, ...clip }}>
        {isExp ? "-" : "+"}{fmtAmt(tx.amount, currency)}
      </div>
    </button>
  );
}

function HomeTab({ txs, currency, onTxClick, cal }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void; cal: HomeCalendar }) {
  const { year, setYear, month, setMonth, dates } = cal;

  const { mIncome, mExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    txs.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (tx.type === "income") inc += tx.amount;
        else exp += tx.amount;
      }
    });
    return { mIncome: inc, mExpense: exp };
  }, [txs, year, month]);

  const filtered = useMemo(() => {
    return txs
      .filter((tx) => {
        const d = new Date(tx.created_at);
        if (dates.sel) return inDateSel(tx.created_at, dates.sel);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [txs, dates.sel, year, month]);

  const balance = mIncome - mExpense;

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    // Day mode: browsing shows the whole month. Range mode keeps the range while browsing.
    if (dates.mode === "day") dates.clear();
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    if (dates.mode === "day") dates.clear();
  };

  return (
    <div className="montra-home" style={{ display: "flex", gap: 32, minHeight: 0 }}>
      {/* Left column */}
      <div className="montra-home-left" style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Summary */}
        <div style={{ background: CARD, borderRadius: 18, padding: "18px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, color: SUB, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 12 }}>
            {MONTHS[month].toUpperCase()} {year}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: balance >= 0 ? GREEN : RED, marginBottom: 4 }}>
            {balance < 0 ? "-" : ""}{fmtAmt(Math.abs(balance), currency)}
          </div>
          <div style={{ fontSize: 15, color: SUB, marginBottom: 16 }}>Net balance</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Income", value: mIncome, color: GREEN, bg: "#2ECC7110" },
              { label: "Expenses", value: mExpense, color: RED, bg: "#FF6B6B10" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 14, color: SUB, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>{fmtAmt(value, currency)}</div>
              </div>
            ))}
          </div>
        </div>

        <MiniCalendar
          year={year} month={month} transactions={txs}
          selection={dates.sel} pending={dates.pending} mode={dates.mode} onModeChange={dates.setMode}
          onSelectDay={(d) => { dates.pick(d); }}
          onPrevMonth={prevMonth} onNextMonth={nextMonth}
          onJump={(y, m) => { setYear(y); setMonth(m); if (dates.mode === "day") dates.clear(); }}
        />
      </div>

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: TEXT, fontSize: 18, fontWeight: 700 }}>
            {dates.sel ? fmtDateSel(dates.sel) : `All of ${MONTHS[month]}`}
          </h2>
          {dates.sel && (
            <button onClick={dates.clear} style={{ ...btnReset, fontSize: 15, color: SUB }}>
              Show all ×
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 15, color: SUB }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="montra-tab" style={{ flex: "none", height: 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: SUB, gap: 10 }}>
            <IoArrowDownCircle size={44} color={BORDER} />
            <span style={{ fontWeight: 600, color: TEXT }}>No transactions</span>
            <span style={{ fontSize: 16 }}>Use the Add tab to record one.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
            {filtered.map((tx) => (
              <TxRow key={tx.id} tx={tx} currency={currency} onClick={() => onTxClick(tx)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── AddTab ─────────────────────────────────────────────────────────────── */
function AddTab({ onAdd }: { onAdd: (tx: Tx) => void }) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [parentCat, setParentCat] = useState("");
  const [subCat, setSubCat] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showCal, setShowCal] = useState(false);
  const [error, setError] = useState("");

  const cats = CATS[type];
  const parentObj = cats.find((c) => c.name === parentCat);
  const isExp = type === "expense";

  const reset = () => {
    setAmount(""); setParentCat(""); setSubCat(""); setNotes("");
    setDate(new Date().toISOString().slice(0, 10)); setError("");
  };

  const handleSubmit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) { setError("Enter a valid amount."); return; }
    if (!parentCat) { setError("Select a category."); return; }
    if (parentObj && parentObj.subs.length > 0 && !subCat) { setError("Select a subcategory."); return; }
    const [yyyy, mm, dd] = date.split("-").map(Number);
    const now = new Date();
    const created = new Date(yyyy, mm - 1, dd, now.getHours(), now.getMinutes(), now.getSeconds());
    onAdd({
      id: crypto.randomUUID(),
      amount: n, type,
      parent_category: parentCat,
      sub_category: subCat,
      notes,
      created_at: created.toISOString(),
    });
    reset();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: TEXT, fontSize: 28, fontWeight: 800, marginBottom: 28, marginTop: 0 }}>Add Transaction</h2>

      {/* Type toggle */}
      <div style={{ display: "flex", background: CARD, borderRadius: 14, padding: 4, marginBottom: 24, border: `1px solid ${BORDER}` }}>
        {(["expense", "income"] as TxType[]).map((t) => {
          const active = type === t;
          const clr = t === "expense" ? RED : GREEN;
          return (
            <button key={t} onClick={() => { setType(t); setParentCat(""); setSubCat(""); setError(""); }}
              style={{
                flex: 1, padding: "11px", borderRadius: 10,
                background: active ? `${clr}1a` : "transparent",
                border: active ? `1px solid ${clr}55` : "1px solid transparent",
                color: active ? clr : SUB,
                fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              {t === "expense"
                ? <IoArrowDownCircle size={17} color={active ? RED : SUB} />
                : <IoArrowUpCircle size={17} color={active ? GREEN : SUB} />}
              {t === "expense" ? "Expense" : "Income"}
            </button>
          );
        })}
      </div>

      {/* Amount */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabel}>AMOUNT <span style={{ color: RED }}>*</span></label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: amount ? (isExp ? RED : GREEN) : SUB, fontSize: 28, fontWeight: 700, pointerEvents: "none" }}>
            {/* We'll rely on the select for currency - show ₱ as default indicator */}
            ₱
          </span>
          <input
            key={type}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            style={{
              width: "100%", background: CARD, borderRadius: 14,
              border: `2px solid ${amount ? (isExp ? `${RED}88` : `${GREEN}88`) : BORDER}`,
              padding: "18px 18px 18px 44px",
              color: isExp ? RED : GREEN, caretColor: isExp ? RED : GREEN, fontSize: 34, fontWeight: 800,
              outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s",
            }}
          />
        </div>
      </div>

      {/* Parent Category */}
      <div style={{ marginBottom: 20 }}>
        <label style={fieldLabel}>CATEGORY <span style={{ color: RED }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {cats.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setParentCat(cat.name); setSubCat(""); setError(""); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 6px", borderRadius: 13, cursor: "pointer",
                background: parentCat === cat.name ? `${cat.color}1e` : CARD,
                border: `1px solid ${parentCat === cat.name ? cat.color : BORDER}`,
                transition: "all 0.15s",
              }}
            >
              <CatIcon name={cat.icon} color={cat.color} size={22} />
              <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: parentCat === cat.name ? cat.color : TEXT, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                {cat.name.split(" & ")[0]}
              </span>
            </button>
          ))}
          {/* Placeholder for custom categories — see README "Planned features → Custom categories" */}
          <button type="button" disabled aria-disabled title="Custom categories are coming soon"
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "12px 6px", borderRadius: 13, background: "transparent",
              border: `1px dashed ${BORDER}`, cursor: "not-allowed", opacity: 0.6,
            }}
          >
            <IcoPlus size={22} color={SUB} />
            <span style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 14, color: SUB, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
              New category
              <span style={{ fontSize: 12 }}>Soon</span>
            </span>
          </button>
        </div>
      </div>

      {/* Sub Category */}
      {parentObj && (
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabel}>SUBCATEGORY <span style={{ color: RED }}>*</span></label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {parentObj.subs.map((sub) => (
              <button key={sub} onClick={() => { setSubCat(sub); setError(""); }}
                style={{
                  padding: "7px 14px", borderRadius: 100,
                  background: subCat === sub ? `${parentObj.color}20` : CARD,
                  border: `1px solid ${subCat === sub ? parentObj.color : BORDER}`,
                  color: subCat === sub ? parentObj.color : SUB,
                  fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}
              >{sub}</button>
            ))}
            {/* Placeholder for custom subcategories — see README "Planned features → Custom subcategories" */}
            <button type="button" disabled aria-disabled title="Custom subcategories are coming soon"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 100, background: "transparent",
                border: `1px dashed ${BORDER}`, color: SUB, fontSize: 16, fontWeight: 600,
                cursor: "not-allowed", opacity: 0.6,
              }}
            >
              <IcoPlus size={14} /> Add
              <span style={{ fontSize: 12, fontWeight: 600 }}>Soon</span>
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label style={fieldLabel}>NOTES (optional)</label>
          <span style={{ fontSize: 14, color: notes.length >= 150 ? RED : SUB, fontWeight: 600 }}>{notes.length}/150</span>
        </div>
        <textarea placeholder="Add a note..." value={notes} maxLength={150} onChange={(e) => setNotes(e.target.value.slice(0, 150))} rows={2}
          style={{ ...inputStyle, resize: "none" as const, fontFamily: "inherit" }}
        />
      </div>

      {/* Date */}
      <div style={{ marginBottom: 28 }}>
        <label style={fieldLabel}>DATE</label>
        <button type="button" onClick={() => setShowCal(true)}
          style={{ ...inputStyle, textAlign: "left", cursor: "pointer" }}>
          {(() => { const [yy, mm, dd] = date.split("-").map(Number); return `${MONTHS[mm - 1]} ${dd}, ${yy}`; })()}
        </button>
        {showCal && <DatePickerModal value={date} onClose={() => setShowCal(false)} onSelect={setDate} />}
      </div>

      {error && <div style={{ color: RED, fontSize: 16, marginBottom: 14 }}>{error}</div>}

      <button onClick={handleSubmit} style={{ ...primaryBtn, width: "100%", fontSize: 16, padding: "16px" }}>
        Save Transaction
      </button>
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

function AnalyticsTab({ txs, currency }: { txs: Tx[]; currency: string }) {
  const [txType, setTxType] = useState<TxType>("expense");
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("month");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedSeg, setSelectedSeg] = useState<Segment | null>(null);

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
        <button onClick={togglePicker} aria-expanded={pickerOpen} style={{
          background: aTint(12), border: `1px solid ${aTint(35)}`,
          borderRadius: 100, padding: "8px 0", width: 320, flexShrink: 0, textAlign: "center",
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
          position: "absolute", top: "calc(100% + 10px)", left: "50%", marginLeft: -170, width: 340, zIndex: 21,
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
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
              <DonutChart segments={segments} size={280} hole={170} currency={currency} activeName={selectedSeg?.name ?? null} onSelect={setSelectedSeg} />
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.name}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: seg.color, marginLeft: 8, flexShrink: 0 }}>{fmtAmt(seg.value, currency)}</span>
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

/* ─── SearchTab ──────────────────────────────────────────────────────────── */
type SearchField = "sub_category" | "notes" | "amount";
const LIST_EASE = [0.2, 0.8, 0.2, 1] as const;
type SortKey = "newest" | "oldest" | "amount_desc" | "amount_asc";
const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "amount_desc", label: "Amount: high to low" },
  { id: "amount_asc", label: "Amount: low to high" },
];
/* Words used to tell people what each search chip looks through */
const FIELD_HINTS: Record<SearchField, string[]> = {
  sub_category: ["category", "subcategory"],
  notes: ["note"],
  amount: ["amount"],
};
const joinOr = (w: string[]) => (w.length <= 1 ? w.join("") : `${w.slice(0, -1).join(", ")} or ${w[w.length - 1]}`);
function SearchTab({ txs, currency, onTxClick }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void }) {
  const SEARCH_CHIPS: { id: SearchField; label: string; Icon: React.FC<IP> }[] = [
    { id: "sub_category", label: "Category", Icon: IcoTag },
    { id: "notes", label: "Notes", Icon: IcoDoc },
    { id: "amount", label: "Amount", Icon: IcoCash },
  ];
  const [query, setQuery] = useState("");
  /* empty set = "All" (search every field); otherwise restrict to picked fields */
  const [fields, setFields] = useState<Set<SearchField>>(new Set());
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortOpen, setSortOpen] = useState(false);
  /* Optional single-day filter picked from the mini calendar */
  const dates = useDateSelection(null);
  const dateFilter = dates.sel;
  const [calOpen, setCalOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const openCal = () => {
    const base = dateFilter?.start ?? new Date();
    setCalYear(base.getFullYear()); setCalMonth(base.getMonth());
    setSortOpen(false);
    if (calOpen) dates.settle();
    setCalOpen((o) => !o);
  };
  const closeCal = () => { setCalOpen(false); dates.settle(); };
  const shiftCal = (n: number) => {
    const d = new Date(calYear, calMonth + n, 1);
    setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
  };

  useEffect(() => {
    if (!sortOpen && !calOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSortOpen(false); setCalOpen(false); dates.settle(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortOpen, calOpen]);

  const toggleField = (f: SearchField) => {
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      /* picking every field collapses back to "All" */
      if (next.size === SEARCH_CHIPS.length) return new Set<SearchField>();
      return next;
    });
  };

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const active: SearchField[] = fields.size ? [...fields] : SEARCH_CHIPS.map((c) => c.id);
    return txs.filter((tx) => {
      if (dateFilter && !inDateSel(tx.created_at, dateFilter)) return false;
      if (!q) return true;
      return active.some((f) => {
        if (f === "sub_category") return (tx.sub_category?.toLowerCase().includes(q)) || (tx.parent_category?.toLowerCase().includes(q));
        if (f === "notes") return tx.notes?.toLowerCase().includes(q);
        return tx.amount.toString().includes(q);
      });
    }).sort((a, b) => {
      const byDate = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return -byDate;
      if (sort === "amount_desc") return b.amount - a.amount || byDate;
      if (sort === "amount_asc") return a.amount - b.amount || byDate;
      return byDate;
    });
  }, [txs, query, fields, sort, dateFilter]);

  const allActive = fields.size === 0;

  // Rows expand/collapse in place so the list reflows smoothly while typing
  const reduceMotion = useReducedMotion();
  const tween = { duration: 0.3, ease: LIST_EASE };
  const fade = { duration: 0.2, ease: "easeOut" as const };
  const collapse = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: reduceMotion ? { duration: 0 } : { height: tween, layout: tween, opacity: fade },
  };
  // Grid cards scale in/out while the remaining cards glide to their new cells
  const pop = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
    transition: reduceMotion ? { duration: 0 } : { scale: tween, layout: tween, opacity: fade },
  };

  const hintWords = SEARCH_CHIPS.filter((c) => allActive || fields.has(c.id)).flatMap((c) => FIELD_HINTS[c.id]);
  const placeholder = `Search by ${joinOr(hintWords)}…`;
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "";

  return (
    <div>
      <h2 style={{ color: TEXT, margin: "0 0 20px", fontSize: 28, fontWeight: 800 }}>Search</h2>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: SUB, pointerEvents: "none" }}>
          <IcoSearch size={17} />
        </div>
        <input
          type="text" placeholder={placeholder} aria-label={placeholder} value={query} autoFocus
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 44 }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ ...btnReset, position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            <IcoX size={16} color={SUB} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFields(new Set())} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 15px", borderRadius: 100, fontSize: 16, fontWeight: 600,
          background: allActive ? aTint(10) : CARD,
          border: `1px solid ${allActive ? ACCENT : BORDER}`,
          color: allActive ? ACCENT : SUB, cursor: "pointer",
        }}><IcoFlash size={13} /> All</button>
        {SEARCH_CHIPS.map((c) => {
          const on = fields.has(c.id);
          return (
            <button key={c.id} onClick={() => toggleField(c.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 15px", borderRadius: 100, fontSize: 16, fontWeight: 600,
              background: on ? aTint(10) : CARD,
              border: `1px solid ${on ? ACCENT : BORDER}`,
              color: on ? ACCENT : SUB, cursor: "pointer",
            }}><c.Icon size={13} /> {c.label}</button>
          );
        })}
        {/* Date filter (mini calendar) */}
        <div style={{ position: "relative", display: "flex" }}>
          {(() => {
            const on = !!dateFilter || calOpen;
            return (
              <div style={{
                display: "flex", alignItems: "center", borderRadius: 100,
                background: on ? aTint(10) : CARD, border: `1px solid ${on ? ACCENT : BORDER}`, color: on ? ACCENT : SUB,
              }}>
                <button onClick={openCal} aria-haspopup="dialog" aria-expanded={calOpen} style={{
                  display: "flex", alignItems: "center", gap: 6, height: "100%",
                  padding: dateFilter ? "7px 4px 7px 15px" : "7px 15px", borderRadius: 100,
                  background: "transparent", border: "none", color: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer",
                }}>
                  <IcoCalendar size={13} /> {dateFilter ? fmtDateSel(dateFilter) : "Date"}
                </button>
                {dateFilter && (
                  <button onClick={dates.clear} aria-label="Clear date filter" title="Clear date" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, marginRight: 6,
                    borderRadius: "50%", background: "transparent", border: "none", color: "inherit", cursor: "pointer",
                  }}>
                    <IcoX size={13} />
                  </button>
                )}
              </div>
            );
          })()}
          {calOpen && <div onClick={closeCal} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}
          <AnimatePresence>
            {calOpen && (
              <motion.div role="dialog" aria-label="Filter by date"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                style={{
                  position: "absolute", left: 0, top: "calc(100% + 8px)", width: 340, maxWidth: "calc(100vw - 32px)",
                  zIndex: 21, borderRadius: 18, boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                }}>
                <MiniCalendar
                  year={calYear} month={calMonth} transactions={txs}
                  selection={dateFilter} pending={dates.pending} mode={dates.mode} onModeChange={dates.setMode}
                  onSelectDay={(d) => { if (dates.pick(d)) setCalOpen(false); }}
                  onPrevMonth={() => shiftCal(-1)} onNextMonth={() => shiftCal(1)}
                  onJump={(y, m) => { setCalYear(y); setCalMonth(m); }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: SUB, fontSize: 15 }}>{results.length} result{results.length !== 1 ? "s" : ""}</span>

          {/* Sort */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { closeCal(); setSortOpen((o) => !o); }} aria-haspopup="listbox" aria-expanded={sortOpen} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              minWidth: 226, height: 38, padding: "0 14px", borderRadius: 12,
              background: sortOpen ? aTint(10) : CARD, border: `1px solid ${sortOpen ? ACCENT : BORDER}`,
              color: sortOpen ? ACCENT : TEXT, fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IcoSort size={15} /> {sortLabel}</span>
              <span style={{ display: "flex", transform: sortOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><IcoChevDown size={15} /></span>
            </button>
            {sortOpen && <div onClick={() => setSortOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}
            <AnimatePresence>
              {sortOpen && (
                <motion.div role="listbox" aria-label="Sort results"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 240, zIndex: 21,
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 6,
                    boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                  }}>
                  {SORT_OPTIONS.map((o) => {
                    const on = sort === o.id;
                    return (
                      <button key={o.id} role="option" aria-selected={on} className="montra-opt"
                        onClick={() => { setSort(o.id); setSortOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "11px 12px", borderRadius: 10, border: "none", textAlign: "left", cursor: "pointer",
                          background: on ? aTint(12) : undefined, color: on ? ACCENT : TEXT, fontSize: 15, fontWeight: on ? 700 : 500,
                        }}>
                        {o.label}
                        {on && <IcoCheck size={15} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List / grid */}
          <div role="group" aria-label="Layout" style={{ display: "flex", gap: 2, padding: 3, borderRadius: 12, background: CARD, border: `1px solid ${BORDER}` }}>
            {([["list", "List view", IcoList], ["grid", "Grid view", IcoGrid]] as const).map(([id, label, Icon]) => {
              const on = view === id;
              return (
                <button key={id} onClick={() => setView(id)} aria-pressed={on} aria-label={label} title={label} style={{
                  width: 38, height: 30, borderRadius: 9, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: on ? aTint(14) : "transparent", color: on ? ACCENT : SUB,
                }}>
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {results.length === 0 && (
          <motion.div key="empty" {...collapse} style={{ overflow: "hidden" }}>
            {/* fills the space under the toolbar so the message sits in the middle of the page */}
            <div style={{
              minHeight: "calc(100vh - 300px)", padding: "20px 0", color: SUB, textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: 0.35 }}><IcoSearch size={44} color={SUB} /></div>
              <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>{query || dateFilter ? "No results" : "Try searching"}</div>
              <div style={{ fontSize: 16 }}>
                {query
                  ? `Nothing matched "${query}"${dateFilter ? ` ${isRange(dateFilter) ? "for" : "on"} ${fmtDateSel(dateFilter)}` : ""}`
                  : dateFilter
                  ? `No transactions ${isRange(dateFilter) ? "for" : "on"} ${fmtDateSel(dateFilter)}.`
                  : `Search by ${joinOr(SEARCH_CHIPS.flatMap((c) => FIELD_HINTS[c.id]))}.`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "list" ? (
        <div key="list" className="montra-tab">
          <AnimatePresence initial={false}>
            {results.map((tx) => (
              <motion.div key={tx.id} layout="position" {...collapse} style={{ overflow: "hidden", margin: "0 -3px" }}>
                {/* padding keeps focus outlines visible inside the clipped wrapper */}
                <div style={{ padding: "3px 3px 5px" }}>
                  <TxRow tx={tx} currency={currency} onClick={() => onTxClick(tx)} showDate />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div key="grid" className="montra-tab" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
          <AnimatePresence initial={false} mode="popLayout">
            {results.map((tx) => (
              <motion.div key={tx.id} layout {...pop}>
                <TxCard tx={tx} currency={currency} onClick={() => onTxClick(tx)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── SettingsTab ────────────────────────────────────────────────────────── */
type SettingsSection = "appearance" | "language" | "currency" | "account" | "data" | "about";

function SettingsTab({ settings, onSave, onClear, txCount, user, onRefresh }: {
  settings: Settings; onSave: (s: Settings) => void; onClear: () => void; txCount: number;
  user: User | null; onRefresh?: () => void;
}) {
  const [section, setSection] = useState<SettingsSection>("appearance");
  const [confirmClear, setConfirmClear] = useState(false);

  const currencies = [
    { code: "₱", name: "Philippine Peso (PHP)", enabled: true },
    { code: "$", name: "US Dollar (USD)", enabled: false },
    { code: "€", name: "Euro (EUR)", enabled: false },
  ];

  const navItems: { id: SettingsSection; label: string; Icon: React.FC<IP> }[] = [
    { id: "appearance", label: "Appearance", Icon: IcoPalette },
    { id: "language", label: "Language", Icon: IcoGlobe },
    { id: "currency", label: "Currency", Icon: IcoWallet },
    ...(user ? [{ id: "account" as SettingsSection, label: "Account", Icon: IcoUser }] : []),
    { id: "data", label: "Data", Icon: IcoDoc },
    { id: "about", label: "About", Icon: IcoHelp },
  ];

  const sectionHead = (title: string, sub: string) => (
    <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
      <h3 style={{ margin: 0, color: TEXT, fontSize: 18, fontWeight: 800 }}>{title}</h3>
      <p style={{ margin: "5px 0 0", color: SUB, fontSize: 16 }}>{sub}</p>
    </div>
  );

  const fieldLabel = (label: string) => (
    <div style={{ fontSize: 14, fontWeight: 800, color: SUB, letterSpacing: "0.08em", marginBottom: 10 }}>{label}</div>
  );

  return (
    <div className="montra-settings" style={{ display: "flex", gap: 0, minHeight: 500 }}>
      {/* ── Sidebar nav ── */}
      <div className="montra-settings-nav" style={{ width: 220, flexShrink: 0 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: TEXT }}>Settings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "12px 14px", borderRadius: 10,
                background: active ? aTint(14) : "transparent",
                color: active ? ACCENT : SUB,
                border: "none", fontWeight: active ? 700 : 500, fontSize: 16,
                cursor: "pointer", textAlign: "left" as const,
                transition: "background 0.15s, color 0.15s",
              }}>
                <item.Icon size={16} color={active ? ACCENT : SUB} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Vertical divider ── */}
      <div style={{ width: 1, background: BORDER, margin: "0 32px", flexShrink: 0 }} />

      {/* ── Content panel ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* APPEARANCE */}
        {section === "appearance" && (
          <div>
            {sectionHead("Appearance", "Customize how Montra looks on your device.")}

            <div style={{ marginBottom: 28 }}>
              {fieldLabel("THEME")}
              <div style={{ display: "flex", gap: 12 }}>
                {([{ mode: "light" as ThemeMode, label: "Light", Icon: IcoSun }, { mode: "dark" as ThemeMode, label: "Dark", Icon: IcoMoon }]).map(({ mode, label, Icon }) => {
                  const on = settings.theme === mode;
                  return (
                    <button key={mode} onClick={() => onSave({ ...settings, theme: mode })} style={{
                      display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10,
                      padding: "18px 0", borderRadius: 14, flex: 1,
                      background: on ? aTint(10) : CARD,
                      border: `2px solid ${on ? ACCENT : BORDER}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <Icon size={22} color={on ? ACCENT : SUB} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: on ? ACCENT : SUB }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              {fieldLabel("ACCENT COLOR")}
              <div style={{ display: "flex", gap: 10 }}>
                {ACCENT_THEMES.map((c) => {
                  const on = settings.accent === c.key;
                  return (
                    <button key={c.key} onClick={() => onSave({ ...settings, accent: c.key })} style={{
                      display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8,
                      padding: "14px 0", borderRadius: 12, flex: 1,
                      background: on ? `${c.key}15` : CARD,
                      border: `2px solid ${on ? c.key : BORDER}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.key }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: on ? c.key : SUB }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {fieldLabel("TEXT SIZE")}
              <div style={{ display: "flex", gap: 10 }}>
                {([{ size: "small" as TextSize, label: "Small", px: 12 }, { size: "medium" as TextSize, label: "Medium", px: 16 }, { size: "large" as TextSize, label: "Large", px: 21 }]).map(({ size, label, px }) => {
                  const on = settings.textSize === size;
                  return (
                    <button key={size} onClick={() => onSave({ ...settings, textSize: size })} style={{
                      display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8,
                      padding: "14px 0", borderRadius: 12, flex: 1,
                      background: on ? aTint(10) : CARD,
                      border: `2px solid ${on ? ACCENT : BORDER}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: px, fontWeight: 800, color: on ? ACCENT : SUB, lineHeight: 1 }}>Aa</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: on ? ACCENT : SUB }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LANGUAGE */}
        {section === "language" && (
          <div>
            {sectionHead("Language", "Choose your preferred display language.")}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {([{ key: "english", label: "English", flag: "🇺🇸", sub: "United States", enabled: true }, { key: "filipino", label: "Filipino", flag: "🇵🇭", sub: "Philippines", enabled: false }] as const).map((l) => {
                const on = settings.language === l.key;
                return (
                  <div key={l.key} aria-disabled={!l.enabled} onClick={() => l.enabled && onSave({ ...settings, language: l.key })} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                    borderRadius: 13, cursor: l.enabled ? "pointer" : "not-allowed",
                    opacity: l.enabled ? 1 : 0.4,
                    background: on ? aTint(8) : CARD,
                    border: `2px solid ${on ? ACCENT : BORDER}`,
                    transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 32 }}>{l.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: on ? ACCENT : TEXT }}>{l.label}</div>
                      <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>{l.sub}</div>
                    </div>
                    {!l.enabled && <span style={{ fontSize: 14, fontWeight: 600, color: SUB }}>Coming soon</span>}
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${on ? ACCENT : BORDER}`,
                      background: on ? ACCENT : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {on && <IcoCheck size={10} color="#fff" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CURRENCY */}
        {section === "currency" && (
          <div>
            {sectionHead("Currency", "Choose the symbol displayed next to amounts.")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currencies.map((c) => {
                const on = settings.currency === c.code;
                return (
                  <div key={c.code} aria-disabled={!c.enabled} onClick={() => c.enabled && onSave({ ...settings, currency: c.code })} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                    borderRadius: 12, cursor: c.enabled ? "pointer" : "not-allowed",
                    opacity: c.enabled ? 1 : 0.4,
                    background: on ? aTint(8) : CARD,
                    border: `1.5px solid ${on ? ACCENT : BORDER}`,
                    transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: on ? aTint(18) : CARD2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: c.code.length > 1 ? 11 : 16, fontWeight: 800, color: on ? ACCENT : SUB,
                    }}>{c.code}</div>
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: on ? ACCENT : TEXT }}>{c.name}</span>
                    {!c.enabled && <span style={{ fontSize: 14, fontWeight: 600, color: SUB }}>Coming soon</span>}
                    {on && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IcoCheck size={10} color="#fff" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {section === "account" && user && (
          <div>
            {sectionHead("Account", "Manage your Montra account and sync settings.")}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: aTint(18), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url as string} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 24, fontWeight: 800, color: ACCENT }}>{(user.user_metadata?.full_name as string || user.email || "?")[0].toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.user_metadata?.full_name as string || "Signed in"}</div>
                  <div style={{ fontSize: 16, color: SUB, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                </div>
                <button onClick={onRefresh} style={{
                  background: aTint(9), border: `1px solid ${aTint(27)}`, color: ACCENT,
                  borderRadius: 9, padding: "8px 16px", fontSize: 16, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                }}>Sync now</button>
              </div>
            </div>
          </div>
        )}

        {/* DATA */}
        {section === "data" && (
          <div>
            {sectionHead("Data", "Your transactions are stored locally in this browser.")}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: SUB, marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>STORED TRANSACTIONS</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{txCount}</div>
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: aTint(12), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcoDoc size={24} color={ACCENT} />
                </div>
              </div>
              <div style={{ fontSize: 15, color: SUB, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                All data lives in your browser only. Nothing is sent to any server.
              </div>
            </div>
            <div style={{ background: "#FF6B6B0d", border: "1px solid #FF6B6B30", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: RED, marginBottom: 6, letterSpacing: "0.04em" }}>DANGER ZONE</div>
              <div style={{ fontSize: 16, color: SUB, marginBottom: 16, lineHeight: 1.6 }}>
                Permanently delete all {txCount} transaction{txCount !== 1 ? "s" : ""}. This cannot be undone.
              </div>
              {!confirmClear ? (
                <button onClick={() => setConfirmClear(true)} style={{ ...dangerBtn, flex: "none" }}>Clear All Data</button>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmClear(false)} style={{ ...outlineBtn, flex: "none", padding: "10px 20px" }}>Cancel</button>
                  <button onClick={() => { onClear(); setConfirmClear(false); }} style={{ ...dangerBtn, flex: "none", background: RED, color: "#fff", border: "none" }}>
                    Delete All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT */}
        {section === "about" && (
          <div>
            {sectionHead("About", "Montra — a simple personal finance tracker.")}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: aTint(14), border: `2px solid ${aTint(28)}`, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoWallet size={28} color={ACCENT} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 24, color: TEXT, marginBottom: 4 }}>Montra Web</div>
              <div style={{ fontSize: 15, color: SUB, marginBottom: 20 }}>Version 1.0 · Built with React + Supabase</div>
              <div style={{ fontSize: 16, color: SUB, lineHeight: 1.8, maxWidth: 320, margin: "0 auto" }}>
                Track your income and expenses with a clean, fast interface. All data is stored locally in your browser by default.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── ProfileTab ─────────────────────────────────────────────────────────── */
function ProfileTab({ txs, settings, onSave, user, isGuest, onSignOut, onOpenSettings }: {
  txs: Tx[]; settings: Settings; onSave: (s: Settings) => void; user: User | null;
  isGuest: boolean; onSignOut: () => void; onOpenSettings: () => void;
}) {
  const cur = settings.currency;
  const { income, spent } = useMemo(() => {
    let income = 0, spent = 0;
    txs.forEach((t) => { if (t.type === "income") income += t.amount; else spent += t.amount; });
    return { income, spent };
  }, [txs]);
  const balance = Math.abs(income - spent);

  const name = isGuest ? "Guest User" : ((user?.user_metadata?.full_name as string) || user?.email || "User");
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const initials = isGuest ? "G" : name.charAt(0).toUpperCase();

  const stats = [
    { label: "Income", value: income, color: GREEN, Icon: IcoTrendUp },
    { label: "Spent", value: spent, color: RED, Icon: IcoTrendDown },
    { label: "Balance", value: balance, color: ACCENT, Icon: IcoWallet },
  ];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ color: TEXT, textAlign: "center", margin: "0 0 24px", fontSize: 30, fontWeight: 800 }}>Profile</h2>

      {/* Identity card */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "18px 20px", marginBottom: 16 }}>
        {avatar ? (
          <img src={avatar} alt={name} style={{ width: 54, height: 54, borderRadius: 27, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 54, height: 54, borderRadius: 27, background: aTint(15), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: ACCENT }}>{initials}</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
            padding: "4px 10px", borderRadius: 100, fontSize: 14, fontWeight: 700,
            background: isGuest ? "#FF6B6B12" : "#2ECC7115", color: isGuest ? RED : GREEN,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: isGuest ? RED : GREEN }} />
            {isGuest ? "Local only" : "Cloud synced"}
          </span>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {stats.map(({ label, value, color, Icon }) => (
          <div key={label} style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "14px 12px" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: `${color === ACCENT ? aTint(15) : color + "22"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <Icon size={15} color={color} />
            </span>
            <div style={{ fontSize: 16, fontWeight: 800, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtAmt(value, cur)}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Currency</div>
            <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>Symbol shown next to amounts</div>
          </div>
          <div style={{ display: "flex", gap: 3, background: CARD2, borderRadius: 9, padding: 3, border: `1px solid ${BORDER}` }}>
            {["₱", "$", "€"].map((c) => {
              const on = cur === c;
              const enabled = c === "₱";
              return (
                <button key={c} disabled={!enabled} onClick={() => enabled && onSave({ ...settings, currency: c })}
                  style={{
                    minWidth: 30, padding: "5px 10px", borderRadius: 7, cursor: enabled ? "pointer" : "not-allowed",
                    background: on ? SURFACE : "transparent", border: "none",
                    color: on ? ACCENT : SUB, fontWeight: 700, fontSize: 16,
                    opacity: enabled ? 1 : 0.3,
                  }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account */}
      <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, marginBottom: 14, overflow: "hidden" }}>
        {isGuest && (
          <button onClick={onSignOut} style={profileRow}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: "#DB443515", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            </span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Link Google</div>
              <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>Save your data to the cloud</div>
            </div>
            <IcoChevR size={16} color={SUB} />
          </button>
        )}
        <button onClick={onOpenSettings} style={{ ...profileRow, borderBottom: "none" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "#F5A62318", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcoHelp size={17} color="#F5A623" />
          </span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Preferences &amp; Support</div>
            <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>Theme, language, data &amp; more</div>
          </div>
          <IcoChevR size={16} color={SUB} />
        </button>
      </div>

      {/* Sign out */}
      <button onClick={onSignOut} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", padding: "14px", borderRadius: 14, marginTop: 4,
        background: "#FF6B6B0d", border: `1px solid ${RED}25`, color: RED,
        fontWeight: 700, fontSize: 16, cursor: "pointer",
      }}>
        <IcoLogout size={17} color={RED} /> {isGuest ? "Sign in" : "Sign out"}
      </button>

      <div style={{ textAlign: "center", fontSize: 14, color: SUB, marginTop: 20 }}>Montra · v1.0.0</div>
    </div>
  );
}

/* ─── DatePickerModal ────────────────────────────────────────────────────── */
function DatePickerModal({ value, onClose, onSelect }: { value: string; onClose: () => void; onSelect: (iso: string) => void }) {
  const [y0, m0, d0] = value.split("-").map(Number);
  const selected = new Date(y0, m0 - 1, d0);
  const [view, setView] = useState({ year: y0, month: m0 - 1 });
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const atCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth();
  const shift = (n: number) => setView((v) => {
    const d = new Date(v.year, v.month + n, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const pick = (d: Date) => {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onSelect(iso);
    onClose();
  };
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modalBox, width: 460, padding: 32 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button onClick={() => shift(-1)} style={{ ...btnReset, padding: 8 }}><IcoChevLeft size={22} color={SUB} /></button>
          <span style={{ fontWeight: 800, color: TEXT, fontSize: 20 }}>{MONTHS[view.month]} {view.year}</span>
          <button onClick={() => !atCurrentMonth && shift(1)} disabled={atCurrentMonth} style={{ ...btnReset, padding: 8, opacity: atCurrentMonth ? 0.25 : 1, cursor: atCurrentMonth ? "not-allowed" : "pointer" }}>
            <IcoChevRight size={22} color={SUB} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 10 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, color: SUB, fontWeight: 700, paddingBottom: 4, letterSpacing: "0.04em" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const date = new Date(view.year, view.month, day);
            const future = date > todayStart;
            const isSel = sameDay(date, selected);
            const isToday = sameDay(date, today);
            return (
              <button key={i} disabled={future} onClick={() => pick(date)} style={{
                aspectRatio: "1", borderRadius: 12, padding: 0, fontSize: 16,
                fontWeight: isSel || isToday ? 700 : 500,
                background: isSel ? ACCENT : isToday ? aTint(9) : "transparent",
                border: isToday && !isSel ? `1px solid ${aTint(33)}` : "none",
                color: isSel ? "#fff" : isToday ? ACCENT : TEXT,
                opacity: future ? 0.25 : 1, cursor: future ? "not-allowed" : "pointer",
              }}>{day}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <button onClick={() => pick(todayStart)} style={{ ...outlineBtn, padding: 14, fontSize: 15 }}>Today</button>
          <button onClick={onClose} style={{ ...outlineBtn, padding: 14, fontSize: 15 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── LoginScreen ────────────────────────────────────────────────────────── */
function LoginScreen({ onGuest }: { onGuest: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: BG, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 28,
        padding: "48px 40px", width: 380, maxWidth: "90vw", textAlign: "center",
      }}>
        <img src={logoUrl} alt="Montra" style={{ width: 52, height: 52, objectFit: "contain", marginBottom: 16 }} />
        <h1 style={{ color: TEXT, fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>Montra Web</h1>
        <p style={{ color: SUB, fontSize: 16, margin: "0 0 36px", lineHeight: 1.5 }}>
          Sign in with the same account you use on the mobile app — your transactions will sync automatically.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14,
            background: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontSize: 18, fontWeight: 700, color: "#111",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
            marginBottom: 12,
          }}
        >
          {/* Google logo SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 12px" }}>
          <span style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: SUB }}>or</span>
          <span style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        <button onClick={onGuest} style={{
          width: "100%", padding: "12px", borderRadius: 14,
          background: "transparent", border: `1px solid ${BORDER}`,
          color: SUB, fontSize: 16, fontWeight: 600, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
        >
          Continue as Guest
        </button>

        {error && <p style={{ color: RED, fontSize: 15, marginTop: 14 }}>{error}</p>}

        <p style={{ color: SUB, fontSize: 14, marginTop: 24, lineHeight: 1.6 }}>
          Data syncs with your Montra mobile app via Supabase.
          Guest mode stores data locally in your browser only.
        </p>
      </div>

      <a href="#/" style={{
        position: "fixed", top: 20, left: 24, color: SUB, fontSize: 16,
        textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
      }}>
        <IcoArrowLeft size={14} color={SUB} /> Back to site
      </a>
    </div>
  );
}

/* ─── AppShell (authenticated) ───────────────────────────────────────────── */
function AppShell({ user, onSignOut }: { user: User | null; onSignOut: () => void }) {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [settings, setSettings] = useState<Settings>(loadSet);
  const [tab, setTab] = useState<Tab>("home");
  const homeCal = useHomeCalendar();
  const [detailTx, setDetailTx] = useState<Tx | null>(null);
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingTx, setLoadingTx] = useState(!!user);

  const isGuest = !user;

  /* Persist settings */
  useEffect(() => { saveSet(settings); }, [settings]);

  /* Show toast helper */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Fetch transactions from Supabase (authenticated users) ── */
  const fetchFromSupabase = useCallback(async () => {
    if (!user) return;
    setLoadingTx(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: Tx[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        amount: r.amount as number,
        type: r.type as TxType,
        parent_category: (r.parent_category as string) || "",
        sub_category: (r.sub_category as string) || "",
        notes: (r.notes as string) || "",
        created_at: r.created_at as string,
        is_edited: Boolean(r.is_edited),
        last_edited_at: r.last_edited_at as string | null,
        original_amount: r.original_amount as number | null,
        original_notes: r.original_notes as string | null,
      }));
      setTransactions(mapped);
      saveTx(mapped);
    } else {
      /* Fall back to localStorage cache */
      setTransactions(loadTx());
    }
    setLoadingTx(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFromSupabase();
    } else {
      setTransactions(loadTx());
    }
  }, [user, fetchFromSupabase]);

  /* ── Add ── */
  const addTx = useCallback(async (tx: Tx) => {
    /* Optimistic */
    setTransactions((p) => [tx, ...p]);
    setTab("home");

    if (user) {
      const { error } = await supabase.from("transactions").insert([{
        id: tx.id,
        user_id: user.id,
        amount: tx.amount,
        type: tx.type,
        parent_category: tx.parent_category,
        sub_category: tx.sub_category || null,
        notes: tx.notes || null,
        created_at: tx.created_at,
        is_edited: false,
      }]);
      if (error) {
        console.error("[Supabase insert error]", error);
        showToast(`Error: ${error.message}`);
        saveTx([tx, ...loadTx()]);
      } else {
        showToast("Transaction saved!");
      }
    } else {
      saveTx([tx, ...loadTx()]);
      showToast("Transaction saved (local only — not signed in).");
    }
  }, [user, showToast]);

  /* ── Delete ── */
  const deleteTx = useCallback(async (id: string) => {
    setTransactions((p) => p.filter((t) => t.id !== id));
    setDetailTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      showToast(error ? "Deleted locally — sync failed." : "Transaction deleted.");
    } else {
      saveTx(loadTx().filter((t) => t.id !== id));
      showToast("Transaction deleted.");
    }
  }, [user, showToast]);

  /* ── Update ── */
  const updateTx = useCallback(async (updated: Tx) => {
    setTransactions((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    setEditTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").update({
        amount: updated.amount,
        notes: updated.notes,
        is_edited: true,
        last_edited_at: updated.last_edited_at,
        original_amount: updated.original_amount,
        original_notes: updated.original_notes,
      }).eq("id", updated.id);
      showToast(error ? "Updated locally — sync failed." : "Changes saved.");
    } else {
      showToast("Changes saved.");
    }
  }, [user, showToast]);

  const navItems: { id: Tab; label: string; Icon: React.FC<IP> }[] = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "add", label: "Add", Icon: IcoPlus },
    { id: "analytics", label: "Analytics", Icon: IcoBarChart },
    { id: "search", label: "Search", Icon: IcoSearch },
    { id: "profile", label: "Profile", Icon: IcoUser },
    { id: "settings", label: "Settings", Icon: IcoSettings },
  ];

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name as string) || user?.email || "Guest";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const themeVars = { ...PALETTES[settings.theme], "--accent": settings.accent } as React.CSSProperties;

  return (
    <div style={{ ...themeVars, display: "flex", height: "100vh", background: BG, fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <nav className="montra-nav" style={{ width: 268, background: SURFACE, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logoUrl} alt="Montra" style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: TEXT, lineHeight: 1.1 }}>Montra</span>
              <span style={{ fontSize: 14, color: SUB }}>Web Edition</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "13px 16px", borderRadius: 12,
                  background: active ? aTint(14) : "transparent",
                  border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  color: active ? ACCENT : SUB,
                  fontWeight: active ? 700 : 500, fontSize: 16, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={20} color={active ? ACCENT : SUB} />
                <span className="montra-nav-label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* User + sign-out */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* User card */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: CARD }}>
            {avatar ? (
              <img src={avatar} alt={name} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: aTint(19), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT }}>{isGuest ? "G" : initials}</span>
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isGuest ? "Guest" : name.split(" ")[0]}</div>
              <div style={{ fontSize: 14, color: isGuest ? RED : ACCENT }}>{isGuest ? "Not signed in" : "Synced with Supabase"}</div>
            </div>
          </div>

          {/* Sign out / Sign in */}
          {isGuest ? (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: ACCENT, fontWeight: 600, gap: 8, justifyContent: "flex-start" }}>
              Sign in
            </button>
          ) : (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: SUB, fontWeight: 500, gap: 8, justifyContent: "flex-start" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = RED; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = SUB; }}
            >
              Sign out
            </button>
          )}

          <a href="#/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: SUB, fontSize: 16, fontWeight: 500 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = SUB; }}
          >
            <IcoArrowLeft size={14} />
            Back to site
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="montra-main" style={{ flex: 1, overflow: "auto", padding: "44px 56px 56px", position: "relative", zoom: TEXT_SCALE[settings.textSize] } as React.CSSProperties}>
        {loadingTx ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: SUB }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 16 }}>Loading your transactions…</span>
          </div>
        ) : (
          <div key={tab} className="montra-tab" style={{ maxWidth: 1360, margin: "0 auto", width: "100%" }}>
            {tab === "home" && <HomeTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} cal={homeCal} />}
            {tab === "add" && <AddTab onAdd={addTx} />}
            {tab === "analytics" && <AnalyticsTab txs={transactions} currency={settings.currency} />}
            {tab === "search" && <SearchTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} />}
            {tab === "profile" && (
              <ProfileTab
                txs={transactions} settings={settings} onSave={setSettings}
                user={user} isGuest={isGuest} onSignOut={onSignOut}
                onOpenSettings={() => setTab("settings")}
              />
            )}
            {tab === "settings" && (
              <SettingsTab
                settings={settings} onSave={setSettings}
                onClear={async () => {
                  if (user) {
                    await supabase.from("transactions").delete().eq("user_id", user.id);
                  }
                  setTransactions([]);
                  saveTx([]);
                  showToast("All data cleared.");
                }}
                txCount={transactions.length}
                user={user}
                onRefresh={fetchFromSupabase}
              />
            )}
          </div>
        )}
      </main>

      {detailTx && (
        <TxDetailModal
          tx={detailTx} currency={settings.currency}
          onClose={() => setDetailTx(null)}
          onDelete={deleteTx}
          onEdit={(tx) => { setEditTx(tx); setDetailTx(null); }}
        />
      )}
      {editTx && (
        <EditModal
          tx={editTx} currency={settings.currency}
          onClose={() => setEditTx(null)}
          onSave={updateTx}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function WebApp() {
  const [session, setSession] = useState<Session | null | "loading">("loading");
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (session && session !== "loading") {
      await supabase.auth.signOut();
      /* Remove the signed-in user's cached transactions so the next guest cannot see them. */
      saveTx([]);
    }
    setGuestMode(false);    setSession(null);
  };

  return (
    <>
      <style>{`
        .montra-root {
          --bg:#0d0d0d; --surface:#141414; --card:#1c1c1c; --card2:#222222;
          --border:#282828; --text:#f8f8f8; --sub:#b0b0b0; --accent:#27AE60;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .montra-home { flex-direction: column !important; }
          .montra-home-left { width: 100% !important; }
          .montra-main { padding: 32px 28px 48px !important; }
        }
        @media (max-width: 860px) {
          .montra-nav { width: 76px !important; }
          .montra-nav-label { display: none; }
          .montra-nav button { justify-content: center !important; padding: 14px 0 !important; }
          .montra-nav > div:first-child { display: none !important; }
          .montra-nav > div:last-child > div { display: none !important; }
          .montra-nav > div:last-child button { font-size: 12px !important; justify-content: center !important; padding: 10px 0 !important; }
          .montra-nav > div:last-child a { font-size: 0 !important; justify-content: center !important; }
          .montra-nav > div { padding-left: 8px !important; padding-right: 8px !important; }
          .montra-settings { flex-direction: column !important; gap: 20px !important; }
          .montra-settings-nav { width: 100% !important; }
        }
        @media (max-width: 560px) { .montra-main { padding: 24px 16px 40px !important; } }
        @keyframes donutIn { from { opacity: 0; transform: rotate(-25deg) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        .montra-opt { background: transparent; } .montra-opt:hover { background: var(--card2); }
        .montra-pop { animation: popIn 0.22s cubic-bezier(.2,.8,.2,1) both; max-height: 92vh; overflow-y: auto; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .montra-tab { animation: fadeIn 0.28s ease both; }
        button { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease; }
        button:not(:disabled):active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { .montra-tab, button { animation: none !important; transition: none !important; } }
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>

      <div className="montra-root">
        {session === "loading" ? (
          <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : session || guestMode ? (
          <AppShell
            user={(session && typeof session !== "string") ? session.user : null}
            onSignOut={handleSignOut}
          />
        ) : (
          <LoginScreen onGuest={() => setGuestMode(true)} />
        )}
      </div>
    </>
  );
}
