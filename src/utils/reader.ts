// Pure helpers for the in-app article reader: plain-text extract -> sections, and bolding of key terms.

export type Section = { level: number; title: string; paras: string[] };
/** Stands in for a formula the plain-text extract dropped; the reader draws it as a small "formula" chip. */
export const FORMULA = '';

// Reference-only sections: nothing worth reading (their text is empty in extracts anyway).
const SKIP = new Set(
  ['see also', 'references', 'external links', 'further reading', 'notes', 'explanatory notes', 'footnotes', 'bibliography', 'citations', 'sources', 'جستارهای وابسته', 'پانویس', 'منابع', 'پیوند به بیرون', 'کتاب‌شناسی', 'یادداشت‌ها'],
);

/**
 * MediaWiki's plain-text extract: "== Heading ==" lines, one paragraph per line, and formulas dumped as runs of
 * indented junk lines. Headings start sections; each junk run is joined into the paragraph around it as a formula chip.
 */
export function parseArticle(text: string, title: string): Section[] {
  const sections: Section[] = [{ level: 1, title, paras: [] }];
  let cur = sections[0];
  let formula = false; // a junk run was just seen, so the next line continues the paragraph before it
  for (const raw of text.split('\n')) {
    if (!raw.trim()) continue;
    if (/^\s/.test(raw)) {
      formula = true;
      continue;
    }
    const line = raw.trim();
    const h = line.match(/^(={2,6})\s*(.+?)\s*\1$/);
    if (h) {
      cur = { level: h[1].length, title: h[2], paras: [] };
      sections.push(cur);
      formula = false;
    } else if (formula && cur.paras.length) {
      cur.paras[cur.paras.length - 1] += ` ${FORMULA} ${line}`;
      formula = false;
    } else {
      cur.paras.push(line);
      formula = false;
    }
  }
  return sections.filter((s) => s.paras.length && (s.level === 1 || !SKIP.has(s.title.toLowerCase())));
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Finds `term` as a whole word, tolerant of how Persian is typed: ی/ي and ک/ك are interchangeable, a ZWNJ matches a
 * space, and a ZWNJ-joined suffix is kept ("ماتریس" bolds all of "ماتریس‌ها"). No `g` flag, so exec() always finds the first match.
 */
export function termRegex(term: string): RegExp {
  const body = [...term.trim()]
    .map((ch) => (ch === 'ی' || ch === 'ي' ? '[یي]' : ch === 'ک' || ch === 'ك' ? '[کك]' : ch === '‌' || /\s/.test(ch) ? '[\\u200c\\s]' : esc(ch)))
    .join('');
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?:\\u200c\\p{L}+)?(?![\\p{L}\\p{N}])`, 'iu');
}

/** The AI's term list, cleaned: short strings that really occur in the article (it may paraphrase or invent), no duplicates. */
export function cleanTerms(raw: unknown, text: string): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of raw) {
    const t = typeof x === 'string' ? x.trim() : '';
    const k = t.toLowerCase();
    if (t.length < 2 || t.length > 60 || seen.has(k) || !termRegex(t).test(text)) continue;
    seen.add(k);
    out.push(t);
  }
  return out.slice(0, 30);
}

export type Seg = { text: string; term?: number };

/**
 * Splits a paragraph into plain and bold segments. A term is bolded at its first mention in a section only
 * (`seen` is shared by the section's paragraphs), so bold marks where each idea is introduced instead of everywhere.
 */
export function boldSegments(para: string, terms: RegExp[], seen: Set<number>): Seg[] {
  const hits: { s: number; e: number; i: number }[] = [];
  terms.forEach((re, i) => {
    const m = seen.has(i) ? null : re.exec(para);
    if (m) hits.push({ s: m.index, e: m.index + m[0].length, i });
  });
  hits.sort((a, b) => a.s - b.s || b.e - b.s - (a.e - a.s)); // earliest first; at a tie the longer term wins
  const out: Seg[] = [];
  let pos = 0;
  for (const h of hits) {
    if (h.s < pos) continue; // overlaps a bolded term; left unseen so a later paragraph can bold it
    if (h.s > pos) out.push({ text: para.slice(pos, h.s) });
    out.push({ text: para.slice(h.s, h.e), term: h.i });
    seen.add(h.i);
    pos = h.e;
  }
  if (pos < para.length) out.push({ text: para.slice(pos) });
  return out;
}

/** An outline (headings + the start of each section) small enough to send to the AI instead of the whole article. */
export function outline(sections: Section[], max = 9000): string {
  const out: string[] = [];
  let len = 0;
  for (const s of sections) {
    const block = `## ${s.title}\n${s.paras.slice(0, 2).join(' ').replaceAll(FORMULA, ' ').slice(0, 450)}`;
    if (len + block.length > max) break;
    out.push(block);
    len += block.length;
  }
  return out.join('\n\n');
}
