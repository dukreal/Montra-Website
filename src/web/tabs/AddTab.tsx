import { useState } from "react";
import { IoArrowDownCircle, IoArrowUpCircle } from "react-icons/io5";
import { CATS } from "@/web/categories";
import { MONTHS, sameDay } from "@/web/dates";
import { fieldLabel, inputStyle, primaryBtn, overlay, modalBox, btnReset, outlineBtn } from "@/web/styles";
import { TEXT, CARD, BORDER, RED, GREEN, SUB, ACCENT, aTint } from "@/web/theme";
import type { Tx, TxType } from "@/web/types";
import { CatIcon, IcoPlus, IcoChevLeft, IcoChevRight } from "@/web/icons";

/* ─── AddTab ─────────────────────────────────────────────────────────────── */
export function AddTab({ onAdd }: { onAdd: (tx: Tx) => void }) {
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
