import { useState, useEffect, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import logoUrl from "@/assets/images/logo.png";
import { loadSet, saveSet, saveTx, loadTx } from "@/web/storage";
import { btnReset, outlineBtn } from "@/web/styles";
import { PALETTES, BG, SURFACE, BORDER, TEXT, SUB, aTint, ACCENT, ACCENT_TEXT, CARD, TEXT_SCALE, accentTextFor, RED_TEXT, ON_ACCENT } from "@/web/theme";
import type { Tx, Settings, Tab, TxType } from "@/web/types";
import { EditModal } from "@/web/components/EditModal";
import { LoadErrorModal } from "@/web/components/LoadErrorModal";
import { Toast } from "@/web/components/Toast";
import { TxDetailModal } from "@/web/components/TxDetailModal";
import { useHomeCalendar } from "@/web/hooks";
import { IcoHome, IcoPlus, IcoBarChart, IcoSearch, IcoUser, IcoSettings, IcoArrowLeft } from "@/web/icons";
import type { IP } from "@/web/icons";
import { AddTab } from "@/web/tabs/AddTab";
import { AnalyticsTab } from "@/web/tabs/AnalyticsTab";
import { HomeTab } from "@/web/tabs/HomeTab";
import { ProfileTab } from "@/web/tabs/ProfileTab";
import { SearchTab } from "@/web/tabs/SearchTab";
import { SettingsTab } from "@/web/tabs/SettingsTab";

/* ─── AppShell (authenticated) ───────────────────────────────────────────── */
export function AppShell({ user, onSignOut }: { user: User | null; onSignOut: () => void }) {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [settings, setSettings] = useState<Settings>(loadSet);
  const [tab, setTab] = useState<Tab>("home");
  /* Where the phone Settings back arrow returns to (the tab Settings was opened from) */
  const [backTab, setBackTab] = useState<Tab>("profile");
  const openSettings = () => { setBackTab(tab); setTab("settings"); };
  const homeCal = useHomeCalendar();
  const [detailTx, setDetailTx] = useState<Tx | null>(null);
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [toast, setToast] = useState<{ msg: string; error: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingTx, setLoadingTx] = useState(!!user);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLoadError, setShowLoadError] = useState(false);

  const isGuest = !user;
  /* Stable id: the `user` object is a new copy each time the tab regains focus */
  const userId = user?.id;

  /* Persist settings */
  useEffect(() => { saveSet(settings); }, [settings]);

  /* Show toast helper */
  const showToast = useCallback((msg: string, error = false) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, error });
    toastTimer.current = setTimeout(() => setToast(null), error ? 5000 : 2500);
  }, []);

  /* ── Fetch transactions from Supabase (authenticated users) ── */
  const fetchFromSupabase = useCallback(async () => {
    if (!userId) return;
    setLoadingTx(true);
    setLoadError(null);
    setShowLoadError(false);
    let failure: string | null = null;
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error || !data) {
        failure = error?.message || "Unknown error";
      } else {
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
      }
    } catch (e) {
      failure = e instanceof Error ? e.message : "Unknown error";
    }
    if (failure) {
      /* No silent fallback to old cached data: tell the user and let them retry */
      console.error("[Supabase fetch error]", failure);
      setLoadError(failure);
      setShowLoadError(true);
    }
    setLoadingTx(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFromSupabase();
    } else {
      setTransactions(loadTx());
    }
  }, [userId, fetchFromSupabase]);

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
        /* Not saved: take the row back out so the list never shows something that will vanish on reload */
        setTransactions((p) => p.filter((t) => t.id !== tx.id));
        showToast("Couldn't save this transaction, so it was not added. Check your connection and try again.", true);
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
    const index = transactions.findIndex((t) => t.id === id);
    const removed = transactions[index];
    setTransactions((p) => p.filter((t) => t.id !== id));
    setDetailTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) {
        console.error("[Supabase delete error]", error);
        /* Not deleted on the server: put the row back where it was */
        if (removed) setTransactions((p) => (p.some((t) => t.id === id) ? p : [...p.slice(0, index), removed, ...p.slice(index)]));
        showToast("Couldn't delete this transaction. It has been restored.", true);
      } else {
        showToast("Transaction deleted.");
      }
    } else {
      saveTx(loadTx().filter((t) => t.id !== id));
      showToast("Transaction deleted.");
    }
  }, [user, showToast, transactions]);

  /* ── Update ── */
  const updateTx = useCallback(async (updated: Tx) => {
    const previous = transactions.find((t) => t.id === updated.id);
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
      if (error) {
        console.error("[Supabase update error]", error);
        /* Not saved on the server: go back to the previous values */
        if (previous) setTransactions((p) => p.map((t) => (t.id === updated.id ? previous : t)));
        showToast("Couldn't save your changes. The previous values were restored.", true);
      } else {
        showToast("Changes saved.");
      }
    } else {
      showToast("Changes saved.");
    }
  }, [user, showToast, transactions]);

  /* ── Clear all ── */
  const clearAll = useCallback(async () => {
    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("user_id", user.id);
      if (error) {
        console.error("[Supabase clear error]", error);
        showToast("Couldn't delete your data, so nothing was changed. Check your connection and try again.", true);
        return;
      }
    }
    setTransactions([]);
    saveTx([]);
    showToast("All data cleared.");
  }, [user, showToast]);

  const navItems: { id: Tab; label: string; Icon: React.FC<IP> }[] = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "add", label: "Add", Icon: IcoPlus },
    { id: "analytics", label: "Analytics", Icon: IcoBarChart },
    { id: "search", label: "Search", Icon: IcoSearch },
    { id: "profile", label: "Profile", Icon: IcoUser },
    { id: "settings", label: "Settings", Icon: IcoSettings },
  ];

  /* Bottom tab bar button (phones). The tab Settings was opened from stays highlighted. */
  const barTab = (id: Tab, label: string, Icon: React.FC<IP>) => {
    const active = tab === id || (tab === "settings" && id === backTab);
    return (
      <button key={id} type="button" className="montra-tabbar-btn" onClick={() => setTab(id)} aria-current={active ? "page" : undefined}>
        <Icon size={24} color={active ? ACCENT_TEXT : SUB} />
        <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, lineHeight: 1, color: active ? ACCENT_TEXT : SUB }}>{label}</span>
      </button>
    );
  };

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name as string) || user?.email || "Guest";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const themeVars = { ...PALETTES[settings.theme], "--accent": settings.accent, "--accent-text": accentTextFor(settings.accent, settings.theme) } as React.CSSProperties;

  return (
    <div className="montra-shell" style={{ ...themeVars, display: "flex", background: BG, fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
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
                  color: active ? ACCENT_TEXT : SUB,
                  fontWeight: active ? 700 : 500, fontSize: 16, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={20} color={active ? ACCENT_TEXT : SUB} />
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
                <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT_TEXT }}>{isGuest ? "G" : initials}</span>
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isGuest ? "Guest" : name.split(" ")[0]}</div>
              <div style={{ fontSize: 14, color: isGuest ? RED_TEXT : ACCENT_TEXT }}>{isGuest ? "Not signed in" : "Synced to your account"}</div>
            </div>
          </div>

          {/* Sign out / Sign in */}
          {isGuest ? (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: ACCENT_TEXT, fontWeight: 600, gap: 8, justifyContent: "flex-start" }}>
              Sign in
            </button>
          ) : (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: SUB, fontWeight: 500, gap: 8, justifyContent: "flex-start" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = RED_TEXT; }}
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
             {loadError && !showLoadError && (
              <div role="alert" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20, padding: "12px 16px", borderRadius: 14, background: "#FF6B6B14", border: "1px solid #FF6B6B40" }}>
                <span style={{ flex: 1, minWidth: 200, color: TEXT, fontSize: 16, lineHeight: 1.4 }}>Your transactions couldn't be loaded, so the lists below may be empty.</span>
                <button onClick={fetchFromSupabase} style={{ ...outlineBtn, flex: "none", padding: "8px 18px" }}>Retry</button>
              </div>
            )}
            {tab === "home" && <HomeTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} cal={homeCal} onOpenSettings={openSettings} />}
            {tab === "add" && <AddTab onAdd={addTx} />}
            {tab === "analytics" && <AnalyticsTab txs={transactions} currency={settings.currency} />}
            {tab === "search" && <SearchTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} />}
            {tab === "profile" && (
              <ProfileTab
                txs={transactions} settings={settings} onSave={setSettings}
                user={user} isGuest={isGuest} onSignOut={onSignOut}
                onOpenSettings={openSettings}
              />
            )}
            {tab === "settings" && (
              <SettingsTab
                settings={settings} onSave={setSettings}
                onClear={clearAll}
                txCount={transactions.length}
                user={user}
                onRefresh={fetchFromSupabase}
                onBack={() => setTab(backTab)}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom tab bar: shown instead of the sidebar under 860px */}
      <nav className="montra-tabbar" aria-label="Main navigation" style={{ background: SURFACE, borderTop: `1px solid ${BORDER}` }}>
        {barTab("home", "Home", IcoHome)}
        {barTab("search", "Search", IcoSearch)}
        <button type="button" className="montra-tabbar-add" aria-label="Add transaction" aria-current={tab === "add" ? "page" : undefined}
          onClick={() => setTab("add")} style={{ background: ACCENT }}>
          <IcoPlus size={30} color={ON_ACCENT} />
        </button>
        {barTab("analytics", "Analytics", IcoBarChart)}
        {barTab("profile", "Profile", IcoUser)}
      </nav>

      {showLoadError && (
        <LoadErrorModal detail={loadError} onRetry={fetchFromSupabase} onClose={() => setShowLoadError(false)} />
      )}
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
      {toast && <Toast message={toast.msg} error={toast.error} />}
    </div>
  );
}
