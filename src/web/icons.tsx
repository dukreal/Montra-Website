/* eslint-disable react/only-export-components -- every icon is created with the ico() helper */
import { IoHome, IoRestaurant, IoBus, IoCart, IoGameController, IoMedical, IoSchool, IoCard, IoPeople, IoAirplane, IoWifi, IoWarning, IoBriefcase, IoLaptop, IoStorefront, IoTrendingUp, IoCash } from "react-icons/io5";

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

export function CatIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} />;
}

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
export type IP = { size?: number; color?: string };
const ico = (path: React.ReactNode) =>
  ({ size = 20, color = "currentColor" }: IP) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
export const IcoHome = ico(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></>);
export const IcoPlus = ico(<path d="M12 5v14M5 12h14"/>);
export const IcoBarChart = ico(<><path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-3"/></>);
export const IcoSearch = ico(<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>);
export const IcoSettings = ico(<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>);
export const IcoX = ico(<><path d="M18 6 6 18M6 6l12 12"/></>);
export const IcoChevLeft = ico(<path d="m15 18-6-6 6-6"/>);
export const IcoChevRight = ico(<path d="m9 18 6-6-6-6"/>);
export const IcoArrowLeft = ico(<><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></>);
export const IcoCheck = ico(<polyline points="20,6 9,17 4,12"/>);
export const IcoTag = ico(<><path d="M20.6 13.4 12 22l-9-9V3h10z"/><circle cx="7.5" cy="7.5" r="1.2"/></>);
export const IcoDoc = ico(<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></>);
export const IcoCash = ico(<><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></>);
export const IcoFlash = ico(<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>);
export const IcoUser = ico(<><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>);
export const IcoTrendUp = ico(<><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></>);
export const IcoTrendDown = ico(<><path d="M3 7l6 6 4-4 8 8"/><path d="M17 17h4v-4"/></>);
export const IcoWallet = ico(<><path d="M3 7a2 2 0 0 1 2-2h11v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="16.5" cy="13.5" r="1"/></>);
export const IcoHelp = ico(<><circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.6 1c0 2-3 2.5-3 4"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>);
export const IcoLogout = ico(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></>);
export const IcoChevR = ico(<path d="m9 18 6-6-6-6"/>);
export const IcoMoon = ico(<path d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8z"/>);
export const IcoSun = ico(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></>);
export const IcoPalette = ico(<><path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 2-2 0-1.5 1-2 2-2h2a3 3 0 0 0 3-3 8 8 0 0 0-9-9z"/></>);
export const IcoText = ico(<path d="M4 6V4h16v2M12 4v16M9 20h6"/>);
export const IcoCalendar = ico(<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>);
export const IcoChevDown = ico(<path d="m6 9 6 6 6-6"/>);
export const IcoSort = ico(<><path d="M7 20V4M3 8l4-4 4 4"/><path d="M17 4v16M13 16l4 4 4-4"/></>);
export const IcoList = ico(<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>);
export const IcoGrid = ico(<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>);
export const IcoGlobe = ico(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"/></>);
