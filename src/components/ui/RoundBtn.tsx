import { ArrowRight } from '@/components/ui/icons'
import { INK, PANEL, HAIR } from '@/constants/theme'

export default function RoundBtn({ dir, onClick, disabled }: { dir: "left" | "right"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "left" ? "Previous" : "Next"}
      className="grid place-items-center rounded-full border transition hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
      style={{ width: 46, height: 46, background: PANEL, borderColor: HAIR }}
    >
      <span style={{ display: "inline-flex", transform: dir === "left" ? "rotate(180deg)" : "none" }}>
        <ArrowRight size={19} color={INK} />
      </span>
    </button>
  );
}
