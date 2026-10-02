import type { Format, FormatId, Frame } from './types';

/** Instagram covers about the top and bottom 14% of a story with its own bars, so the story format keeps clear of them. */
export const FORMATS: Format[] = [
  { id: 'portrait', name: 'پست ۴:۵', w: 1080, h: 1350, safeTop: 0, safeBottom: 0 },
  { id: 'square', name: 'مربع', w: 1080, h: 1080, safeTop: 0, safeBottom: 0 },
  { id: 'story', name: 'استوری', w: 1080, h: 1920, safeTop: 250, safeBottom: 270 },
  { id: 'tall', name: '۱۲۰۰×۱۵۰۰', w: 1200, h: 1500, safeTop: 0, safeBottom: 0 },
];
export const DEFAULT_FORMAT: FormatId = 'portrait';
export const formatOf = (id: string): Format => FORMATS.find((f) => f.id === id) ?? FORMATS[0];

/** Design units: `u` is 1 at 1080 px wide, so one template serves every format. */
export function frameOf(format: Format, scale = 1): Frame {
  const u = (format.w / 1080) * scale;
  return { w: format.w * scale, h: format.h * scale, u, pad: Math.round(72 * u), safeTop: format.safeTop * scale, safeBottom: format.safeBottom * scale };
}
