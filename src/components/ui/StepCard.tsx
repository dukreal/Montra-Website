import { ACCENT, INK, SUB, PANEL, HAIR } from '@/constants/theme'

export default function StepCard({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border p-6" style={{ background: PANEL, borderColor: HAIR }}>
      <span className="text-[11px] font-bold tracking-[0.18em]" style={{ color: ACCENT }}>{n}</span>
      <p className="mt-2 text-lg font-bold" style={{ color: INK }}>{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: SUB }}>{body}</p>
    </div>
  );
}
