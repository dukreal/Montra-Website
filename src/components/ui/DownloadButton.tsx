import { Download } from '@/components/ui/icons'
import { SUB, PANEL2 } from '@/constants/theme'

// Store links do not exist yet, so this is a real disabled button.
export default function DownloadButton({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <button
      type="button"
      disabled
      title="Android and iOS apps are coming soon"
      className={`inline-flex items-center gap-2.5 rounded-full font-bold cursor-not-allowed ${
        lg ? "px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      }`}
      style={{ background: PANEL2, color: SUB, border: "1px dashed #3a3a3a" }}
    >
      <Download size={lg ? 20 : 17} color={SUB} strokeWidth={2.4} />
      Download App
      {lg && (
        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "#2a2a2a", color: SUB }}>
          Coming soon
        </span>
      )}
    </button>
  );
}