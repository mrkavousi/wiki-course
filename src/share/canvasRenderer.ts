import { frameOf } from './formats';
import type { Assets, Format, Report, ShareData, ShareTemplate } from './types';

const images = new Map<string, Promise<HTMLImageElement | null>>();
/** Loads a picture once (kept for later renders); a failure (network, CORS) is `null`, never an error: the template then draws without it. */
export function loadImage(src?: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  let p = images.get(src);
  if (!p) {
    p = new Promise((res) => {
      const i = new Image();
      if (!/^(blob|data):/.test(src)) i.crossOrigin = 'anonymous'; // a tainted canvas could not be exported
      i.onload = () => res(i.naturalWidth ? i : null);
      i.onerror = () => res(null);
      i.src = src;
    });
    images.set(src, p);
  }
  return p;
}

let fonts: Promise<unknown> | undefined;
const ensureFonts = () => (fonts ??= Promise.all([400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 40px Vazirmatn`, 'متن Text 2026'))));

/** Draws one template into `canvas` at the format's size times `scale` (thumbnails use a small scale). The same function makes the preview and the exported file. */
const gen = new WeakMap<HTMLCanvasElement, number>();
/** Resolves with the report, or null when a newer draw into the same canvas started meanwhile (so a slow older one never overwrites it). */
export async function drawTemplate(canvas: HTMLCanvasElement, tpl: ShareTemplate, data: ShareData, format: Format, scale = 1): Promise<Report | null> {
  const my = (gen.get(canvas) ?? 0) + 1;
  gen.set(canvas, my);
  const [, cover, logo] = await Promise.all([ensureFonts(), loadImage(data.coverImage), loadImage(data.logo ?? '/icon.svg')]);
  if (gen.get(canvas) !== my) return null;
  const f = frameOf(format, scale);
  canvas.width = Math.round(f.w);
  canvas.height = Math.round(f.h);
  const c = canvas.getContext('2d')!;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  const assets: Assets = { cover, logo };
  return tpl.draw(c, data, f, assets);
}
