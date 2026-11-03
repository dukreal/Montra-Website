import { Download } from '@/components/ui/icons'
import { ACCENT } from '@/constants/theme'

export default function DownloadButton({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <button
      type="button"
      aria-disabled="true"
      title="Download link coming soon"
      onClick={(e) => e.preventDefault()}
      className={`group inline-flex items-center gap-2.5 rounded-full font-bold cursor-not-allowed transition active:scale-[0.98] ${
        lg ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      }`}
      style={{ background: ACCENT, color: "#03130a", boxShadow: `0 12px 34px ${ACCENT}44` }}
    >
      <Download size={lg ? 20 : 17} color="#03130a" strokeWidth={2.4} />
      Download App
    </button>
  );
}
