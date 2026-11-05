import { Monitor } from '@/components/ui/icons'
import { ACCENT_SOFT, INK, PANEL2, HAIR } from '@/constants/theme'

export default function WebVersionButton({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <a
      href="#/app"
      title="Open the web version"
      className={`inline-flex items-center gap-2.5 rounded-full font-bold cursor-pointer transition active:scale-[0.98] hover:brightness-125 ${
        lg ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      }`}
      style={{ background: PANEL2, color: INK, border: `1px solid ${HAIR}` }}
    >
      <Monitor size={lg ? 20 : 17} color={ACCENT_SOFT} strokeWidth={2.2} />
      Web Version
    </a>
  );
}
