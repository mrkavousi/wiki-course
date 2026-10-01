// Builds a course (and a topic's study pack, and its key terms) from Wikipedia + an OpenAI-compatible chat endpoint.
//   Wikipedia -> article summary/thumbnail, lead-section links, plain text
//   AI (ArvanCloud gateway -> Gemini 2.5 Flash-lite) -> prerequisites / next steps / related scored 0-100, flashcards, quiz, key terms
// Only needs fetch: runs in the browser (the app; both APIs allow CORS) and in Node (scripts/build-course.ts).
import type { AI, Course, Pack, Page, Topic } from '../types/course';
import { ROLES, cleanItems, cleanPack, courseKey, extractLists, parseWikiUrl, topicKey } from '../utils/course';
import { cleanTerms, outline, parseArticle } from '../utils/reader';

export type Status = (message: string) => void;

const TRIES = 6;
const UA = 'wiki-course/0.2 (personal learning app)';
// Browsers can't set User-Agent; Wikimedia accepts Api-User-Agent instead (and allows it in CORS preflights).
const WIKI_HEADERS: Record<string, string> = typeof window === 'undefined' ? { 'User-Agent': UA } : { 'Api-User-Agent': UA };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fa = (n: number) => n.toLocaleString('fa');

async function getJson(url: string, init?: RequestInit) {
  for (let i = 0; ; i++) {
    const res = await fetch(url, init);
    if ((res.status === 429 || res.status >= 500) && i < 4) { // rate limit / blip
      await sleep(Math.min(20, Number(res.headers.get('retry-after')) || 2 * 2 ** i) * 1000);
      continue;
    }
    // Host only: the AI gateway's URL path carries a secret token.
    if (!res.ok) throw Object.assign(new Error(`${res.status} ${new URL(url).host}: ${(await res.text()).slice(0, 160)}`), { status: res.status });
    return res.json();
  }
}

// ---------- Wikipedia ----------
const wiki = (lang: string, params: Record<string, string>) =>
  getJson(`https://${lang}.wikipedia.org/w/api.php?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`, { headers: WIKI_HEADERS });

async function summary(lang: string, title: string): Promise<Page | null> {
  try {
    const r = await getJson(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { headers: WIKI_HEADERS });
    if (r.type === 'disambiguation') return null;
    return { title: r.title, lang, url: r.content_urls.desktop.page, summary: r.extract ?? '', thumbnail: r.thumbnail?.source };
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e; // rate limit / network: don't pretend the article doesn't exist
  }
}

/** The title as given, or the closest real article (the model often misses ی/ي, ZWNJ or capitalisation). */
async function resolve(lang: string, title: string) {
  const exact = await summary(lang, title);
  if (exact) return exact;
  const r = await wiki(lang, { action: 'query', list: 'search', srsearch: title, srlimit: '1', srprop: '' });
  const hit: string | undefined = r.query?.search?.[0]?.title;
  return hit ? summary(lang, hit) : null;
}

/** Links in the article's lead section: few and the most relevant (all links come alphabetically, hundreds of them). */
async function leadLinks(lang: string, title: string): Promise<string[]> {
  const r = await wiki(lang, { action: 'parse', page: title, prop: 'links', section: '0', redirects: '1' });
  return (r.parse?.links ?? []).filter((l: any) => l.ns === 0 && l.exists).map((l: any) => l.title);
}

async function articleText(lang: string, title: string) {
  const r = await wiki(lang, { action: 'query', prop: 'extracts', explaintext: '1', redirects: '1', titles: title });
  return String(r.query?.pages?.[0]?.extract ?? '').slice(0, 8000);
}

/** A whole article as plain text (parse it with parseArticle), with its lead image and canonical title and URL. */
export type Article = { lang: string; title: string; url: string; thumbnail?: string; text: string };

export async function fetchArticle(lang: string, title: string): Promise<Article> {
  const r = await wiki(lang, {
    action: 'query', prop: 'extracts|pageimages|info', explaintext: '1', exsectionformat: 'wiki',
    piprop: 'thumbnail', pithumbsize: '900', inprop: 'url', redirects: '1', titles: title,
  });
  const p = r.query?.pages?.[0];
  if (!p || p.missing || !p.extract) throw new Error(`مقاله‌ای با عنوان «${title}» در ${lang}.wikipedia.org پیدا نشد`);
  return { lang, title: p.title, url: p.fullurl, thumbnail: p.thumbnail?.source, text: p.extract };
}

const inBatches = async <T, R>(xs: T[], f: (x: T) => Promise<R>, n = 3) => {
  const out: R[] = [];
  for (let i = 0; i < xs.length; i += n) out.push(...(await Promise.all(xs.slice(i, i + n).map(f))));
  return out;
};

// ---------- AI ----------
async function chat(ai: AI, prompt: string): Promise<string> {
  const r = await getJson(`${ai.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `apikey ${ai.key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ model: ai.model, messages: [{ role: 'user', content: prompt }] }),
  }).catch((e: Error) => {
    throw new Error(`هوش مصنوعی: ${e.message}`);
  });
  return r.choices?.[0]?.message?.content ?? ''; // may be empty: the gateway sometimes returns '' with finish=stop
}

/** True when the endpoint answers at all (settings "test connection"). */
export const testAI = async (ai: AI) => (await chat(ai, 'Reply with the single word: ok')).trim().length > 0;

/** How to turn a parsed reply into usable items, and when that's good enough to stop asking. */
type Judge<K extends string, T> = { clean: (d: Record<K, unknown[]>) => T; enough: (t: T) => boolean; size: (t: T) => number };

/**
 * Ask until the cleaned reply is good enough. The gateway randomly cuts answers short ('', '```json', half a JSON)
 * and the model sometimes writes broken JSON, so weak replies are retried; if none is good enough, the fullest one wins.
 */
async function askJson<K extends string, T>(ai: AI, prompt: string, keys: readonly K[], status: Status, judge: Judge<K, T>): Promise<T> {
  let text = '';
  let best: T | undefined;
  for (let i = 1; i <= TRIES; i++) {
    status(i === 1 ? 'در حال پرسیدن از هوش مصنوعی…' : `پاسخ ناقص بود؛ تلاش ${fa(i)} از ${fa(TRIES)}…`);
    if (i > 1) await sleep(1500 * (i - 1));
    text = await chat(ai, prompt);
    try {
      const t = judge.clean(extractLists(text, keys));
      if (judge.enough(t)) return t;
      if (best === undefined || judge.size(t) > judge.size(best)) best = t;
    } catch {}
  }
  if (best !== undefined && judge.size(best) > 0) return best;
  throw new Error(text.trim() ? `پاسخ مدل قابل استفاده نبود: «${text.slice(0, 120).replace(/\s+/g, ' ')}»` : `پاسخ مدل خالی بود (${fa(TRIES)} بار تلاش شد)`);
}

const coursePrompt = (root: Page, candidates: string[]) => `You design learning paths from Wikipedia articles.
Article: "${root.title}" (${root.lang}.wikipedia.org)
Summary: ${root.summary}
Articles linked from its introduction (prefer these titles when they fit; you may use others): ${candidates.join(' | ')}

Base your judgement on how university syllabi, textbooks and learning roadmaps order this subject. Answer with ONE JSON object and nothing else:
{"prereq":[...],"next":[...],"related":[...]}
- prereq: up to 5 topics a learner should know BEFORE reading this article; score = how essential (0-100).
- next: up to 5 topics to read AFTER it; score = how natural a next step it is (0-100).
- related: up to 5 neighbouring topics that are neither; score = topical closeness (0-100).
Each item: {"title": exact article title on ${root.lang}.wikipedia.org, "score": number, "why": one Persian sentence naming the evidence, "summary": one short Persian sentence explaining the topic}.
Output raw JSON, no code fence, no commentary. Never repeat a title across lists. Do not include "${root.title}" itself.`;

const PACK_KEYS = ['keyPoints', 'cards', 'quiz'] as const;
const packPrompt = (title: string, text: string) => `You are a teacher writing study material in Persian (Farsi) about the Wikipedia article "${title}".
Base it on the article text below; if the text is short, add only well-established basics.
Answer with ONE raw JSON object (no code fence, no commentary), keys in exactly this order:
{"keyPoints":[3-5 short Persian sentences: the most important ideas],
 "cards":[6 flashcards {"q": short Persian question, "a": short Persian answer, at most 2 sentences}],
 "quiz":[4 multiple-choice questions {"q": Persian question, "options": [4 short Persian options], "answer": index 0-3 of the correct option, "explain": one Persian sentence why}]}
Test understanding, not trivia. Vary the position of the correct option.

Article text:
${text}`;

const termsPrompt = (a: Pick<Article, 'lang' | 'title'>, outline: string) => `You help a learner skim the Wikipedia article "${a.title}" (${a.lang}.wikipedia.org).
Below is its outline: each section heading followed by the start of that section.
Pick the 20-30 terms most worth bolding: key concepts and defined terms, named people, places and works, and important numbers, dates or quantities.
Rules: copy each term EXACTLY as it is written in the text (same language, spelling and letters, no re-inflecting), 1-5 words each; no generic words; no duplicates.
Answer with ONE raw JSON object and nothing else: {"terms":["...","..."]}

${outline}`;

// ---------- Builders ----------
/** Key terms for the enhanced reader. The AI only sees an outline, and anything it returns that isn't in the article is dropped. */
export async function buildTerms(a: Pick<Article, 'lang' | 'title' | 'text'>, ai: AI, status: Status = () => {}): Promise<string[]> {
  const prompt = termsPrompt(a, outline(parseArticle(a.text, a.title)));
  return askJson(ai, prompt, ['terms'] as const, status, {
    clean: (d) => cleanTerms(d.terms, a.text),
    enough: (t) => t.length >= 8,
    size: (t) => t.length,
  });
}

export async function buildCourse(url: string, ai: AI, status: Status = () => {}): Promise<Course> {
  const { lang, title } = parseWikiUrl(url);
  status('در حال خواندن ویکی‌پدیا…');
  const [root, candidates] = await Promise.all([summary(lang, title), leadLinks(lang, title).catch(() => [])]);
  if (!root) throw new Error(`مقاله‌ای با عنوان «${title}» در ${lang}.wikipedia.org پیدا نشد`);

  const roles = await askJson(ai, coursePrompt(root, candidates), ROLES, status, {
    clean: (d) => ({ prereq: cleanItems(d.prereq), next: cleanItems(d.next), related: cleanItems(d.related) }),
    enough: (r) => r.prereq.length >= 2 && r.next.length >= 2 && r.prereq.length + r.next.length + r.related.length >= 8,
    size: (r) => r.prereq.length + r.next.length + r.related.length,
  });

  status('در حال پیدا کردن مقاله‌ها در ویکی‌پدیا…');
  const seen = new Set([topicKey(root)]);
  const topics: Topic[] = [];
  for (const role of ROLES) {
    const items = roles[role];
    const pages = await inBatches(items, (it) => resolve(lang, it.title));
    items.forEach((it, i) => {
      const p = pages[i];
      if (!p || seen.has(topicKey(p))) return; // not found, the article itself, or already placed in an earlier role
      seen.add(topicKey(p));
      topics.push({ ...p, summary: it.summary || p.summary, role, score: it.score, why: it.why });
    });
  }
  if (!topics.length) throw new Error('هیچ موضوع معتبری از پاسخ مدل به‌دست نیامد');
  return { key: courseKey(lang, root.title), root, topics, sources: [], generatedAt: new Date().toISOString() };
}

export async function buildPack(page: Pick<Page, 'lang' | 'title'>, ai: AI, status: Status = () => {}): Promise<Pack> {
  status('در حال خواندن متن مقاله…');
  const text = await articleText(page.lang, page.title);
  const pack = await askJson(ai, packPrompt(page.title, text), PACK_KEYS, status, {
    clean: cleanPack,
    enough: (p) => p.cards.length >= 5 && p.quiz.length >= 3,
    size: (p) => p.cards.length + p.quiz.length,
  });
  return { key: courseKey(page.lang, page.title), lang: page.lang, title: page.title, ...pack, generatedAt: new Date().toISOString() };
}
