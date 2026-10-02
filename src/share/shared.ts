// Pieces every template builds on: text flow, logo and source footer, chips, cover image, paper noise. Templates only choose colours and composition.
import { alpha, readable } from './color';
import { isRtl } from './rtl';
import { fitBlocks, wrapLines, withEllipsis, calculateFontSize, type Block, type Fit } from './textFit';
import type { Assets, Ctx, Frame, Report, ShareData } from './types';

export const FONT = 'Vazirmatn, ui-sans-serif, system-ui, Tahoma, Arial, sans-serif';
export const font = (weight: number, px: number) => `${weight} ${px}px ${FONT}`;
export type Rect = { x: number; y: number; w: number; h: number };

export const measurer = (c: Ctx, rtl = true) => (text: string, weight: number, size: number) => {
  c.font = font(weight, size);
  c.direction = rtl ? 'rtl' : 'ltr';
  return c.measureText(text).width;
};

export const emptyReport = (): Report => ({ truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
export function merge(...rs: Report[]): Report {
  return rs.reduce((a, r) => ({ truncated: a.truncated || r.truncated, overflow: a.overflow || r.overflow, minFontPx: Math.min(a.minFontPx, r.minFontPx), usedImage: a.usedImage || r.usedImage }));
}

/** The drawable area between the safe margins, inset by `inset` on every side. */
export const inner = (f: Frame, inset: number): Rect => ({ x: inset, y: f.safeTop + inset, w: f.w - 2 * inset, h: f.h - f.safeTop - f.safeBottom - 2 * inset });

export function roundRect(c: Ctx, r: Rect, radius: number) {
  c.beginPath();
  c.roundRect(r.x, r.y, r.w, r.h, radius);
}

// ---------- text flow ----------
export type Style = { color: string; weight?: number; size?: number; min?: number; lh?: number; maxLines?: number; gap?: number; align?: 'start' | 'center'; quotes?: boolean };
export type FlowSpec = { title?: Style; excerpt?: Style; quote?: Style; body?: Style };
const BASE = { title: { weight: 800, size: 88, min: 50, lh: 1.35, maxLines: 4, gap: 0 }, excerpt: { weight: 600, size: 44, min: 30, lh: 1.6, maxLines: 3, gap: 28 }, body: { weight: 500, size: 42, min: 28, lh: 1.85, maxLines: 99, gap: 32 }, quote: { weight: 600, size: 40, min: 28, lh: 1.65, maxLines: 5, gap: 36 } };

/** Draws title, excerpt, body and quote (in this order, only the ones present) inside `rect`, shrinking and cutting to fit. `before` runs ahead of a block so a template can draw something behind it (a bar, a panel). */
export function flow(
  c: Ctx,
  d: ShareData,
  f: Frame,
  rect: Rect,
  spec: FlowSpec,
  opt: { order?: (keyof FlowSpec)[]; before?: (id: string, box: Rect, rtl: boolean) => void; valign?: 'top' | 'center'; skip?: (keyof FlowSpec)[]; dry?: boolean } = {},
): Report & { bottom: number; fit: Fit } {
  const u = f.u;
  const text: Record<string, string | undefined> = { title: d.title, excerpt: d.excerpt, body: d.body, quote: d.quote && (spec.quote?.quotes === false ? d.quote : `«${d.quote.replace(/^«|»$/g, '')}»`) };
  const order = opt.order ?? ['title', 'excerpt', 'body', 'quote'];
  const blocks: Block[] = [];
  const styles: Record<string, Style> = {};
  for (const id of order) {
    const s = spec[id];
    const t = text[id]?.trim();
    if (!s || !t || opt.skip?.includes(id)) continue;
    const b = BASE[id];
    const size = id === 'title' ? calculateFontSize(t.length, (s.size ?? b.size) * u, (s.min ?? b.min) * u) : (s.size ?? b.size) * u;
    blocks.push({ id, text: t, weight: s.weight ?? b.weight, size, min: (s.min ?? b.min) * u, lh: s.lh ?? b.lh, maxLines: s.maxLines ?? b.maxLines, gap: (s.gap ?? b.gap) * u });
    styles[id] = s;
  }
  const rep = emptyReport();
  if (!blocks.length) return { ...rep, minFontPx: 0, bottom: rect.y, fit: { placed: [], total: 0, truncated: false, overflow: false, minFont: 0 } };
  const m = measurer(c);
  const fit = fitBlocks(m, blocks, rect.w, rect.h);
  const y0 = rect.y + (opt.valign === 'center' ? (rect.h - fit.total) / 2 : 0);
  if (opt.dry) return { ...rep, truncated: fit.truncated, overflow: fit.overflow, minFontPx: fit.minFont, bottom: y0 + fit.total, fit };
  c.textBaseline = 'alphabetic';
  for (const p of fit.placed) {
    const s = styles[p.id];
    const b = blocks.find((x) => x.id === p.id)!;
    const rtl = isRtl(b.text);
    const center = s.align === 'center';
    const x = center ? rect.x + rect.w / 2 : rtl ? rect.x + rect.w : rect.x;
    opt.before?.(p.id, { x: rect.x, y: y0 + p.top, w: rect.w, h: p.height }, rtl);
    c.font = font(b.weight, p.size);
    c.direction = rtl ? 'rtl' : 'ltr';
    c.textAlign = center ? 'center' : rtl ? 'right' : 'left';
    c.fillStyle = s.color;
    p.lines.forEach((l, i) => c.fillText(l, x, y0 + p.top + i * p.lh + p.lh / 2 + p.size * 0.32));
  }
  return { truncated: fit.truncated, overflow: fit.overflow, minFontPx: fit.minFont, usedImage: false, bottom: y0 + fit.total, fit };
}

// ---------- footer ----------
const sourceText = (d: ShareData) => `${d.sourceTitle ? `از مقاله‌ی «${d.sourceTitle}» در ویکی‌پدیا` : 'ویکی‌پدیا'} · CC BY-SA 4.0`;
export const footerHeight = (f: Frame, d: ShareData) => Math.round((d.coverCredit ? 190 : 156) * f.u);

/**
 * Logo, name and source line, pinned at the bottom of `area`. It owns its reserved height (`footerHeight`), so
 * the text above can never run into it. `align` places the logo row; the source line follows it.
 */
export function footer(c: Ctx, d: ShareData, f: Frame, a: Assets, area: Rect, o: { color: string; muted: string; align?: 'center' | 'start'; bg?: string }) {
  const u = f.u;
  const h = footerHeight(f, d);
  const top = area.y + area.h - h;
  const logo = Math.round(64 * u);
  c.direction = 'ltr';
  c.font = font(800, Math.round(36 * u));
  const nameW = c.measureText(d.brandName).width;
  const rowW = logo + 18 * u + nameW;
  const rtl = true;
  const startX = o.align === 'start' ? (rtl ? area.x + area.w - rowW : area.x) : area.x + (area.w - rowW) / 2;
  if (a.logo) c.drawImage(a.logo, startX, top, logo, logo);
  c.textAlign = 'left';
  c.textBaseline = 'alphabetic';
  c.fillStyle = o.color;
  c.fillText(d.brandName, startX + logo + 18 * u, top + logo / 2 + 36 * u * 0.34);
  const size = Math.round(25 * u);
  const m = measurer(c);
  const lines = [sourceText(d), ...(d.coverCredit ? [d.coverCredit] : [])];
  const maxW = area.w;
  c.fillStyle = o.muted;
  c.font = font(500, size);
  c.direction = 'rtl';
  c.textAlign = o.align === 'start' ? 'right' : 'center';
  let y = top + logo + 22 * u;
  lines.forEach((ln, i) => {
    const wrapped = wrapLines(ln, (s) => m(s, 500, size), maxW);
    const shown = i === 0 ? wrapped.slice(0, 2) : wrapped.slice(0, 1);
    if (wrapped.length > shown.length) shown[shown.length - 1] = withEllipsis(shown[shown.length - 1], (s) => m(s, 500, size), maxW);
    for (const s of shown) {
      y += size * 1.45;
      c.fillText(s, o.align === 'start' ? area.x + area.w : area.x + area.w / 2, y);
    }
  });
  return { top, h };
}

/** The area above the footer, with a little breathing room. */
export const aboveFooter = (area: Rect, f: Frame, d: ShareData, gap = 36): Rect => {
  const h = footerHeight(f, d) + Math.round(gap * f.u);
  return { x: area.x, y: area.y, w: area.w, h: Math.max(0, area.h - h) };
};

// ---------- chips ----------
/** Category and up to three tags in one row; whatever does not fit is dropped. Returns the row height (0 when there is nothing). */
export function chips(c: Ctx, d: ShareData, f: Frame, x: number, y: number, maxW: number, o: { fill: string; text: string; border?: string; size?: number }) {
  const items = [d.category, ...(d.tags ?? [])].filter((t): t is string => !!t?.trim()).slice(0, 4);
  if (!items.length) return 0;
  const size = Math.round((o.size ?? 26) * f.u);
  const h = Math.round(size * 1.9);
  const m = measurer(c);
  let right = x + maxW; // RTL: the row starts at the right edge
  c.textAlign = 'center';
  c.direction = 'rtl';
  c.textBaseline = 'alphabetic';
  for (const t of items) {
    const w = m(t, 600, size) + size * 1.6;
    if (right - w < x) break;
    roundRect(c, { x: right - w, y, w, h }, h / 2);
    c.fillStyle = o.fill;
    c.fill();
    if (o.border) {
      c.strokeStyle = o.border;
      c.lineWidth = 1.5 * f.u;
      c.stroke();
    }
    c.font = font(600, size);
    c.fillStyle = o.text;
    c.fillText(t, right - w / 2, y + h / 2 + size * 0.33);
    right -= w + size * 0.6;
  }
  return h;
}

// ---------- pictures ----------
/** Fills the rect with the picture, cropped to cover (centred), optionally with rounded corners. */
export function drawCover(c: Ctx, img: HTMLImageElement, r: Rect, radius = 0) {
  const s = Math.max(r.w / img.naturalWidth, r.h / img.naturalHeight);
  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;
  c.save();
  if (radius) {
    roundRect(c, r, radius);
    c.clip();
  } else {
    c.beginPath();
    c.rect(r.x, r.y, r.w, r.h);
    c.clip();
  }
  c.drawImage(img, r.x + (r.w - w) / 2, r.y + (r.h - h) / 2, w, h);
  c.restore();
}

/** A blurred copy of the picture: drawn tiny and scaled up, which blurs in every browser (ctx.filter is not everywhere). */
export function drawBlurred(c: Ctx, img: HTMLImageElement, r: Rect, strength = 40) {
  const k = document.createElement('canvas');
  k.width = Math.max(8, Math.round(r.w / strength));
  k.height = Math.max(8, Math.round(r.h / strength));
  const kc = k.getContext('2d')!;
  const s = Math.max(k.width / img.naturalWidth, k.height / img.naturalHeight);
  kc.drawImage(img, (k.width - img.naturalWidth * s) / 2, (k.height - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  c.save();
  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = 'high';
  c.drawImage(k, r.x, r.y, r.w, r.h);
  c.restore();
}

/** Soft blurred colour spots (x, y, radius as fractions of the width; hex colour; opacity): a background for when there is no picture. */
export function blobs(c: Ctx, f: Frame, spots: [x: number, y: number, r: number, color: string, a: number][]) {
  for (const [x, y, r, col, a] of spots) {
    const g = c.createRadialGradient(x * f.w, y * f.h, 0, x * f.w, y * f.h, r * f.w);
    g.addColorStop(0, alpha(col, a));
    g.addColorStop(1, alpha(col, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, f.w, f.h);
  }
}

/** Paper grain and a darkened edge. The seed is fixed so a preview and its export are the same picture. */
export function paperNoise(c: Ctx, f: Frame, tint: string, amount = 1) {
  let s = 1234567;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  c.save();
  const n = Math.round((f.w * f.h) / 520 * amount);
  for (let i = 0; i < n; i++) {
    c.fillStyle = alpha(tint, 0.03 + rnd() * 0.07);
    c.fillRect(rnd() * f.w, rnd() * f.h, 1 + rnd() * 2.2 * f.u, 1 + rnd() * 2.2 * f.u);
  }
  for (let i = 0; i < 90 * amount; i++) {
    c.strokeStyle = alpha(tint, 0.04);
    c.lineWidth = 1;
    const x = rnd() * f.w;
    const y = rnd() * f.h;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + (rnd() - 0.5) * 36 * f.u, y + (rnd() - 0.5) * 36 * f.u);
    c.stroke();
  }
  const g = c.createRadialGradient(f.w / 2, f.h / 2, f.h * 0.35, f.w / 2, f.h / 2, f.h * 0.8);
  g.addColorStop(0, alpha(tint, 0));
  g.addColorStop(1, alpha(tint, 0.18));
  c.fillStyle = g;
  c.fillRect(0, 0, f.w, f.h);
  c.restore();
}

export const accentOf = (d: ShareData, fallback: string) => d.accentColor || fallback;
export { alpha, readable };
