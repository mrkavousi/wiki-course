import { alpha, readable } from '../color';
import { accentOf, aboveFooter, chips, flow, footer, inner, merge, roundRect } from '../shared';
import type { ShareTemplate } from '../types';

const BG = '#F3F6F8';
const CARD = '#FFFFFF';
const INK = '#10263F';
const TEXT = '#2B3A4A';
const MUTED = '#5B6B7B';

/** 3. Soft minimal: an oversized white card on a cool page with faint circles; blue and teal, lots of air. */
export const softMinimal: ShareTemplate = {
  id: 'soft',
  name: 'مینیمال نرم',
  accent: '#1D5D9B',
  palette: { surfaces: [CARD, '#E8F1F8'], text: TEXT, muted: MUTED },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#1D5D9B');
    const ink = readable(accent, CARD);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    for (const [x, y, r, col] of [[0.1, 0.08, 0.3, '#087F73'], [0.95, 0.3, 0.22, '#1D5D9B'], [0.8, 0.95, 0.34, '#087F73']] as const) {
      c.beginPath();
      c.arc(x * f.w, y * f.h, r * f.w, 0, Math.PI * 2);
      c.fillStyle = alpha(col, 0.1);
      c.fill();
    }
    const outer = inner(f, f.pad * 0.55);
    c.save();
    c.shadowColor = 'rgba(16,38,63,0.14)';
    c.shadowBlur = 60 * u;
    c.shadowOffsetY = 20 * u;
    roundRect(c, outer, 60 * u);
    c.fillStyle = CARD;
    c.fill();
    c.restore();
    const area = inner(f, f.pad * 0.55 + 56 * u);
    footer(c, d, f, a, area, { color: INK, muted: MUTED, align: 'center' });
    let top = area.y;
    const ch = chips(c, d, f, area.x, top, area.w, { fill: alpha(accent, 0.1), text: ink });
    top += ch ? ch + 30 * u : 0;
    const box = aboveFooter({ ...area, y: top, h: area.h - (top - area.y) }, f, d, 24);
    const rep = flow(
      c, d, f, box,
      { title: { color: INK, size: 84 }, excerpt: { color: ink, size: 40 }, body: { color: TEXT, size: 40 }, quote: { color: INK, size: 38 } },
      {
        before: (id, b) => {
          if (id === 'body') {
            c.fillStyle = '#087F73';
            c.fillRect(b.x + b.w - 80 * u, b.y - 20 * u, 80 * u, 6 * u);
          }
          if (id === 'quote') {
            roundRect(c, { x: b.x - 22 * u, y: b.y - 20 * u, w: b.w + 44 * u, h: b.h + 40 * u }, 28 * u);
            c.fillStyle = '#E8F1F8';
            c.fill();
          }
        },
      },
    );
    return merge(rep, { truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
  },
};
