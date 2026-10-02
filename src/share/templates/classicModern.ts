import { alpha, readable } from '../color';
import { sprig } from '../decor';
import { accentOf, aboveFooter, chips, drawCover, flow, footer, inner, merge, type Rect } from '../shared';
import type { ShareTemplate } from '../types';

const BG = '#F7F3E8';
const INK = '#1E1E1E';
const MUTED = '#5A5648';

/** 1. Premium educational magazine: ivory page, charcoal type, one teal accent, a geometric sprig in the corner. */
export const classicModern: ShareTemplate = {
  id: 'classic',
  name: 'کلاسیک مدرن',
  accent: '#087F73',
  palette: { surfaces: [BG], text: INK, muted: MUTED },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#087F73');
    const ink = readable(accent, BG);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    const area = inner(f, f.pad);
    sprig(c, f.pad * 0.25, f.h - f.safeBottom - f.pad * 0.15, 300 * u, 0.55, alpha(accent, 0.14), alpha(accent, 0.28));
    footer(c, d, f, a, area, { color: INK, muted: MUTED, align: 'start' });
    let top = area.y;
    const chipH = chips(c, d, f, area.x, top, area.w, { fill: alpha(accent, 0.1), text: ink, border: alpha(accent, 0.35) });
    top += chipH ? chipH + 34 * u : 0;
    let usedImage = false;
    const rest = aboveFooter({ ...area, y: top, h: area.h - (top - area.y) }, f, d);
    if (a.cover && rest.h > 620 * u) {
      const r: Rect = { x: area.x, y: top, w: area.w, h: Math.min(rest.h * 0.24, 300 * u) };
      drawCover(c, a.cover, r, 28 * u);
      top += r.h + 34 * u;
      usedImage = true;
    }
    const box = aboveFooter({ ...area, y: top, h: area.h - (top - area.y) }, f, d);
    const rep = flow(
      c, d, f, box,
      { title: { color: INK, size: 88 }, excerpt: { color: ink, size: 42 }, body: { color: '#2B2A25', size: 40 }, quote: { color: ink, size: 38 } },
      {
        before: (id, b, rtl) => {
          if (id === 'quote') {
            c.fillStyle = accent;
            c.fillRect(rtl ? b.x + b.w + 18 * u : b.x - 18 * u - 8 * u, b.y, 8 * u, b.h);
          }
          if (id === 'body') {
            const y = b.y - 18 * u;
            c.fillStyle = accent;
            c.fillRect(rtl ? b.x + b.w - 110 * u : b.x, y, 110 * u, 6 * u);
            c.fillStyle = alpha(INK, 0.12);
            c.fillRect(rtl ? b.x : b.x + 120 * u, y + 2 * u, b.w - 120 * u, 2 * u);
          }
        },
      },
    );
    return merge(rep, { truncated: false, overflow: false, minFontPx: Infinity, usedImage });
  },
};
