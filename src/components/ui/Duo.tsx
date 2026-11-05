import { INK, MUTE } from '@/constants/theme'

/* two-tone heading: strong word + muted word */
export default function Duo({ a, b, className = "" }: { a: string; b: string; className?: string }) {
  return (
    <h2 className={`font-black tracking-tight leading-[1.05] ${className}`}>
      <span style={{ color: INK }}>{a} </span>
      <span style={{ color: MUTE }}>{b}</span>
    </h2>
  );
}
