import { useMemo } from "react";
import { IoArrowDownCircle } from "react-icons/io5";
import { inDateSel, MONTHS, fmtDateSel } from "@/web/dates";
import { fmtAmt } from "@/web/helpers";
import { btnReset } from "@/web/styles";
import { CARD, BORDER, SUB, GREEN, RED, TEXT } from "@/web/theme";
import type { Tx } from "@/web/types";
import { MiniCalendar } from "@/web/components/MiniCalendar";
import { TxRow } from "@/web/components/TxRow";
import type { HomeCalendar } from "@/web/hooks";

export function HomeTab({ txs, currency, onTxClick, cal }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void; cal: HomeCalendar }) {
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
