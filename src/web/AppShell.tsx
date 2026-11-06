import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import logoUrl from "@/assets/images/logo.png";
import { loadSet, saveSet, saveTx, loadTx } from "@/web/storage";
import { btnReset } from "@/web/styles";
import { PALETTES, BG, SURFACE, BORDER, TEXT, SUB, aTint, ACCENT, CARD, RED, TEXT_SCALE } from "@/web/theme";
import type { Tx, Settings, Tab, TxType } from "@/web/types";
import { EditModal } from "@/web/components/EditModal";
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
