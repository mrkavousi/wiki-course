// One-off: captures real app screens for the landing page into public/landing/ (PNG; converted to WebP with sharp (1440 px wide desktop, 600 px phone, q78)).
// Usage: npx vite preview --port 4173 & PW_CHANNEL=chrome npx tsx scripts/capture-landing.ts   (SHOTS=reader,share captures only those)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = 'public/landing';
const course = JSON.parse(readFileSync('public/courses/fa-جبر_خطی.json', 'utf8'));
const KEY = encodeURIComponent(course.key);
const topics: { lang: string; title: string }[] = course.topics;
const tk = (t: { lang: string; title: string }) => `${t.lang}:${t.title}`;
const today = new Date();
const day = (n: number) => new Date(today.getTime() - n * 864e5).toISOString().slice(0, 10);
const ref = (k: string, title: string, lang: string) => ({ key: k, title, lang });

const state = {
  onboarded: true,
  recent: [ref(course.key, course.root.title, 'fa'), ref('en-Machine_learning', 'Machine learning', 'en'), ref('fa-ایران', 'ایران', 'fa')],
  known: topics.slice(0, 4).map(tk),
  quiz: { [tk(topics[0])]: 85 },
  days: [0, 1, 2, 3, 5].map(day),
  log: Object.fromEntries([0, 1, 2, 3, 5].map((n) => [day(n), { cards: 6 + n, known: 4, quiz: 1, sec: 900 }])),
  meta: { [course.key]: { last: Date.now() } },
  goal: 5,
};
const PACK = (t: { lang: string; title: string }) => ({
  key: tk(t), lang: t.lang, title: t.title, generatedAt: '', keyPoints: ['نکته‌ی نخست', 'نکته‌ی دوم'],
  cards: [1, 2, 3, 4, 5, 6].map((i) => ({ q: `پرسش ${i}`, a: `پاسخ ${i}` })), quiz: [],
});

const READ = `#/read/fa/${encodeURIComponent(topics[0].title)}?c=${KEY}`;
/** Scrolls whichever element scrolls the reader (an inner pane on desktop, the window on phones). */
const scrollReader = (p: import('@playwright/test').Page, y: number) =>
  p.evaluate((y) => { const sc = document.querySelector<HTMLElement>('.page-in')!; sc.scrollHeight > sc.clientHeight && getComputedStyle(sc).overflowY === 'auto' ? sc.scrollTo({ top: y }) : scrollTo({ top: y }); }, y).then(() => p.waitForTimeout(700));

const shots: [name: string, hash: string, wait?: string, act?: (p: import('@playwright/test').Page) => Promise<void>][] = [
  ['dashboard', '#/app'],
  ['builder', '#/new'],
  ['roadmap', `#/c/${KEY}`],
  ['graph', `#/c/${KEY}`, undefined, async (p) => { await p.getByRole('button', { name: 'گراف' }).click(); await p.waitForTimeout(1500); }],
  ['topic', `#/c/${KEY}?t=${encodeURIComponent(tk(topics[0]))}`],
  ['reader', READ, undefined, async (p) => { await p.waitForTimeout(2500); await scrollReader(p, 460); }],
  ['readerCards', READ, undefined, async (p) => { await p.waitForTimeout(2500); await scrollReader(p, 700); }],
  ['focus', READ, undefined, async (p) => { await p.waitForTimeout(2500); await p.getByRole('button', { name: 'حالت تمرکز' }).click(); await scrollReader(p, 900); }],
  ['share', READ, undefined, async (p) => { await p.waitForTimeout(2500); await p.getByRole('button', { name: /^اشتراک‌گذاری فصل/ }).first().click(); await p.getByRole('radio', { name: process.env.TPL ?? 'میراث تزئینی' }).click(); await p.waitForTimeout(3500); }],
  ['insights', '#/insights'],
  ['library', '#/library'],
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL });
for (const theme of ['dark', 'light'] as const) {
  for (const [dev, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]] as const) {
    const ctx = await browser.newContext({ viewport: vp, locale: 'fa-IR', deviceScaleFactor: dev === 'm' ? 2 : 1, colorScheme: theme, serviceWorkers: 'block', isMobile: dev === 'm' });
    const page = await ctx.newPage();
    await page.addInitScript(([s, t]) => { if (!sessionStorage.getItem('seeded')) { localStorage.clear(); localStorage.setItem('wc:state', JSON.stringify(s)); localStorage.setItem('wc:theme', JSON.stringify(t)); sessionStorage.setItem('seeded', '1'); } }, [state, theme] as const);
    await page.goto(`${BASE}/#/app`);
    await page.evaluate(async (packs) => { const c = await caches.open('wiki-course'); for (const p of packs) await c.put(`/__kv/${encodeURIComponent('pack:' + p.key)}`, new Response(JSON.stringify(p), { headers: { 'content-type': 'application/json' } })); }, [PACK(topics[0])]);
    for (const [name, hash, , act] of shots) {
      if (process.env.SHOTS && !process.env.SHOTS.split(',').includes(name)) continue;
      await page.goto(`${BASE}/${hash}`);
      await page.waitForTimeout(1200);
      if (act) await act(page);
      await page.screenshot({ path: `${OUT}/${name}-${dev}-${theme}.png` });
      console.log(name, dev, theme);
    }
    await ctx.close();
  }
}
await browser.close();
