import { useState, useEffect, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import logoUrl from "@/assets/images/logo.png";
import { loadSet, saveSet, saveTx, loadTx } from "@/web/storage";
import { btnReset } from "@/web/styles";
import { BG, CARD, BORDER, TEXT, SUB, RED, PALETTES, SURFACE, aTint, ACCENT, TEXT_SCALE } from "@/web/theme";
import type { Tx, Settings, Tab, TxType } from "@/web/types";
import { EditModal } from "@/web/components/EditModal";
import { Toast } from "@/web/components/Toast";
import { TxDetailModal } from "@/web/components/TxDetailModal";
import { useHomeCalendar } from "@/web/hooks";
import { IcoArrowLeft, IcoHome, IcoPlus, IcoBarChart, IcoSearch, IcoUser, IcoSettings } from "@/web/icons";
import type { IP } from "@/web/icons";
import { AddTab } from "@/web/tabs/AddTab";
import { AnalyticsTab } from "@/web/tabs/AnalyticsTab";
import { HomeTab } from "@/web/tabs/HomeTab";
import { ProfileTab } from "@/web/tabs/ProfileTab";
import { SearchTab } from "@/web/tabs/SearchTab";
import { SettingsTab } from "@/web/tabs/SettingsTab";

/* ─── LoginScreen ────────────────────────────────────────────────────────── */
function LoginScreen({ onGuest }: { onGuest: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: BG, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 28,
        padding: "48px 40px", width: 380, maxWidth: "90vw", textAlign: "center",
      }}>
        <img src={logoUrl} alt="Montra" style={{ width: 52, height: 52, objectFit: "contain", marginBottom: 16 }} />
        <h1 style={{ color: TEXT, fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>Montra Web</h1>
        <p style={{ color: SUB, fontSize: 16, margin: "0 0 36px", lineHeight: 1.5 }}>
          Sign in with the same account you use on the mobile app — your transactions will sync automatically.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14,
            background: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontSize: 18, fontWeight: 700, color: "#111",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
            marginBottom: 12,
          }}
        >
          {/* Google logo SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 12px" }}>
          <span style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: SUB }}>or</span>
          <span style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        <button onClick={onGuest} style={{
          width: "100%", padding: "12px", borderRadius: 14,
          background: "transparent", border: `1px solid ${BORDER}`,
          color: SUB, fontSize: 16, fontWeight: 600, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
        >
          Continue as Guest
        </button>

        {error && <p style={{ color: RED, fontSize: 15, marginTop: 14 }}>{error}</p>}

        <p style={{ color: SUB, fontSize: 14, marginTop: 24, lineHeight: 1.6 }}>
          Data syncs with your Montra mobile app via Supabase.
          Guest mode stores data locally in your browser only.
        </p>
      </div>

      <a href="#/" style={{
        position: "fixed", top: 20, left: 24, color: SUB, fontSize: 16,
        textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
      }}>
        <IcoArrowLeft size={14} color={SUB} /> Back to site
      </a>
    </div>
  );
}

/* ─── AppShell (authenticated) ───────────────────────────────────────────── */
function AppShell({ user, onSignOut }: { user: User | null; onSignOut: () => void }) {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [settings, setSettings] = useState<Settings>(loadSet);
  const [tab, setTab] = useState<Tab>("home");
  const homeCal = useHomeCalendar();
  const [detailTx, setDetailTx] = useState<Tx | null>(null);
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingTx, setLoadingTx] = useState(!!user);

  const isGuest = !user;

  /* Persist settings */
  useEffect(() => { saveSet(settings); }, [settings]);

  /* Show toast helper */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Fetch transactions from Supabase (authenticated users) ── */
  const fetchFromSupabase = useCallback(async () => {
    if (!user) return;
    setLoadingTx(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: Tx[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        amount: r.amount as number,
        type: r.type as TxType,
        parent_category: (r.parent_category as string) || "",
        sub_category: (r.sub_category as string) || "",
        notes: (r.notes as string) || "",
        created_at: r.created_at as string,
        is_edited: Boolean(r.is_edited),
        last_edited_at: r.last_edited_at as string | null,
        original_amount: r.original_amount as number | null,
        original_notes: r.original_notes as string | null,
      }));
      setTransactions(mapped);
      saveTx(mapped);
    } else {
      /* Fall back to localStorage cache */
      setTransactions(loadTx());
    }
    setLoadingTx(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFromSupabase();
    } else {
      setTransactions(loadTx());
    }
  }, [user, fetchFromSupabase]);

  /* ── Add ── */
  const addTx = useCallback(async (tx: Tx) => {
    /* Optimistic */
    setTransactions((p) => [tx, ...p]);
    setTab("home");

    if (user) {
      const { error } = await supabase.from("transactions").insert([{
        id: tx.id,
        user_id: user.id,
        amount: tx.amount,
        type: tx.type,
        parent_category: tx.parent_category,
        sub_category: tx.sub_category || null,
        notes: tx.notes || null,
        created_at: tx.created_at,
        is_edited: false,
      }]);
      if (error) {
        console.error("[Supabase insert error]", error);
        showToast(`Error: ${error.message}`);
        saveTx([tx, ...loadTx()]);
      } else {
        showToast("Transaction saved!");
      }
    } else {
      saveTx([tx, ...loadTx()]);
      showToast("Transaction saved (local only — not signed in).");
    }
  }, [user, showToast]);

  /* ── Delete ── */
  const deleteTx = useCallback(async (id: string) => {
    setTransactions((p) => p.filter((t) => t.id !== id));
    setDetailTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      showToast(error ? "Deleted locally — sync failed." : "Transaction deleted.");
    } else {
      saveTx(loadTx().filter((t) => t.id !== id));
      showToast("Transaction deleted.");
    }
  }, [user, showToast]);

  /* ── Update ── */
  const updateTx = useCallback(async (updated: Tx) => {
    setTransactions((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    setEditTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").update({
        amount: updated.amount,
        notes: updated.notes,
        is_edited: true,
        last_edited_at: updated.last_edited_at,
        original_amount: updated.original_amount,
        original_notes: updated.original_notes,
      }).eq("id", updated.id);
      showToast(error ? "Updated locally — sync failed." : "Changes saved.");
    } else {
      showToast("Changes saved.");
    }
  }, [user, showToast]);

  const navItems: { id: Tab; label: string; Icon: React.FC<IP> }[] = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "add", label: "Add", Icon: IcoPlus },
    { id: "analytics", label: "Analytics", Icon: IcoBarChart },
    { id: "search", label: "Search", Icon: IcoSearch },
    { id: "profile", label: "Profile", Icon: IcoUser },
    { id: "settings", label: "Settings", Icon: IcoSettings },
  ];

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name as string) || user?.email || "Guest";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const themeVars = { ...PALETTES[settings.theme], "--accent": settings.accent } as React.CSSProperties;

  return (
    <div style={{ ...themeVars, display: "flex", height: "100vh", background: BG, fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <nav className="montra-nav" style={{ width: 268, background: SURFACE, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logoUrl} alt="Montra" style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: TEXT, lineHeight: 1.1 }}>Montra</span>
              <span style={{ fontSize: 14, color: SUB }}>Web Edition</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "13px 16px", borderRadius: 12,
                  background: active ? aTint(14) : "transparent",
                  border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  color: active ? ACCENT : SUB,
                  fontWeight: active ? 700 : 500, fontSize: 16, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={20} color={active ? ACCENT : SUB} />
                <span className="montra-nav-label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* User + sign-out */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* User card */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: CARD }}>
            {avatar ? (
              <img src={avatar} alt={name} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: aTint(19), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT }}>{isGuest ? "G" : initials}</span>
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isGuest ? "Guest" : name.split(" ")[0]}</div>
              <div style={{ fontSize: 14, color: isGuest ? RED : ACCENT }}>{isGuest ? "Not signed in" : "Synced with Supabase"}</div>
            </div>
          </div>

          {/* Sign out / Sign in */}
          {isGuest ? (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: ACCENT, fontWeight: 600, gap: 8, justifyContent: "flex-start" }}>
              Sign in
            </button>
          ) : (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: SUB, fontWeight: 500, gap: 8, justifyContent: "flex-start" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = RED; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = SUB; }}
            >
              Sign out
            </button>
          )}

          <a href="#/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: SUB, fontSize: 16, fontWeight: 500 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = SUB; }}
          >
            <IcoArrowLeft size={14} />
            Back to site
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="montra-main" style={{ flex: 1, overflow: "auto", padding: "44px 56px 56px", position: "relative", zoom: TEXT_SCALE[settings.textSize] } as React.CSSProperties}>
        {loadingTx ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: SUB }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 16 }}>Loading your transactions…</span>
          </div>
        ) : (
          <div key={tab} className="montra-tab" style={{ maxWidth: 1360, margin: "0 auto", width: "100%" }}>
            {tab === "home" && <HomeTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} cal={homeCal} />}
            {tab === "add" && <AddTab onAdd={addTx} />}
            {tab === "analytics" && <AnalyticsTab txs={transactions} currency={settings.currency} />}
            {tab === "search" && <SearchTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} />}
            {tab === "profile" && (
              <ProfileTab
                txs={transactions} settings={settings} onSave={setSettings}
                user={user} isGuest={isGuest} onSignOut={onSignOut}
                onOpenSettings={() => setTab("settings")}
              />
            )}
            {tab === "settings" && (
              <SettingsTab
                settings={settings} onSave={setSettings}
                onClear={async () => {
                  if (user) {
                    await supabase.from("transactions").delete().eq("user_id", user.id);
                  }
                  setTransactions([]);
                  saveTx([]);
                  showToast("All data cleared.");
                }}
                txCount={transactions.length}
                user={user}
                onRefresh={fetchFromSupabase}
              />
            )}
          </div>
        )}
      </main>

      {detailTx && (
        <TxDetailModal
          tx={detailTx} currency={settings.currency}
          onClose={() => setDetailTx(null)}
          onDelete={deleteTx}
          onEdit={(tx) => { setEditTx(tx); setDetailTx(null); }}
        />
      )}
      {editTx && (
        <EditModal
          tx={editTx} currency={settings.currency}
          onClose={() => setEditTx(null)}
          onSave={updateTx}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function WebApp() {
  const [session, setSession] = useState<Session | null | "loading">("loading");
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (session && session !== "loading") {
      await supabase.auth.signOut();
      /* Remove the signed-in user's cached transactions so the next guest cannot see them. */
      saveTx([]);
    }
    setGuestMode(false);    setSession(null);
  };

  return (
    <>
      <style>{`
        .montra-root {
          --bg:#0d0d0d; --surface:#141414; --card:#1c1c1c; --card2:#222222;
          --border:#282828; --text:#f8f8f8; --sub:#b0b0b0; --accent:#27AE60;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .montra-home { flex-direction: column !important; }
          .montra-home-left { width: 100% !important; }
          .montra-main { padding: 32px 28px 48px !important; }
        }
        @media (max-width: 860px) {
          .montra-nav { width: 76px !important; }
          .montra-nav-label { display: none; }
          .montra-nav button { justify-content: center !important; padding: 14px 0 !important; }
          .montra-nav > div:first-child { display: none !important; }
          .montra-nav > div:last-child > div { display: none !important; }
          .montra-nav > div:last-child button { font-size: 12px !important; justify-content: center !important; padding: 10px 0 !important; }
          .montra-nav > div:last-child a { font-size: 0 !important; justify-content: center !important; }
          .montra-nav > div { padding-left: 8px !important; padding-right: 8px !important; }
          .montra-settings { flex-direction: column !important; gap: 20px !important; }
          .montra-settings-nav { width: 100% !important; }
        }
        @media (max-width: 560px) { .montra-main { padding: 24px 16px 40px !important; } }
        @keyframes donutIn { from { opacity: 0; transform: rotate(-25deg) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        .montra-opt { background: transparent; } .montra-opt:hover { background: var(--card2); }
        .montra-pop { animation: popIn 0.22s cubic-bezier(.2,.8,.2,1) both; max-height: 92vh; overflow-y: auto; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .montra-tab { animation: fadeIn 0.28s ease both; }
        button { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease; }
        button:not(:disabled):active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { .montra-tab, button { animation: none !important; transition: none !important; } }
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>

      <div className="montra-root">
        {session === "loading" ? (
          <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : session || guestMode ? (
          <AppShell
            user={(session && typeof session !== "string") ? session.user : null}
            onSignOut={handleSignOut}
          />
        ) : (
          <LoginScreen onGuest={() => setGuestMode(true)} />
        )}
      </div>
    </>
  );
}
