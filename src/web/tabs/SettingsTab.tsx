import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { dangerBtn, outlineBtn } from "@/web/styles";
import { BORDER, TEXT, SUB, aTint, ACCENT, CARD, ACCENT_THEMES, CARD2, RED } from "@/web/theme";
import type { Settings, ThemeMode, TextSize } from "@/web/types";
import { IcoPalette, IcoGlobe, IcoWallet, IcoUser, IcoDoc, IcoHelp, IcoSun, IcoMoon, IcoCheck } from "@/web/icons";
import type { IP } from "@/web/icons";

/* ─── SettingsTab ────────────────────────────────────────────────────────── */
type SettingsSection = "appearance" | "language" | "currency" | "account" | "data" | "about";

export function SettingsTab({ settings, onSave, onClear, txCount, user, onRefresh }: {
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
