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
      className={`inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-bold cursor-not-allowed ${
        lg ? "w-full max-w-xs sm:w-auto sm:max-w-none px-8 py-4 text-base" : "px-5 py-2.5 text-sm"
      }`}
      style={{ background: PANEL2, color: SUB, border: "1px dashed #3a3a3a" }}
    >
      <Download size={lg ? 20 : 17} color={SUB} strokeWidth={2.4} />
      {lg ? (
        <>
          <span className="sm:hidden">App coming soon</span>
          <span className="hidden sm:inline">Download App</span>
          <span className="hidden sm:inline rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "#2a2a2a", color: SUB }}>
            Coming soon
          </span>
        </>
      ) : (
        "Download App"
      )}
    </button>
  );
}