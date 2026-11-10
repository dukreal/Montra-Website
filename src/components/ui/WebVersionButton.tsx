import { Monitor } from '@/components/ui/icons'
import { ACCENT } from '@/constants/theme'

export default function WebVersionButton({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <a
      href="#/app"
      title="Open the web version"
      className={`inline-flex items-center gap-2.5 rounded-full font-bold cursor-pointer transition active:scale-[0.98] hover:brightness-110 ${
        lg ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      }`}
      style={{ background: ACCENT, color: "#03130a", boxShadow: `0 12px 34px ${ACCENT}44` }}
    >
      <Monitor size={lg ? 20 : 17} color="#03130a" strokeWidth={2.2} />
      Web Version
    </a>
  );
}