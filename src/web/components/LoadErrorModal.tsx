import { overlay, modalBox, outlineBtn, primaryBtn } from "@/web/styles";
import { RED, SUB, TEXT, RED_TEXT } from "@/web/theme";
import { IcoX } from "@/web/icons";

/* ─── LoadErrorModal ─────────────────────────────────────────────────────── */
/* Shown when the signed-in transactions could not be fetched. */
export function LoadErrorModal({ detail, onRetry, onClose }: {
  detail: string | null; onRetry: () => void; onClose: () => void;
}) {
  return (
    <div style={overlay}>
      <div className="montra-pop" role="dialog" aria-modal="true" aria-labelledby="load-error-title" style={{ ...modalBox, width: 440, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FF6B6B1e", border: `1px solid ${RED}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IcoX size={20} color={RED_TEXT} />
          </div>
          <h3 id="load-error-title" style={{ margin: 0, color: TEXT, fontSize: 20, fontWeight: 800, lineHeight: 1.25 }}>Couldn't load your transactions</h3>
        </div>
        <p style={{ margin: "0 0 8px", color: SUB, fontSize: 16, lineHeight: 1.55 }}>
          We couldn't reach your account, so your transactions aren't showing. Nothing has been deleted. Check your connection and try again.
        </p>
        {detail && <p style={{ margin: "0 0 20px", color: SUB, fontSize: 14, opacity: 0.8 }}>Details: {detail}</p>}
        <div style={{ display: "flex", gap: 12, marginTop: detail ? 0 : 20 }}>
          <button onClick={onClose} style={outlineBtn}>Close</button>
          <button onClick={onRetry} autoFocus style={{ ...primaryBtn, flex: 1 }}>Retry</button>
        </div>
      </div>
    </div>
  );
}