// Shared class strings for buttons, cards and icons, and Persian digits.
// min-h-11 = 44px: the smallest comfortable touch target.
export const btn =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50';
export const primary = `${btn} bg-accent text-on-accent hover:brightness-110`;
export const ghost = `${btn} border border-line hover:bg-fg/5`;
export const outline = `${btn} border border-accent text-accent hover:bg-accent/10`;
/** Icon-only button: always give it an aria-label. */
export const iconBtn = 'flex size-11 items-center justify-center rounded-lg hover:bg-fg/10';
/** lucide icon next to text: sized with the text (em), never squashed by flex. */
export const ic = 'size-[1.15em] shrink-0';
export const card = 'rounded-lg border border-line bg-panel elev';
/** Hover feedback for clickable cards: pairs with {card}. No movement, so lists never jump. */
export const lift = 'transition-shadow duration-200 hover:elev-hi hover:border-accent/50';
/** Monospace meta tag, e.g. a language code. */
export const badge = 'rounded-md border border-line px-1.5 py-0.5 font-mono text-xs uppercase text-muted';
/** text-base (16px): smaller inputs make iOS Safari zoom the page on focus. */
export const field = 'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-base placeholder:text-muted focus:border-accent focus:outline-none';
export const fa = (n: number) => n.toLocaleString('fa');

const rtf = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });
/** "دیروز", "۳ روز پیش"... for a timestamp in ms; '' when there is none. */
export function ago(ms: number) {
  if (!ms) return '';
  const min = Math.round((ms - Date.now()) / 60_000);
  if (Math.abs(min) < 60) return min > -2 ? 'همین الان' : rtf.format(min, 'minute');
  const h = Math.round(min / 60);
  return Math.abs(h) < 24 ? rtf.format(h, 'hour') : rtf.format(Math.round(h / 24), 'day');
}
/** "فردا", "۴ روز دیگر" for a number of days ahead. */
export const inDays = (n: number) => (n <= 0 ? 'امروز' : rtf.format(n, 'day'));
/** "۴۵ دقیقه" or "حدود ۲ ساعت" for a rough duration. */
export const fmtMinutes = (min: number) => (min < 60 ? `${fa(Math.max(5, Math.round(min / 5) * 5))} دقیقه` : `حدود ${fa(Math.round((min / 60) * 2) / 2)} ساعت`);
