import { alpha, readable } from '../color';
import { arches, meander } from '../decor';
import { accentOf, aboveFooter, chips, flow, footer, inner, merge } from '../shared';
import type { ShareTemplate } from '../types';

const BG = '#0D1211';
const TEXT = '#F7F3E8';
const MUTED = '#B9B4A6';

/** 4. Dark editorial: near-black page, thin borders, huge type, historic line art (arches and a Greek-key band) barely visible behind it. */
export const darkEditorial: ShareTemplate = {
  id: 'dark',
  name: 'تحریریه‌ی تیره',
  accent: '#2BB59F',
  palette: { surfaces: [BG], text: TEXT, muted: MUTED },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#2BB59F');
    const acc = readable(accent, BG, 4.5);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    // line art behind the text
    arches(c, f.w * 0.78, f.h - f.safeBottom - 40 * u, 520 * u, 5, alpha(accent, 0.13), 2 * u);
    meander(c, f.pad, f.safeTop + f.pad * 0.55, f.w - 2 * f.pad, 16 * u, alpha(accent, 0.35), 2 * u);
    // double border
    const o = inner(f, 34 * u);
    c.strokeStyle = alpha(TEXT, 0.22);
    c.lineWidth = 1.5 * u;
    c.strokeRect(o.x, o.y, o.w, o.h);
    const o2 = inner(f, 46 * u);
    c.strokeStyle = alpha(accent, 0.45);
    c.strokeRect(o2.x, o2.y, o2.w, o2.h);

    const area = inner(f, f.pad + 10 * u);
    footer(c, d, f, a, area, { color: TEXT, muted: MUTED, align: 'start' });
    let top = area.y + 36 * u;
    const ch = chips(c, d, f, area.x, top, area.w, { fill: 'rgba(0,0,0,0)', text: acc, border: alpha(accent, 0.6) });
    top += ch ? ch + 34 * u : 0;
    const box = aboveFooter({ ...area, y: top, h: area.h - (top - area.y) }, f, d, 24);
    const rep = flow(
      c, d, f, box,
      { title: { color: TEXT, size: 96, lh: 1.28 }, excerpt: { color: acc, size: 42 }, body: { color: '#E4E0D2', size: 40 }, quote: { color: TEXT, size: 40, weight: 500 } },
      {
        before: (id, b, rtl) => {
          if (id === 'quote') {
            c.fillStyle = alpha(TEXT, 0.25);
            c.fillRect(b.x, b.y - 18 * u, b.w, 1.5 * u);
            c.fillStyle = acc;
            c.fillRect(rtl ? b.x + b.w - 70 * u : b.x, b.y - 20 * u, 70 * u, 4 * u);
          }
        },
      },
    );
    return merge(rep, { truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
  },
};
