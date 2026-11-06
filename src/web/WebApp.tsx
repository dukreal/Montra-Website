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
