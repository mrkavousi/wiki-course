import { alpha } from '../color';
import { accentOf, aboveFooter, blobs, chips, drawCover, flow, footer, inner, merge, roundRect } from '../shared';
import type { ShareTemplate } from '../types';

const WHITE = '#FFFFFF';
const SOFT = '#E6ECEA';

/** 2. Cinematic: the picture is the page; a dark gradient, big white title and the text in a translucent dark card. Without a picture the accent colour makes the light. */
export const cinematicImage: ShareTemplate = {
  id: 'cinematic',
  name: 'سینمایی',
  accent: '#1FB5A3',
  palette: { surfaces: ['#0B1514', '#142624'], text: WHITE, muted: SOFT },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#1FB5A3');
    c.fillStyle = '#0B1514';
    c.fillRect(0, 0, f.w, f.h);
    if (a.cover) drawCover(c, a.cover, { x: 0, y: 0, w: f.w, h: f.h });
    else {
      c.fillStyle = '#0F1D1C';
      c.fillRect(0, 0, f.w, f.h);
      blobs(c, f, [[0.8, 0.15, 0.9, accent, 0.55], [0.1, 0.75, 0.8, '#1D5D9B', 0.45]]);
    }
    const g = c.createLinearGradient(0, 0, 0, f.h);
    g.addColorStop(0, 'rgba(6,12,12,0.55)');
    g.addColorStop(0.45, 'rgba(6,12,12,0.55)');
    g.addColorStop(1, 'rgba(6,12,12,0.92)');
    c.fillStyle = g;
    c.fillRect(0, 0, f.w, f.h);
    const light = c.createRadialGradient(f.w * 0.85, f.h * 0.05, 0, f.w * 0.85, f.h * 0.05, f.w * 0.7);
    light.addColorStop(0, alpha('#FFFFFF', 0.16));
    light.addColorStop(1, alpha('#FFFFFF', 0));
    c.fillStyle = light;
    c.fillRect(0, 0, f.w, f.h);

    const area = inner(f, f.pad);
    footer(c, d, f, a, area, { color: WHITE, muted: SOFT, align: 'center' });
    const body = aboveFooter(area, f, d, 30);
    let top = body.y;
    const ch = chips(c, d, f, body.x, top, body.w, { fill: alpha('#FFFFFF', 0.14), text: WHITE, border: alpha('#FFFFFF', 0.4) });
    top += ch ? ch + 30 * u : 0;
    const hasText = !!(d.body || d.quote);
    const titleBox = { x: body.x, y: top, w: body.w, h: hasText ? (body.h - (top - body.y)) * 0.34 : body.h - (top - body.y) };
    const r1 = flow(c, d, f, titleBox, { title: { color: WHITE, size: 92, maxLines: 4 } }, { valign: hasText ? 'top' : 'center' });
    let r2 = merge({ truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
    if (hasText) {
      const cardY = r1.bottom + 34 * u;
      const card = { x: body.x, y: cardY, w: body.w, h: body.y + body.h - cardY };
      c.save();
      c.shadowColor = 'rgba(0,0,0,0.45)';
      c.shadowBlur = 50 * u;
      roundRect(c, card, 44 * u);
      c.fillStyle = 'rgba(8,16,15,0.68)';
      c.fill();
      c.restore();
      roundRect(c, card, 44 * u);
      c.strokeStyle = alpha('#FFFFFF', 0.18);
      c.lineWidth = 1.5 * u;
      c.stroke();
      const pad = 40 * u;
      r2 = flow(c, d, f, { x: card.x + pad, y: card.y + pad, w: card.w - 2 * pad, h: card.h - 2 * pad }, { body: { color: WHITE, size: 40 }, quote: { color: '#B8F0E8', size: 38 } }, {
        order: ['body', 'quote'],
        before: (id, b, rtl) => {
          if (id === 'quote') {
            c.fillStyle = accent;
            c.fillRect(rtl ? b.x + b.w + 14 * u : b.x - 22 * u, b.y, 8 * u, b.h);
          }
        },
      });
    }
    return merge(r1, r2, { truncated: false, overflow: false, minFontPx: Infinity, usedImage: !!a.cover });
  },
};
