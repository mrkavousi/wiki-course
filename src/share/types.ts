export type Ctx = CanvasRenderingContext2D;

/** What a template may show. Every field except the title and the brand is optional: a missing one drops its block and the layout closes the gap. */
export type ShareData = {
  title: string;
  excerpt?: string;
  body?: string;
  quote?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  author?: string;
  category?: string;
  tags?: string[];
  logo?: string;
  coverImage?: string;
  coverCredit?: string; // shown with the picture, e.g. «تصویر: ویکی‌پدیا»
  accentColor?: string;
  brandName: 'Wiki Course';
};

export type FormatId = 'portrait' | 'square' | 'story' | 'tall';
export type Format = { id: FormatId; name: string; w: number; h: number; safeTop: number; safeBottom: number };

/** The canvas a template draws on, in design units: everything is laid out for 1080 px of width and scaled by `u`. */
export type Frame = { w: number; h: number; u: number; pad: number; safeTop: number; safeBottom: number };

export type Report = { truncated: boolean; overflow: boolean; minFontPx: number; usedImage: boolean };

export type Assets = { cover: HTMLImageElement | null; logo: HTMLImageElement | null };

/** A template is one file with this shape; adding a template means adding it to templates/index.ts. */
export type ShareTemplate = {
  id: string;
  name: string;
  accent: string; // default accent colour
  /** Colours the text sits on and the text colours used there: only for the contrast test. `inverse` is light text on dark parts of an otherwise light template. */
  palette: { surfaces: string[]; text: string; muted: string; inverse?: { surfaces: string[]; text: string; muted: string } };
  draw(c: Ctx, d: ShareData, f: Frame, a: Assets): Report;
};
