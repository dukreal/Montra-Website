import { useState } from "react";
import { IoCash } from "react-icons/io5";
import { fmtDate, fmtTime } from "@/web/dates";
import { getCat, fmtAmt } from "@/web/helpers";
import { CARD2, CARD, BORDER, RED, GREEN, TEXT, SUB } from "@/web/theme";
import type { Tx } from "@/web/types";
import { CatIcon } from "@/web/icons";

/* ─── TxRow ──────────────────────────────────────────────────────────────── */
export function TxRow({ tx, currency, onClick, showDate = false }: { tx: Tx; currency: string; onClick: () => void; showDate?: boolean }) {
  const [hov, setHov] = useState(false);
  const isExp = tx.type === "expense";
  const cat = getCat(tx.type, tx.parent_category);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: hov ? CARD2 : CARD,
        borderRadius: 14, padding: "13px 15px",
        border: `1px solid ${hov ? "#333" : BORDER}`,
        cursor: "pointer", width: "100%", textAlign: "left",
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: cat ? `${cat.color}20` : (isExp ? "#FF6B6B20" : "#2ECC7120"),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {cat ? <CatIcon name={cat.icon} color={cat.color} size={20} /> : (isExp ? <IoCash size={20} color={RED} /> : <IoCash size={20} color={GREEN} />)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {tx.sub_category || tx.parent_category || "Uncategorized"}
        </div>
        <div style={{ fontSize: 15, color: SUB, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {showDate ? `${fmtDate(tx.created_at)} · ` : ""}{fmtTime(tx.created_at)}{tx.notes ? ` · ${tx.notes}` : ""}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: isExp ? RED : GREEN, flexShrink: 0 }}>
        {isExp ? "-" : "+"}{fmtAmt(tx.amount, currency)}
      </div>
    </button>
  );
}
