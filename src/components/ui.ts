// Shared class strings for buttons and cards, and Persian digits.
export const btn =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
export const primary = `${btn} bg-accent text-on-accent hover:brightness-110`;
export const ghost = `${btn} border border-line hover:bg-fg/5`;
export const card = 'rounded-2xl border border-line bg-panel';
export const fa = (n: number) => n.toLocaleString('fa');
