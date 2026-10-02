import { alpha } from '../color';
import { accentOf, aboveFooter, blobs, chips, drawBlurred, flow, footer, inner, merge, roundRect } from '../shared';
import type { ShareTemplate } from '../types';

const WHITE = '#FFFFFF';
const SOFT = '#E8F0EE';

/** 7. Glass card: the picture blurred into light and colour, a frosted card with a fine border and soft shadow, white type. Blur is made with a scaled-down copy so it looks the same everywhere. */
export const glassCard: ShareTemplate = {
  id: 'glass',
  name: 'کارت شیشه‌ای',
  accent: '#2DD4BF',
  palette: { surfaces: ['#0A1413', '#33423F'], text: WHITE, muted: SOFT },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#2DD4BF');
    c.fillStyle = '#0E1B1A';
    c.fillRect(0, 0, f.w, f.h);
    if (a.cover) {
      drawBlurred(c, a.cover, { x: -40 * u, y: -40 * u, w: f.w + 80 * u, h: f.h + 80 * u }, 26);
      c.fillStyle = 'rgba(0,0,0,0.5)';
      c.fillRect(0, 0, f.w, f.h);
    } else blobs(c, f, [[0.2, 0.2, 0.7, accent, 0.6], [0.85, 0.5, 0.7, '#1D5D9B', 0.55], [0.4, 0.95, 0.6, '#7C3AED', 0.4]]);
    const area = inner(f, f.pad);
    footer(c, d, f, a, area, { color: WHITE, muted: SOFT, align: 'center' });
    const box = aboveFooter(area, f, d, 20);
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.4)';
    c.shadowBlur = 70 * u;
    c.shadowOffsetY = 26 * u;
    roundRect(c, box, 56 * u);
    c.fillStyle = 'rgba(14,27,26,0.62)';
    c.fill();
    c.restore();
    const sheen = c.createLinearGradient(box.x, box.y, box.x + box.w * 0.6, box.y + box.h);
    sheen.addColorStop(0, 'rgba(255,255,255,0.18)');
    sheen.addColorStop(0.4, 'rgba(255,255,255,0.03)');
    sheen.addColorStop(1, 'rgba(255,255,255,0.08)');
    roundRect(c, box, 56 * u);
    c.fillStyle = sheen;
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.42)';
    c.lineWidth = 2 * u;
    c.stroke();
    const pad = 50 * u;
    const content = { x: box.x + pad, y: box.y + pad, w: box.w - 2 * pad, h: box.h - 2 * pad };
    const ch = chips(c, d, f, content.x, content.y, content.w, { fill: alpha(WHITE, 0.16), text: WHITE, border: alpha(WHITE, 0.4) });
    const off = ch ? ch + 26 * u : 0;
    const rep = flow(
      c, d, f, { ...content, y: content.y + off, h: content.h - off },
      { title: { color: WHITE, size: 84 }, excerpt: { color: '#CFF7F1', size: 40 }, body: { color: WHITE, size: 40 }, quote: { color: '#D8FBF5', size: 38 } },
      {
        before: (id, b, rtl) => {
          if (id === 'quote') {
            c.fillStyle = accent;
            c.fillRect(rtl ? b.x + b.w + 16 * u : b.x - 24 * u, b.y, 8 * u, b.h);
          }
        },
      },
    );
    return merge(rep, { truncated: false, overflow: false, minFontPx: Infinity, usedImage: !!a.cover });
  },
};
