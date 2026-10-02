import { alpha, readable } from '../color';
import { icon } from '../decor';
import { faDigits, sentences } from '../rtl';
import { accentOf, aboveFooter, chips, flow, footer, inner, merge, roundRect, type Rect } from '../shared';
import { truncateText } from '../textFit';
import type { Ctx, ShareData, ShareTemplate } from '../types';

const BG = '#F2F5F4';
const CARD = '#FFFFFF';
const HEAD = '#075E57';
const INK = '#14302B';
const TEXT = '#2A4039';
const MUTED = '#506962';

/** The article as a compact visual summary: up to four steps taken from its sentences, a quote and the source. */
function steps(body?: string): string[] {
  const s = sentences(body ?? '');
  if (s.length <= 4) return s.map((t) => truncateText(t, 120));
  const per = Math.ceil(s.length / 4);
  return Array.from({ length: 4 }, (_, i) => truncateText(s.slice(i * per, i * per + per).join(' '), 120)).filter(Boolean);
}
const host = (u?: string) => {
  try {
    return u ? new URL(u).host : '';
  } catch {
    return '';
  }
};

/** 10. Structured information design: title band, a vertical timeline with numbered nodes, a quote card, a source card. */
export const infographicSummary: ShareTemplate = {
  id: 'infographic',
  name: 'خلاصه‌ی اینفوگرافیک',
  accent: '#0E8F86',
  palette: { surfaces: [CARD, BG], text: TEXT, muted: MUTED, inverse: { surfaces: [HEAD], text: '#FFFFFF', muted: '#D5ECE8' } },
  draw(c: Ctx, d: ShareData, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#0E8F86');
    const ink = readable(accent, CARD);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    const area = inner(f, f.pad * 0.8);
    footer(c, d, f, a, area, { color: INK, muted: MUTED, align: 'center' });
    const box = aboveFooter(area, f, d, 22);

    // header band with the title
    const hasBelow = !!(d.body || d.quote);
    const bandH = hasBelow ? Math.min(box.h * 0.33, 360 * u) : box.h;
    const band: Rect = { x: box.x, y: box.y, w: box.w, h: bandH };
    roundRect(c, band, 40 * u);
    c.fillStyle = HEAD;
    c.fill();
    const pad = 36 * u;
    let ty = band.y + pad;
    const ch = band.h > 300 * u ? chips(c, d, f, band.x + pad, ty, band.w - 2 * pad, { fill: 'rgba(255,255,255,0.14)', text: '#FFFFFF', border: 'rgba(255,255,255,0.4)' }) : 0;
    ty += ch ? ch + 18 * u : 0;
    const r1 = flow(c, { ...d, body: undefined, quote: undefined }, f, { x: band.x + pad, y: ty, w: band.w - 2 * pad, h: band.y + band.h - pad - ty }, { title: { color: '#FFFFFF', size: 76 } }, { valign: 'center' });

    let rest: Rect = { x: box.x, y: band.y + band.h + 24 * u, w: box.w, h: box.y + box.h - band.y - band.h - 24 * u };
    // source card at the bottom, quote card above it
    const srcH = d.sourceTitle || d.sourceUrl ? 110 * u : 0;
    const quoteH = d.quote ? Math.min(rest.h * 0.3, 240 * u) : 0;
    const reps = [r1];
    if (srcH) {
      const r: Rect = { x: rest.x, y: rest.y + rest.h - srcH, w: rest.w, h: srcH };
      roundRect(c, r, 28 * u);
      c.fillStyle = CARD;
      c.fill();
      c.strokeStyle = alpha(accent, 0.35);
      c.lineWidth = 2 * u;
      c.stroke();
      icon(c, 'link', r.x + r.w - 40 * u - 46 * u, r.y + srcH / 2 - 23 * u, 46 * u, ink);
      c.textAlign = 'right';
      c.direction = 'rtl';
      c.fillStyle = INK;
      c.font = `700 ${Math.round(28 * u)}px Vazirmatn, sans-serif`;
      c.fillText(truncateText(d.sourceTitle ? `منبع: ${d.sourceTitle}` : 'منبع', 52), r.x + r.w - 110 * u, r.y + srcH / 2 - 4 * u);
      c.fillStyle = MUTED;
      c.font = `500 ${Math.round(24 * u)}px Vazirmatn, sans-serif`;
      c.direction = 'ltr';
      c.textAlign = 'right';
      c.fillText(host(d.sourceUrl) || 'wikipedia.org', r.x + r.w - 110 * u, r.y + srcH / 2 + 30 * u);
      rest = { ...rest, h: rest.h - srcH - 20 * u };
    }
    if (quoteH) {
      const r: Rect = { x: rest.x, y: rest.y + rest.h - quoteH, w: rest.w, h: quoteH };
      roundRect(c, r, 28 * u);
      c.fillStyle = alpha(accent, 0.12);
      c.fill();
      icon(c, 'quote', r.x + r.w - 38 * u - 44 * u, r.y + 28 * u, 44 * u, ink);
      reps.push(flow(c, d, f, { x: r.x + 36 * u, y: r.y + 24 * u, w: r.w - 36 * u - 110 * u, h: r.h - 48 * u }, { quote: { color: INK, size: 34, min: 26, weight: 600 } }, { order: ['quote'], valign: 'center' }));
      rest = { ...rest, h: rest.h - quoteH - 20 * u };
    }
    // timeline
    const gap = 18 * u;
    const fits = Math.max(0, Math.floor((rest.h + gap) / (104 * u + gap))); // a card needs room for two lines of text
    const all = steps(d.body);
    const list = all.slice(0, fits);
    const cutSteps = list.length < all.length || list.some((t) => t.endsWith('…')); // the summary is shorter than the text
    if (list.length) {
      const h = Math.min((rest.h - gap * (list.length - 1)) / list.length, 190 * u);
      const total = h * list.length + gap * (list.length - 1);
      const y0 = rest.y + Math.max(0, (rest.h - total) / 2);
      const nodeX = rest.x + rest.w - 36 * u;
      c.strokeStyle = alpha(accent, 0.4);
      c.lineWidth = 4 * u;
      c.beginPath();
      c.moveTo(nodeX, y0 + h / 2);
      c.lineTo(nodeX, y0 + total - h / 2);
      c.stroke();
      list.forEach((t, i) => {
        const y = y0 + i * (h + gap);
        const card: Rect = { x: rest.x, y, w: rest.w - 92 * u, h };
        roundRect(c, card, 24 * u);
        c.fillStyle = CARD;
        c.fill();
        c.strokeStyle = alpha(accent, 0.22);
        c.lineWidth = 1.5 * u;
        c.stroke();
        c.beginPath();
        c.arc(nodeX, y + h / 2, 28 * u, 0, Math.PI * 2);
        c.fillStyle = accent;
        c.fill();
        c.fillStyle = '#FFFFFF';
        c.font = `800 ${Math.round(28 * u)}px Vazirmatn, sans-serif`;
        c.direction = 'rtl';
        c.textAlign = 'center';
        c.fillText(faDigits(i + 1), nodeX, y + h / 2 + 10 * u);
        const rep = flow(c, { ...d, title: t, body: undefined, quote: undefined }, f, { x: card.x + 28 * u, y: card.y + 16 * u, w: card.w - 56 * u, h: card.h - 32 * u }, { title: { color: TEXT, size: 36, min: 26, weight: 600, lh: 1.6, maxLines: Math.max(1, Math.floor((card.h - 32 * u) / (26 * u * 1.6))) } }, { valign: 'center' });
        reps.push(rep);
      });
    }
    return merge(...reps, { truncated: cutSteps, overflow: false, minFontPx: Infinity, usedImage: false });
  },
};
