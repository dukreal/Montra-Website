import { useState, useEffect, useMemo } from "react";
import { useReducedMotion, AnimatePresence, motion } from "motion/react";
import { IoCash } from "react-icons/io5";
import { fmtDate, fmtTime, inDateSel, fmtDateSel, isRange } from "@/web/dates";
import { getCat, fmtAmt } from "@/web/helpers";
import { inputStyle, btnReset } from "@/web/styles";
import { RED, GREEN, CARD2, CARD, BORDER, SUB, TEXT, aTint, ACCENT } from "@/web/theme";
import type { Tx } from "@/web/types";
import { MiniCalendar } from "@/web/components/MiniCalendar";
import { TxRow } from "@/web/components/TxRow";
import { useDateSelection } from "@/web/hooks";
import { CatIcon, IcoTag, IcoDoc, IcoCash, IcoSearch, IcoX, IcoFlash, IcoCalendar, IcoSort, IcoChevDown, IcoCheck, IcoList, IcoGrid } from "@/web/icons";
import type { IP } from "@/web/icons";

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
export function SearchTab({ txs, currency, onTxClick }: { txs: Tx[]; currency: string; onTxClick: (tx: Tx) => void }) {
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
