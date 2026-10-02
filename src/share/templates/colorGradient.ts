import { alpha, onColor } from '../color';
import { accentOf, aboveFooter, blobs, chips, flow, footer, inner, merge, roundRect } from '../shared';
import type { ShareTemplate } from '../types';

const INK = '#12283A';
const TEXT = '#22394B';
const WHITE = '#FFFFFF';

/** 6. Modern gradient: teal into blue with soft blurred light, floating rounded cards and a few geometric shapes. */
export const colorGradient: ShareTemplate = {
  id: 'gradient',
  name: 'گرادیان رنگی',
  accent: '#B7D84B',
  palette: { surfaces: ['#FFFFFF'], text: TEXT, muted: '#4C6272', inverse: { surfaces: ['#087F73', '#1D5D9B', '#075E57'], text: WHITE, muted: '#FFFFFF' } },
  draw(c, d, f, a) {
    const u = f.u;
    const accent = accentOf(d, '#B7D84B');
    const g = c.createLinearGradient(0, 0, f.w * 0.7, f.h);
    g.addColorStop(0, '#087F73');
    g.addColorStop(0.55, '#1D5D9B');
    g.addColorStop(1, '#075E57');
    c.fillStyle = g;
    c.fillRect(0, 0, f.w, f.h);
    blobs(c, f, [[0.15, 0.1, 0.6, '#B7D84B', 0.35], [0.9, 0.55, 0.55, '#38BDF8', 0.3], [0.3, 0.95, 0.6, '#2DD4BF', 0.3]]);
    // geometric shapes
    c.strokeStyle = alpha(WHITE, 0.22);
    c.lineWidth = 3 * u;
    c.beginPath();
    c.arc(f.w * 0.92, f.h * 0.12, 130 * u, 0, Math.PI * 2);
    c.stroke();
    c.save();
    c.translate(f.w * 0.06, f.h * 0.62);
    c.rotate(0.5);
    roundRect(c, { x: -70 * u, y: -70 * u, w: 140 * u, h: 140 * u }, 30 * u);
    c.stroke();
    c.restore();
    c.fillStyle = alpha(accent, 0.9);
    c.beginPath();
    c.arc(f.w * 0.88, f.h * 0.78, 18 * u, 0, Math.PI * 2);
    c.fill();

    const area = inner(f, f.pad * 0.8);
    footer(c, d, f, a, area, { color: WHITE, muted: WHITE, align: 'center' });
    const box = aboveFooter(area, f, d, 26);
    // title card, then body card (+ quote card in the accent colour)
    const hasMore = !!(d.body || d.quote);
    const tb = { x: box.x, y: box.y, w: box.w, h: hasMore ? box.h * 0.32 : box.h };
    const showChips = tb.h > 300 * u; // short formats drop the chips rather than squeeze the title
    const pad = 36 * u;
    const probe = flow(c, { ...d, body: undefined, quote: undefined }, f, { x: tb.x + pad, y: tb.y + pad, w: tb.w - 2 * pad, h: tb.h - 2 * pad }, { title: { color: INK, size: 80 } }, { dry: true });
    const th = Math.min(tb.h, probe.fit.total + 2 * pad + (showChips && (d.category || d.tags?.length) ? 62 * u : 0));
    const titleCard = { x: tb.x, y: hasMore ? tb.y : tb.y + (tb.h - th) / 2, w: tb.w, h: th };
    c.save();
    c.shadowColor = 'rgba(5,30,40,0.35)';
    c.shadowBlur = 50 * u;
    c.shadowOffsetY = 18 * u;
    roundRect(c, titleCard, 44 * u);
    c.fillStyle = 'rgba(255,255,255,0.97)';
    c.fill();
    c.restore();
    let ty = titleCard.y + pad;
    const ch = showChips ? chips(c, d, f, titleCard.x + pad, ty, titleCard.w - 2 * pad, { fill: '#E3F3F0', text: '#075E57' }) : 0;
    ty += ch ? ch + 18 * u : 0;
    const r1 = flow(c, { ...d, body: undefined, quote: undefined }, f, { x: titleCard.x + pad, y: ty, w: titleCard.w - 2 * pad, h: titleCard.y + titleCard.h - pad - ty }, { title: { color: INK, size: 80 } });
    let r2 = merge({ truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
    if (hasMore) {
      const y0 = titleCard.y + titleCard.h + 28 * u;
      const rest = { x: box.x, y: y0, w: box.w, h: box.y + box.h - y0 };
      const q = d.quote ? Math.min(rest.h * 0.36, 300 * u) : 0;
      const bodyCard = { ...rest, h: rest.h - (q ? q + 24 * u : 0) };
      c.save();
      c.shadowColor = 'rgba(5,30,40,0.3)';
      c.shadowBlur = 40 * u;
      c.shadowOffsetY = 14 * u;
      roundRect(c, bodyCard, 40 * u);
      c.fillStyle = 'rgba(255,255,255,0.94)';
      c.fill();
      c.restore();
      const rb = flow(c, d, f, { x: bodyCard.x + pad, y: bodyCard.y + pad, w: bodyCard.w - 2 * pad, h: bodyCard.h - 2 * pad }, { body: { color: TEXT, size: 40 } }, { order: ['body'], valign: 'center' });
      let rq = merge({ truncated: false, overflow: false, minFontPx: Infinity, usedImage: false });
      if (q) {
        const qc = { x: rest.x, y: bodyCard.y + bodyCard.h + 24 * u, w: rest.w, h: q };
        roundRect(c, qc, 40 * u);
        c.fillStyle = accent;
        c.fill();
        rq = flow(c, d, f, { x: qc.x + pad, y: qc.y + pad * 0.7, w: qc.w - 2 * pad, h: qc.h - pad * 1.4 }, { quote: { color: onColor(accent), size: 38, weight: 700 } }, { order: ['quote'], valign: 'center' });
      }
      r2 = merge(rb, rq);
    }
    return merge(r1, r2);
  },
};
