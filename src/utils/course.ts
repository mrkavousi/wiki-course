import type { Card, Course, Question, Role, Topic } from '../types/course';

export const ROLES: Role[] = ['prereq', 'next', 'related'];
export const ROLE_LABEL: Record<Role, string> = { prereq: 'پیش‌نیاز', next: 'پس‌نیاز', related: 'مرتبط' };
export const topicKey = (p: { lang: string; title: string }) => `${p.lang}:${p.title}`;
export const courseKey = (lang: string, title: string) => `${lang}-${title.replace(/[^\p{L}\p{N}]+/gu, '_')}`;
export const wikiUrl = (lang: string, title: string) => `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;

/** https://fa.wikipedia.org/wiki/Foo_bar#x -> { lang: 'fa', title: 'Foo bar' } */
export function parseWikiUrl(input: string) {
  const m = input.trim().match(/^(?:https?:\/\/)?([a-z-]+)(?:\.m)?\.wikipedia\.org\/wiki\/([^?#]+)/i);
  if (!m) throw new Error('لینک ویکی‌پدیا معتبر نیست (مثل https://fa.wikipedia.org/wiki/…)');
  return { lang: m[1].toLowerCase(), title: decodeURIComponent(m[2]).replace(/_/g, ' ') };
}

/** The model may wrap its JSON in a code fence or prose, so cut it out by braces. */
export function extractJson(text: string): unknown {
  const a = text.indexOf('{');
  const b = text.lastIndexOf('}');
  if (a < 0 || b < a) throw new Error('پاسخ مدل JSON نبود');
  return JSON.parse(text.slice(a, b + 1));
}

/**
 * Like extractJson, but a reply cut off mid-way still yields every complete item before the cut:
 * each key's array is scanned for whole {…} objects and "…" strings.
 */
export function extractLists<K extends string>(text: string, keys: readonly K[]): Record<K, unknown[]> {
  try {
    return extractJson(text) as Record<K, unknown[]>;
  } catch {
    const out = Object.fromEntries(keys.map((k) => [k, []])) as unknown as Record<K, unknown[]>;
    const anyKey = new RegExp(`"(?:${keys.join('|')})"\\s*:`);
    for (const k of keys) {
      const open = new RegExp(`"${k}"\\s*:\\s*\\[`).exec(text);
      if (!open) continue;
      const rest = text.slice(open.index + open[0].length); // scan from just inside the "[" so tokens line up
      const end = rest.search(anyKey); // the next key bounds this section
      for (const m of (end < 0 ? rest : rest.slice(0, end)).matchAll(/\{[^{}]*\}|"(?:[^"\\]|\\.)*"/g)) {
        try { out[k].push(JSON.parse(m[0])); } catch {}
      }
    }
    if (!keys.some((k) => out[k].length)) throw new Error('پاسخ مدل JSON نبود');
    return out;
  }
}

export type RawItem = { title: string; score: number; why: string; summary: string };

/** Validate one role's list from the model: right shape, 0-100 score, ≤6, strongest first. */
export function cleanItems(raw: unknown): RawItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x.title === 'string' && x.title.trim())
    .map((x) => ({
      title: x.title.trim(),
      score: Math.round(Math.min(100, Math.max(0, Number(x.score) || 0))),
      why: String(x.why ?? ''),
      summary: String(x.summary ?? ''),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

const str = (x: unknown) => (typeof x === 'string' ? x.trim() : '');
const list = (x: unknown): any[] => (Array.isArray(x) ? x.filter((v) => v !== null && v !== undefined) : []);

/** Validate a study pack from the model; drops cards without both sides and questions whose answer index is off. */
export function cleanPack(raw: Partial<Record<'keyPoints' | 'cards' | 'quiz', unknown>>) {
  const keyPoints = list(raw.keyPoints).map(str).filter(Boolean).slice(0, 6);
  const cards: Card[] = list(raw.cards)
    .map((c) => ({ q: str(c.q), a: str(c.a) }))
    .filter((c) => c.q && c.a)
    .slice(0, 10);
  const quiz: Question[] = list(raw.quiz)
    .map((x) => ({ q: str(x.q), options: list(x.options).map(str), answer: Number(x.answer), explain: str(x.explain) }))
    .filter((x) => x.q && x.options.length >= 2 && x.options.every(Boolean) && Number.isInteger(x.answer) && x.answer >= 0 && x.answer < x.options.length)
    .slice(0, 8);
  return { keyPoints, cards, quiz };
}

/** Learning order: prerequisites (most essential first), the article itself, then next steps. Related stays off the path. */
export function pathOf(course: Course): { topic: Topic | null; page: Course['root'] }[] {
  const by = (r: Role) => course.topics.filter((t) => t.role === r).sort((a, b) => b.score - a.score);
  return [
    ...by('prereq').map((t) => ({ topic: t, page: t })),
    { topic: null, page: course.root },
    ...by('next').map((t) => ({ topic: t, page: t })),
  ];
}
