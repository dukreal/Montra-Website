import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import logoUrl from "@/assets/images/logo.png";
import { BG, CARD, BORDER, TEXT, SUB, RED } from "@/web/theme";
import { IcoArrowLeft } from "@/web/icons";

/* ─── LoginScreen ────────────────────────────────────────────────────────── */
export function LoginScreen({ onGuest }: { onGuest: () => void }) {
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
