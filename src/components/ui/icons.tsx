/* ─────────────────────────────────────────────────────────────
   Inline SVG icons — no external packages. Each is a tiny
   stroke icon (24×24) accepting size / color / strokeWidth / fill.
   ───────────────────────────────────────────────────────────── */
export type IconProps = { size?: number; color?: string; strokeWidth?: number; fill?: string };

const makeIcon =
  (children: React.ReactNode) =>
  ({ size = 24, color = "currentColor", strokeWidth = 2, fill = "none" }: IconProps) =>
    (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    );


export const Wallet = makeIcon(
  <>
    <path d="M3 7a2 2 0 0 1 2-2h11v3" />
    <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z" />
    <circle cx="16.5" cy="13.5" r="1" />
  </>
);

export const Search = makeIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>
);

export const BarChart3 = makeIcon(
  <>
    <path d="M3 3v18h18" />
    <path d="M8 17v-5M13 17V8M18 17v-3" />
  </>
);

export const User = makeIcon(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </>
);

export const Plus = makeIcon(<path d="M12 5v14M5 12h14" />);

export const SettingsIcon = makeIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </>
);

export const Share2 = makeIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
  </>
);

export const ChevronDown = makeIcon(<path d="m6 9 6 6 6-6" />);

export const ArrowDownCircle = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12l4 4 4-4" />
  </>
);

export const ArrowUpCircle = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16V8M8 12l4-4 4 4" />
  </>
);

export const HomeIcon = makeIcon(
  <>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </>
);

export const Utensils = makeIcon(
  <>
    <path d="M4 3v7a2 2 0 0 0 4 0V3M6 10v11" />
    <path d="M15 3c-1.5 1-2 3-2 5s0 3 2 3v10" />
  </>
);

export const Bus = makeIcon(
  <>
    <rect x="4" y="4" width="16" height="13" rx="2" />
    <path d="M4 11h16" />
    <circle cx="8" cy="18" r="1.3" />
    <circle cx="16" cy="18" r="1.3" />
  </>
);

export const ShoppingCart = makeIcon(
  <>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M2 3h3l2.5 12h10l2-8H6" />
  </>
);

export const Gamepad2 = makeIcon(
  <>
    <rect x="2" y="7" width="20" height="11" rx="4" />
    <path d="M7 11v4M5 13h4" />
    <circle cx="16" cy="12" r="1" />
    <circle cx="18" cy="15" r="1" />
  </>
);

export const HeartPulse = makeIcon(
  <>
    <path d="M12 20S3 14 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 14 12 20 12 20z" />
    <path d="M4 11h3l1.5-3 2 5 1.5-2h4" />
  </>
);

export const GraduationCap = makeIcon(
  <>
    <path d="M12 4 2 9l10 5 10-5-10-5z" />
    <path d="M6 11v4c0 1.5 3 3 6 3s6-1.5 6-3v-4" />
  </>
);

export const CreditCard = makeIcon(
  <>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </>
);

export const Users = makeIcon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
    <path d="M16 5.5a3.5 3.5 0 0 1 0 6.5M17 15c2.5.5 4 2.2 4 5" />
  </>
);

export const Plane = makeIcon(
  <>
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
  </>
);

export const Wifi = makeIcon(
  <>
    <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </>
);

export const AlertTriangle = makeIcon(
  <>
    <path d="M12 3 2 20h20L12 3z" />
    <path d="M12 9v5M12 17h.01" />
  </>
);

export const MapPin = makeIcon(
  <>
    <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </>
);

export const Navigation = makeIcon(<path d="M3 11 22 2l-9 19-2-8-8-2z" />);

export const MapIcon = makeIcon(
  <>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </>
);

export const Camera = makeIcon(
  <>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </>
);

export const Receipt = makeIcon(
  <>
    <path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </>
);

export const Moon = makeIcon(<path d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8z" />);

export const Sun = makeIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </>
);

export const Palette = makeIcon(
  <>
    <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h2a3 3 0 0 0 3-3 8 8 0 0 0-9-9z" />
    <circle cx="7.5" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="10" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
  </>
);

export const Type = makeIcon(<path d="M4 6V4h16v2M12 4v16M9 20h6" />);

export const CalendarDays = makeIcon(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
    <circle cx="8" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
  </>
);

export const Circle = makeIcon(<circle cx="12" cy="12" r="9" />);

export const Check = makeIcon(<path d="m5 12 5 5 9-11" />);

export const Download = makeIcon(
  <>
    <path d="M12 3v12M7 11l5 4 5-4" />
    <path d="M4 20h16" />
  </>
);

export const Star = makeIcon(<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z" />);

export const ShieldCheck = makeIcon(
  <>
    <path d="M12 3 5 6v6c0 4 3 6.6 7 8 4-1.4 7-4 7-8V6z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const Zap = makeIcon(<path d="M13 2 4 14h7l-1 8 9-12h-7z" />);

export const Gift = makeIcon(
  <>
    <rect x="3" y="8" width="18" height="13" rx="1" />
    <path d="M3 12h18M12 8v13" />
    <path d="M7.5 8a2.5 2.5 0 1 1 0-5C10 3 12 5 12 8M16.5 8a2.5 2.5 0 1 0 0-5C14 3 12 5 12 8" />
  </>
);

export const Globe = makeIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18" />
  </>
);

export const ArrowRight = makeIcon(<path d="M5 12h14M13 6l6 6-6 6" />);

export const Monitor = makeIcon(
  <>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </>
);

export const TrendingUp = makeIcon(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M17 7h4v4" />
  </>
);


/* ─────────────────────── HOW IT WORKS ─────────────────────── */
export const STEPS = [
  { n: "STEP 1", title: "Add a transaction", body: "Tap the + button, choose expense or income, and enter the amount in seconds." },
  { n: "STEP 2", title: "Tag it with context", body: "Pick a category and sub-category, drop a location, and attach a receipt photo." },
  { n: "STEP 3", title: "Watch it add up", body: "Montra rolls everything into daily balances and monthly analytics automatically." },
];


/* ─────────────────────── TESTIMONIALS ─────────────────────── */
export const REVIEWS = [
  { stars: 5, quote: "Montra made budgeting effortless. Logging a jeepney fare takes two taps and the monthly view is gorgeous.", name: "Maya Collins", role: "Financial Consultant" },
  { stars: 5, quote: "Fast, clean, and genuinely useful. The location tagging is a small thing that I now can't live without.", name: "Daniel Cruz", role: "Small Business Owner" },
  { stars: 5, quote: "I've tried every tracker out there. This is the first one I've actually kept using past a week.", name: "Lara Whitmore", role: "Freelance Designer" },
  { stars: 5, quote: "The analytics breakdown finally showed me where my salary was quietly disappearing each month.", name: "Paolo Reyes", role: "Software Engineer" },
  { stars: 5, quote: "Works perfectly offline on my commute. Everything syncs the moment I'm back online.", name: "Bea Santos", role: "Nurse" },
];
