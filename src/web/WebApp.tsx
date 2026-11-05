import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import logoUrl from "@/assets/images/logo.png";
import {
  IoHome, IoRestaurant, IoBus, IoCart, IoGameController, IoMedical,
  IoSchool, IoCard, IoPeople, IoAirplane, IoWifi, IoWarning,
  IoBriefcase, IoLaptop, IoStorefront, IoTrendingUp, IoCash,
  IoArrowDownCircle, IoArrowUpCircle,
} from "react-icons/io5";

/* ─── Ionicons map ───────────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  home: IoHome,
  restaurant: IoRestaurant,
  bus: IoBus,
  cart: IoCart,
  "game-controller": IoGameController,
  medical: IoMedical,
  school: IoSchool,
  card: IoCard,
  people: IoPeople,
  airplane: IoAirplane,
  wifi: IoWifi,
  warning: IoWarning,
  briefcase: IoBriefcase,
  laptop: IoLaptop,
  storefront: IoStorefront,
  "trending-up": IoTrendingUp,
  cash: IoCash,
};

function CatIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} />;
}

/* ─── Tokens ─────────────────────────────────────────────────────────────── */
/* Theme tokens resolve to CSS variables so the Settings screen can retint the
   whole app live (dark/light mode + accent color). RED / GREEN are semantic and
   stay fixed. Accent tints use color-mix since the accent is a runtime variable. */
const BG = "var(--bg)";
const SURFACE = "var(--surface)";
const CARD = "var(--card)";
const CARD2 = "var(--card2)";
const BORDER = "var(--border)";
const TEXT = "var(--text)";
const SUB = "var(--sub)";
const ACCENT = "var(--accent)";
const RED = "#FF6B6B";
const GREEN = "#2ECC71";
const aTint = (pct: number) => `color-mix(in srgb, var(--accent) ${pct}%, transparent)`;

/* Accent themes — mirrors the mobile Settings "Color Theme" swatches */
const ACCENT_THEMES = [
  { key: "#27AE60", name: "Green" },
  { key: "#3B7DD8", name: "Blue" },
  { key: "#E67E22", name: "Orange" },
  { key: "#E05282", name: "Rose" },
];
const PALETTES: Record<"dark" | "light", Record<string, string>> = {
  dark: { "--bg": "#0d0d0d", "--surface": "#141414", "--card": "#1c1c1c", "--card2": "#222222", "--border": "#282828", "--text": "#f8f8f8", "--sub": "#b0b0b0" },
  light: { "--bg": "#f3f5f9", "--surface": "#ffffff", "--card": "#ffffff", "--card2": "#eceff5", "--border": "#d3d8e2", "--text": "#10141c", "--sub": "#4a5365" },
};
const TEXT_SCALE: Record<string, number> = { small: 0.92, medium: 1, large: 1.1 };

/* ─── Types ──────────────────────────────────────────────────────────────── */
type TxType = "expense" | "income";
interface Tx {
  id: string;
  amount: number;
  type: TxType;
  parent_category: string;
  sub_category: string;
  notes: string;
  created_at: string;
  is_edited?: boolean;
  last_edited_at?: string | null;
  original_amount?: number | null;
  original_notes?: string | null;
}
type ThemeMode = "dark" | "light";
type TextSize = "small" | "medium" | "large";
type Language = "english" | "filipino";
interface Settings {
  currency: string;
  theme: ThemeMode;
  accent: string;
  textSize: TextSize;
  language: Language;
}

/* ─── Storage ─────────────────────────────────────────────────────────────── */
const TX_KEY = "montra-transactions";
const SET_KEY = "montra-settings";
const loadTx = (): Tx[] => {
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveTx = (t: Tx[]) => localStorage.setItem(TX_KEY, JSON.stringify(t));
const SET_DEFAULTS: Settings = { currency: "₱", theme: "dark", accent: "#27AE60", textSize: "medium", language: "english" };
const loadSet = (): Settings => {
  try {
    return { ...SET_DEFAULTS, ...JSON.parse(localStorage.getItem(SET_KEY) || "{}") };
  } catch {
    return { ...SET_DEFAULTS };
  }
};
const saveSet = (s: Settings) => localStorage.setItem(SET_KEY, JSON.stringify(s));

/* ─── Categories ──────────────────────────────────────────────────────────── */
const CATS = {
  expense: [
    { name: "Housing & Living", color: "#4a90e2", icon: "home", subs: ["Rent", "Electricity", "Water", "Gas", "Internet", "House Maintenance"] },
    { name: "Food & Dining", color: "#ff9500", icon: "restaurant", subs: ["Groceries", "Dining Out", "Fast Food", "Food Delivery", "Drinks / Snacks"] },
    { name: "Transportation", color: "#5856d6", icon: "bus", subs: ["Fuel / Gas", "Public Transport", "Ride-hailing", "Parking Fees", "Car Maintenance", "Car Insurance"] },
    { name: "Shopping & Personal", color: "#ff2d55", icon: "cart", subs: ["Clothes", "Online Shopping", "Electronics", "Personal Care", "Accessories"] },
    { name: "Entertainment & Lifestyle", color: "#af52de", icon: "game-controller", subs: ["Movies", "Games", "Hobbies", "Events"] },
    { name: "Health & Wellness", color: "#34c759", icon: "medical", subs: ["Medicine", "Hospital Bills", "Health Insurance", "Gym / Fitness"] },
    { name: "Education", color: "#007aff", icon: "school", subs: ["Tuition Fees", "School Supplies", "Books", "Online Courses", "Misc School Fee"] },
    { name: "Financial & Obligations", color: "#ff3b30", icon: "card", subs: ["Loan Payments", "Credit Card Bills", "Taxes", "Insurance", "Savings"] },
    { name: "Family & Social", color: "#ffcc00", icon: "people", subs: ["Allowance", "Gifts", "Social", "Childcare"] },
    { name: "Travel & Leisure", color: "#5ac8fa", icon: "airplane", subs: ["Flights", "Hotel", "Tours", "Travel Food & Transport"] },
    { name: "Utilities & Subscriptions", color: "#8e8e93", icon: "wifi", subs: ["Mobile Load", "Netflix / Spotify", "Cloud Storage", "Software Subscriptions"] },
    { name: "Emergency & Misc", color: "#ff6b6b", icon: "warning", subs: ["Emergency Expenses", "Unexpected Repairs", "Miscellaneous", "Replacement Costs"] },
  ],
  income: [
    { name: "Employment Income", color: "#4cd964", icon: "briefcase", subs: ["Salary / Wages", "Overtime Pay", "Bonuses", "Commissions"] },
    { name: "Freelance & Side Hustle", color: "#5ac8fa", icon: "laptop", subs: ["Freelance Work", "Side Jobs / Gigs", "Online Selling", "Content Creation"] },
    { name: "Business Income", color: "#ff9500", icon: "storefront", subs: ["Business Profits", "Sales Revenue", "Service Income"] },
    { name: "Investments & Passive Income", color: "#34c759", icon: "trending-up", subs: ["Dividends", "Interest", "Rental Income", "Crypto / Investment Gains"] },
    { name: "Allowance & Support", color: "#af52de", icon: "people", subs: ["Allowance", "Family Support", "Remittances"] },
    { name: "Other Income", color: "#ffcc00", icon: "cash", subs: ["Gifts", "Refunds", "Scholarships / Grants", "Cashback / Rewards"] },
  ],
};

/* ─── Date Helpers ────────────────────────────────────────────────────────── */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const M3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmtDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${M3[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

function fmtTime(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function fmtAmt(n: number, cur: string) {
  return `${cur}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getCat(type: TxType, name: string) {
  return CATS[type].find((c) => c.name === name);
}

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
type IP = { size?: number; color?: string };
const ico = (path: React.ReactNode) =>
  ({ size = 20, color = "currentColor" }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
const IcoHome = ico(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>);
const IcoPlus = ico(<path d="M12 5v14M5 12h14"/>);
const IcoBarChart = ico(<><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-3"/></>);
const IcoSearch = ico(<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>);
const IcoSettings = ico(<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>);
const IcoX = ico(<><path d="M18 6 6 18M6 6l12 12"/></>);
const IcoChevLeft = ico(<path d="m15 18-6-6 6-6"/>);
const IcoChevRight = ico(<path d="m9 18 6-6-6-6"/>);
const IcoArrowLeft = ico(<><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>);
const IcoCheck = ico(<polyline points="20,6 9,17 4,12"/>);
const IcoTag = ico(<><path d="M20.6 13.4 12 22l-9-9V3h10z"/><circle cx="7.5" cy="7.5" r="1.2"/></>);
const IcoDoc = ico(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></>);
const IcoCash = ico(<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></>);
const IcoFlash = ico(<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>);
const IcoUser = ico(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>);
const IcoTrendUp = ico(<><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></>);
const IcoTrendDown = ico(<><path d="M3 7l6 6 4-4 8 8"/><path d="M17 17h4v-4"/></>);
const IcoWallet = ico(<><path d="M3 7a2 2 0 0 1 2-2h11v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="13.5" r="1"/></>);
const IcoHelp = ico(<><circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.6 1c0 2-3 2.5-3 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>);
const IcoLogout = ico(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>);
const IcoChevR = ico(<path d="m9 18 6-6-6-6"/>);
const IcoMoon = ico(<path d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8z"/>);
const IcoSun = ico(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>);
const IcoPalette = ico(<><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h2a3 3 0 0 0 3-3 8 8 0 0 0-9-9z"/></>);
const IcoText = ico(<path d="M4 6V4h16v2M12 4v16M9 20h6"/>);
const IcoCalendar = ico(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>);
const IcoChevDown = ico(<path d="m6 9 6 6 6-6"/>);
const IcoSort = ico(<><path d="M7 20V4M3 8l4-4 4 4"/><path d="M17 4v16M13 16l4 4 4-4"/></>);
const IcoList = ico(<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>);
const IcoGrid = ico(<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>);
const IcoGlobe = ico(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/></>);

/* ─── DonutChart ─────────────────────────────────────────────────────────── */
interface Segment { value: number; color: string; name: string; icon: string }

function DonutChart({ segments, size = 220, hole = 110, currency, activeName, onSelect }: {
  segments: Segment[];
  size?: number;
  hole?: number;
  currency: string;
  activeName?: string | null;
  onSelect?: (seg: Segment | null) => void;
}) {
  const [hov, setHov] = useState<number | null>(null);
  const total = segments.reduce((s, d) => s + d.value, 0);
  const pad = 10; // room for the pop-out offset
  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - pad;
  const ri = hole / 2;

  if (total === 0) {
    return (
      <div style={{ width: size, height: size, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <span style={{ color: SUB, fontSize: 16 }}>No data yet</span>
      </div>
    );
  }

  const gap = segments.length > 1 ? 2.2 : 0; // degrees between slices
  let ang = -90;
  const arcs = segments.map((seg, i) => {
    const sweep = (seg.value / total) * 360;
    const start = ang;
    ang += sweep;
    const g = Math.min(gap, sweep * 0.4) / 2;
    return { ...seg, start: start + g, end: ang - g, mid: (start + ang) / 2, i };
  });

  const toXY = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });
  const arcPath = (start: number, end: number) => {
    // A full circle needs two half arcs to render
    if (end - start >= 359.9) {
      const a1 = toXY(start, R), a2 = toXY(start + 180, R), b1 = toXY(start + 180, ri), b2 = toXY(start, ri);
      return `M ${a1.x} ${a1.y} A ${R} ${R} 0 1 1 ${a2.x} ${a2.y} A ${R} ${R} 0 1 1 ${a1.x} ${a1.y} M ${b2.x} ${b2.y} A ${ri} ${ri} 0 1 0 ${b1.x} ${b1.y} A ${ri} ${ri} 0 1 0 ${b2.x} ${b2.y} Z`;
    }
    const p1 = toXY(start, R), p2 = toXY(end, R), p3 = toXY(end, ri), p4 = toXY(start, ri);
    const lg = end - start > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${lg} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${ri} ${ri} 0 ${lg} 0 ${p4.x} ${p4.y} Z`;
  };

  const activeIdx = activeName ? segments.findIndex((x) => x.name === activeName) : -1;
  const focus = hov !== null ? hov : activeIdx >= 0 ? activeIdx : null;
  const focusSeg = focus !== null ? segments[focus] : null;
  const amtStr = fmtAmt(focusSeg ? focusSeg.value : total, currency);
  const amtSize = Math.max(14, Math.min(26, Math.floor(((hole - 28) / (amtStr.length * 0.62)))));

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, animation: "donutIn 0.6s cubic-bezier(.2,.8,.2,1) both" }}>
      <svg width={size} height={size} style={{ display: "block", overflow: "visible" }} role="img" aria-label="Category breakdown chart">
        <circle cx={cx} cy={cy} r={(R + ri) / 2} fill="none" stroke={BORDER} strokeOpacity={0.35} strokeWidth={R - ri} />
        {arcs.map((arc) => {
          const on = focus === arc.i;
          const off = on ? 8 : 0;
          const dx = Math.cos((arc.mid * Math.PI) / 180) * off;
          const dy = Math.sin((arc.mid * Math.PI) / 180) * off;
          return (
            <path
              key={arc.i}
              d={arcPath(arc.start, arc.end)}
              fill={arc.color}
              opacity={focus === null || on ? 1 : 0.35}
              style={{ transition: "opacity 0.2s ease, transform 0.25s ease", transform: `translate(${dx}px, ${dy}px)`, cursor: "pointer" }}
              onMouseEnter={() => setHov(arc.i)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onSelect?.(activeName === arc.name ? null : segments[arc.i])}
            />
          );
        })}
      </svg>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        textAlign: "center", pointerEvents: "none", width: hole - 16,
      }}>
        <div style={{ fontSize: 13, color: SUB, marginBottom: 4, fontWeight: 700, letterSpacing: "0.08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {focusSeg ? focusSeg.name.split(" & ")[0].toUpperCase() : "TOTAL"}
        </div>
        <div style={{ fontSize: amtSize, fontWeight: 800, color: focusSeg ? focusSeg.color : TEXT, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          {amtStr}
        </div>
        {focusSeg && (
          <div style={{ fontSize: 14, color: SUB, marginTop: 4, fontWeight: 600 }}>
            {((focusSeg.value / total) * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Date selection (single day or range) ───────────────────────────────── */
type DateSel = { start: Date; end: Date };
type DateMode = "day" | "range";
const isRange = (s: DateSel | null) => !!s && !sameDay(s.start, s.end);
function inDateSel(iso: string, s: DateSel) {
  const t = new Date(iso);
  const from = new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate());
  const to = new Date(s.end.getFullYear(), s.end.getMonth(), s.end.getDate() + 1);
  return t >= from && t < to;
}
function fmtDateSel(s: DateSel) {
  if (!isRange(s)) return fmtDate(s.start);
  const a = s.start, b = s.end;
  if (a.getFullYear() === b.getFullYear()) return `${M3[a.getMonth()]} ${a.getDate()} – ${M3[b.getMonth()]} ${b.getDate()}, ${b.getFullYear()}`;
  return `${fmtDate(a)} – ${fmtDate(b)}`;
}
/* Click logic shared by Home and Search. Day mode picks one day (click it again to clear);
   range mode takes a start click, then an end click. */
function useDateSelection(initial: DateSel | null) {
  const [sel, setSel] = useState<DateSel | null>(initial);
  const [mode, setModeState] = useState<DateMode>("day");
  const [pending, setPending] = useState<Date | null>(null);
  /** Returns true once the selection is complete */
  const pick = (d: Date) => {
    if (mode === "day") {
      setSel(sel && !isRange(sel) && sameDay(sel.start, d) ? null : { start: d, end: d });
      return true;
    }
    if (!pending) { setPending(d); setSel({ start: d, end: d }); return false; }
    setSel(pending <= d ? { start: pending, end: d } : { start: d, end: pending });
    setPending(null);
    return true;
  };
  const setMode = (m: DateMode) => {
    setModeState(m);
    setPending(null);
    if (m === "day" && isRange(sel)) setSel(null);
  };
  const clear = () => { setSel(null); setPending(null); };
  /* Stop waiting for an end date; keeps the start day selected */
  const settle = () => setPending(null);
  return { sel, mode, pending, pick, setMode, clear, settle };
}

/* ─── MiniCalendar ───────────────────────────────────────────────────────── */
/* The visible panel (days or month/year picker) sits in normal flow and sets the card height;
   the hidden one is lifted out of flow while it fades, so the card can shrink/grow to fit. */
const calLayer = (active: boolean): React.CSSProperties => ({
  gridArea: "1 / 1",
  position: active ? "relative" : "absolute", top: 0, left: 0, right: 0,
  opacity: active ? 1 : 0, visibility: active ? "visible" : "hidden",
  pointerEvents: active ? "auto" : "none",
  transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
});
function MiniCalendar({ year, month, transactions, selection, pending = null, mode = "day", onModeChange, onSelectDay, onPrevMonth, onNextMonth, onJump }: {
  year: number;
  month: number;
  transactions: Tx[];
  selection: DateSel | null;
  pending?: Date | null;
  mode?: DateMode;
  onModeChange?: (m: DateMode) => void;
  onSelectDay: (d: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJump: (year: number, month: number) => void;
}) {
  const today = new Date();
  const [picking, setPicking] = useState(false);
  // Animate the card height when the month needs 5 vs 6 week rows
  const innerRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState<number | null>(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);
  const [pickYear, setPickYear] = useState(year);
  const [hoverDay, setHoverDay] = useState<Date | null>(null);
  // While picking a range end, preview the range up to the hovered day
  const shown: DateSel | null = pending
    ? hoverDay
      ? (pending <= hoverDay ? { start: pending, end: hoverDay } : { start: hoverDay, end: pending })
      : { start: pending, end: pending }
    : selection;
  const spans = isRange(shown);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const atCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const txDays = useMemo(() => {
    const set = new Set<number>();
    const txExpDays = new Set<number>();
    transactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        set.add(d.getDate());
        if (tx.type === "expense") txExpDays.add(d.getDate());
      }
    });
    return { any: set, exp: txExpDays };
  }, [transactions, year, month]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{
      background: CARD, borderRadius: 18, border: `1px solid ${BORDER}`, overflow: "hidden",
      height: cardH === null ? "auto" : cardH + 2, transition: "height 0.4s cubic-bezier(.2,.8,.2,1)",
    }}>
     <div ref={innerRef} style={{ padding: "18px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={onPrevMonth} style={btnReset}>
          <IcoChevLeft size={17} color={SUB} />
        </button>
        <button onClick={() => { setPickYear(year); setPicking((v) => !v); }} aria-expanded={picking}
          style={{ ...btnReset, gap: 6, padding: "6px 12px", borderRadius: 10, background: picking ? aTint(14) : "transparent", fontWeight: 700, color: picking ? ACCENT : TEXT, fontSize: 16 }}>
          {MONTHS[month]} {year}
          <span style={{ fontSize: 11, transform: picking ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
        </button>
        <button onClick={() => !atCurrentMonth && onNextMonth()} disabled={atCurrentMonth} style={{ ...btnReset, opacity: atCurrentMonth ? 0.25 : 1, cursor: atCurrentMonth ? "not-allowed" : "pointer" }}>
          <IcoChevRight size={17} color={SUB} />
        </button>
      </div>

      <div style={{ display: "grid", position: "relative" }}>
        <div style={{ ...calLayer(picking), transform: picking ? "none" : "scale(0.97)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={() => setPickYear((y) => y - 1)} style={btnReset}><IcoChevLeft size={16} color={SUB} /></button>
            <span style={{ fontWeight: 800, color: TEXT, fontSize: 16 }}>{pickYear}</span>
            <button onClick={() => pickYear < today.getFullYear() && setPickYear((y) => y + 1)} disabled={pickYear >= today.getFullYear()}
              style={{ ...btnReset, opacity: pickYear >= today.getFullYear() ? 0.25 : 1, cursor: pickYear >= today.getFullYear() ? "not-allowed" : "pointer" }}>
              <IcoChevRight size={16} color={SUB} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {MONTHS.map((m, mi) => {
              const future = pickYear > today.getFullYear() || (pickYear === today.getFullYear() && mi > today.getMonth());
              const cur = pickYear === year && mi === month;
              return (
                <button key={m} disabled={future} onClick={() => { onJump(pickYear, mi); setPicking(false); }} style={{
                  padding: "12px 0", borderRadius: 10, fontSize: 15, fontWeight: cur ? 700 : 500,
                  background: cur ? ACCENT : CARD2, color: cur ? "#fff" : TEXT,
                  border: "none", cursor: future ? "not-allowed" : "pointer", opacity: future ? 0.3 : 1,
                }}>{m.slice(0, 3)}</button>
              );
            })}
          </div>
        </div>
        <div style={{ ...calLayer(!picking), transform: picking ? "scale(1.03)" : "none" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {["S","M","T","W","T","F","S"].map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 14, color: SUB, fontWeight: 700, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }} onMouseLeave={() => setHoverDay(null)}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} style={{ aspectRatio: "1" }} />;
          const date = new Date(year, month, day);
          const isToday = sameDay(date, today);
          const isStart = !!shown && sameDay(date, shown.start);
          const isEnd = !!shown && sameDay(date, shown.end);
          const isSel = isStart || isEnd;
          const inside = spans && !!shown && date > shown.start && date < shown.end;
          const band = spans && (inside || isSel);
          // Round the range band at its ends and where a week row starts/ends
          const col = i % 7;
          const roundL = band && (isStart || col === 0 || day === 1) ? 8 : 0;
          const roundR = band && (isEnd || col === 6 || day === daysInMonth) ? 8 : 0;
          const hasTx = txDays.any.has(day);
          const future = date > todayStart;
          return (
            <div key={i} style={{
              background: band ? aTint(16) : "transparent",
              borderRadius: `${roundL}px ${roundR}px ${roundR}px ${roundL}px`,
              transition: "background 0.15s",
            }}>
              <button
                disabled={future}
                onClick={() => { setHoverDay(date); onSelectDay(date); }}
                onMouseEnter={() => { if (pending) setHoverDay(date); }}
                style={{
                  width: "100%", display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", aspectRatio: "1", borderRadius: 8,
                  background: isSel ? ACCENT : isToday && !band ? aTint(9) : "transparent",
                  border: isToday && !isSel && !band ? `1px solid ${aTint(33)}` : "none",
                  cursor: future ? "not-allowed" : "pointer", gap: 2, padding: 0,
                  opacity: future ? 0.3 : 1,
                  transition: "background 0.15s",
                }}
              >
                <span style={{
                  fontSize: 15,
                  fontWeight: isSel || isToday ? 700 : 400,
                  color: isSel ? "#fff" : isToday ? ACCENT : TEXT,
                }}>
                  {day}
                </span>
                {hasTx && !isSel && (
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: ACCENT, display: "block" }} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {onModeChange && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
          <div role="group" aria-label="Selection mode" style={{ display: "flex", gap: 2, padding: 3, borderRadius: 10, background: CARD2, flexShrink: 0 }}>
            {(["day", "range"] as const).map((m) => (
              <button key={m} onClick={() => onModeChange(m)} aria-pressed={mode === m} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                background: mode === m ? SURFACE : "transparent", color: mode === m ? ACCENT : SUB,
              }}>{m === "day" ? "Day" : "Range"}</button>
            ))}
          </div>
          <span style={{ fontSize: 14, color: pending ? ACCENT : SUB, fontWeight: pending ? 600 : 400, textAlign: "right" }}>
            {mode === "day"
              ? "Pick a day"
              : pending
              ? "Now pick an end date"
              : selection && isRange(selection)
              ? fmtDateSel(selection)
              : "Pick a start date"}
          </span>
        </div>
      )}
        </div>
      </div>
     </div>
    </div>
  );
}

/* ─── TxRow ──────────────────────────────────────────────────────────────── */
function TxRow({ tx, currency, onClick, showDate = false }: { tx: Tx; currency: string; onClick: () => void; showDate?: boolean }) {
  const [hov, setHov] = useState(false);
  const isExp = tx.type === "expense";
  const cat = getCat(tx.type, tx.parent_category);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: hov ? CARD2 : CARD,
        borderRadius: 14, padding: "13px 15px",
        border: `1px solid ${hov ? "#333" : BORDER}`,
        cursor: "pointer", width: "100%", textAlign: "left",
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: cat ? `${cat.color}20` : (isExp ? "#FF6B6B20" : "#2ECC7120"),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {cat ? <CatIcon name={cat.icon} color={cat.color} size={20} /> : (isExp ? <IoCash size={20} color={RED} /> : <IoCash size={20} color={GREEN} />)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {tx.sub_category || tx.parent_category || "Uncategorized"}
        </div>
        <div style={{ fontSize: 15, color: SUB, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {showDate ? `${fmtDate(tx.created_at)} · ` : ""}{fmtTime(tx.created_at)}{tx.notes ? ` · ${tx.notes}` : ""}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: isExp ? RED : GREEN, flexShrink: 0 }}>
        {isExp ? "-" : "+"}{fmtAmt(tx.amount, currency)}
      </div>
    </button>
  );
}

/* Square card used by the Search grid view */
function TxCard({ tx, currency, onClick }: { tx: Tx; currency: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const isExp = tx.type === "expense";
  const tone = isExp ? RED : GREEN;
  const cat = getCat(tx.type, tx.parent_category);
  const clip: React.CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", aspectRatio: "1 / 1", overflow: "hidden", minWidth: 0,
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10,
        padding: 18, borderRadius: 16, textAlign: "left", cursor: "pointer",
        background: hov ? CARD2 : CARD, border: `1px solid ${hov ? "#333" : BORDER}`,
        transition: "background 0.12s, border-color 0.12s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, width: "100%" }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: `${cat?.color ?? tone}20`, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {cat ? <CatIcon name={cat.icon} color={cat.color} size={22} /> : <IoCash size={22} color={tone} />}
        </div>
        <span style={{ fontSize: 13, color: SUB, fontWeight: 600, whiteSpace: "nowrap" }}>{fmtDate(tx.created_at)}</span>
      </div>
      <div style={{ width: "100%", minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: TEXT, ...clip }}>{tx.sub_category || tx.parent_category || "Uncategorized"}</div>
        <div style={{ fontSize: 14, color: SUB, marginTop: 2, ...clip }}>{tx.sub_category ? tx.parent_category : fmtTime(tx.created_at)}</div>
        {tx.notes && <div style={{ fontSize: 14, color: SUB, marginTop: 6, ...clip }}>{tx.notes}</div>}
      </div>
      <div style={{ width: "100%", fontSize: 20, fontWeight: 800, color: tone, ...clip }}>
        {isExp ? "-" : "+"}{fmtAmt(tx.amount, currency)}
      </div>
    </button>
  );
}

/* ─── TxDetailModal ──────────────────────────────────────────────────────── */
function TxDetailModal({ tx, currency, onClose, onDelete, onEdit }: {
  tx: Tx; currency: string; onClose: () => void; onDelete: (id: string) => void; onEdit: (tx: Tx) => void;
}) {
  const isExp = tx.type === "expense";
  const tone = isExp ? RED : GREEN;
  const cat = getCat(tx.type, tx.parent_category);
  const [confirmDel, setConfirmDel] = useState(false);
  const catClr = cat?.color ?? tone;
  const rows = [
    { label: "Category", value: tx.parent_category || "—" },
    { label: "Subcategory", value: tx.sub_category || "—" },
    { label: "Date", value: fmtDate(tx.created_at) },
    { label: "Time", value: fmtTime(tx.created_at) },
  ];
  return (
    <div style={overlay} onClick={onClose}>
      <div className="montra-pop" style={{ ...modalBox, width: 460, padding: 0, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        {/* Top bar: category + close */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "22px 24px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${catClr}1e`, border: `1px solid ${catClr}55`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {cat ? <CatIcon name={cat.icon} color={cat.color} size={24} /> : <IoCash size={24} color={tone} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tx.sub_category || tx.parent_category || "Uncategorized"}
            </div>
            <div style={{ fontSize: 15, color: SUB, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tx.sub_category ? tx.parent_category : "Transaction details"}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, width: 36, height: 36, borderRadius: 10, background: CARD2 }}>
            <IcoX size={18} color={SUB} />
          </button>
        </div>

        {/* Amount */}
        <div style={{ padding: "26px 24px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: tone, lineHeight: 1.1, letterSpacing: "-0.02em", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
            {isExp ? "-" : "+"}{fmtAmt(tx.amount, currency)}
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 100, border: `1px solid ${tone}55`, color: tone, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: tone }} />
            {isExp ? "Expense" : "Income"}
          </span>
        </div>

        {/* Details list */}
        <div style={{ margin: "0 24px", borderTop: `1px solid ${BORDER}` }}>
          {rows.map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "15px 0", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 16, color: SUB }}>{label}</span>
              <span style={{ fontSize: 16, color: TEXT, fontWeight: 600, textAlign: "right" }}>{value}</span>
            </div>
          ))}
        </div>

        {tx.notes && (
          <div style={{ margin: "18px 24px 0", background: SURFACE, borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${tone}` }}>
            <div style={{ fontSize: 13, color: SUB, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 6 }}>NOTE</div>
            <div style={{ fontSize: 16, color: TEXT, lineHeight: 1.5, wordBreak: "break-word" }}>{tx.notes}</div>
          </div>
        )}
        {tx.is_edited && (
          <div style={{ margin: "14px 24px 0", fontSize: 14, color: SUB }}>
            Edited{tx.last_edited_at ? ` on ${fmtDate(tx.last_edited_at)}` : ""}
            {tx.original_amount != null && tx.original_amount !== tx.amount ? ` · originally ${fmtAmt(tx.original_amount, currency)}` : ""}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, padding: 24 }}>
          {confirmDel ? (
            <>
              <button onClick={() => setConfirmDel(false)} style={outlineBtn}>Keep</button>
              <button onClick={() => { onDelete(tx.id); onClose(); }} style={{ ...dangerBtn, background: RED, color: "#fff", border: "none" }}>Confirm delete</button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDel(true)} style={dangerBtn}>Delete</button>
              <button onClick={() => onEdit(tx)} style={{ ...primaryBtn, flex: 1 }}>Edit</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── EditModal ──────────────────────────────────────────────────────────── */
function EditModal({ tx, currency, onClose, onSave }: {
  tx: Tx; currency: string; onClose: () => void; onSave: (updated: Tx) => void;
}) {
  const [amount, setAmount] = useState(tx.amount.toString());
  const [notes, setNotes] = useState(tx.notes || "");
  const isExp = tx.type === "expense";
  const tone = isExp ? RED : GREEN;
  const cat = getCat(tx.type, tx.parent_category);
  const valid = parseFloat(amount) > 0;

  const handleSave = () => {
    const n = parseFloat(amount);
    if (!isNaN(n) && n > 0) {
      onSave({
        ...tx, amount: n, notes,
        is_edited: true,
        last_edited_at: new Date().toISOString(),
        original_amount: tx.is_edited ? tx.original_amount : tx.amount,
        original_notes: tx.is_edited ? tx.original_notes : tx.notes,
      });
      onClose();
    }
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div className="montra-pop" style={{ ...modalBox, width: 480, padding: 0, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "24px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${cat?.color ?? tone}1e`, border: `1px solid ${cat?.color ?? tone}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {cat ? <CatIcon name={cat.icon} color={cat.color} size={24} /> : <IoCash size={24} color={tone} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: TEXT, margin: 0, fontSize: 22, fontWeight: 800 }}>Edit Transaction</h3>
            <div style={{ fontSize: 15, color: SUB, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {isExp ? "Expense" : "Income"} · {tx.sub_category || tx.parent_category}
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ ...btnReset, width: 36, height: 36, borderRadius: 10, background: CARD2 }}>
            <IcoX size={18} color={SUB} />
          </button>
        </div>
        <div style={{ padding: 28 }}>
          <label style={fieldLabel}>AMOUNT</label>
          <div style={{ position: "relative", marginBottom: 22 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: tone, fontSize: 24, fontWeight: 700, pointerEvents: "none" }}>{currency}</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
              style={{ ...inputStyle, paddingLeft: 46, fontSize: 28, fontWeight: 800, color: tone, border: `2px solid ${valid ? `${tone}88` : BORDER}` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label style={fieldLabel}>NOTES</label>
            <span style={{ fontSize: 13, color: notes.length >= 150 ? RED : SUB, fontWeight: 600 }}>{notes.length}/150</span>
          </div>
          <textarea value={notes} maxLength={150} placeholder="Add a note..." onChange={(e) => setNotes(e.target.value.slice(0, 150))} rows={3} style={{ ...inputStyle, marginBottom: 26, resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onClose} style={outlineBtn}>Cancel</button>
            <button onClick={handleSave} disabled={!valid} style={{ ...primaryBtn, flex: 1, opacity: valid ? 1 : 0.5, cursor: valid ? "pointer" : "not-allowed" }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HomeTab ─────────────────────────────────────────────────────────────── */
/* Home's calendar state lives in AppShell so the shown month and the picked day/range
   survive switching to other tabs and back. */
function useHomeCalendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const dates = useDateSelection((() => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return { start: d, end: d };
  })());
  return { year, setYear, month, setMonth, dates };
}
type HomeCalendar = ReturnType<typeof useHomeCalendar>;

function HomeTab({ txs, currency, onTxClick, cal }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void; cal: HomeCalendar }) {
  const { year, setYear, month, setMonth, dates } = cal;

  const { mIncome, mExpense } = useMemo(() => {
    let inc = 0, exp = 0;
    txs.forEach((tx) => {
      const d = new Date(tx.created_at);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (tx.type === "income") inc += tx.amount;
        else exp += tx.amount;
      }
    });
    return { mIncome: inc, mExpense: exp };
  }, [txs, year, month]);

  const filtered = useMemo(() => {
    return txs
      .filter((tx) => {
        const d = new Date(tx.created_at);
        if (dates.sel) return inDateSel(tx.created_at, dates.sel);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [txs, dates.sel, year, month]);

  const balance = mIncome - mExpense;

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    // Day mode: browsing shows the whole month. Range mode keeps the range while browsing.
    if (dates.mode === "day") dates.clear();
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    if (dates.mode === "day") dates.clear();
  };

  return (
    <div className="montra-home" style={{ display: "flex", gap: 32, minHeight: 0 }}>
      {/* Left column */}
      <div className="montra-home-left" style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Summary */}
        <div style={{ background: CARD, borderRadius: 18, padding: "18px 16px", border: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 14, color: SUB, fontWeight: 700, letterSpacing: "0.07em", marginBottom: 12 }}>
            {MONTHS[month].toUpperCase()} {year}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: balance >= 0 ? GREEN : RED, marginBottom: 4 }}>
            {balance < 0 ? "-" : ""}{fmtAmt(Math.abs(balance), currency)}
          </div>
          <div style={{ fontSize: 15, color: SUB, marginBottom: 16 }}>Net balance</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Income", value: mIncome, color: GREEN, bg: "#2ECC7110" },
              { label: "Expenses", value: mExpense, color: RED, bg: "#FF6B6B10" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 14, color: SUB, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color }}>{fmtAmt(value, currency)}</div>
              </div>
            ))}
          </div>
        </div>

        <MiniCalendar
          year={year} month={month} transactions={txs}
          selection={dates.sel} pending={dates.pending} mode={dates.mode} onModeChange={dates.setMode}
          onSelectDay={(d) => { dates.pick(d); }}
          onPrevMonth={prevMonth} onNextMonth={nextMonth}
          onJump={(y, m) => { setYear(y); setMonth(m); if (dates.mode === "day") dates.clear(); }}
        />
      </div>

      {/* Right column */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: TEXT, fontSize: 18, fontWeight: 700 }}>
            {dates.sel ? fmtDateSel(dates.sel) : `All of ${MONTHS[month]}`}
          </h2>
          {dates.sel && (
            <button onClick={dates.clear} style={{ ...btnReset, fontSize: 15, color: SUB }}>
              Show all ×
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 15, color: SUB }}>{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="montra-tab" style={{ flex: "none", height: 440, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: SUB, gap: 10 }}>
            <IoArrowDownCircle size={44} color={BORDER} />
            <span style={{ fontWeight: 600, color: TEXT }}>No transactions</span>
            <span style={{ fontSize: 16 }}>Use the Add tab to record one.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
            {filtered.map((tx) => (
              <TxRow key={tx.id} tx={tx} currency={currency} onClick={() => onTxClick(tx)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── AddTab ─────────────────────────────────────────────────────────────── */
function AddTab({ onAdd }: { onAdd: (tx: Tx) => void }) {
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [parentCat, setParentCat] = useState("");
  const [subCat, setSubCat] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showCal, setShowCal] = useState(false);
  const [error, setError] = useState("");

  const cats = CATS[type];
  const parentObj = cats.find((c) => c.name === parentCat);
  const isExp = type === "expense";

  const reset = () => {
    setAmount(""); setParentCat(""); setSubCat(""); setNotes("");
    setDate(new Date().toISOString().slice(0, 10)); setError("");
  };

  const handleSubmit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) { setError("Enter a valid amount."); return; }
    if (!parentCat) { setError("Select a category."); return; }
    if (parentObj && parentObj.subs.length > 0 && !subCat) { setError("Select a subcategory."); return; }
    const [yyyy, mm, dd] = date.split("-").map(Number);
    const now = new Date();
    const created = new Date(yyyy, mm - 1, dd, now.getHours(), now.getMinutes(), now.getSeconds());
    onAdd({
      id: crypto.randomUUID(),
      amount: n, type,
      parent_category: parentCat,
      sub_category: subCat,
      notes,
      created_at: created.toISOString(),
    });
    reset();
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ color: TEXT, fontSize: 28, fontWeight: 800, marginBottom: 28, marginTop: 0 }}>Add Transaction</h2>

      {/* Type toggle */}
      <div style={{ display: "flex", background: CARD, borderRadius: 14, padding: 4, marginBottom: 24, border: `1px solid ${BORDER}` }}>
        {(["expense", "income"] as TxType[]).map((t) => {
          const active = type === t;
          const clr = t === "expense" ? RED : GREEN;
          return (
            <button key={t} onClick={() => { setType(t); setParentCat(""); setSubCat(""); setError(""); }}
              style={{
                flex: 1, padding: "11px", borderRadius: 10,
                background: active ? `${clr}1a` : "transparent",
                border: active ? `1px solid ${clr}55` : "1px solid transparent",
                color: active ? clr : SUB,
                fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.18s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
            >
              {t === "expense"
                ? <IoArrowDownCircle size={17} color={active ? RED : SUB} />
                : <IoArrowUpCircle size={17} color={active ? GREEN : SUB} />}
              {t === "expense" ? "Expense" : "Income"}
            </button>
          );
        })}
      </div>

      {/* Amount */}
      <div style={{ marginBottom: 22 }}>
        <label style={fieldLabel}>AMOUNT <span style={{ color: RED }}>*</span></label>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: amount ? (isExp ? RED : GREEN) : SUB, fontSize: 28, fontWeight: 700, pointerEvents: "none" }}>
            {/* We'll rely on the select for currency - show ₱ as default indicator */}
            ₱
          </span>
          <input
            key={type}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError(""); }}
            style={{
              width: "100%", background: CARD, borderRadius: 14,
              border: `2px solid ${amount ? (isExp ? `${RED}88` : `${GREEN}88`) : BORDER}`,
              padding: "18px 18px 18px 44px",
              color: isExp ? RED : GREEN, caretColor: isExp ? RED : GREEN, fontSize: 34, fontWeight: 800,
              outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s",
            }}
          />
        </div>
      </div>

      {/* Parent Category */}
      <div style={{ marginBottom: 20 }}>
        <label style={fieldLabel}>CATEGORY <span style={{ color: RED }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {cats.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setParentCat(cat.name); setSubCat(""); setError(""); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "12px 6px", borderRadius: 13, cursor: "pointer",
                background: parentCat === cat.name ? `${cat.color}1e` : CARD,
                border: `1px solid ${parentCat === cat.name ? cat.color : BORDER}`,
                transition: "all 0.15s",
              }}
            >
              <CatIcon name={cat.icon} color={cat.color} size={22} />
              <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: parentCat === cat.name ? cat.color : TEXT, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
                {cat.name.split(" & ")[0]}
              </span>
            </button>
          ))}
          {/* Placeholder for custom categories — see README "Planned features → Custom categories" */}
          <button type="button" disabled aria-disabled title="Custom categories are coming soon"
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "12px 6px", borderRadius: 13, background: "transparent",
              border: `1px dashed ${BORDER}`, cursor: "not-allowed", opacity: 0.6,
            }}
          >
            <IcoPlus size={22} color={SUB} />
            <span style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 14, color: SUB, fontWeight: 600, textAlign: "center", lineHeight: 1.3 }}>
              New category
              <span style={{ fontSize: 12 }}>Soon</span>
            </span>
          </button>
        </div>
      </div>

      {/* Sub Category */}
      {parentObj && (
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabel}>SUBCATEGORY <span style={{ color: RED }}>*</span></label>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {parentObj.subs.map((sub) => (
              <button key={sub} onClick={() => { setSubCat(sub); setError(""); }}
                style={{
                  padding: "7px 14px", borderRadius: 100,
                  background: subCat === sub ? `${parentObj.color}20` : CARD,
                  border: `1px solid ${subCat === sub ? parentObj.color : BORDER}`,
                  color: subCat === sub ? parentObj.color : SUB,
                  fontSize: 16, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}
              >{sub}</button>
            ))}
            {/* Placeholder for custom subcategories — see README "Planned features → Custom subcategories" */}
            <button type="button" disabled aria-disabled title="Custom subcategories are coming soon"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 100, background: "transparent",
                border: `1px dashed ${BORDER}`, color: SUB, fontSize: 16, fontWeight: 600,
                cursor: "not-allowed", opacity: 0.6,
              }}
            >
              <IcoPlus size={14} /> Add
              <span style={{ fontSize: 12, fontWeight: 600 }}>Soon</span>
            </button>
          </div>
        </div>
      )}

      {/* Notes */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label style={fieldLabel}>NOTES (optional)</label>
          <span style={{ fontSize: 14, color: notes.length >= 150 ? RED : SUB, fontWeight: 600 }}>{notes.length}/150</span>
        </div>
        <textarea placeholder="Add a note..." value={notes} maxLength={150} onChange={(e) => setNotes(e.target.value.slice(0, 150))} rows={2}
          style={{ ...inputStyle, resize: "none" as const, fontFamily: "inherit" }}
        />
      </div>

      {/* Date */}
      <div style={{ marginBottom: 28 }}>
        <label style={fieldLabel}>DATE</label>
        <button type="button" onClick={() => setShowCal(true)}
          style={{ ...inputStyle, textAlign: "left", cursor: "pointer" }}>
          {(() => { const [yy, mm, dd] = date.split("-").map(Number); return `${MONTHS[mm - 1]} ${dd}, ${yy}`; })()}
        </button>
        {showCal && <DatePickerModal value={date} onClose={() => setShowCal(false)} onSelect={setDate} />}
      </div>

      {error && <div style={{ color: RED, fontSize: 16, marginBottom: 14 }}>{error}</div>}

      <button onClick={handleSubmit} style={{ ...primaryBtn, width: "100%", fontSize: 16, padding: "16px" }}>
        Save Transaction
      </button>
    </div>
  );
}

/* ─── AnalyticsTab ───────────────────────────────────────────────────────── */
function GhostPie({ size = 64 }: { size?: number }) {
  // Three slices: 0°→110°→230°→360° (from 12 o'clock, clockwise)
  // Point on circle: x = 32 + 28·sin(θ°), y = 32 − 28·cos(θ°)
  // p0 = 0°  → (32, 4)
  // p1 = 110° → (58.31, 41.58)   110° span → large-arc 0
  // p2 = 230° → (10.55, 50.00)   120° span → large-arc 0
  // back to p0                    130° span → large-arc 0
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3 }}>
      <path d="M32 32 L32 4 A28 28 0 0 1 58.31 41.58 Z" fill="#888" />
      <path d="M32 32 L58.31 41.58 A28 28 0 0 1 10.55 50 Z" fill="#888" opacity="0.65" />
      <path d="M32 32 L10.55 50 A28 28 0 0 1 32 4 Z" fill="#888" opacity="0.38" />
      <line x1="32" y1="32" x2="32" y2="4" stroke="var(--bg,#111)" strokeWidth="1.5" />
      <line x1="32" y1="32" x2="58.31" y2="41.58" stroke="var(--bg,#111)" strokeWidth="1.5" />
      <line x1="32" y1="32" x2="10.55" y2="50" stroke="var(--bg,#111)" strokeWidth="1.5" />
    </svg>
  );
}

function mondayOf(src: Date) {
  const d = new Date(src.getFullYear(), src.getMonth(), src.getDate());
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}
function isoWeekNum(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((+t - +y0) / 864e5 + 1) / 7);
}
const fmtShort = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* Wraps content in a card whose height animates smoothly as the content changes */
function AnimatedCard({ children, style, padding = 20 }: { children: React.ReactNode; style?: React.CSSProperties; padding?: number }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    setH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);
  return (
    <div style={{
      background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden",
      height: h === null ? "auto" : h + 2, transition: "height 0.45s cubic-bezier(.2,.8,.2,1)", ...style,
    }}>
      <div ref={innerRef} style={{ padding }}>{children}</div>
    </div>
  );
}

function AnalyticsTab({ txs, currency }: { txs: Tx[]; currency: string }) {
  const [txType, setTxType] = useState<TxType>("expense");
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("month");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedSeg, setSelectedSeg] = useState<Segment | null>(null);

  // Smoothly animate the breakdown card's height as its content changes size
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState<number | null>(null);
  useEffect(() => {
    const el = cardInnerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight));
    ro.observe(el);
    setCardH(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickYear, setPickYear] = useState(today.getFullYear());
  const [pickMonth, setPickMonth] = useState(today.getMonth());
  const isCurrentYear = (y: number) => y >= today.getFullYear();

  const inPeriod = useCallback((dateStr: string) => {
    const d = new Date(dateStr);
    if (viewMode === "month") return d.getFullYear() === year && d.getMonth() === month;
    if (viewMode === "year") return d.getFullYear() === year;
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    return d >= weekStart && d < end;
  }, [viewMode, year, month, weekStart]);

  const periodTxs = useMemo(() => txs.filter(tx => inPeriod(tx.created_at)), [txs, inPeriod]);
  const totalIncome = useMemo(() => periodTxs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [periodTxs]);
  const totalExpense = useMemo(() => periodTxs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [periodTxs]);
  const balance = totalIncome - totalExpense;

  const filtered = useMemo(() => periodTxs.filter(tx => tx.type === txType), [periodTxs, txType]);

  const segments: Segment[] = useMemo(() => {
    const map: Record<string, Segment> = {};
    filtered.forEach((tx) => {
      const cat = getCat(tx.type, tx.parent_category);
      if (!map[tx.parent_category]) {
        map[tx.parent_category] = { value: 0, color: cat?.color ?? "#888", name: tx.parent_category, icon: cat?.icon ?? "cash" };
      }
      map[tx.parent_category].value += tx.amount;
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const total = segments.reduce((s, d) => s + d.value, 0);

  const segTxs = useMemo(() => {
    if (!selectedSeg) return [];
    return filtered
      .filter(tx => tx.parent_category === selectedSeg.name)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [filtered, selectedSeg]);

  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const periodLabel = viewMode === "month"
    ? `${MONTHS[month]} ${year}`
    : viewMode === "year"
    ? `${year}`
    : `Week ${isoWeekNum(weekStart)} · ${fmtShort(weekStart)} - ${fmtShort(weekEnd)}`;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const atEnd = viewMode === "month"
    ? year === today.getFullYear() && month === today.getMonth()
    : viewMode === "year"
    ? year >= today.getFullYear()
    : new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 7) > todayStart;

  function shiftWeek(n: number) { setWeekStart(w => new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7 * n)); }
  function prevPeriod() {
    setSelectedSeg(null);
    if (viewMode === "month") { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); }
    else if (viewMode === "year") setYear(y => y - 1);
    else shiftWeek(-1);
  }
  function nextPeriod() {
    if (atEnd) return;
    setSelectedSeg(null);
    if (viewMode === "month") { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); }
    else if (viewMode === "year") setYear(y => y + 1);
    else shiftWeek(1);
  }
  function togglePicker() {
    if (!pickerOpen) { setPickYear(viewMode === "week" ? weekStart.getFullYear() : year); setPickMonth(viewMode === "week" ? weekStart.getMonth() : month); }
    setPickerOpen(o => !o);
  }

  // Mondays of weeks touching the picked month (no future weeks)
  const weekOptions: Date[] = [];
  {
    let w = mondayOf(new Date(pickYear, pickMonth, 1));
    const lastDay = new Date(pickYear, pickMonth + 1, 0);
    while (w <= lastDay) { if (w <= todayStart) weekOptions.push(w); w = new Date(w.getFullYear(), w.getMonth(), w.getDate() + 7); }
  }
  const yearOptions = Array.from({ length: 12 }, (_, i) => today.getFullYear() - 11 + i);
  const pickBtn = (on: boolean, disabled = false): React.CSSProperties => ({
    padding: "11px 0", borderRadius: 10, fontSize: 15, fontWeight: on ? 700 : 500,
    background: on ? ACCENT : CARD2, color: on ? "#fff" : TEXT, border: "none",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Period pill with nav arrows */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, position: "relative" }}>
        <button onClick={prevPeriod} style={{ ...btnReset, ...navBtnStyle }}>
          <IcoChevLeft size={15} color={TEXT} />
        </button>
        <button onClick={togglePicker} aria-expanded={pickerOpen} style={{
          background: aTint(12), border: `1px solid ${aTint(35)}`,
          borderRadius: 100, padding: "8px 0", width: 320, flexShrink: 0, textAlign: "center",
          whiteSpace: "nowrap", color: ACCENT, fontWeight: 700, fontSize: 17, letterSpacing: 0.2, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {periodLabel}
          <span style={{ fontSize: 11, transform: pickerOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
        </button>
        <button onClick={nextPeriod} disabled={atEnd} style={{ ...btnReset, ...navBtnStyle, opacity: atEnd ? 0.3 : 1, cursor: atEnd ? "not-allowed" : "pointer" }}>
          <IcoChevRight size={15} color={TEXT} />
        </button>

        {pickerOpen && <div onClick={() => setPickerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}
        <div className="montra-tab" style={{
          position: "absolute", top: "calc(100% + 10px)", left: "50%", marginLeft: -170, width: 340, zIndex: 21,
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 16,
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
          opacity: pickerOpen ? 1 : 0, visibility: pickerOpen ? "visible" : "hidden",
          transform: pickerOpen ? "none" : "translateY(-6px)",
          transition: "opacity 0.18s ease, transform 0.18s ease, visibility 0.18s",
          animation: "none",
        }}>
          {viewMode === "year" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {yearOptions.map(y => (
                <button key={y} onClick={() => { setYear(y); setSelectedSeg(null); setPickerOpen(false); }} style={pickBtn(y === year)}>{y}</button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <button onClick={() => setPickYear(y => y - 1)} style={btnReset}><IcoChevLeft size={16} color={SUB} /></button>
                <span style={{ fontWeight: 800, color: TEXT, fontSize: 16 }}>{viewMode === "week" ? `${MONTHS[pickMonth]} ${pickYear}` : pickYear}</span>
                <button onClick={() => !isCurrentYear(pickYear) && setPickYear(y => y + 1)} disabled={isCurrentYear(pickYear)}
                  style={{ ...btnReset, opacity: isCurrentYear(pickYear) ? 0.25 : 1, cursor: isCurrentYear(pickYear) ? "not-allowed" : "pointer" }}>
                  <IcoChevRight size={16} color={SUB} />
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {MONTHS.map((m, mi) => {
                  const future = pickYear > today.getFullYear() || (pickYear === today.getFullYear() && mi > today.getMonth());
                  const on = viewMode === "week" ? mi === pickMonth : pickYear === year && mi === month;
                  return (
                    <button key={m} disabled={future} style={pickBtn(on, future)} onClick={() => {
                      if (viewMode === "week") setPickMonth(mi);
                      else { setYear(pickYear); setMonth(mi); setSelectedSeg(null); setPickerOpen(false); }
                    }}>{m.slice(0, 3)}</button>
                  );
                })}
              </div>
              {viewMode === "week" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14, borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
                  {weekOptions.length === 0 && <div style={{ color: SUB, fontSize: 15, textAlign: "center" }}>No weeks available</div>}
                  {weekOptions.map(w => {
                    const e = new Date(w.getFullYear(), w.getMonth(), w.getDate() + 6);
                    const on = +w === +weekStart;
                    return (
                      <button key={+w} onClick={() => { setWeekStart(w); setSelectedSeg(null); setPickerOpen(false); }}
                        style={{ ...pickBtn(on), padding: "10px 14px", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                        <span>Week {isoWeekNum(w)}</span><span style={{ opacity: 0.85 }}>{fmtShort(w)} - {fmtShort(e)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Week / Month / Year segmented */}
      <div style={{ display: "flex", background: CARD, borderRadius: 12, padding: 4, border: `1px solid ${BORDER}` }}>
        {(["Week", "Month", "Year"] as const).map(v => {
          const key = v.toLowerCase() as "week" | "month" | "year";
          const active = viewMode === key;
          return (
            <button key={v} onClick={() => { setViewMode(key); setSelectedSeg(null); setPickerOpen(false); }} style={{
              flex: 1, padding: "9px 0", borderRadius: 9,
              background: active ? CARD2 : "transparent",
              color: active ? TEXT : SUB,
              border: "none", fontWeight: active ? 700 : 500, fontSize: 16, cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}>{v}</button>
          );
        })}
      </div>

      {/* Income / Expense / Balance summary */}
      <div style={{ background: CARD, borderRadius: 16, padding: "18px 12px", border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: SUB, fontSize: 15, marginBottom: 6 }}>Income</div>
            <div style={{ color: GREEN, fontWeight: 700, fontSize: 16 }}>+{fmtAmt(totalIncome, currency)}</div>
          </div>
          <div style={{ textAlign: "center", borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
            <div style={{ color: SUB, fontSize: 15, marginBottom: 6 }}>Expense</div>
            <div style={{ color: RED, fontWeight: 700, fontSize: 16 }}>-{fmtAmt(totalExpense, currency)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: SUB, fontSize: 15, marginBottom: 6 }}>Balance</div>
            <div style={{ color: balance >= 0 ? TEXT : RED, fontWeight: 700, fontSize: 16 }}>
              {balance >= 0 ? "+" : "-"}{fmtAmt(Math.abs(balance), currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown card */}
      <div style={{
        background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden",
        height: cardH === null ? "auto" : cardH + 2, transition: "height 0.45s cubic-bezier(.2,.8,.2,1)",
      }}>
       <div ref={cardInnerRef} style={{ padding: 20 }}>
        {/* Header row: title + internal Expense/Income toggle */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: TEXT }}>
              {txType === "expense" ? "Expense" : "Income"} Breakdown
            </div>
            <div style={{ color: SUB, fontSize: 15, marginTop: 3 }}>Top categories this period</div>
          </div>
          <div style={{ display: "flex", background: CARD2, borderRadius: 10, padding: 3, gap: 2, border: `1px solid ${BORDER}` }}>
            <button onClick={() => { setTxType("expense"); setSelectedSeg(null); }} style={{
              padding: "6px 13px", borderRadius: 8,
              background: txType === "expense" ? RED : "transparent",
              color: txType === "expense" ? "#fff" : SUB,
              border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.2s",
            }}>Expense</button>
            <button onClick={() => { setTxType("income"); setSelectedSeg(null); }} style={{
              padding: "6px 13px", borderRadius: 8,
              background: txType === "income" ? GREEN : "transparent",
              color: txType === "income" ? "#fff" : SUB,
              border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", transition: "all 0.2s",
            }}>Income</button>
          </div>
        </div>

        {segments.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 0" }}>
            <GhostPie size={72} />
            <div style={{ fontWeight: 700, fontSize: 18, color: TEXT, marginTop: 18, marginBottom: 6 }}>
              No {txType === "expense" ? "Expenses" : "Income"}
            </div>
            <div style={{ color: SUB, fontSize: 16 }}>No records for this period</div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <DonutChart segments={segments} size={280} hole={170} currency={currency} activeName={selectedSeg?.name ?? null} onSelect={setSelectedSeg} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {segments.map((seg, i) => {
                const pct = total > 0 ? (seg.value / total) * 100 : 0;
                const isActive = selectedSeg?.name === seg.name;
                return (
                  <div key={i} onClick={() => setSelectedSeg(isActive ? null : seg)} style={{
                    display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
                    opacity: selectedSeg && !isActive ? 0.45 : 1, transition: "opacity 0.2s",
                  }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${seg.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CatIcon name={seg.icon} color={seg.color} size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{seg.name}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: seg.color, marginLeft: 8, flexShrink: 0 }}>{fmtAmt(seg.value, currency)}</span>
                      </div>
                      <div style={{ height: 5, background: BORDER, borderRadius: 100, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: seg.color, borderRadius: 100, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 15, color: SUB, flexShrink: 0, width: 40, textAlign: "right" }}>{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
       </div>
      </div>

      {/* Slice detail / tap-a-slice card */}
      <AnimatedCard>
        {selectedSeg ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${selectedSeg.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CatIcon name={selectedSeg.icon} color={selectedSeg.color} size={16} />
              </div>
              <span style={{ fontWeight: 700, color: TEXT, fontSize: 18 }}>{selectedSeg.name}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: selectedSeg.color }}>{fmtAmt(selectedSeg.value, currency)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {segTxs.map(tx => (
                <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: CARD2, borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{tx.sub_category || tx.parent_category}</div>
                    {tx.notes ? <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>{tx.notes}</div> : null}
                    <div style={{ fontSize: 14, color: SUB, marginTop: 2 }}>{fmtDate(tx.created_at)}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: tx.type === "expense" ? RED : GREEN }}>
                    {tx.type === "expense" ? "-" : "+"}{fmtAmt(tx.amount, currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "14px 0" }}>
            <GhostPie size={52} />
            <span style={{ color: SUB, fontSize: 16 }}>Tap a slice to see transactions</span>
          </div>
        )}
      </AnimatedCard>

    </div>
  );
}

/* ─── SearchTab ──────────────────────────────────────────────────────────── */
type SearchField = "sub_category" | "notes" | "amount";
const LIST_EASE = [0.2, 0.8, 0.2, 1] as const;
type SortKey = "newest" | "oldest" | "amount_desc" | "amount_asc";
const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "amount_desc", label: "Amount: high to low" },
  { id: "amount_asc", label: "Amount: low to high" },
];
/* Words used to tell people what each search chip looks through */
const FIELD_HINTS: Record<SearchField, string[]> = {
  sub_category: ["category", "subcategory"],
  notes: ["note"],
  amount: ["amount"],
};
const joinOr = (w: string[]) => (w.length <= 1 ? w.join("") : `${w.slice(0, -1).join(", ")} or ${w[w.length - 1]}`);
function SearchTab({ txs, currency, onTxClick }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void }) {
  const SEARCH_CHIPS: { id: SearchField; label: string; Icon: React.FC<IP> }[] = [
    { id: "sub_category", label: "Category", Icon: IcoTag },
    { id: "notes", label: "Notes", Icon: IcoDoc },
    { id: "amount", label: "Amount", Icon: IcoCash },
  ];
  const [query, setQuery] = useState("");
  /* empty set = "All" (search every field); otherwise restrict to picked fields */
  const [fields, setFields] = useState<Set<SearchField>>(new Set());
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortOpen, setSortOpen] = useState(false);
  /* Optional single-day filter picked from the mini calendar */
  const dates = useDateSelection(null);
  const dateFilter = dates.sel;
  const [calOpen, setCalOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const openCal = () => {
    const base = dateFilter?.start ?? new Date();
    setCalYear(base.getFullYear()); setCalMonth(base.getMonth());
    setSortOpen(false);
    if (calOpen) dates.settle();
    setCalOpen((o) => !o);
  };
  const closeCal = () => { setCalOpen(false); dates.settle(); };
  const shiftCal = (n: number) => {
    const d = new Date(calYear, calMonth + n, 1);
    setCalYear(d.getFullYear()); setCalMonth(d.getMonth());
  };

  useEffect(() => {
    if (!sortOpen && !calOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setSortOpen(false); setCalOpen(false); dates.settle(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortOpen, calOpen]);

  const toggleField = (f: SearchField) => {
    setFields((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else next.add(f);
      /* picking every field collapses back to "All" */
      if (next.size === SEARCH_CHIPS.length) return new Set<SearchField>();
      return next;
    });
  };

  const results = useMemo(() => {
    const q = query.toLowerCase();
    const active: SearchField[] = fields.size ? [...fields] : SEARCH_CHIPS.map((c) => c.id);
    return txs.filter((tx) => {
      if (dateFilter && !inDateSel(tx.created_at, dateFilter)) return false;
      if (!q) return true;
      return active.some((f) => {
        if (f === "sub_category") return (tx.sub_category?.toLowerCase().includes(q)) || (tx.parent_category?.toLowerCase().includes(q));
        if (f === "notes") return tx.notes?.toLowerCase().includes(q);
        return tx.amount.toString().includes(q);
      });
    }).sort((a, b) => {
      const byDate = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return -byDate;
      if (sort === "amount_desc") return b.amount - a.amount || byDate;
      if (sort === "amount_asc") return a.amount - b.amount || byDate;
      return byDate;
    });
  }, [txs, query, fields, sort, dateFilter]);

  const allActive = fields.size === 0;

  // Rows expand/collapse in place so the list reflows smoothly while typing
  const reduceMotion = useReducedMotion();
  const tween = { duration: 0.3, ease: LIST_EASE };
  const fade = { duration: 0.2, ease: "easeOut" as const };
  const collapse = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: reduceMotion ? { duration: 0 } : { height: tween, layout: tween, opacity: fade },
  };
  // Grid cards scale in/out while the remaining cards glide to their new cells
  const pop = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
    transition: reduceMotion ? { duration: 0 } : { scale: tween, layout: tween, opacity: fade },
  };

  const hintWords = SEARCH_CHIPS.filter((c) => allActive || fields.has(c.id)).flatMap((c) => FIELD_HINTS[c.id]);
  const placeholder = `Search by ${joinOr(hintWords)}…`;
  const sortLabel = SORT_OPTIONS.find((o) => o.id === sort)?.label ?? "";

  return (
    <div>
      <h2 style={{ color: TEXT, margin: "0 0 20px", fontSize: 28, fontWeight: 800 }}>Search</h2>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: SUB, pointerEvents: "none" }}>
          <IcoSearch size={17} />
        </div>
        <input
          type="text" placeholder={placeholder} aria-label={placeholder} value={query} autoFocus
          onChange={(e) => setQuery(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 44 }}
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ ...btnReset, position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            <IcoX size={16} color={SUB} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFields(new Set())} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 15px", borderRadius: 100, fontSize: 16, fontWeight: 600,
          background: allActive ? aTint(10) : CARD,
          border: `1px solid ${allActive ? ACCENT : BORDER}`,
          color: allActive ? ACCENT : SUB, cursor: "pointer",
        }}><IcoFlash size={13} /> All</button>
        {SEARCH_CHIPS.map((c) => {
          const on = fields.has(c.id);
          return (
            <button key={c.id} onClick={() => toggleField(c.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 15px", borderRadius: 100, fontSize: 16, fontWeight: 600,
              background: on ? aTint(10) : CARD,
              border: `1px solid ${on ? ACCENT : BORDER}`,
              color: on ? ACCENT : SUB, cursor: "pointer",
            }}><c.Icon size={13} /> {c.label}</button>
          );
        })}
        {/* Date filter (mini calendar) */}
        <div style={{ position: "relative", display: "flex" }}>
          {(() => {
            const on = !!dateFilter || calOpen;
            return (
              <div style={{
                display: "flex", alignItems: "center", borderRadius: 100,
                background: on ? aTint(10) : CARD, border: `1px solid ${on ? ACCENT : BORDER}`, color: on ? ACCENT : SUB,
              }}>
                <button onClick={openCal} aria-haspopup="dialog" aria-expanded={calOpen} style={{
                  display: "flex", alignItems: "center", gap: 6, height: "100%",
                  padding: dateFilter ? "7px 4px 7px 15px" : "7px 15px", borderRadius: 100,
                  background: "transparent", border: "none", color: "inherit", fontSize: 16, fontWeight: 600, cursor: "pointer",
                }}>
                  <IcoCalendar size={13} /> {dateFilter ? fmtDateSel(dateFilter) : "Date"}
                </button>
                {dateFilter && (
                  <button onClick={dates.clear} aria-label="Clear date filter" title="Clear date" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, marginRight: 6,
                    borderRadius: "50%", background: "transparent", border: "none", color: "inherit", cursor: "pointer",
                  }}>
                    <IcoX size={13} />
                  </button>
                )}
              </div>
            );
          })()}
          {calOpen && <div onClick={closeCal} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}
          <AnimatePresence>
            {calOpen && (
              <motion.div role="dialog" aria-label="Filter by date"
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                style={{
                  position: "absolute", left: 0, top: "calc(100% + 8px)", width: 340, maxWidth: "calc(100vw - 32px)",
                  zIndex: 21, borderRadius: 18, boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                }}>
                <MiniCalendar
                  year={calYear} month={calMonth} transactions={txs}
                  selection={dateFilter} pending={dates.pending} mode={dates.mode} onModeChange={dates.setMode}
                  onSelectDay={(d) => { if (dates.pick(d)) setCalOpen(false); }}
                  onPrevMonth={() => shiftCal(-1)} onNextMonth={() => shiftCal(1)}
                  onJump={(y, m) => { setCalYear(y); setCalMonth(m); }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: SUB, fontSize: 15 }}>{results.length} result{results.length !== 1 ? "s" : ""}</span>

          {/* Sort */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { closeCal(); setSortOpen((o) => !o); }} aria-haspopup="listbox" aria-expanded={sortOpen} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              minWidth: 226, height: 38, padding: "0 14px", borderRadius: 12,
              background: sortOpen ? aTint(10) : CARD, border: `1px solid ${sortOpen ? ACCENT : BORDER}`,
              color: sortOpen ? ACCENT : TEXT, fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IcoSort size={15} /> {sortLabel}</span>
              <span style={{ display: "flex", transform: sortOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}><IcoChevDown size={15} /></span>
            </button>
            {sortOpen && <div onClick={() => setSortOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }} />}
            <AnimatePresence>
              {sortOpen && (
                <motion.div role="listbox" aria-label="Sort results"
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={reduceMotion ? { duration: 0 } : { duration: 0.16, ease: "easeOut" }}
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", width: 240, zIndex: 21,
                    background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 6,
                    boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
                  }}>
                  {SORT_OPTIONS.map((o) => {
                    const on = sort === o.id;
                    return (
                      <button key={o.id} role="option" aria-selected={on} className="montra-opt"
                        onClick={() => { setSort(o.id); setSortOpen(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "11px 12px", borderRadius: 10, border: "none", textAlign: "left", cursor: "pointer",
                          background: on ? aTint(12) : undefined, color: on ? ACCENT : TEXT, fontSize: 15, fontWeight: on ? 700 : 500,
                        }}>
                        {o.label}
                        {on && <IcoCheck size={15} />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* List / grid */}
          <div role="group" aria-label="Layout" style={{ display: "flex", gap: 2, padding: 3, borderRadius: 12, background: CARD, border: `1px solid ${BORDER}` }}>
            {([["list", "List view", IcoList], ["grid", "Grid view", IcoGrid]] as const).map(([id, label, Icon]) => {
              const on = view === id;
              return (
                <button key={id} onClick={() => setView(id)} aria-pressed={on} aria-label={label} title={label} style={{
                  width: 38, height: 30, borderRadius: 9, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: on ? aTint(14) : "transparent", color: on ? ACCENT : SUB,
                }}>
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {results.length === 0 && (
          <motion.div key="empty" {...collapse} style={{ overflow: "hidden" }}>
            {/* fills the space under the toolbar so the message sits in the middle of the page */}
            <div style={{
              minHeight: "calc(100vh - 300px)", padding: "20px 0", color: SUB, textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10, opacity: 0.35 }}><IcoSearch size={44} color={SUB} /></div>
              <div style={{ fontWeight: 600, color: TEXT, marginBottom: 6 }}>{query || dateFilter ? "No results" : "Try searching"}</div>
              <div style={{ fontSize: 16 }}>
                {query
                  ? `Nothing matched "${query}"${dateFilter ? ` ${isRange(dateFilter) ? "for" : "on"} ${fmtDateSel(dateFilter)}` : ""}`
                  : dateFilter
                  ? `No transactions ${isRange(dateFilter) ? "for" : "on"} ${fmtDateSel(dateFilter)}.`
                  : `Search by ${joinOr(SEARCH_CHIPS.flatMap((c) => FIELD_HINTS[c.id]))}.`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === "list" ? (
        <div key="list" className="montra-tab">
          <AnimatePresence initial={false}>
            {results.map((tx) => (
              <motion.div key={tx.id} layout="position" {...collapse} style={{ overflow: "hidden", margin: "0 -3px" }}>
                {/* padding keeps focus outlines visible inside the clipped wrapper */}
                <div style={{ padding: "3px 3px 5px" }}>
                  <TxRow tx={tx} currency={currency} onClick={() => onTxClick(tx)} showDate />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div key="grid" className="montra-tab" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
          <AnimatePresence initial={false} mode="popLayout">
            {results.map((tx) => (
              <motion.div key={tx.id} layout {...pop}>
                <TxCard tx={tx} currency={currency} onClick={() => onTxClick(tx)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ─── SettingsTab ────────────────────────────────────────────────────────── */
type SettingsSection = "appearance" | "language" | "currency" | "account" | "data" | "about";

function SettingsTab({ settings, onSave, onClear, txCount, user, onRefresh }: {
  settings: Settings; onSave: (s: Settings) => void; onClear: () => void; txCount: number;
  user: User | null; onRefresh?: () => void;
}) {
  const [section, setSection] = useState<SettingsSection>("appearance");
  const [confirmClear, setConfirmClear] = useState(false);

  const currencies = [
    { code: "₱", name: "Philippine Peso (PHP)", enabled: true },
    { code: "$", name: "US Dollar (USD)", enabled: false },
    { code: "€", name: "Euro (EUR)", enabled: false },
  ];

  const navItems: { id: SettingsSection; label: string; Icon: React.FC<IP> }[] = [
    { id: "appearance", label: "Appearance", Icon: IcoPalette },
    { id: "language", label: "Language", Icon: IcoGlobe },
    { id: "currency", label: "Currency", Icon: IcoWallet },
    ...(user ? [{ id: "account" as SettingsSection, label: "Account", Icon: IcoUser }] : []),
    { id: "data", label: "Data", Icon: IcoDoc },
    { id: "about", label: "About", Icon: IcoHelp },
  ];

  const sectionHead = (title: string, sub: string) => (
    <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
      <h3 style={{ margin: 0, color: TEXT, fontSize: 18, fontWeight: 800 }}>{title}</h3>
      <p style={{ margin: "5px 0 0", color: SUB, fontSize: 16 }}>{sub}</p>
    </div>
  );

  const fieldLabel = (label: string) => (
    <div style={{ fontSize: 14, fontWeight: 800, color: SUB, letterSpacing: "0.08em", marginBottom: 10 }}>{label}</div>
  );

  return (
    <div className="montra-settings" style={{ display: "flex", gap: 0, minHeight: 500 }}>
      {/* ── Sidebar nav ── */}
      <div className="montra-settings-nav" style={{ width: 220, flexShrink: 0 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 800, color: TEXT }}>Settings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map(item => {
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "12px 14px", borderRadius: 10,
                background: active ? aTint(14) : "transparent",
                color: active ? ACCENT : SUB,
                border: "none", fontWeight: active ? 700 : 500, fontSize: 16,
                cursor: "pointer", textAlign: "left" as const,
                transition: "background 0.15s, color 0.15s",
              }}>
                <item.Icon size={16} color={active ? ACCENT : SUB} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Vertical divider ── */}
      <div style={{ width: 1, background: BORDER, margin: "0 32px", flexShrink: 0 }} />

      {/* ── Content panel ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* APPEARANCE */}
        {section === "appearance" && (
          <div>
            {sectionHead("Appearance", "Customize how Montra looks on your device.")}

            <div style={{ marginBottom: 28 }}>
              {fieldLabel("THEME")}
              <div style={{ display: "flex", gap: 12 }}>
                {([{ mode: "light" as ThemeMode, label: "Light", Icon: IcoSun }, { mode: "dark" as ThemeMode, label: "Dark", Icon: IcoMoon }]).map(({ mode, label, Icon }) => {
                  const on = settings.theme === mode;
                  return (
                    <button key={mode} onClick={() => onSave({ ...settings, theme: mode })} style={{
                      display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 10,
                      padding: "18px 0", borderRadius: 14, flex: 1,
                      background: on ? aTint(10) : CARD,
                      border: `2px solid ${on ? ACCENT : BORDER}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <Icon size={22} color={on ? ACCENT : SUB} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: on ? ACCENT : SUB }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              {fieldLabel("ACCENT COLOR")}
              <div style={{ display: "flex", gap: 10 }}>
                {ACCENT_THEMES.map((c) => {
                  const on = settings.accent === c.key;
                  return (
                    <button key={c.key} onClick={() => onSave({ ...settings, accent: c.key })} style={{
                      display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8,
                      padding: "14px 0", borderRadius: 12, flex: 1,
                      background: on ? `${c.key}15` : CARD,
                      border: `2px solid ${on ? c.key : BORDER}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.key }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: on ? c.key : SUB }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              {fieldLabel("TEXT SIZE")}
              <div style={{ display: "flex", gap: 10 }}>
                {([{ size: "small" as TextSize, label: "Small", px: 12 }, { size: "medium" as TextSize, label: "Medium", px: 16 }, { size: "large" as TextSize, label: "Large", px: 21 }]).map(({ size, label, px }) => {
                  const on = settings.textSize === size;
                  return (
                    <button key={size} onClick={() => onSave({ ...settings, textSize: size })} style={{
                      display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 8,
                      padding: "14px 0", borderRadius: 12, flex: 1,
                      background: on ? aTint(10) : CARD,
                      border: `2px solid ${on ? ACCENT : BORDER}`,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>
                      <span style={{ fontSize: px, fontWeight: 800, color: on ? ACCENT : SUB, lineHeight: 1 }}>Aa</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: on ? ACCENT : SUB }}>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* LANGUAGE */}
        {section === "language" && (
          <div>
            {sectionHead("Language", "Choose your preferred display language.")}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {([{ key: "english", label: "English", flag: "🇺🇸", sub: "United States", enabled: true }, { key: "filipino", label: "Filipino", flag: "🇵🇭", sub: "Philippines", enabled: false }] as const).map((l) => {
                const on = settings.language === l.key;
                return (
                  <div key={l.key} aria-disabled={!l.enabled} onClick={() => l.enabled && onSave({ ...settings, language: l.key })} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                    borderRadius: 13, cursor: l.enabled ? "pointer" : "not-allowed",
                    opacity: l.enabled ? 1 : 0.4,
                    background: on ? aTint(8) : CARD,
                    border: `2px solid ${on ? ACCENT : BORDER}`,
                    transition: "all 0.15s",
                  }}>
                    <span style={{ fontSize: 32 }}>{l.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: on ? ACCENT : TEXT }}>{l.label}</div>
                      <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>{l.sub}</div>
                    </div>
                    {!l.enabled && <span style={{ fontSize: 14, fontWeight: 600, color: SUB }}>Coming soon</span>}
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${on ? ACCENT : BORDER}`,
                      background: on ? ACCENT : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.15s",
                    }}>
                      {on && <IcoCheck size={10} color="#fff" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CURRENCY */}
        {section === "currency" && (
          <div>
            {sectionHead("Currency", "Choose the symbol displayed next to amounts.")}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currencies.map((c) => {
                const on = settings.currency === c.code;
                return (
                  <div key={c.code} aria-disabled={!c.enabled} onClick={() => c.enabled && onSave({ ...settings, currency: c.code })} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                    borderRadius: 12, cursor: c.enabled ? "pointer" : "not-allowed",
                    opacity: c.enabled ? 1 : 0.4,
                    background: on ? aTint(8) : CARD,
                    border: `1.5px solid ${on ? ACCENT : BORDER}`,
                    transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: on ? aTint(18) : CARD2,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: c.code.length > 1 ? 11 : 16, fontWeight: 800, color: on ? ACCENT : SUB,
                    }}>{c.code}</div>
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: on ? ACCENT : TEXT }}>{c.name}</span>
                    {!c.enabled && <span style={{ fontSize: 14, fontWeight: 600, color: SUB }}>Coming soon</span>}
                    {on && (
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IcoCheck size={10} color="#fff" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACCOUNT */}
        {section === "account" && user && (
          <div>
            {sectionHead("Account", "Manage your Montra account and sync settings.")}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: aTint(18), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {user.user_metadata?.avatar_url
                    ? <img src={user.user_metadata.avatar_url as string} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 24, fontWeight: 800, color: ACCENT }}>{(user.user_metadata?.full_name as string || user.email || "?")[0].toUpperCase()}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.user_metadata?.full_name as string || "Signed in"}</div>
                  <div style={{ fontSize: 16, color: SUB, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                </div>
                <button onClick={onRefresh} style={{
                  background: aTint(9), border: `1px solid ${aTint(27)}`, color: ACCENT,
                  borderRadius: 9, padding: "8px 16px", fontSize: 16, fontWeight: 600, cursor: "pointer", flexShrink: 0,
                }}>Sync now</button>
              </div>
            </div>
          </div>
        )}

        {/* DATA */}
        {section === "data" && (
          <div>
            {sectionHead("Data", "Your transactions are stored locally in this browser.")}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: SUB, marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>STORED TRANSACTIONS</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{txCount}</div>
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: aTint(12), display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcoDoc size={24} color={ACCENT} />
                </div>
              </div>
              <div style={{ fontSize: 15, color: SUB, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
                All data lives in your browser only. Nothing is sent to any server.
              </div>
            </div>
            <div style={{ background: "#FF6B6B0d", border: "1px solid #FF6B6B30", borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: RED, marginBottom: 6, letterSpacing: "0.04em" }}>DANGER ZONE</div>
              <div style={{ fontSize: 16, color: SUB, marginBottom: 16, lineHeight: 1.6 }}>
                Permanently delete all {txCount} transaction{txCount !== 1 ? "s" : ""}. This cannot be undone.
              </div>
              {!confirmClear ? (
                <button onClick={() => setConfirmClear(true)} style={{ ...dangerBtn, flex: "none" }}>Clear All Data</button>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setConfirmClear(false)} style={{ ...outlineBtn, flex: "none", padding: "10px 20px" }}>Cancel</button>
                  <button onClick={() => { onClear(); setConfirmClear(false); }} style={{ ...dangerBtn, flex: "none", background: RED, color: "#fff", border: "none" }}>
                    Delete All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABOUT */}
        {section === "about" && (
          <div>
            {sectionHead("About", "Montra — a simple personal finance tracker.")}
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 32, textAlign: "center", marginBottom: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: aTint(14), border: `2px solid ${aTint(28)}`, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcoWallet size={28} color={ACCENT} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 24, color: TEXT, marginBottom: 4 }}>Montra Web</div>
              <div style={{ fontSize: 15, color: SUB, marginBottom: 20 }}>Version 1.0 · Built with React + Supabase</div>
              <div style={{ fontSize: 16, color: SUB, lineHeight: 1.8, maxWidth: 320, margin: "0 auto" }}>
                Track your income and expenses with a clean, fast interface. All data is stored locally in your browser by default.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── ProfileTab ─────────────────────────────────────────────────────────── */
function ProfileTab({ txs, settings, onSave, user, isGuest, onSignOut, onOpenSettings }: {
  txs: Tx[]; settings: Settings; onSave: (s: Settings) => void; user: User | null;
  isGuest: boolean; onSignOut: () => void; onOpenSettings: () => void;
}) {
  const cur = settings.currency;
  const { income, spent } = useMemo(() => {
    let income = 0, spent = 0;
    txs.forEach((t) => { if (t.type === "income") income += t.amount; else spent += t.amount; });
    return { income, spent };
  }, [txs]);
  const balance = Math.abs(income - spent);

  const name = isGuest ? "Guest User" : ((user?.user_metadata?.full_name as string) || user?.email || "User");
  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const initials = isGuest ? "G" : name.charAt(0).toUpperCase();

  const stats = [
    { label: "Income", value: income, color: GREEN, Icon: IcoTrendUp },
    { label: "Spent", value: spent, color: RED, Icon: IcoTrendDown },
    { label: "Balance", value: balance, color: ACCENT, Icon: IcoWallet },
  ];

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 style={{ color: TEXT, textAlign: "center", margin: "0 0 24px", fontSize: 30, fontWeight: 800 }}>Profile</h2>

      {/* Identity card */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "18px 20px", marginBottom: 16 }}>
        {avatar ? (
          <img src={avatar} alt={name} style={{ width: 54, height: 54, borderRadius: 27, objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 54, height: 54, borderRadius: 27, background: aTint(15), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: ACCENT }}>{initials}</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6,
            padding: "4px 10px", borderRadius: 100, fontSize: 14, fontWeight: 700,
            background: isGuest ? "#FF6B6B12" : "#2ECC7115", color: isGuest ? RED : GREEN,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: isGuest ? RED : GREEN }} />
            {isGuest ? "Local only" : "Cloud synced"}
          </span>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {stats.map(({ label, value, color, Icon }) => (
          <div key={label} style={{ flex: 1, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "14px 12px" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: `${color === ACCENT ? aTint(15) : color + "22"}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
              <Icon size={15} color={color} />
            </span>
            <div style={{ fontSize: 16, fontWeight: 800, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtAmt(value, cur)}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: SUB, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Preferences */}
      <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Currency</div>
            <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>Symbol shown next to amounts</div>
          </div>
          <div style={{ display: "flex", gap: 3, background: CARD2, borderRadius: 9, padding: 3, border: `1px solid ${BORDER}` }}>
            {["₱", "$", "€"].map((c) => {
              const on = cur === c;
              const enabled = c === "₱";
              return (
                <button key={c} disabled={!enabled} onClick={() => enabled && onSave({ ...settings, currency: c })}
                  style={{
                    minWidth: 30, padding: "5px 10px", borderRadius: 7, cursor: enabled ? "pointer" : "not-allowed",
                    background: on ? SURFACE : "transparent", border: "none",
                    color: on ? ACCENT : SUB, fontWeight: 700, fontSize: 16,
                    opacity: enabled ? 1 : 0.3,
                  }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Account */}
      <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, marginBottom: 14, overflow: "hidden" }}>
        {isGuest && (
          <button onClick={onSignOut} style={profileRow}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: "#DB443515", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            </span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Link Google</div>
              <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>Save your data to the cloud</div>
            </div>
            <IcoChevR size={16} color={SUB} />
          </button>
        )}
        <button onClick={onOpenSettings} style={{ ...profileRow, borderBottom: "none" }}>
          <span style={{ width: 34, height: 34, borderRadius: 10, background: "#F5A62318", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcoHelp size={17} color="#F5A623" />
          </span>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>Preferences &amp; Support</div>
            <div style={{ fontSize: 15, color: SUB, marginTop: 2 }}>Theme, language, data &amp; more</div>
          </div>
          <IcoChevR size={16} color={SUB} />
        </button>
      </div>

      {/* Sign out */}
      <button onClick={onSignOut} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", padding: "14px", borderRadius: 14, marginTop: 4,
        background: "#FF6B6B0d", border: `1px solid ${RED}25`, color: RED,
        fontWeight: 700, fontSize: 16, cursor: "pointer",
      }}>
        <IcoLogout size={17} color={RED} /> {isGuest ? "Sign in" : "Sign out"}
      </button>

      <div style={{ textAlign: "center", fontSize: 14, color: SUB, marginTop: 20 }}>Montra · v1.0.0</div>
    </div>
  );
}
const profileRow: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, width: "100%",
  padding: "14px 16px", background: "none", border: "none",
  borderBottom: `1px solid ${BORDER}`, cursor: "pointer",
};

/* ─── Shared style helpers ────────────────────────────────────────────────── */
const btnReset: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", padding: 4,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const navBtnStyle: React.CSSProperties = {
  background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8,
  padding: "7px 10px",
};
const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 1000, backdropFilter: "blur(6px)",
};
const modalBox: React.CSSProperties = {
  background: CARD, borderRadius: 24, padding: 32, maxWidth: "90vw",
  border: `1px solid ${BORDER}`, position: "relative",
};
const fieldLabel: React.CSSProperties = {
  fontSize: 14, color: SUB, fontWeight: 700, letterSpacing: "0.07em",
  display: "block", marginBottom: 8,
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12,
  padding: "12px 14px", color: TEXT, fontSize: 16, outline: "none",
  boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  background: ACCENT, color: "#fff", border: "none", borderRadius: 12,
  padding: "12px 20px", fontWeight: 700, fontSize: 16, cursor: "pointer",
};
const outlineBtn: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${BORDER}`,
  background: SURFACE, color: TEXT, cursor: "pointer", fontWeight: 600, fontSize: 16,
};
const dangerBtn: React.CSSProperties = {
  flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${RED}55`,
  background: "#FF6B6B14", color: RED, cursor: "pointer", fontWeight: 600, fontSize: 16,
};

/* ─── DatePickerModal ────────────────────────────────────────────────────── */
function DatePickerModal({ value, onClose, onSelect }: { value: string; onClose: () => void; onSelect: (iso: string) => void }) {
  const [y0, m0, d0] = value.split("-").map(Number);
  const selected = new Date(y0, m0 - 1, d0);
  const [view, setView] = useState({ year: y0, month: m0 - 1 });
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const firstDay = new Date(view.year, view.month, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const atCurrentMonth = view.year === today.getFullYear() && view.month === today.getMonth();
  const shift = (n: number) => setView((v) => {
    const d = new Date(v.year, v.month + n, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const pick = (d: Date) => {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onSelect(iso);
    onClose();
  };
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modalBox, width: 460, padding: 32 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button onClick={() => shift(-1)} style={{ ...btnReset, padding: 8 }}><IcoChevLeft size={22} color={SUB} /></button>
          <span style={{ fontWeight: 800, color: TEXT, fontSize: 20 }}>{MONTHS[view.month]} {view.year}</span>
          <button onClick={() => !atCurrentMonth && shift(1)} disabled={atCurrentMonth} style={{ ...btnReset, padding: 8, opacity: atCurrentMonth ? 0.25 : 1, cursor: atCurrentMonth ? "not-allowed" : "pointer" }}>
            <IcoChevRight size={22} color={SUB} />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 10 }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, color: SUB, fontWeight: 700, paddingBottom: 4, letterSpacing: "0.04em" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const date = new Date(view.year, view.month, day);
            const future = date > todayStart;
            const isSel = sameDay(date, selected);
            const isToday = sameDay(date, today);
            return (
              <button key={i} disabled={future} onClick={() => pick(date)} style={{
                aspectRatio: "1", borderRadius: 12, padding: 0, fontSize: 16,
                fontWeight: isSel || isToday ? 700 : 500,
                background: isSel ? ACCENT : isToday ? aTint(9) : "transparent",
                border: isToday && !isSel ? `1px solid ${aTint(33)}` : "none",
                color: isSel ? "#fff" : isToday ? ACCENT : TEXT,
                opacity: future ? 0.25 : 1, cursor: future ? "not-allowed" : "pointer",
              }}>{day}</button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <button onClick={() => pick(todayStart)} style={{ ...outlineBtn, padding: 14, fontSize: 15 }}>Today</button>
          <button onClick={onClose} style={{ ...outlineBtn, padding: 14, fontSize: 15 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ message }: { message: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28, zIndex: 2000,
      background: ACCENT, color: "#fff", padding: "12px 20px", borderRadius: 14,
      fontWeight: 700, fontSize: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", gap: 8,
      animation: "slideUp 0.2s ease",
    }}>
      <IcoCheck size={16} color="#fff" />
      {message}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
type Tab = "home" | "add" | "analytics" | "search" | "profile" | "settings";

/* ─── LoginScreen ────────────────────────────────────────────────────────── */
function LoginScreen({ onGuest }: { onGuest: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: BG, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Inter, sans-serif",
    }}>
      <div style={{
        background: CARD, border: `1px solid ${BORDER}`, borderRadius: 28,
        padding: "48px 40px", width: 380, maxWidth: "90vw", textAlign: "center",
      }}>
        <img src={logoUrl} alt="Montra" style={{ width: 52, height: 52, objectFit: "contain", marginBottom: 16 }} />
        <h1 style={{ color: TEXT, fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>Montra Web</h1>
        <p style={{ color: SUB, fontSize: 16, margin: "0 0 36px", lineHeight: 1.5 }}>
          Sign in with the same account you use on the mobile app — your transactions will sync automatically.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14,
            background: "#fff", border: "none", cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            fontSize: 18, fontWeight: 700, color: "#111",
            opacity: loading ? 0.7 : 1, transition: "opacity 0.15s",
            marginBottom: 12,
          }}
        >
          {/* Google logo SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 12px" }}>
          <span style={{ flex: 1, height: 1, background: BORDER }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: SUB }}>or</span>
          <span style={{ flex: 1, height: 1, background: BORDER }} />
        </div>

        <button onClick={onGuest} style={{
          width: "100%", padding: "12px", borderRadius: 14,
          background: "transparent", border: `1px solid ${BORDER}`,
          color: SUB, fontSize: 16, fontWeight: 600, cursor: "pointer",
          transition: "border-color 0.15s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
        >
          Continue as Guest
        </button>

        {error && <p style={{ color: RED, fontSize: 15, marginTop: 14 }}>{error}</p>}

        <p style={{ color: SUB, fontSize: 14, marginTop: 24, lineHeight: 1.6 }}>
          Data syncs with your Montra mobile app via Supabase.
          Guest mode stores data locally in your browser only.
        </p>
      </div>

      <a href="#/" style={{
        position: "fixed", top: 20, left: 24, color: SUB, fontSize: 16,
        textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
      }}>
        <IcoArrowLeft size={14} color={SUB} /> Back to site
      </a>
    </div>
  );
}

/* ─── AppShell (authenticated) ───────────────────────────────────────────── */
function AppShell({ user, onSignOut }: { user: User | null; onSignOut: () => void }) {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [settings, setSettings] = useState<Settings>(loadSet);
  const [tab, setTab] = useState<Tab>("home");
  const homeCal = useHomeCalendar();
  const [detailTx, setDetailTx] = useState<Tx | null>(null);
  const [editTx, setEditTx] = useState<Tx | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loadingTx, setLoadingTx] = useState(!!user);

  const isGuest = !user;

  /* Persist settings */
  useEffect(() => { saveSet(settings); }, [settings]);

  /* Show toast helper */
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  /* ── Fetch transactions from Supabase (authenticated users) ── */
  const fetchFromSupabase = useCallback(async () => {
    if (!user) return;
    setLoadingTx(true);
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: Tx[] = data.map((r: Record<string, unknown>) => ({
        id: r.id as string,
        amount: r.amount as number,
        type: r.type as TxType,
        parent_category: (r.parent_category as string) || "",
        sub_category: (r.sub_category as string) || "",
        notes: (r.notes as string) || "",
        created_at: r.created_at as string,
        is_edited: Boolean(r.is_edited),
        last_edited_at: r.last_edited_at as string | null,
        original_amount: r.original_amount as number | null,
        original_notes: r.original_notes as string | null,
      }));
      setTransactions(mapped);
      saveTx(mapped);
    } else {
      /* Fall back to localStorage cache */
      setTransactions(loadTx());
    }
    setLoadingTx(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFromSupabase();
    } else {
      setTransactions(loadTx());
    }
  }, [user, fetchFromSupabase]);

  /* ── Add ── */
  const addTx = useCallback(async (tx: Tx) => {
    /* Optimistic */
    setTransactions((p) => [tx, ...p]);
    setTab("home");

    if (user) {
      const { error } = await supabase.from("transactions").insert([{
        id: tx.id,
        user_id: user.id,
        amount: tx.amount,
        type: tx.type,
        parent_category: tx.parent_category,
        sub_category: tx.sub_category || null,
        notes: tx.notes || null,
        created_at: tx.created_at,
        is_edited: false,
      }]);
      if (error) {
        console.error("[Supabase insert error]", error);
        showToast(`Error: ${error.message}`);
        saveTx([tx, ...loadTx()]);
      } else {
        showToast("Transaction saved!");
      }
    } else {
      saveTx([tx, ...loadTx()]);
      showToast("Transaction saved (local only — not signed in).");
    }
  }, [user, showToast]);

  /* ── Delete ── */
  const deleteTx = useCallback(async (id: string) => {
    setTransactions((p) => p.filter((t) => t.id !== id));
    setDetailTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      showToast(error ? "Deleted locally — sync failed." : "Transaction deleted.");
    } else {
      saveTx(loadTx().filter((t) => t.id !== id));
      showToast("Transaction deleted.");
    }
  }, [user, showToast]);

  /* ── Update ── */
  const updateTx = useCallback(async (updated: Tx) => {
    setTransactions((p) => p.map((t) => (t.id === updated.id ? updated : t)));
    setEditTx(null);
    if (user) {
      const { error } = await supabase.from("transactions").update({
        amount: updated.amount,
        notes: updated.notes,
        is_edited: true,
        last_edited_at: updated.last_edited_at,
        original_amount: updated.original_amount,
        original_notes: updated.original_notes,
      }).eq("id", updated.id);
      showToast(error ? "Updated locally — sync failed." : "Changes saved.");
    } else {
      showToast("Changes saved.");
    }
  }, [user, showToast]);

  const navItems: { id: Tab; label: string; Icon: React.FC<IP> }[] = [
    { id: "home", label: "Home", Icon: IcoHome },
    { id: "add", label: "Add", Icon: IcoPlus },
    { id: "analytics", label: "Analytics", Icon: IcoBarChart },
    { id: "search", label: "Search", Icon: IcoSearch },
    { id: "profile", label: "Profile", Icon: IcoUser },
    { id: "settings", label: "Settings", Icon: IcoSettings },
  ];

  const avatar = user?.user_metadata?.avatar_url as string | undefined;
  const name = (user?.user_metadata?.full_name as string) || user?.email || "Guest";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  const themeVars = { ...PALETTES[settings.theme], "--accent": settings.accent } as React.CSSProperties;

  return (
    <div style={{ ...themeVars, display: "flex", height: "100vh", background: BG, fontFamily: "Inter, sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <nav className="montra-nav" style={{ width: 268, background: SURFACE, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logoUrl} alt="Montra" style={{ width: 56, height: 56, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: TEXT, lineHeight: 1.1 }}>Montra</span>
              <span style={{ fontSize: 14, color: SUB }}>Web Edition</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{
                  display: "flex", alignItems: "center", gap: 11,
                  padding: "13px 16px", borderRadius: 12,
                  background: active ? aTint(14) : "transparent",
                  border: "none", cursor: "pointer", width: "100%", textAlign: "left",
                  color: active ? ACCENT : SUB,
                  fontWeight: active ? 700 : 500, fontSize: 16, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={20} color={active ? ACCENT : SUB} />
                <span className="montra-nav-label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* User + sign-out */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 6 }}>
          {/* User card */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: CARD }}>
            {avatar ? (
              <img src={avatar} alt={name} style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: aTint(19), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT }}>{isGuest ? "G" : initials}</span>
              </div>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{isGuest ? "Guest" : name.split(" ")[0]}</div>
              <div style={{ fontSize: 14, color: isGuest ? RED : ACCENT }}>{isGuest ? "Not signed in" : "Synced with Supabase"}</div>
            </div>
          </div>

          {/* Sign out / Sign in */}
          {isGuest ? (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: ACCENT, fontWeight: 600, gap: 8, justifyContent: "flex-start" }}>
              Sign in
            </button>
          ) : (
            <button onClick={onSignOut} style={{ ...btnReset, width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 16, color: SUB, fontWeight: 500, gap: 8, justifyContent: "flex-start" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = RED; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = SUB; }}
            >
              Sign out
            </button>
          )}

          <a href="#/" style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: SUB, fontSize: 16, fontWeight: 500 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = TEXT; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = SUB; }}
          >
            <IcoArrowLeft size={14} />
            Back to site
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="montra-main" style={{ flex: 1, overflow: "auto", padding: "44px 56px 56px", position: "relative", zoom: TEXT_SCALE[settings.textSize] } as React.CSSProperties}>
        {loadingTx ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16, color: SUB }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
            <span style={{ fontSize: 16 }}>Loading your transactions…</span>
          </div>
        ) : (
          <div key={tab} className="montra-tab" style={{ maxWidth: 1360, margin: "0 auto", width: "100%" }}>
            {tab === "home" && <HomeTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} cal={homeCal} />}
            {tab === "add" && <AddTab onAdd={addTx} />}
            {tab === "analytics" && <AnalyticsTab txs={transactions} currency={settings.currency} />}
            {tab === "search" && <SearchTab txs={transactions} currency={settings.currency} onTxClick={setDetailTx} />}
            {tab === "profile" && (
              <ProfileTab
                txs={transactions} settings={settings} onSave={setSettings}
                user={user} isGuest={isGuest} onSignOut={onSignOut}
                onOpenSettings={() => setTab("settings")}
              />
            )}
            {tab === "settings" && (
              <SettingsTab
                settings={settings} onSave={setSettings}
                onClear={async () => {
                  if (user) {
                    await supabase.from("transactions").delete().eq("user_id", user.id);
                  }
                  setTransactions([]);
                  saveTx([]);
                  showToast("All data cleared.");
                }}
                txCount={transactions.length}
                user={user}
                onRefresh={fetchFromSupabase}
              />
            )}
          </div>
        )}
      </main>

      {detailTx && (
        <TxDetailModal
          tx={detailTx} currency={settings.currency}
          onClose={() => setDetailTx(null)}
          onDelete={deleteTx}
          onEdit={(tx) => { setEditTx(tx); setDetailTx(null); }}
        />
      )}
      {editTx && (
        <EditModal
          tx={editTx} currency={settings.currency}
          onClose={() => setEditTx(null)}
          onSave={updateTx}
        />
      )}
      {toast && <Toast message={toast} />}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function WebApp() {
  const [session, setSession] = useState<Session | null | "loading">("loading");
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (session && session !== "loading") {
      await supabase.auth.signOut();
    }
    setGuestMode(false);
    setSession(null);
  };

  return (
    <>
      <style>{`
        .montra-root {
          --bg:#0d0d0d; --surface:#141414; --card:#1c1c1c; --card2:#222222;
          --border:#282828; --text:#f8f8f8; --sub:#b0b0b0; --accent:#27AE60;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1100px) {
          .montra-home { flex-direction: column !important; }
          .montra-home-left { width: 100% !important; }
          .montra-main { padding: 32px 28px 48px !important; }
        }
        @media (max-width: 860px) {
          .montra-nav { width: 76px !important; }
          .montra-nav-label { display: none; }
          .montra-nav button { justify-content: center !important; padding: 14px 0 !important; }
          .montra-nav > div:first-child { display: none !important; }
          .montra-nav > div:last-child > div { display: none !important; }
          .montra-nav > div:last-child button { font-size: 12px !important; justify-content: center !important; padding: 10px 0 !important; }
          .montra-nav > div:last-child a { font-size: 0 !important; justify-content: center !important; }
          .montra-nav > div { padding-left: 8px !important; padding-right: 8px !important; }
          .montra-settings { flex-direction: column !important; gap: 20px !important; }
          .montra-settings-nav { width: 100% !important; }
        }
        @media (max-width: 560px) { .montra-main { padding: 24px 16px 40px !important; } }
        @keyframes donutIn { from { opacity: 0; transform: rotate(-25deg) scale(0.92); } to { opacity: 1; transform: none; } }
        @keyframes popIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
        .montra-opt { background: transparent; } .montra-opt:hover { background: var(--card2); }
        .montra-pop { animation: popIn 0.22s cubic-bezier(.2,.8,.2,1) both; max-height: 92vh; overflow-y: auto; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .montra-tab { animation: fadeIn 0.28s ease both; }
        button { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease, transform 0.12s ease; }
        button:not(:disabled):active { transform: scale(0.97); }
        @media (prefers-reduced-motion: reduce) { .montra-tab, button { animation: none !important; transition: none !important; } }
        * { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type=number] { -moz-appearance: textfield; appearance: textfield; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>

      <div className="montra-root">
        {session === "loading" ? (
          <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${BORDER}`, borderTopColor: ACCENT, animation: "spin 0.8s linear infinite" }} />
          </div>
        ) : session || guestMode ? (
          <AppShell
            user={(session && typeof session !== "string") ? session.user : null}
            onSignOut={handleSignOut}
          />
        ) : (
          <LoginScreen onGuest={() => setGuestMode(true)} />
        )}
      </div>
    </>
  );
}
