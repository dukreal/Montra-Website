import { ACCENT, CARD2, ON_ACCENT, SUB } from "@/web/theme";

/* Visual only: put it inside a <button role="switch" aria-checked={on}> that handles the click. */
export function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" style={{
      position: "relative", width: 52, height: 30, borderRadius: 15, flexShrink: 0, display: "block",
      background: on ? ACCENT : CARD2,
      boxShadow: on ? "none" : "inset 0 0 0 2px color-mix(in srgb, var(--sub) 70%, transparent)",
      transition: "background 0.15s",
    }}>
      <span style={{
        position: "absolute", top: 4, left: on ? 26 : 4, width: 22, height: 22, borderRadius: "50%",
        background: on ? ON_ACCENT : SUB, transition: "left 0.15s",
      }} />
    </span>
  );
}

/* Small filled dot used as the icon of the Transaction Dots row */
export function DotGlyph({ color }: { color: string }) {
  return <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: "50%", background: color, display: "block" }} />;
}