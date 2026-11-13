/* The two "Advanced" switches in Settings. Both are on by default, so nothing changes until a switch is turned off. */
export const ADVANCED_OPTIONS: { key: "customDate" | "transactionDots"; title: string; sub: string }[] = [
  { key: "customDate", title: "Custom Date", sub: "Pick any past date when adding" },
  { key: "transactionDots", title: "Transaction Dots", sub: "Show dots on dates with transactions" },
];
