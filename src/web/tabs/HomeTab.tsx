import { useMemo, useState } from "react";
import { IoArrowDownCircle } from "react-icons/io5";
import { inDateSel, isRange, MONTHS, fmtDateSel } from "@/web/dates";
import { fmtAmt } from "@/web/helpers";
import { btnReset } from "@/web/styles";
import { CARD, BORDER, SUB, TEXT, RED_TEXT, GREEN_TEXT } from "@/web/theme";
import type { Tx, DateSel } from "@/web/types";
import { MiniCalendar } from "@/web/components/MiniCalendar";
import { PhoneHomeBar } from "@/web/components/PhoneHomeBar";
import { TxRow } from "@/web/components/TxRow";
import { useIsPhone } from "@/web/hooks";
import type { HomeCalendar } from "@/web/hooks";

export function HomeTab({ txs, currency, onTxClick, cal, onOpenSettings, showDots }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void; cal: HomeCalendar; onOpenSettings: () => void; showDots: boolean }) {
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

/* Phone Home always shows ONE day: the picked day, or today's date number inside the shown month */
  const [today] = useState(() => new Date());
  const isPhone = useIsPhone();
  const phoneDay = useMemo(() => {
    if (dates.sel && !isRange(dates.sel)) return dates.sel.start;
    const last = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(today.getDate(), last));
  }, [dates.sel, year, month, today]);
  const listSel = useMemo<DateSel | null>(() => (isPhone ? { start: phoneDay, end: phoneDay } : dates.sel), [isPhone, phoneDay, dates.sel]);

  const filtered = useMemo(() => {
    return txs
      .filter((tx) => {
        const d = new Date(tx.created_at);
        if (listSel) return inDateSel(tx.created_at, listSel);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [txs, listSel, year, month]);

  const balance = mIncome - mExpense;

  /* Phone header totals follow the list below: the picked day, or the whole month */
  const { fInc, fExp } = useMemo(() => {
    let inc = 0, exp = 0;
    filtered.forEach((tx) => { if (tx.type === "income") inc += tx.amount; else exp += tx.amount; });
    return { fInc: inc, fExp: exp };
  }, [filtered]);

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
      <PhoneHomeBar
        year={year} month={month} transactions={txs} selectedDay={phoneDay}
        income={fInc} expense={fExp} currency={currency}
        onSelectDay={(d) => { setYear(d.getFullYear()); setMonth(d.getMonth()); dates.pick(d, true); }}
        onJump={(y, m) => {
          const cap = y === today.getFullYear() && m === today.getMonth() ? today.getDate() : new Date(y, m + 1, 0).getDate();
          setYear(y); setMonth(m); dates.pick(new Date(y, m, Math.min(phoneDay.getDate(), cap)), true);
        }}
        onOpenSettings={onOpenSettings} showDots={showDots}
      />
      {/* Left column */}
      <div className="montra-home-left" style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Summary */}
        <div style={{ background: CARD, borderRadius: 18, padding: "18px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, color: SUB, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 12 }}>
            {MONTHS[month].toUpperCase()} {year}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: balance >= 0 ? GREEN_TEXT : RED_TEXT, marginBottom: 4 }}>
            {balance < 0 ? "-" : ""}{fmtAmt(Math.abs(balance), currency)}
          </div>
          <div style={{ fontSize: 15, color: SUB, marginBottom: 16 }}>Net balance</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 }}>
            {[
              { label: "Income", value: mIncome, color: GREEN_TEXT, bg: "#2ECC7110" },
              { label: "Expenses", value: mExpense, color: RED_TEXT, bg: "#FF6B6B10" },
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
          showDots={showDots}
        />
      </div>

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: TEXT, fontSize: 18, fontWeight: 700 }}>
            {listSel ? fmtDateSel(listSel) : `All of ${MONTHS[month]}`}
          </h2>
          {dates.sel && (
            <button className="montra-desk-only" onClick={dates.clear} style={{ ...btnReset, fontSize: 15, color: SUB }}>
              Show all ×
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 15, color: SUB }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="montra-tab" style={{ flex: "none", height: 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: SUB, gap: 10 }}>
            <IoArrowDownCircle size={44} color={BORDER} />
            <span style={{ fontWeight: 600, color: TEXT }}>No transactions</span>
            <span style={{ fontSize: 16 }}>
              <span className="montra-desk-only">Use the Add tab to record one.</span>
              <span className="montra-phone-only">Tap + to record one.</span>
            </span>
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
