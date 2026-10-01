// Everything is stored in this browser: small state in localStorage, courses and study packs in Cache Storage
// (they can outgrow localStorage's ~5MB). Backup files move it all to another device.
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AI, Course, CourseRef, Pack, Page, State, Terms } from '../types/course';
import { topicKey } from '../utils/course';
import { EMPTY_STATE, PASS, mergeBackup, rate, today } from '../utils/learn';
import samplesJson from './samples.json';

// localStorage can throw (private mode, quota), so every access is guarded.
export const local = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown): boolean {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  },
};

// ---------- courses & packs ----------
// Cache Storage needs a secure context (https or localhost); fall back to localStorage elsewhere (e.g. http on a LAN IP).
const hasCaches = typeof caches !== 'undefined';
const kvUrl = (k: string) => `/__kv/${encodeURIComponent(k)}`;
const kv = {
  async get<T>(k: string): Promise<T | undefined> {
    if (!hasCaches) return local.get<T | undefined>(`wc:kv:${k}`, undefined);
    return (await (await caches.open('wiki-course')).match(kvUrl(k)))?.json();
  },
  async set(k: string, v: unknown) {
    if (!hasCaches) return void local.set(`wc:kv:${k}`, v);
    await (await caches.open('wiki-course')).put(kvUrl(k), new Response(JSON.stringify(v), { headers: { 'content-type': 'application/json' } }));
  },
  async all<T>(prefix: string): Promise<T[]> {
    if (!hasCaches) return Object.keys(localStorage).filter((k) => k.startsWith(`wc:kv:${prefix}`)).map((k) => local.get<T>(k, null as T));
    const cache = await caches.open('wiki-course');
    const reqs = (await cache.keys()).filter((r) => decodeURIComponent(new URL(r.url).pathname.slice(6)).startsWith(prefix));
    return Promise.all(reqs.map(async (r) => (await cache.match(r))!.json()));
  },
};

/** Courses shipped with the site: the list is bundled (renders without a fetch), each body is public/courses/<key>.json. */
export const SAMPLES: CourseRef[] = samplesJson;

/** A course built on this device, else the bundled sample with that key. */
export async function findCourse(key: string): Promise<Course | null> {
  const mine = await kv.get<Course>(`course/${key}`);
  if (mine) return mine;
  if (!SAMPLES.some((s) => s.key === key)) return null;
  const res = await fetch(`/courses/${encodeURIComponent(key)}.json`).catch(() => null);
  return res?.ok ? res.json() : null;
}
export const saveCourse = (c: Course) => kv.set(`course/${c.key}`, c);
export const loadPack = (key: string) => kv.get<Pack>(`pack/${key}`);
export const savePack = (p: Pack) => kv.set(`pack/${p.key}`, p);
export const loadTerms = (key: string) => kv.get<Terms>(`terms/${key}`);
export const saveTerms = (t: Terms) => kv.set(`terms/${t.key}`, t);
export const courseRef = (c: Course): CourseRef => ({ key: c.key, title: c.root.title, lang: c.root.lang, thumbnail: c.root.thumbnail });

// ---------- backup ----------
export async function backupJson(state: State) {
  const [courses, packs, terms] = await Promise.all([kv.all<Course>('course/'), kv.all<Pack>('pack/'), kv.all<Terms>('terms/')]);
  return JSON.stringify({ app: 'wiki-course', version: 1, exportedAt: new Date().toISOString(), state, courses, packs, terms });
}
/** Stores the backup's courses and packs; returns its state for the caller to merge. The AI key is never in a backup. */
export async function restoreJson(text: string): Promise<Partial<State>> {
  const b = JSON.parse(text);
  if (b?.app !== 'wiki-course') throw new Error('این فایل پشتیبان Wiki Course نیست');
  await Promise.all([
    ...(b.courses ?? []).map((c: Course) => saveCourse(c)),
    ...(b.packs ?? []).map((p: Pack) => savePack(p)),
    ...(b.terms ?? []).map((t: Terms) => saveTerms(t)),
  ]);
  return b.state ?? {};
}

// ---------- settings ----------
export const DEFAULT_AI: AI = { baseUrl: '', key: '', model: 'Gemini-2.5-Flash-lite' };
export const loadAI = (): AI => ({ ...DEFAULT_AI, ...local.get<Partial<AI>>('wc:ai', {}) });
export const saveAI = (ai: AI) => local.set('wc:ai', ai);

export type ThemePref = 'auto' | 'light' | 'dark';
/** Same rule as the inline script in index.html, which applies it before the first paint. */
export function applyTheme(pref: ThemePref) {
  const dark = pref === 'dark' || (pref === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

// ---------- learner state ----------
const pageOf = (p: Page): Page => ({ title: p.title, lang: p.lang, url: p.url, summary: p.summary, thumbnail: p.thumbnail });

export function useStore() {
  const [state, setState] = useState<State>(() => {
    const s = { ...EMPTY_STATE, ...local.get<Partial<State>>('wc:state', {}) };
    const legacy = local.get<string[]>('wiki-course:known', []); // phase-1 progress
    return legacy.length ? { ...s, known: [...new Set([...s.known, ...legacy])] } : s;
  });
  const [saveOk, setSaveOk] = useState(true);

  useEffect(() => {
    const ok = local.set('wc:state', state);
    setSaveOk(ok);
    if (ok) try { localStorage.removeItem('wiki-course:known'); } catch {} // migrated only once it is safely saved
  }, [state]);

  // Learning actions also mark today as active (streak).
  const update = useCallback(
    (fn: (s: State) => State, active = false) =>
      setState((s) => {
        const n = fn(s);
        const day = today();
        return active && !n.days.includes(day) ? { ...n, days: [...n.days, day] } : n;
      }),
    [],
  );

  const actions = useMemo(
    () => ({
      toggleKnown: (key: string) =>
        update((s) => ({ ...s, known: s.known.includes(key) ? s.known.filter((k) => k !== key) : [...s.known, key] }), true),
      toggleSaved: (p: Page) =>
        update((s) => {
          const k = topicKey(p);
          return { ...s, saved: s.saved.some((x) => topicKey(x) === k) ? s.saved.filter((x) => topicKey(x) !== k) : [pageOf(p), ...s.saved] };
        }),
      setNote: (key: string, text: string) => update((s) => ({ ...s, notes: { ...s.notes, [key]: text } })),
      rateCard: (id: string, ok: boolean) => update((s) => ({ ...s, boxes: { ...s.boxes, [id]: rate(s.boxes[id], ok, today()) } }), true),
      /** Best score is kept; passing marks the topic as known. */
      quizDone: (key: string, pct: number) =>
        update(
          (s) => ({
            ...s,
            quiz: { ...s.quiz, [key]: Math.max(pct, s.quiz[key] ?? 0) },
            known: pct >= PASS && !s.known.includes(key) ? [...s.known, key] : s.known,
          }),
          true,
        ),
      addRecent: (c: Course) => update((s) => ({ ...s, recent: [courseRef(c), ...s.recent.filter((r) => r.key !== c.key)].slice(0, 60) })),
      restore: (b: Partial<State>) => update((s) => mergeBackup(s, b)),
    }),
    [update],
  );

  return { state, saveOk, ...actions };
}
export type Store = ReturnType<typeof useStore>;

// ---------- reader preferences ----------
export type ReaderMode = 'easy' | 'enhanced';
export const READER_SIZES = [1, 1.125, 1.25, 1.4, 1.6]; // rem; index 1 (18px) is the default
export type ReaderPrefs = { mode: ReaderMode; size: number };

export function useReaderPrefs() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(() => {
    const p = local.get<Partial<ReaderPrefs>>('wc:reader', {});
    return { mode: p.mode === 'enhanced' ? 'enhanced' : 'easy', size: Number.isInteger(p.size) && p.size! >= 0 && p.size! < READER_SIZES.length ? p.size! : 1 };
  });
  const set = useCallback((next: Partial<ReaderPrefs>) => {
    setPrefs((prev) => {
      const n = { ...prev, ...next };
      local.set('wc:reader', n);
      return n;
    });
  }, []);
  return [prefs, set] as const;
}

// ---------- routes ----------
const dec = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s; // a hand-edited, malformed hash must not crash the app
  }
};

/** Hash routes keep static hosting simple: #/ library, #/c/<key> course, #/read/<lang>/<title> reader, #/review flashcards. */
export function useRoute() {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const f = () => setHash(location.hash);
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  if (hash.startsWith('#/c/')) return { name: 'course' as const, key: dec(hash.slice(4)) };
  if (hash.startsWith('#/read/')) {
    const rest = hash.slice(7);
    const at = rest.indexOf('/');
    if (at > 0 && at < rest.length - 1) return { name: 'read' as const, lang: rest.slice(0, at), title: dec(rest.slice(at + 1)) };
  }
  if (hash === '#/review') return { name: 'review' as const };
  return { name: 'library' as const };
}
export const courseHref = (key: string) => `#/c/${encodeURIComponent(key)}`;
export const readHref = (lang: string, title: string) => `#/read/${lang}/${encodeURIComponent(title)}`;
