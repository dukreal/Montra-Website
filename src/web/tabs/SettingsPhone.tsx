import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import logoUrl from "@/assets/images/logo.png";
import { BORDER, TEXT, SUB, aTint, ACCENT, ACCENT_TEXT, CARD, CARD2, SURFACE, ACCENT_THEMES, RED, ON_ACCENT, ON_RED, RED_TEXT } from "@/web/theme";
import type { Settings, ThemeMode, TextSize } from "@/web/types";
import { IcoPalette, IcoText, IcoSun, IcoMoon, IcoCheck, IcoChevLeft, IcoDoc, IcoUser, IcoCalendar } from "@/web/icons";
import { Switch, DotGlyph } from "@/web/components/Switch";
import { ADVANCED_OPTIONS } from "@/web/advanced";

/* ─── SettingsPhone ──────────────────────────────────────────────────────── */
/* Phone layout of Settings: one scrolling page of grouped cards, like the mobile app.
   Rendered by SettingsTab under 860px; the desktop layout is untouched. */

/* Icon-tile hues. The icon uses the deeper shade in light theme so it stays readable on its own tint. */
const HUES = {
  purple: { dark: "#A78BFA", light: "#6D28D9" },
  blue: { dark: "#60A5FA", light: "#1D4ED8" },
  amber: { dark: "#FB923C", light: "#9A4B0D" },
} as const;
type Hue = keyof typeof HUES;

const SIZES: { size: TextSize; label: string; name: string }[] = [
  { size: "small", label: "S", name: "Small" },
  { size: "medium", label: "M", name: "Medium" },
  { size: "large", label: "L", name: "Large" },
];

const LANGUAGES = [
  { key: "english", label: "English", flag: "🇺🇸", enabled: true },
  { key: "filipino", label: "Filipino", flag: "🇵🇭", enabled: false },
] as const;

const CURRENCIES = [
  { code: "₱", name: "Philippine Peso (PHP)", enabled: true },
  { code: "$", name: "US Dollar (USD)", enabled: false },
  { code: "€", name: "Euro (EUR)", enabled: false },
];

const rowBase: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, width: "100%", minHeight: 68, padding: "12px 14px",
  background: "none", border: "none", textAlign: "left", font: "inherit", color: "inherit",
};

/* Rounded tile behind a row's icon. `tone` is a fixed hue, or the live accent colour. */
function Tile({ tone, theme, children }: { tone: Hue | "accent"; theme: ThemeMode; children: (color: string) => React.ReactNode }) {
  const color = tone === "accent" ? ACCENT_TEXT : HUES[tone][theme];
  const bg = tone === "accent" ? aTint(15) : `color-mix(in srgb, ${color} 16%, transparent)`;
  return (
    <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
      {children(color)}
    </span>
  );
}

/* `fit`: keep the title on one line; the row's control drops to its own line when it does not fit. */
function RowText({ title, sub, fit }: { title: string; sub?: string; fit?: boolean }) {
  return (
    <span style={{ flex: fit ? "1 1 auto" : "1 1 80px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, lineHeight: 1.25, whiteSpace: fit ? "nowrap" : undefined }}>{title}</span>
      {sub && <span style={{ fontSize: 14, color: SUB, lineHeight: 1.3 }}>{sub}</span>}
    </span>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h3 style={{ margin: "0 0 10px 4px", fontSize: 14, fontWeight: 800, letterSpacing: "0.08em", color: SUB, textTransform: "uppercase" }}>{label}</h3>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, overflow: "hidden" }}>
        {children}
      </div>
    </section>
  );
}

/* Hairline between rows of one card */
const sep: React.CSSProperties = { borderTop: `1px solid ${BORDER}` };

/* Pill with 44px buttons; the chosen one is lifted and tinted. */
function Segmented({ label, items }: { label: string; items: { key: string; content: React.ReactNode; name: string; on: boolean; onPick: () => void }[] }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 2, padding: 3, borderRadius: 14, background: CARD2, flexShrink: 0, marginLeft: "auto" }}>
      {items.map((it) => (
        <button key={it.key} type="button" aria-pressed={it.on} aria-label={it.name} onClick={it.onPick} style={{
          width: 44, height: 44, borderRadius: 11, border: "none", cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800,
          background: it.on ? SURFACE : "transparent", color: it.on ? ACCENT_TEXT : SUB,
          boxShadow: it.on ? `inset 0 0 0 1.5px ${aTint(45)}` : "none",
        }}>{it.content}</button>
      ))}
    </div>
  );
}

function CheckDot({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" style={{
      width: 24, height: 24, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: on ? ACCENT : "transparent", border: on ? "none" : `2px solid ${BORDER}`,
    }}>
      {on && <IcoCheck size={13} color={ON_ACCENT} />}
    </span>
  );
}

export function SettingsPhone({ settings, onSave, onClear, txCount, user, onRefresh, onBack }: {
  settings: Settings; onSave: (s: Settings) => void; onClear: () => void | Promise<void>; txCount: number;
  user: User | null; onRefresh?: () => void; onBack: () => void;
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const theme = settings.theme;
  const sizeName = SIZES.find((s) => s.size === settings.textSize)?.name;
  const accentName = ACCENT_THEMES.find((a) => a.key.toLowerCase() === settings.accent.toLowerCase())?.name;
  const plural = txCount !== 1 ? "s" : "";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Header: back chevron + centred title */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <button type="button" onClick={onBack} aria-label="Back" style={{
          position: "absolute", left: -8, top: 0, width: 44, height: 44, padding: 0, background: "none", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <IcoChevLeft size={24} color={TEXT} />
        </button>
        <h2 className="montra-phone-title">Settings</h2>
      </div>

      {/* APPEARANCE */}
      <Section label="Appearance">
        <div style={{ ...rowBase, flexWrap: "wrap" }}>
          <Tile tone="purple" theme={theme}>{(c) => (theme === "dark" ? <IcoMoon size={22} color={c} /> : <IcoSun size={22} color={c} />)}</Tile>
          <RowText fit title="Theme Mode" sub={theme === "dark" ? "Dark" : "Light"} />
          <Segmented label="Theme mode" items={[
            { key: "light", name: "Light", on: theme === "light", onPick: () => onSave({ ...settings, theme: "light" }), content: <IcoSun size={20} /> },
            { key: "dark", name: "Dark", on: theme === "dark", onPick: () => onSave({ ...settings, theme: "dark" }), content: <IcoMoon size={20} /> },
          ]} />
        </div>

        <div style={{ ...rowBase, ...sep, flexWrap: "wrap" }}>
          <Tile tone="accent" theme={theme}>{(c) => <IcoPalette size={22} color={c} />}</Tile>
          <RowText fit title="Color Theme" sub={accentName} />
          <div role="group" aria-label="Color theme" style={{ display: "flex", flex: "1 1 auto", justifyContent: "flex-end", marginRight: -5 }}>
            {ACCENT_THEMES.map((c) => {
              const on = settings.accent.toLowerCase() === c.key.toLowerCase();
              return (
                <button key={c.key} type="button" aria-pressed={on} aria-label={c.name} onClick={() => onSave({ ...settings, accent: c.key })} style={{
                  width: 40, height: 44, padding: 0, background: "none", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: "50%", background: c.key, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: on ? `0 0 0 2px ${CARD}, 0 0 0 4px ${c.text[theme]}` : "none",
                  }}>
                    {on && <IcoCheck size={15} color={ON_ACCENT} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ ...rowBase, ...sep, flexWrap: "wrap" }}>
          <Tile tone="blue" theme={theme}>{(c) => <IcoText size={22} color={c} />}</Tile>
          <RowText fit title="Text Size" sub={sizeName} />
          <Segmented label="Text size" items={SIZES.map((s) => ({
            key: s.size, name: s.name, on: settings.textSize === s.size, onPick: () => onSave({ ...settings, textSize: s.size }), content: s.label,
          }))} />
        </div>
      </Section>

      {/* ADVANCED */}
      <Section label="Advanced">
        {ADVANCED_OPTIONS.map((o, i) => {
          const on = settings[o.key];
          return (
            <button key={o.key} type="button" role="switch" aria-checked={on} onClick={() => onSave({ ...settings, [o.key]: !on })}
              style={{ ...rowBase, ...(i ? sep : null), cursor: "pointer" }}>
              <Tile tone={o.key === "customDate" ? "blue" : "amber"} theme={theme}>
                {(c) => (o.key === "customDate" ? <IcoCalendar size={22} color={c} /> : <DotGlyph color={c} />)}
              </Tile>
              <RowText title={o.title} sub={o.sub} />
              <Switch on={on} />
            </button>
          );
        })}
      </Section>

      {/* LANGUAGE */}
      <Section label="Language">
        {LANGUAGES.map((l, i) => {
          const on = settings.language === l.key;
          return (
            <button key={l.key} type="button" disabled={!l.enabled} aria-pressed={on} onClick={() => onSave({ ...settings, language: l.key })}
              style={{ ...rowBase, ...(i ? sep : null), cursor: l.enabled ? "pointer" : "not-allowed" }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: CARD2, fontSize: 24, opacity: l.enabled ? 1 : 0.55 }}>{l.flag}</span>
              <RowText title={l.label} sub={l.enabled ? undefined : "Coming soon"} />
              {l.enabled && <CheckDot on={on} />}
            </button>
          );
        })}
      </Section>

      {/* CURRENCY */}
      <Section label="Currency">
        {CURRENCIES.map((c, i) => {
          const on = settings.currency === c.code;
          return (
            <button key={c.code} type="button" disabled={!c.enabled} aria-pressed={on} onClick={() => onSave({ ...settings, currency: c.code })}
              style={{ ...rowBase, ...(i ? sep : null), cursor: c.enabled ? "pointer" : "not-allowed" }}>
              <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: on ? aTint(15) : CARD2, color: on ? ACCENT_TEXT : SUB, fontSize: 20, fontWeight: 800, opacity: c.enabled ? 1 : 0.55 }}>{c.code}</span>
              <RowText title={c.name} sub={c.enabled ? undefined : "Coming soon"} />
              {c.enabled && <CheckDot on={on} />}
            </button>
          );
        })}
      </Section>

      {/* ACCOUNT (signed-in users only) */}
      {user && (
        <Section label="Account">
          <div style={{ ...rowBase, flexWrap: "wrap" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, background: aTint(18), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {user.user_metadata?.avatar_url
                ? <img src={user.user_metadata.avatar_url as string} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", maxWidth: "none" }} />
                : <IcoUser size={22} color={ACCENT_TEXT} />}
            </span>
            <span style={{ flex: "1 1 120px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(user.user_metadata?.full_name as string) || "Signed in"}</span>
              <span style={{ fontSize: 14, color: SUB, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
            </span>
            <button type="button" onClick={onRefresh} style={{
              minHeight: 44, padding: "0 16px", borderRadius: 12, flexShrink: 0, cursor: "pointer", marginLeft: "auto",
              background: aTint(9), border: `1px solid ${aTint(27)}`, color: ACCENT_TEXT, fontSize: 16, fontWeight: 600,
            }}>Sync now</button>
          </div>
        </Section>
      )}

      {/* DATA */}
      <Section label="Data">
        <div style={rowBase}>
          <Tile tone="blue" theme={theme}>{(c) => <IcoDoc size={22} color={c} />}</Tile>
          <RowText title="Stored transactions" sub={user ? "Synced to your account. A copy is also kept in this browser." : "Saved in this browser only. Nothing is sent to any server."} />
          <span style={{ fontSize: 24, fontWeight: 800, color: ACCENT_TEXT, flexShrink: 0 }}>{txCount}</span>
        </div>
        <div style={{ ...sep, padding: 16, background: "#FF6B6B0d" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: RED_TEXT, marginBottom: 6, letterSpacing: "0.08em" }}>DANGER ZONE</div>
          <p style={{ margin: "0 0 14px", fontSize: 15, lineHeight: 1.55, color: SUB }}>
            {user
              ? `This permanently deletes all ${txCount} transaction${plural} from your Montra account. If you also use the Montra mobile app, they will be deleted there too. This cannot be undone.`
              : `This permanently deletes all ${txCount} transaction${plural} stored in this browser. This cannot be undone.`}
          </p>
          {!confirmClear ? (
            <button type="button" onClick={() => setConfirmClear(true)} style={{
              width: "100%", minHeight: 48, borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 700,
              border: `1px solid ${RED}55`, background: "#FF6B6B14", color: RED_TEXT,
            }}>Clear All Data</button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" disabled={clearing} onClick={() => setConfirmClear(false)} style={{
                flex: 1, minHeight: 48, borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 600,
                border: `1px solid ${BORDER}`, background: SURFACE, color: TEXT, opacity: clearing ? 0.5 : 1,
              }}>Cancel</button>
              <button type="button" disabled={clearing}
                onClick={async () => { setClearing(true); await onClear(); setClearing(false); setConfirmClear(false); }}
                style={{
                  flex: 1.4, minHeight: 48, borderRadius: 12, cursor: "pointer", fontSize: 16, fontWeight: 700,
                  border: "none", background: RED, color: ON_RED, opacity: clearing ? 0.7 : 1,
                }}>{clearing ? "Deleting…" : user ? "Yes, delete everything" : "Yes, delete all"}</button>
            </div>
          )}
        </div>
      </Section>

      {/* ABOUT */}
      <Section label="About">
        <div style={rowBase}>
          <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: CARD2 }}>
            <img src={logoUrl} alt="" style={{ width: 28, height: 28, objectFit: "contain", maxWidth: "none" }} />
          </span>
          <RowText title="Montra Web" sub="Version 2.1.0 · Built with React + Supabase" />
        </div>
        <p style={{ ...sep, margin: 0, padding: 16, fontSize: 15, lineHeight: 1.55, color: SUB }}>
          Track your income and expenses with a clean, fast interface. Guest mode keeps data in your browser; when you sign in, it syncs to your account.
        </p>
      </Section>
    </div>
  );
}