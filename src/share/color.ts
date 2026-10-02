const rgb = (h: string): [number, number, number] => {
  const x = h.replace('#', '');
  const f = x.length === 3 ? x.replace(/./g, (c) => c + c) : x;
  return [0, 2, 4].map((i) => parseInt(f.slice(i, i + 2), 16)) as [number, number, number];
};
const hex = (c: number[]) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;

export const alpha = (h: string, a: number) => {
  const [r, g, b] = rgb(h);
  return `rgba(${r},${g},${b},${a})`;
};
export const mix = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return hex(x.map((v, i) => v + (y[i] - v) * t));
};
export const luminance = (h: string) => {
  const [r, g, b] = rgb(h).map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

/** `fg` pushed toward black or white (whichever helps) until it reads on `bg` at the given ratio: for an accent colour the user picked used as text. */
export function readable(fg: string, bg: string, min = 4.5) {
  const target = luminance(bg) > 0.4 ? '#000000' : '#ffffff';
  for (let t = 0; t <= 1; t += 0.05) {
    const c = mix(fg, target, t);
    if (contrast(c, bg) >= min) return c;
  }
  return target;
}

/** The better of two text colours on `bg` (for text on a colour the user picked). */
export const onColor = (bg: string, dark = '#10230F', light = '#FFFFFF') => (contrast(dark, bg) >= contrast(light, bg) ? dark : light);
