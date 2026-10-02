// Moving data between devices without a server: a backup is gzipped into a URL fragment (never sent anywhere), and
// everything that comes back in, from a link or a file, is treated as untrusted and rebuilt field by field.
import type { Card, Course, Day, Pack, Page, Question, State, Terms, Usage, UsageKind } from '../types/course';
import { ROLES, cleanPack, courseKey, wikiUrl } from './course';

// ---------- link encoding ----------
const toB64Url = (u8: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64Url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export async function pack(json: string): Promise<string> {
  const gz = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  return toB64Url(new Uint8Array(await new Response(gz).arrayBuffer()));
}

/** Inverse of pack. `max` caps the decompressed size, so a tiny link cannot expand into gigabytes. */
export async function unpack(text: string, max = 5_000_000): Promise<string> {
  const reader = new Blob([fromB64Url(text)]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new Error('too-big');
    }
    parts.push(value);
  }
  return new TextDecoder().decode(await new Blob(parts as BlobPart[]).arrayBuffer());
}

// ---------- sanitizers ----------
const WIKI = /^https:\/\/[a-z-]{2,12}\.wikipedia\.org\//;
const LANG = /^[a-z-]{2,12}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const str = (x: unknown, max = 2000) => (typeof x === 'string' ? x.slice(0, max) : '');
const num = (x: unknown, lo: number, hi: number) => (typeof x === 'number' && Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : NaN);
const rec = (x: unknown): Record<string, unknown> => (x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {});
const arr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);

/** A page with a Wikipedia-only link (so no `javascript:` or tracking URL can reach an href) and an https thumbnail. */
export function sanitizePage(p: unknown): Page | null {
  const o = rec(p);
  const title = str(o.title, 300).trim();
  const lang = str(o.lang, 12);
  if (!title || !LANG.test(lang)) return null;
  const url = typeof o.url === 'string' && WIKI.test(o.url) ? o.url.slice(0, 600) : wikiUrl(lang, title);
  const thumbnail = typeof o.thumbnail === 'string' && o.thumbnail.startsWith('https://') ? o.thumbnail.slice(0, 1000) : undefined;
  return { title, lang, url, summary: str(o.summary, 3000), ...(thumbnail && { thumbnail }) };
}

/** A course whose key matches its article (the key is an address in storage, so a forged one could overwrite another course). */
export function sanitizeCourse(c: unknown): Course | null {
  const o = rec(c);
  const root = sanitizePage(o.root);
  if (!root || o.key !== courseKey(root.lang, root.title)) return null;
  const topics = arr(o.topics)
    .map((t) => {
      const p = sanitizePage(t);
      const r = rec(t);
      const role = ROLES.find((x) => x === r.role);
      const score = num(r.score, 0, 100);
      return p && role && !Number.isNaN(score) ? { ...p, role, score: Math.round(score), why: str(r.why, 600) } : null;
    })
    .filter((t): t is NonNullable<typeof t> => !!t)
    .slice(0, 40);
  if (!topics.length) return null;
  const opts = rec(o.opts);
  const depth = (['quick', 'standard', 'deep'] as const).find((d) => d === opts.depth);
  const purpose = (['general', 'exam', 'work', 'research'] as const).find((d) => d === opts.purpose);
  return { key: o.key as string, root, topics, sources: [], ...(o.note ? { note: str(o.note, 500) } : {}), ...(depth && purpose ? { opts: { depth, purpose } } : {}), generatedAt: str(o.generatedAt, 40) };
}

export function sanitizePack(p: unknown): Pack | null {
  const o = rec(p);
  const lang = str(o.lang, 12);
  const title = str(o.title, 300);
  if (!title || !LANG.test(lang) || o.key !== courseKey(lang, title)) return null;
  const { keyPoints, cards, quiz } = cleanPack(o as never);
  return keyPoints.length || cards.length || quiz.length ? { key: o.key as string, lang, title, keyPoints, cards: cards as Card[], quiz: quiz as Question[], generatedAt: str(o.generatedAt, 40) } : null;
}

export function sanitizeTerms(t: unknown): Terms | null {
  const o = rec(t);
  const lang = str(o.lang, 12);
  const title = str(o.title, 300);
  if (!title || !LANG.test(lang) || o.key !== courseKey(lang, title)) return null;
  const terms = arr(o.terms).filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length < 80).slice(0, 60);
  return terms.length ? { key: o.key as string, lang, title, terms, generatedAt: str(o.generatedAt, 40) } : null;
}

/** Only the list and map fields a backup carries, each entry checked; scalars (goal, onboarded, lastBackup) are never imported. */
export function sanitizeState(s: unknown): Partial<State> {
  const o = rec(s);
  const strings = (x: unknown, max: number) => arr(x).filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 400).slice(0, max);
  const out: Partial<State> = {
    known: strings(o.known, 5000),
    days: strings(o.days, 5000).filter((d) => DAY.test(d)),
    saved: arr(o.saved).map(sanitizePage).filter((p): p is Page => !!p).slice(0, 500),
    recent: arr(o.recent)
      .map((r) => {
        const x = rec(r);
        const lang = str(x.lang, 12);
        const title = str(x.title, 300);
        return title && LANG.test(lang) && x.key === courseKey(lang, title) ? { key: x.key as string, title, lang, ...(typeof x.thumbnail === 'string' && x.thumbnail.startsWith('https://') ? { thumbnail: x.thumbnail.slice(0, 1000) } : {}) } : null;
      })
      .filter((r): r is NonNullable<typeof r> => !!r)
      .slice(0, 100),
    notes: {},
    boxes: {},
    quiz: {},
    meta: {},
    log: {},
    pos: {},
  };
  const each = (x: unknown, f: (k: string, v: unknown) => void) => Object.entries(rec(x)).slice(0, 20000).forEach(([k, v]) => k.length <= 400 && f(k, v));
  each(o.notes, (k, v) => typeof v === 'string' && (out.notes![k] = v.slice(0, 5000)));
  each(o.boxes, (k, v) => {
    const b = rec(v);
    const box = num(b.box, 1, 5);
    if (!Number.isNaN(box) && typeof b.due === 'string' && DAY.test(b.due)) out.boxes![k] = { box: Math.round(box), due: b.due };
  });
  each(o.quiz, (k, v) => { const n = num(v, 0, 100); if (!Number.isNaN(n)) out.quiz![k] = Math.round(n); });
  each(o.pos, (k, v) => { const n = num(v, 0, 1); if (!Number.isNaN(n)) out.pos![k] = n; });
  each(o.meta, (k, v) => {
    const m = rec(v);
    const last = num(m.last, 0, 8.64e15);
    if (!Number.isNaN(last)) out.meta![k] = { last, ...(m.archived === true ? { archived: true } : {}) };
  });
  each(o.log, (k, v) => {
    if (!DAY.test(k)) return;
    const d = rec(v);
    const n = (x: unknown) => { const y = num(x, 0, 1e7); return Number.isNaN(y) ? 0 : Math.round(y); };
    out.log![k] = { cards: n(d.cards), known: n(d.known), quiz: n(d.quiz), sec: n(d.sec) } satisfies Day;
  });
  const kinds: UsageKind[] = ['course', 'pack', 'terms', 'test'];
  const usage = arr(o.usage)
    .map((v): Usage | null => {
      const x = rec(v);
      const t = num(x.t, 0, 8.64e15), inT = num(x.inT, 0, 1e8), outT = num(x.outT, 0, 1e8);
      if (Number.isNaN(t) || Number.isNaN(inT) || Number.isNaN(outT) || !kinds.includes(x.kind as UsageKind)) return null;
      return { t, kind: x.kind as UsageKind, model: str(x.model, 80), inT: Math.round(inT), outT: Math.round(outT), ...(x.est === true ? { est: true } : {}), ...(x.retry === true ? { retry: true } : {}) };
    })
    .filter((u): u is Usage => !!u)
    .slice(-1000);
  if (usage.length) out.usage = usage; // the price is a local preference: never taken from a file
  return out;
}
