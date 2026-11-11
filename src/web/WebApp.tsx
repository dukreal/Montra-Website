import { useState, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { saveTx } from "@/web/storage";
import { BG, BORDER, ACCENT } from "@/web/theme";
import { AppShell } from "@/web/AppShell";
import { LoginScreen } from "@/web/LoginScreen";

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
        .montra-shell { height: 100vh; height: 100dvh; }
        .montra-tabbar { display: none; }
        .montra-phone-home { display: none; }
        .montra-phone-only { display: none; }
        .montra-cat-head { display: none; }
        .montra-chips { display: contents; }
        .montra-daystrip::-webkit-scrollbar { display: none; }
        @media (max-width: 860px) {
          .montra-nav { display: none !important; }
          .montra-tabbar {
            position: fixed; left: 0; right: 0; bottom: 0; z-index: 900;
            display: flex; align-items: flex-end;
            height: calc(68px + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom);
          }
          .montra-tabbar-btn {
            flex: 1 1 0; min-width: 0; height: 68px; padding: 0;
            display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
            background: none; border: none; cursor: pointer;
          }
          .montra-tabbar-add {
            flex: 0 0 64px; width: 64px; height: 64px; margin-bottom: 18px; padding: 0;
            border: none; border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 24px rgba(0,0,0,0.45);
          }
          .montra-toast { left: 16px !important; right: 16px !important; bottom: calc(100px + env(safe-area-inset-bottom)) !important; max-width: none !important; }
          .montra-settings { flex-direction: column !important; gap: 20px !important; }
          .montra-home { gap: 16px !important; }
          .montra-home-left { display: none !important; }
          .montra-phone-home { display: block; }
          .montra-desk-only { display: none !important; }
          .montra-phone-only { display: inline; }
          .montra-add { display: flex; flex-direction: column; }
          .montra-add-title { text-align: center; font-size: 24px !important; margin-bottom: 18px !important; }
          .montra-amtcard { order: 1; margin-bottom: 20px; background: var(--card); border: 1px solid var(--border); border-radius: 20px; }
          .montra-typebar { padding: 0 !important; margin-bottom: 0 !important; background: transparent !important; border: none !important; border-bottom: 1px solid var(--border) !important; border-radius: 0 !important; }
          .montra-typebar button { padding: 14px !important; border: none !important; border-radius: 0 !important; }
          .montra-typebar button:first-child { border-radius: 19px 0 0 0 !important; }
          .montra-typebar button:last-child { border-radius: 0 19px 0 0 !important; }
          .montra-amount { margin-bottom: 0 !important; }
          .montra-amount label { display: none !important; }
          .montra-amount input { background: transparent !important; border: none !important; border-radius: 0 0 19px 19px !important; }
          .montra-add-notes { order: 2; }
          .montra-add-cat { order: 3; }
          .montra-add-sub { order: 4; }
          .montra-add-date { order: 5; }
          .montra-add-foot { order: 6; position: sticky; bottom: 0; }
          .montra-cat-card { background: var(--card); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; }
          .montra-cat-head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border); }
          .montra-cat-card .montra-cats { padding: 12px; }
          .montra-search-title { display: none; }
          .montra-chips { display: flex; flex: 0 0 100%; order: 1; gap: 8px; overflow-x: auto; padding: 4px; margin: -4px; scrollbar-width: none; }
          .montra-chips::-webkit-scrollbar { display: none; }
          .montra-chips > button { flex: 0 0 auto; min-height: 44px; }
          .montra-datewrap { order: 2; }
          .montra-datewrap > div:first-child { min-height: 44px; }
          .montra-search-tools { display: contents !important; }
          .montra-sortwrap { order: 3; flex: 1; min-width: 0; }
          .montra-sort-btn { min-width: 0 !important; width: 100%; height: 44px !important; }
          .montra-viewtoggle { display: none !important; }
          .montra-count { order: 4; flex: 0 0 100%; }
          .montra-settings-nav { width: 100% !important; }
        }
        @media (max-width: 720px) { .montra-cats { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 560px) {
          .montra-main { padding: 24px 16px 40px !important; }
          .montra-cats { grid-template-columns: repeat(2, 1fr) !important; }
          .montra-period { font-size: 15px !important; }
          .montra-sum { grid-template-columns: 1fr !important; }
          .montra-sum > div { display: flex !important; justify-content: space-between !important; align-items: center !important; text-align: left !important; border: none !important; padding: 8px 4px !important; }
          .montra-sum > div + div { border-top: 1px solid var(--border) !important; }
          .montra-sum > div > div { margin: 0 !important; }
          .montra-segname { white-space: normal !important; overflow: visible !important; }
        }
        @media (max-width: 400px) { .montra-period { font-size: 13px !important; gap: 4px !important; } }
        @media (max-width: 860px) { .montra-main { padding-bottom: calc(112px + env(safe-area-inset-bottom)) !important; } }
        @keyframes donutIn { from { opacity: 0; transform: rotate(-25deg) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        .montra-opt { background: transparent; } .montra-opt:hover { background: var(--card2); }
        .montra-pop { animation: popIn 0.22s cubic-bezier(.2,.8,.2,1) both; max-height: 92vh; overflow-y: auto; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .montra-tab { animation: fadeIn 0.28s ease backwards; }
        button { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease; }
        button:not(:disabled):active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { .montra-tab, button { animation: none !important; transition: none !important; } }
        * { box-sizing: border-box; }
        .montra-root :focus-visible { outline: 2px solid var(--accent-text, var(--accent)); outline-offset: 2px; }
        .montra-main { scrollbar-gutter: stable both-edges; }
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
