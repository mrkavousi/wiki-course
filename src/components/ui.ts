// Shared class strings for buttons, cards and icons, and Persian digits.
export const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
export const primary = `${btn} bg-accent text-on-accent hover:brightness-110`;
export const ghost = `${btn} border border-line hover:bg-fg/5`;
export const outline = `${btn} border border-accent text-accent hover:bg-accent/10`;
/** lucide icon next to text: sized with the text (em), never squashed by flex. */
export const ic = 'size-[1.15em] shrink-0';
export const card = 'rounded-2xl border border-line bg-panel elev';
/** Hover-lift for clickable cards: pairs with {card}. */
export const lift = 'transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:elev-hi';
/** Monospace meta tag, e.g. a language code. */
export const badge = 'rounded-md border border-line px-1.5 py-0.5 font-mono text-xs uppercase text-muted';
export const fa = (n: number) => n.toLocaleString('fa');
