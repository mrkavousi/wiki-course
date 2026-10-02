// Sharing a piece of an article: the text to copy or send, and a 1080x1920 story picture drawn on a canvas (no dependency).
import { FORMULA } from './reader';

export type ShareInput = { text: string; title?: string; article: string; url: string };

export const W = 1080;
export const H = 1920;
// Instagram covers roughly the top and bottom 14% of a story with its own bars, so everything stays inside this band.
const SAFE_TOP = 270;
const SAFE_BOTTOM = 1650;
const SITE = 'wiki-course.vercel.app';

/** Colours are plain values (a canvas cannot read CSS tokens). `card` is the panel of the "card" frame. */
export const COLORS = [
  { id: 'teal', name: 'سبزآبی', bg: ['#0b1210', '#12312c'], card: '#121c18', fg: '#e8eee9', muted: '#a3b0a7', accent: '#2dd4bf' },
  { id: 'paper', name: 'کاغذی', bg: ['#f4ecd8', '#eadfc2'], card: '#faf4e4', fg: '#2b2418', muted: '#5b5140', accent: '#0f766e' },
  { id: 'night', name: 'شب', bg: ['#0f172a', '#1e1b4b'], card: '#1e293b', fg: '#f1f5f9', muted: '#b4bed1', accent: '#a78bfa' },
  { id: 'violet', name: 'بنفش‌آبی', bg: ['#4c1d95', '#1d4ed8'], card: '#312e81', fg: '#ffffff', muted: '#e0e7ff', accent: '#fde68a' },
  { id: 'warm', name: 'نارنجی', bg: ['#7c2d12', '#c2410c'], card: '#9a3412', fg: '#fff7ed', muted: '#ffedd5', accent: '#fef08a' },
] as const;
export const FRAMES = [
  { id: 'plain', name: 'ساده' },
  { id: 'line', name: 'خطی' },
  { id: 'card', name: 'کارت' },
  { id: 'corners', name: 'گوشه‌ها' },
] as const;
export type Look = { color: (typeof COLORS)[number]['id']; frame: (typeof FRAMES)[number]['id'] };
export const DEFAULT_LOOK: Look = { color: 'teal', frame: 'plain' };

/** Quote text without the formula placeholders and with tidy spaces. */
export const cleanQuote = (t: string) =>
  t.replaceAll(FORMULA, ' ').split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n\n');

/** The text that is copied or sent: the quote, where it comes from (CC BY-SA asks for that) and the link. */
export function shareText({ text, title, article, url }: ShareInput) {
  return [title, cleanQuote(text), `— از مقاله‌ی «${article}» در ویکی‌پدیا\n${url}`, `Wiki Course · ${SITE}`].filter(Boolean).join('\n\n');
}

/** Greedy line breaking with a measuring function (so it can be tested without a canvas); a word wider than a line is cut by characters. */
export function wrapLines(text: string, measure: (s: string) => number, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    let cur = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = cur ? `${cur} ${word}` : word;
      if (measure(next) <= maxW) {
        cur = next;
        continue;
      }
      if (cur) lines.push(cur);
      cur = '';
      let rest = word;
      while (measure(rest) > maxW && rest.length > 1) {
        let n = rest.length - 1;
        while (n > 1 && measure(rest.slice(0, n)) > maxW) n--;
        lines.push(rest.slice(0, n));
        rest = rest.slice(n);
      }
      cur = rest;
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

/** Cuts the last line so that "…" fits. */
export function withEllipsis(line: string, measure: (s: string) => number, maxW: number) {
  let s = line;
  while (s && measure(`${s}…`) > maxW) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

const isRtl = (t: string) => {
  const ar = (t.match(/[؀-ۿ]/g) ?? []).length;
  const la = (t.match(/[A-Za-z]/g) ?? []).length;
  return ar >= la;
};

let logo: Promise<HTMLImageElement> | undefined;
const loadLogo = () =>
  (logo ??= new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = '/icon.svg';
  }));

const font = (w: number, px: number) => `${w} ${px}px Vazirmatn, ui-sans-serif, system-ui, sans-serif`;

function rounded(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/** Draws the story picture; resolves with whether the text had to be cut to fit. */
export async function drawShareImage(canvas: HTMLCanvasElement, input: ShareInput, look: Look): Promise<{ truncated: boolean }> {
  const col = COLORS.find((c) => c.id === look.color) ?? COLORS[0];
  await Promise.all([document.fonts.load(font(800, 40), 'متن Text'), document.fonts.load(font(500, 40), 'متن Text')]);
  const img = await loadLogo().catch(() => null);
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d')!;

  // background
  const g = c.createLinearGradient(0, 0, W * 0.6, H);
  g.addColorStop(0, col.bg[0]);
  g.addColorStop(1, col.bg[1]);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);

  // frame
  c.lineWidth = 6;
  c.strokeStyle = col.accent;
  if (look.frame === 'line') {
    rounded(c, 56, 56, W - 112, H - 112, 48);
    c.stroke();
    c.lineWidth = 2;
    rounded(c, 84, 84, W - 168, H - 168, 30);
    c.stroke();
  } else if (look.frame === 'corners') {
    c.lineWidth = 10;
    c.lineCap = 'round';
    const m = 72;
    const L = 130;
    for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]] as const) {
      c.beginPath();
      c.moveTo(x + dx * L, y);
      c.lineTo(x, y);
      c.lineTo(x, y + dy * L);
      c.stroke();
    }
  } else if (look.frame === 'card') {
    c.save();
    c.shadowColor = 'rgba(0,0,0,0.35)';
    c.shadowBlur = 60;
    c.shadowOffsetY = 24;
    c.fillStyle = col.card;
    rounded(c, 72, 230, W - 144, 1450, 64);
    c.fill();
    c.restore();
    c.fillStyle = col.accent;
    c.fillRect(72 + 64, 230, W - 144 - 128, 8); // accent edge on top of the card
  }

  const rtl = isRtl(input.text);
  const left = 120;
  const right = W - 120;
  const maxW = right - left;
  const set = (rtlDir: boolean) => {
    c.direction = rtlDir ? 'rtl' : 'ltr';
    c.textAlign = rtlDir ? 'right' : 'left';
  };
  const edge = (rtlDir: boolean) => (rtlDir ? right : left);
  c.textBaseline = 'alphabetic';

  // footer: logo, name, source line (stays above Instagram's bottom bar)
  const footTop = 1440;
  c.fillStyle = col.accent;
  c.globalAlpha = 0.5;
  c.fillRect(W / 2 - 60, footTop, 120, 4);
  c.globalAlpha = 1;
  const logoSize = 92;
  c.direction = 'ltr';
  c.font = font(800, 50);
  const nameW = c.measureText('Wiki Course').width;
  const rowX = (W - (logoSize + 24 + nameW)) / 2;
  if (img) c.drawImage(img, rowX, footTop + 44, logoSize, logoSize);
  c.textAlign = 'left';
  c.fillStyle = col.fg;
  c.fillText('Wiki Course', rowX + logoSize + 24, footTop + 44 + logoSize / 2 + 18);
  const src = `از مقاله‌ی «${input.article}» در ویکی‌پدیا · CC BY-SA 4.0`;
  c.font = font(500, 28);
  set(true);
  c.textAlign = 'center';
  c.fillStyle = col.muted;
  const srcLines = wrapLines(src, (s) => c.measureText(s).width, maxW).slice(0, 2);
  srcLines.forEach((l, i) => c.fillText(l, W / 2, footTop + 44 + logoSize + 54 + i * 40));

  // text block: optional chapter title, then the quote, shrunk until it fits above the footer
  let y = SAFE_TOP + (look.frame === 'card' ? 70 : 20);
  if (input.title) {
    set(isRtl(input.title));
    c.font = font(800, 56);
    c.fillStyle = col.accent;
    const t = wrapLines(input.title, (s) => c.measureText(s).width, maxW);
    const shown = t.slice(0, 2);
    if (t.length > 2) shown[1] = withEllipsis(shown[1], (s) => c.measureText(s).width, maxW);
    for (const l of shown) {
      y += 76;
      c.fillText(l, edge(isRtl(input.title)), y);
    }
    y += 24;
  }
  c.fillStyle = col.accent;
  c.fillRect(rtl ? right - 120 : left, y, 120, 10);
  y += 50;
  const bottom = footTop - 50;
  set(rtl);
  const text = cleanQuote(input.text);
  let size = 62;
  let lines: string[] = [];
  let truncated = false;
  for (; size >= 34; size -= 2) {
    c.font = font(500, size);
    lines = wrapLines(text, (s) => c.measureText(s).width, maxW);
    if (lines.length * size * 1.75 <= bottom - y) break;
  }
  const lh = size * 1.75;
  const fit = Math.max(1, Math.floor((bottom - y) / lh));
  if (lines.length > fit) {
    truncated = true;
    lines = lines.slice(0, fit);
    lines[fit - 1] = withEllipsis(lines[fit - 1], (s) => c.measureText(s).width, maxW);
  }
  c.fillStyle = col.fg;
  lines.forEach((l, i) => c.fillText(l, edge(rtl), y + (i + 1) * lh - lh * 0.25));
  return { truncated };
}
