import { alpha, readable } from '../color';
import { accentOf, aboveFooter, chips, flow, footer, inner, merge, roundRect, type Rect } from '../shared';
import type { Ctx, Frame, ShareTemplate } from '../types';

const BG = '#E7E1D6';
const INK = '#2E2A24';
const TEXT = '#38332B';
const MUTED = '#5C5447';

/** A raised soft card: a dark shadow down-right and a light one up-left. */
function raised(c: Ctx, f: Frame, r: Rect, radius: number) {
  const u = f.u;
  c.save();
  c.shadowColor = 'rgba(160,148,128,0.75)';
  c.shadowBlur = 36 * u;
  c.shadowOffsetX = 14 * u;
  c.shadowOffsetY = 14 * u;
  roundRect(c, r, radius);
  c.fillStyle = BG;
  c.fill();
  c.shadowColor = 'rgba(255,255,255,0.95)';
  c.shadowOffsetX = -14 * u;
  c.shadowOffsetY = -14 * u;
  c.fill();
  c.restore();
}

/** 8. Soft UI, kept calm: warm grey, raised cards, one pressed-in quote well; strong text contrast so it never turns muddy. */
export const neumorphic: ShareTemplate = {
  id: 'soft-ui',
  name: 'نرم و برجسته',
  accent: '#087F73',
  palette: { surfaces: [BG, '#DDD6C9'], text: TEXT, muted: MUTED },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#087F73');
    const ink = readable(accent, BG);
    c.fillStyle = BG;
    c.fillRect(0, 0, f.w, f.h);
    const area = inner(f, f.pad * 0.8);
    footer(c, d, f, a, area, { color: INK, muted: MUTED, align: 'center' });
    const box = aboveFooter(area, f, d, 30);
    const hasQuote = !!d.quote;
    const quoteH = hasQuote ? Math.min(box.h * 0.26, 280 * u) : 0;
    const main = { ...box, h: box.h - (hasQuote ? quoteH + 32 * u : 0) };
    raised(c, f, main, 52 * u);
    const pad = 46 * u;
    const content = { x: main.x + pad, y: main.y + pad, w: main.w - 2 * pad, h: main.h - 2 * pad };
    const ch = chips(c, d, f, content.x, content.y, content.w, { fill: BG, text: ink, border: alpha(accent, 0.4) });
    const off = ch ? ch + 26 * u : 0;
    const rep = flow(
      c, d, f, { ...content, y: content.y + off, h: content.h - off },
      { title: { color: INK, size: 84 }, excerpt: { color: ink, size: 40 }, body: { color: TEXT, size: 40 } },
      {
        order: ['title', 'excerpt', 'body'],
        before: (id, b, rtl) => {
          if (id === 'body') {
            c.fillStyle = accent;
            c.fillRect(rtl ? b.x + b.w - 90 * u : b.x, b.y - 18 * u, 90 * u, 6 * u);
          }
        },
      },
    );
    let rq = merge({ truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
    if (hasQuote) {
      const well = { x: box.x, y: main.y + main.h + 32 * u, w: box.w, h: quoteH };
      roundRect(c, well, 44 * u);
      c.fillStyle = '#DDD6C9';
      c.fill();
      c.save();
      roundRect(c, well, 44 * u);
      c.clip();
      c.strokeStyle = 'rgba(150,138,118,0.55)'; // inner shadow along the top and start edges
      c.lineWidth = 10 * u;
      c.strokeRect(well.x - 5 * u, well.y - 5 * u, well.w + 10 * u, well.h + 10 * u);
      c.restore();
      rq = flow(c, d, f, { x: well.x + pad, y: well.y + pad * 0.6, w: well.w - 2 * pad, h: well.h - pad * 1.2 }, { quote: { color: INK, size: 38 } }, { order: ['quote'], valign: 'center' });
    }
    return merge(rep, rq);
  },
};
