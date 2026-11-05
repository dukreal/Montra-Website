import IconTile from '@/components/ui/IconTile'
import { INK, SUB, PANEL, HAIR } from '@/constants/theme'

export default function BenefitCard({ icon, tint, title, body }: { icon: React.ReactNode; tint: string; title: string; body: string }) {
  return (
    <div className="h-full rounded-3xl border p-7" style={{ background: PANEL, borderColor: HAIR }}>
      <IconTile icon={icon} tint={tint} />
      <h3 className="mt-5 text-xl font-bold" style={{ color: INK }}>{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed" style={{ color: SUB }}>{body}</p>
    </div>
  );
}
