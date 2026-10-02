import { alpha } from '../color';
import { cornerOrnament, starPath } from '../decor';
import { aboveFooter, accentOf, chips, flow, footer, inner, merge, paperNoise } from '../shared';
import type { ShareTemplate } from '../types';

const BG = '#EFE6D2';
const INK = '#3B2A16';
const TEXT = '#43321D';
const MUTED = '#66523A';
const BROWN = '#7A5A2E';

/** 5. Old document made modern: parchment with grain, a double border with corner ornaments, a manuscript-style quotation, clean spacing. */
export const paperDocument: ShareTemplate = {
  id: 'paper',
  name: 'سند کهن',
  accent: BROWN,
  palette: { surfaces: [BG], text: TEXT, muted: MUTED },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, BROWN);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    paperNoise(c, f, '#6B4F2A');
    const o = inner(f, 44 * u);
    c.strokeStyle = alpha(accent, 0.85);
    c.lineWidth = 3 * u;
    c.strokeRect(o.x, o.y, o.w, o.h);
    const o2 = inner(f, 58 * u);
    c.lineWidth = 1.2 * u;
    c.strokeRect(o2.x, o2.y, o2.w, o2.h);
    const k = 70 * u;
    for (const [x, y, sx, sy] of [[o2.x, o2.y, 1, 1], [o2.x + o2.w, o2.y, -1, 1], [o2.x, o2.y + o2.h, 1, -1], [o2.x + o2.w, o2.y + o2.h, -1, -1]] as const) cornerOrnament(c, x, y, k, sx, sy, alpha(accent, 0.9), alpha(accent, 0.25), u);

    const area = inner(f, f.pad + 22 * u);
    footer(c, d, f, a, area, { color: INK, muted: MUTED, align: 'center' });
    let top = area.y;
    const ch = chips(c, d, f, area.x, top, area.w, { fill: alpha(accent, 0.1), text: '#5E4421', border: alpha(accent, 0.5) });
    top += ch ? ch + 30 * u : 0;
    const box = aboveFooter({ ...area, y: top, h: area.h - (top - area.y) }, f, d, 24);
    const rep = flow(
      c, d, f, box,
      { title: { color: INK, size: 86, align: 'center' }, excerpt: { color: '#5E4421', size: 40, align: 'center' }, body: { color: TEXT, size: 40 }, quote: { color: INK, size: 38, align: 'center', weight: 600, lh: 1.7 } },
      {
        before: (id, b) => {
          if (id === 'body') {
            // divider: line, star, line
            const y = b.y - 22 * u;
            c.strokeStyle = alpha(accent, 0.7);
            c.lineWidth = 1.5 * u;
            c.beginPath();
            c.moveTo(b.x + b.w * 0.2, y);
            c.lineTo(b.x + b.w * 0.46, y);
            c.moveTo(b.x + b.w * 0.54, y);
            c.lineTo(b.x + b.w * 0.8, y);
            c.stroke();
            starPath(c, b.x + b.w / 2, y, 12 * u, 8, 0.55, 0);
            c.fillStyle = accent;
            c.fill();
          }
          if (id === 'quote') {
            c.setLineDash([10 * u, 8 * u]);
            c.strokeStyle = alpha(accent, 0.6);
            c.lineWidth = 1.5 * u;
            c.beginPath();
            c.moveTo(b.x + b.w * 0.1, b.y - 16 * u);
            c.lineTo(b.x + b.w * 0.9, b.y - 16 * u);
            c.stroke();
            c.setLineDash([]);
          }
        },
      },
    );
    return merge(rep, { truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
  },
};
