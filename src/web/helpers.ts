import { CATS } from "@/web/categories";
import type { TxType } from "@/web/types";

export function fmtAmt(n: number, cur: string) {
  return `${cur}${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCat(type: TxType, name: string) {
  return CATS[type].find((c) => c.name === name);
}
