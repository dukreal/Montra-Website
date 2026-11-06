import { useState } from "react";
import { IoCash } from "react-icons/io5";
import { getCat } from "@/web/helpers";
import { overlay, modalBox, btnReset, fieldLabel, inputStyle, outlineBtn, primaryBtn } from "@/web/styles";
import { RED, GREEN, BORDER, TEXT, SUB, CARD2 } from "@/web/theme";
import type { Tx } from "@/web/types";
import { CatIcon, IcoX } from "@/web/icons";

/* ─── EditModal ──────────────────────────────────────────────────────────── */
export function EditModal({ tx, currency, onClose, onSave }: {
  tx: Tx; currency: string; onClose: () => void; onSave: (updated: Tx) => void;
}) {
  const [amount, setAmount] = useState(tx.amount.toString());
  const [notes, setNotes] = useState(tx.notes || "");
  const isExp = tx.type === "expense";
  const tone = isExp ? RED : GREEN;
  const cat = getCat(tx.type, tx.parent_category);
  const valid = parseFloat(amount) > 0;

  const handleSave = () => {
    const n = parseFloat(amount);
    if (!isNaN(n) && n > 0) {
      onSave({
        ...tx, amount: n, notes,
        is_edited: true,
        last_edited_at: new Date().toISOString(),
        original_amount: tx.is_edited ? tx.original_amount : tx.amount,
        original_notes: tx.is_edited ? tx.original_notes : tx.notes,
      });
      onClose();
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div className="montra-pop" style={{ ...modalBox, width: 480, padding: 0, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "24px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${cat?.color ?? tone}1e`, border: `1px solid ${cat?.color ?? tone}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {cat ? <CatIcon name={cat.icon} color={cat.color} size={24} /> : <IoCash size={24} color={tone} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: TEXT, margin: 0, fontSize: 22, fontWeight: 800 }}>Edit Transaction</h3>
            <div style={{ fontSize: 15, color: SUB, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isExp ? "Expense" : "Income"} · {tx.sub_category || tx.parent_category}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, width: 36, height: 36, borderRadius: 10, background: CARD2 }}>
            <IcoX size={18} color={SUB} />
          </button>
        </div>
        <div style={{ padding: 28 }}>
          <label style={fieldLabel}>AMOUNT</label>
          <div style={{ position: "relative", marginBottom: 22 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: tone, fontSize: 24, fontWeight: 700, pointerEvents: "none" }}>{currency}</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
              style={{ ...inputStyle, paddingLeft: 46, fontSize: 28, fontWeight: 800, color: tone, border: `2px solid ${valid ? `${tone}88` : BORDER}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={fieldLabel}>NOTES</label>
            <span style={{ fontSize: 13, color: notes.length >= 150 ? RED : SUB, fontWeight: 600 }}>{notes.length}/150</span>
          </div>
          <textarea value={notes} maxLength={150} placeholder="Add a note..." onChange={(e) => setNotes(e.target.value.slice(0, 150))} rows={3} style={{ ...inputStyle, marginBottom: 26, resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onClose} style={outlineBtn}>Cancel</button>
            <button onClick={handleSave} disabled={!valid} style={{ ...primaryBtn, flex: 1, opacity: valid ? 1 : 0.5, cursor: valid ? "pointer" : "not-allowed" }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
