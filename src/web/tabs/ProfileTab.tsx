import { useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { fmtAmt } from "@/web/helpers";
import { profileRow } from "@/web/styles";
import { GREEN, RED, ACCENT, TEXT, CARD, BORDER, aTint, SUB, CARD2, SURFACE } from "@/web/theme";
import type { Tx, Settings } from "@/web/types";
import { IcoTrendUp, IcoTrendDown, IcoWallet, IcoChevR, IcoHelp, IcoLogout } from "@/web/icons";

/* ─── ProfileTab ─────────────────────────────────────────────────────────── */
export function ProfileTab({ txs, settings, onSave, user, isGuest, onSignOut, onOpenSettings }: {
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
