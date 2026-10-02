// Text fitting. Pure functions over a `measure` callback, so they run (and are tested) without a canvas.

/** Width in px of `text` at the given weight and size. */
export type Measure = (text: string, weight: number, size: number) => number;

/** Greedy line breaking; a word wider than a line is cut by characters, blank lines are kept as spacing. */
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

/** Cuts the line so that "…" fits. */
export function withEllipsis(line: string, measure: (s: string) => number, maxW: number) {
  let s = line.replace(/[…\s]+$/, '');
  while (s && measure(`${s}…`) > maxW) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

/** Shortens at a word boundary to at most `max` characters, ending in "…". */
export function truncateText(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s،,.؛;:]+$/, '')}…`;
}

/** Title size from its length: short titles are big, long ones shrink linearly to `min` at `long` characters. */
export function calculateFontSize(length: number, base: number, min: number, short = 22, long = 110) {
  if (length <= short) return base;
  if (length >= long) return min;
  return Math.round(base - ((base - min) * (length - short)) / (long - short));
}

export const calculateTextHeight = (lines: number, size: number, lh: number) => lines * size * lh;

export type Block = {
  id: string;
  text: string;
  weight: number;
  size: number; // px at full scale
  min: number; // the smallest size that is still comfortable to read
  lh: number; // line height as a multiple of the size
  maxLines: number;
  gap: number; // space above, px at full scale (not for the first block)
  width?: number;
};
export type Placed = { id: string; lines: string[]; size: number; lh: number; top: number; height: number };
export type Fit = { placed: Placed[]; total: number; truncated: boolean; overflow: boolean; minFont: number };

/**
 * Stacks blocks inside `width` x `height`. Order of giving way: everything shrinks together (down to each block's
 * minimum), then quote and title are cut to fewer lines, then the body is cut line by line with "…". Nothing is
 * ever placed past `height`; `overflow` is true only when even that cannot be honoured.
 */
export function fitBlocks(measure: Measure, blocks: Block[], width: number, height: number): Fit {
  const layout = (scale: number, caps: Record<string, number>, bodyLines?: number) => {
    let top = 0;
    let truncated = false;
    let minFont = Infinity;
    const placed = blocks.map((b, i): Placed => {
      const size = Math.max(b.min, Math.round(b.size * scale));
      minFont = Math.min(minFont, size);
      const w = b.width ?? width;
      const m = (s: string) => measure(s, b.weight, size);
      let lines = wrapLines(b.text, m, w);
      const cap = Math.min(b.maxLines, caps[b.id] ?? Infinity, b.id === 'body' ? (bodyLines ?? Infinity) : Infinity);
      if (lines.length > cap) {
        truncated = true;
        lines = lines.slice(0, cap);
        lines[cap - 1] = withEllipsis(lines[cap - 1], m, w);
      }
      if (i > 0) top += Math.round(b.gap * Math.max(scale, 0.6));
      const h = calculateTextHeight(lines.length, size, b.lh);
      const p = { id: b.id, lines, size, lh: size * b.lh, top, height: h };
      top += h;
      return p;
    });
    return { placed, total: top, truncated, minFont: minFont === Infinity ? 0 : minFont };
  };

  let r = layout(1, {});
  for (let s = 0.96; r.total > height && s >= 0.6; s -= 0.04) r = layout(s, {});
  // below the comfortable size: quote, then title, give up lines before the body is cut
  const caps: Record<string, number> = {};
  for (const [id, n] of [['quote', 3], ['quote', 2], ['title', 3], ['title', 2]] as const) {
    if (r.total <= height) break;
    caps[id] = n;
    r = layout(0.6, caps);
  }
  const body = blocks.find((b) => b.id === 'body');
  if (r.total > height && body) {
    const rest = r.placed.filter((p) => p.id !== 'body').reduce((t, p) => t + p.height, 0) + blocks.filter((b, i) => i > 0).reduce((t, b) => t + Math.round(b.gap * 0.6), 0);
    const bp = r.placed.find((p) => p.id === 'body')!;
    r = layout(0.6, caps, Math.max(1, Math.floor((height - rest) / bp.lh)));
  }
  return { ...r, overflow: r.total > height + 0.5 };
}
