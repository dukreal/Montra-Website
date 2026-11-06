import { useState } from "react";
import { IoCash } from "react-icons/io5";
import { fmtDate, fmtTime } from "@/web/dates";
import { getCat, fmtAmt } from "@/web/helpers";
import { overlay, modalBox, btnReset, outlineBtn, dangerBtn, primaryBtn } from "@/web/styles";
import { RED, GREEN, TEXT, SUB, CARD2, BORDER, SURFACE } from "@/web/theme";
import type { Tx } from "@/web/types";
import { CatIcon, IcoX } from "@/web/icons";

/* ─── TxDetailModal ──────────────────────────────────────────────────────── */
export function TxDetailModal({ tx, currency, onClose, onDelete, onEdit }: {
  tx: Tx; currency: string; onClose: () => void; onDelete: (id: string) => void; onEdit: (tx: Tx) => void;
}) {
  const isExp = tx.type === "expense";
  const tone = isExp ? RED : GREEN;
  const cat = getCat(tx.type, tx.parent_category);
  const [confirmDel, setConfirmDel] = useState(false);
  const catClr = cat?.color ?? tone;
  const rows = [
    { label: "Category", value: tx.parent_category || "—" },
    { label: "Subcategory", value: tx.sub_category || "—" },
    { label: "Date", value: fmtDate(tx.created_at) },
    { label: "Time", value: fmtTime(tx.created_at) },
  ];
  return (
    <div style={overlay} onClick={onClose}>
      <div className="montra-pop" style={{ ...modalBox, width: 460, padding: 0, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        {/* Top bar: category + close */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 24px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${catClr}1e`, border: `1px solid ${catClr}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {cat ? <CatIcon name={cat.icon} color={cat.color} size={24} /> : <IoCash size={24} color={tone} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tx.sub_category || tx.parent_category || "Uncategorized"}
            </div>
            <div style={{ fontSize: 15, color: SUB, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tx.sub_category ? tx.parent_category : "Transaction details"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, width: 36, height: 36, borderRadius: 10, background: CARD2 }}>
            <IcoX size={18} color={SUB} />
          </button>
        </div>

        {/* Amount */}
        <div style={{ padding: "26px 24px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: tone, lineHeight: 1.1, letterSpacing: "-0.02em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
            {isExp ? "-" : "+"}{fmtAmt(tx.amount, currency)}
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 100, border: `1px solid ${tone}55`, color: tone, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: tone }} />
            {isExp ? "Expense" : "Income"}
          </span>
        </div>

        {/* Details list */}
        <div style={{ margin: "0 24px", borderTop: `1px solid ${BORDER}` }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "15px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 16, color: SUB }}>{label}</span>
              <span style={{ fontSize: 16, color: TEXT, fontWeight: 600, textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>

        {tx.notes && (
          <div style={{ margin: "18px 24px 0", background: SURFACE, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${tone}` }}>
            <div style={{ fontSize: 13, color: SUB, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>NOTE</div>
            <div style={{ fontSize: 16, color: TEXT, lineHeight: 1.5, wordBreak: "break-word" }}>{tx.notes}</div>
          </div>
        )}
        {tx.is_edited && (
          <div style={{ margin: "14px 24px 0", fontSize: 14, color: SUB }}>
            Edited{tx.last_edited_at ? ` on ${fmtDate(tx.last_edited_at)}` : ""}
            {tx.original_amount != null && tx.original_amount !== tx.amount ? ` · originally ${fmtAmt(tx.original_amount, currency)}` : ""}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, padding: 24 }}>
          {confirmDel ? (
            <>
              <button onClick={() => setConfirmDel(false)} style={outlineBtn}>Keep</button>
              <button onClick={() => { onDelete(tx.id); onClose(); }} style={{ ...dangerBtn, background: RED, color: "#fff", border: "none" }}>Confirm delete</button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDel(true)} style={dangerBtn}>Delete</button>
              <button onClick={() => onEdit(tx)} style={{ ...primaryBtn, flex: 1 }}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
