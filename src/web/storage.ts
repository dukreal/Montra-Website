import type { Settings, Tx } from "@/web/types";

/* ─── Storage ─────────────────────────────────────────────────────────────── */
export const TX_KEY = "montra-transactions";
export const SET_KEY = "montra-settings";
export const loadTx = (): Tx[] => {
  try {
    return JSON.parse(localStorage.getItem(TX_KEY) || "[]");
  } catch {
    return [];
  }
};
export const saveTx = (t: Tx[]) => localStorage.setItem(TX_KEY, JSON.stringify(t));
export const SET_DEFAULTS: Settings = { currency: "₱", theme: "dark", accent: "#27AE60", textSize: "medium", language: "english" };
export const loadSet = (): Settings => {
  try {
    return { ...SET_DEFAULTS, ...JSON.parse(localStorage.getItem(SET_KEY) || "{}") };
  } catch {
    return { ...SET_DEFAULTS };
  }
};
export const saveSet = (s: Settings) => localStorage.setItem(SET_KEY, JSON.stringify(s));
