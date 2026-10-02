import { alpha, readable } from '../color';
import { cornerOrnament, lattice, lozenge, starPath } from '../decor';
import { accentOf, aboveFooter, chips, flow, footer, inner, merge, roundRect } from '../shared';
import type { ShareTemplate } from '../types';

const BG = '#FBF6E9';
const INK = '#14302B';
const TEXT = '#23403A';
const MUTED = '#4F6660';
const GOLD = '#B08D3C';

/** 9. A museum publication: cream page, turquoise frame with eight-pointed-star corners and a lattice header, modern centred type inside. Geometric, never a busy poster. */
export const ornamentalHeritage: ShareTemplate = {
  id: 'heritage',
  name: 'میراث تزئینی',
  accent: '#0E8F86',
  palette: { surfaces: [BG], text: TEXT, muted: MUTED },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#0E8F86');
    const ink = readable(accent, BG);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    const o = inner(f, 40 * u);
    c.strokeStyle = accent;
    c.lineWidth = 6 * u;
    c.strokeRect(o.x, o.y, o.w, o.h);
    const o2 = inner(f, 56 * u);
    c.strokeStyle = GOLD;
    c.lineWidth = 2 * u;
    c.strokeRect(o2.x, o2.y, o2.w, o2.h);
    const k = 84 * u;
    for (const [x, y, sx, sy] of [[o2.x, o2.y, 1, 1], [o2.x + o2.w, o2.y, -1, 1], [o2.x, o2.y + o2.h, 1, -1], [o2.x + o2.w, o2.y + o2.h, -1, -1]] as const) cornerOrnament(c, x, y, k, sx, sy, accent, alpha(GOLD, 0.55), u);
    // lattice band behind the head of the page
    const bandH = 190 * u;
    lattice(c, o2.x + 8 * u, o2.y + 8 * u, o2.w - 16 * u, bandH, 60 * u, alpha(accent, 0.13), 1.5 * u);

    const area = inner(f, f.pad + 28 * u);
    footer(c, d, f, a, area, { color: INK, muted: MUTED, align: 'center' });
    // cartouche with the category
    let top = area.y + 8 * u;
    const cat = d.category?.trim();
    if (cat) {
      c.font = `700 ${Math.round(28 * u)}px Vazirmatn, sans-serif`;
      c.direction = 'rtl';
      const w = c.measureText(cat).width + 90 * u;
      const r = { x: f.w / 2 - w / 2, y: top, w, h: 62 * u };
      roundRect(c, r, 31 * u);
      c.fillStyle = BG;
      c.fill();
      c.strokeStyle = accent;
      c.lineWidth = 2 * u;
      c.stroke();
      c.fillStyle = ink;
      c.textAlign = 'center';
      c.textBaseline = 'alphabetic';
      c.fillText(cat, f.w / 2, r.y + r.h / 2 + 10 * u);
      top += r.h + 34 * u;
    }
    const box = aboveFooter({ ...area, y: top, h: area.h - (top - area.y) }, f, d, 22);
    const rep = flow(
      c, d, f, box,
      { title: { color: INK, size: 88, align: 'center' }, excerpt: { color: ink, size: 40, align: 'center' }, body: { color: TEXT, size: 40 }, quote: { color: INK, size: 38, align: 'center', weight: 600 } },
      {
        before: (id, b) => {
          if (id === 'body') {
            const y = b.y - 22 * u;
            c.strokeStyle = alpha(GOLD, 0.9);
            c.lineWidth = 2 * u;
            c.beginPath();
            c.moveTo(b.x + b.w * 0.18, y);
            c.lineTo(b.x + b.w * 0.45, y);
            c.moveTo(b.x + b.w * 0.55, y);
            c.lineTo(b.x + b.w * 0.82, y);
            c.stroke();
            lozenge(c, b.x + b.w / 2, y, 26 * u, 34 * u);
            c.fillStyle = accent;
            c.fill();
          }
          if (id === 'quote') {
            starPath(c, b.x + b.w / 2, b.y - 28 * u, 15 * u, 8, 0.55, 0);
            c.fillStyle = GOLD;
            c.fill();
          }
        },
      },
    );
    return merge(rep, { truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
  },
};
