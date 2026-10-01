// Smoke tests for the main learner flows. Wikipedia and the AI gateway are stubbed, so nothing here touches the network.
import { expect, test, type Page } from '@playwright/test';

const COURSE = '#/c/fa-%D8%AC%D8%A8%D8%B1_%D8%AE%D8%B7%DB%8C'; // bundled sample: جبر خطی
const state = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('wc:state') || '{}'));

/** Seeds localStorage before the app starts (a plain evaluate would be overwritten by the running app). */
const seed = (page: Page, s: Record<string, unknown> = {}) =>
  page.addInitScript((v) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('wc:state', JSON.stringify({ onboarded: true, ...v }));
      sessionStorage.setItem('seeded', '1'); // only the first load: later reloads keep what the app saved
    }
  }, s);

const putKv = (page: Page, key: string, value: unknown) =>
  page.evaluate(async ([k, v]) => (await caches.open('wiki-course')).put(`/__kv/${encodeURIComponent(k as string)}`, new Response(JSON.stringify(v), { headers: { 'content-type': 'application/json' } })), [key, value]);

const PACK = {
  key: 'fa-ریاضیات', lang: 'fa', title: 'ریاضیات', keyPoints: ['نکته'], generatedAt: '',
  cards: [1, 2, 3].map((i) => ({ q: `سؤال ${i}`, a: `جواب ${i}` })),
  quiz: [0, 1, 2, 3].map((i) => ({ q: `پرسش ${i}`, options: ['الف', 'ب', 'ج', 'د'], answer: 1, explain: `توضیح ${i}` })),
};

/** A tiny Wikipedia: summaries by title, a long article, no search hits. */
async function stubWikipedia(page: Page) {
  await page.route('**/api/rest_v1/page/summary/**', (r) => {
    const title = decodeURIComponent(new URL(r.request().url()).pathname.split('/').pop()!).replace(/_/g, ' ');
    return r.fulfill({ json: { title, type: 'standard', extract: `خلاصه‌ی ${title}`, description: 'Test article', timestamp: '2026-01-01T00:00:00Z', content_urls: { desktop: { page: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}` } } } });
  });
  await page.route('**/w/api.php**', (r) => {
    const q = new URL(r.request().url()).searchParams;
    if (q.get('action') === 'parse') return r.fulfill({ json: { parse: { links: [] } } });
    if (q.get('list') === 'search') return r.fulfill({ json: { query: { search: [] } } });
    const body = Array.from({ length: 40 }, (_, i) => `== Section ${i} ==\n${'Linear algebra text. '.repeat(60)}`).join('\n');
    return r.fulfill({ json: { query: { pages: [{ title: q.get('titles'), fullurl: 'https://en.wikipedia.org/wiki/X', extract: `Intro paragraph.\n${body}` }] } } });
  });
}

test('home: onboarding dismiss persists', async ({ page }) => {
  await page.addInitScript(() => localStorage.getItem('wc:state') || localStorage.setItem('wc:state', '{}'));
  await page.goto('/');
  await page.getByRole('button', { name: 'بستن راهنما' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'از هر مقاله، یک مسیر یادگیری' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'بستن راهنما' })).toHaveCount(0);
});

test('course: mark known shows the next step and records activity', async ({ page }) => {
  await seed(page);
  await page.goto(COURSE);
  await page.locator('button[aria-pressed]', { hasText: 'ریاضیات' }).first().click();
  await page.getByRole('button', { name: 'این را بلدم' }).click();
  await expect(page.getByText('موضوع بعدی:').first()).toBeVisible();
  const s = await state(page);
  const day = Object.keys(s.log)[0];
  expect(s.known).toEqual(['fa:ریاضیات']);
  expect(s.log[day].known).toBe(1);
  expect(s.meta['fa-جبر_خطی'].last).toBeGreaterThan(0);
});

test('cards: hard/good/easy ratings show intervals and schedule boxes', async ({ page }) => {
  await seed(page);
  await page.goto(COURSE);
  await putKv(page, 'pack/fa-ریاضیات', PACK);
  await page.reload();
  await page.locator('button[aria-pressed]', { hasText: 'ریاضیات' }).first().click();
  await page.getByRole('tab', { name: /فلش‌کارت/ }).click();
  await page.getByRole('button', { name: 'نمایش جواب' }).click();
  await expect(page.getByRole('group', { name: 'چقدر یادت بود؟' })).toContainText('فردا');
  await page.keyboard.press('1');
  await page.getByRole('button', { name: 'نمایش جواب' }).click();
  await page.keyboard.press('2');
  await page.getByRole('button', { name: 'نمایش جواب' }).click();
  await page.keyboard.press('3');
  await expect(page.getByText('مرور تمام شد')).toBeVisible();
  const s = await state(page);
  expect(Object.values<any>(s.boxes).map((b) => b.box)).toEqual([1, 1, 2]);
  expect(s.log[Object.keys(s.log)[0]].cards).toBe(3);
});

test('quiz: failing recommends review, then passing marks known', async ({ page }) => {
  await seed(page);
  await page.goto(COURSE);
  await putKv(page, 'pack/fa-ریاضیات', PACK);
  await page.reload();
  await page.locator('button[aria-pressed]', { hasText: 'ریاضیات' }).first().click();
  await page.getByRole('tab', { name: /آزمون/ }).click();
  await expect(page.getByText('آستانه‌ی قبولی')).toBeVisible();
  for (let i = 0; i < 4; i++) { // always the first (wrong) option
    await page.locator('main li button').first().click();
    await page.getByRole('button', { name: /سؤال بعد|دیدن نتیجه/ }).click();
  }
  await expect(page.getByRole('button', { name: 'مرور فلش‌کارت‌ها' })).toBeVisible();
  expect((await state(page)).known).toEqual([]);
  await page.getByRole('button', { name: 'آزمون دوباره' }).click();
  await page.getByRole('button', { name: /نمی‌دانم/ }).click(); // a skip counts as wrong: 3/4 = 75% still passes
  for (let i = 0; i < 3; i++) {
    await page.locator('main li button').nth(1).click();
    await page.getByRole('button', { name: /سؤال بعد|دیدن نتیجه/ }).click();
  }
  await expect(page.getByText(/تسلط کافی/)).toBeVisible();
  const s = await state(page);
  expect(s.quiz['fa:ریاضیات']).toBe(75);
  expect(s.known).toContain('fa:ریاضیات');
});

test('review: due card with a missing pack says so instead of "all done"', async ({ page }) => {
  await seed(page, { boxes: { 'fa:ghost#0': { box: 1, due: '2020-01-01' } } });
  await page.goto('#/review');
  await expect(page.getByText('کارت‌هایت منتظرند')).toBeVisible();
});

test('library: search with no hits, archive and filter', async ({ page }) => {
  await seed(page);
  await page.goto('#/library');
  const cards = page.locator('article');
  await cards.first().waitFor();
  const all = await cards.count();
  await page.getByRole('button', { name: /بایگانی «جبر خطی»/ }).click();
  await expect(cards).toHaveCount(all - 1);
  await page.getByLabel('وضعیت').selectOption('archived');
  await expect(cards).toHaveCount(1);
  await page.getByLabel('وضعیت').selectOption('');
  await page.getByLabel('جست‌وجو در کتابخانه').fill('zzzz');
  await expect(page.getByText('دوره‌ای پیدا نشد')).toBeVisible();
});

test('builder: preview, depth and purpose reach the prompt, build, then delete', async ({ page }) => {
  await stubWikipedia(page);
  let prompt = '';
  await page.route('https://stub.test/**', async (r) => {
    prompt = JSON.parse(r.request().postData()!).messages[0].content;
    const it = (title: string, score: number) => ({ title, score, why: 'دلیل', summary: 'خلاصه' });
    const body = { prereq: [it('Function', 90), it('Limit', 80)], next: [it('Integral', 90), it('Series', 80)], related: [it('Derivative', 60), it('Physics', 50)] };
    await r.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*' }, json: { choices: [{ message: { content: JSON.stringify(body) } }] } });
  });
  await seed(page);
  await page.addInitScript(() => localStorage.setItem('wc:ai', JSON.stringify({ baseUrl: 'https://stub.test/v1', key: 'k', model: 'm' })));
  await page.goto('#/new');
  await page.getByLabel('لینک مقاله‌ی ویکی‌پدیا').fill('https://example.com/x');
  await page.getByRole('button', { name: 'بررسی مقاله' }).click();
  await expect(page.locator('#wiki-url-err')).toContainText('لینک ویکی‌پدیا معتبر نیست');
  await page.getByLabel('لینک مقاله‌ی ویکی‌پدیا').fill('https://en.wikipedia.org/wiki/Calculus');
  await page.getByRole('button', { name: 'بررسی مقاله' }).click();
  await expect(page.getByText('آنچه ساخته می‌شود')).toBeVisible();
  await page.getByLabel('سریع').check();
  await page.getByLabel('امتحان').check();
  await page.getByRole('button', { name: 'ساخت دوره', exact: true }).click();
  await page.waitForURL(/#\/c\/en-Calculus/);
  expect(prompt).toContain('up to 3 topics');
  expect(prompt).toContain('preparing for an exam');
  const s = await state(page);
  expect(s.recent.map((r: any) => r.key)).toEqual(['en-Calculus']);
  await page.goto('#/library');
  await page.getByRole('button', { name: 'حذف «Calculus»' }).click();
  await page.getByRole('button', { name: 'حذف دوره' }).click();
  await expect(page.getByRole('heading', { name: 'Calculus' })).toHaveCount(0);
});

test('backup: invalid, too-new and v1 files are handled; v1 merges', async ({ page }) => {
  await seed(page);
  await page.goto('#/settings');
  const pick = (name: string, data: unknown) => page.locator('input[type=file]').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(data)) });
  await pick('bad.json', { app: 'other' });
  await expect(page.getByText('این فایل پشتیبان Wiki Course نیست')).toBeVisible();
  await pick('new.json', { app: 'wiki-course', version: 9 });
  await expect(page.getByText('نسخه‌ی جدیدتری')).toBeVisible();
  await pick('v1.json', { app: 'wiki-course', version: 1, state: { known: ['fa:zz'], days: ['2020-01-01'] }, courses: [], packs: [], terms: [] });
  await expect(page.getByText('پشتیبان بازیابی شد')).toBeVisible();
  const s = await state(page);
  expect(s.known).toContain('fa:zz');
  expect(s.lastBackup).toBeTruthy();
});

test('reader: scroll position is restored and the next topic is offered', async ({ page }) => {
  await stubWikipedia(page);
  await seed(page);
  await page.goto('#/read/fa/ریاضیات?c=fa-جبر_خطی');
  await page.locator('article h1').waitFor();
  const next = page.locator('div.fixed.bottom-16 a, a:has-text("موضوع بعدی")').first();
  await expect(next).toContainText('دستگاه معادلات خطی');
  await page.evaluate(() => { const sc = document.querySelector<HTMLElement>('.page-in')!; const el = sc.scrollHeight > sc.clientHeight && getComputedStyle(sc).overflowY === 'auto' ? sc : document.documentElement; const max = el.scrollHeight - el.clientHeight; el === sc ? sc.scrollTo({ top: max / 2 }) : scrollTo({ top: max / 2 }); });
  await expect.poll(async () => (await state(page)).pos?.['fa:ریاضیات'] ?? 0, { timeout: 5000 }).toBeGreaterThan(0.4);
  await page.reload();
  await expect(page.getByText('از جایی که مانده بودی ادامه می‌دهی')).toBeVisible();
});

for (const route of ['#/', '#/new', '#/library', '#/discover', '#/insights', '#/review', COURSE]) {
  test(`phone layout: no horizontal overflow at ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await seed(page);
    await page.goto(route);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('phone: a topic is its own screen with a breadcrumb, and Back returns to the path', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await seed(page);
  await page.goto(COURSE);
  await page.locator('button[aria-pressed]', { hasText: 'ریاضیات' }).first().click();
  await expect(page).toHaveURL(/\?t=fa%3A/);
  await expect(page.getByRole('navigation', { name: 'مسیر صفحه' })).toContainText('ریاضیات');
  await expect(page.getByRole('tab', { name: 'درباره' })).toBeVisible();
  await expect(page.locator('button[aria-pressed]', { hasText: 'دستگاه معادلات' })).toBeHidden(); // the path is not on this screen
  await page.goBack();
  await expect(page.locator('button[aria-pressed]', { hasText: 'دستگاه معادلات' }).first()).toBeVisible();
  // a deep link opens straight on the topic
  await page.goto(`${COURSE}?t=${encodeURIComponent('fa:دستگاه معادلات خطی')}`);
  await expect(page.getByRole('heading', { name: 'دستگاه معادلات خطی' })).toBeVisible();
});

test('course shows an approximate level; builder estimates days from minutes per day', async ({ page }) => {
  await seed(page);
  await page.goto(COURSE);
  await expect(page.getByText(/سطح تقریبی: (مقدماتی|متوسط|پیشرفته)/)).toBeVisible();
  await stubWikipedia(page);
  await page.goto('#/new?url=' + encodeURIComponent('https://en.wikipedia.org/wiki/Calculus'));
  await page.getByText('روزی چقدر وقت داری؟').waitFor();
  const before = await page.getByText(/با این ریتم، حدود/).innerText();
  await page.getByLabel('۱۵ دقیقه').check();
  expect(await page.getByText(/با این ریتم، حدود/).innerText()).not.toBe(before);
});

test('cards: swiping a flipped card right grades it good', async ({ page }) => {
  await seed(page);
  await page.goto(COURSE);
  await putKv(page, 'pack/fa-ریاضیات', PACK);
  await page.reload();
  await page.locator('button[aria-pressed]', { hasText: 'ریاضیات' }).first().click();
  await page.getByRole('tab', { name: /فلش‌کارت/ }).click();
  const card = page.getByRole('button', { name: 'نمایش جواب' });
  await card.click();
  await page.getByRole('button', { name: 'نمایش سؤال' }).evaluate((el) => {
    const fire = (type: string, x: number) => el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'touch', clientX: x, clientY: 300 }));
    fire('pointerdown', 100);
    fire('pointerup', 260);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true })); // the click a real swipe release produces
  });
  await expect(page.getByText('کارت ۲ از ۳')).toBeVisible();
  const s = await state(page);
  expect(Object.values<any>(s.boxes).map((b) => b.box)).toEqual([1]);
  await expect(page.getByRole('button', { name: 'نمایش جواب' })).toBeVisible(); // still on the question side: no stray flip
});

test('search: arrow keys move through results', async ({ page }) => {
  await seed(page);
  await page.goto('/');
  await page.getByRole('heading', { level: 1 }).waitFor(); // the shortcut exists once the app has mounted
  await page.keyboard.press('Control+k');
  await page.getByLabel('عبارت جست‌وجو یا لینک ویکی‌پدیا').fill('a');
  const results = page.locator('#search-results a');
  await results.first().waitFor();
  await page.keyboard.press('ArrowDown');
  await expect(results.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(results.nth(1)).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByLabel('عبارت جست‌وجو یا لینک ویکی‌پدیا')).toBeFocused();
});

test('settings: theme and weekly goal persist; wiping data asks first', async ({ page }) => {
  await seed(page);
  await page.goto('#/settings');
  await page.getByLabel('تیره').check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByLabel('هدفم در هفته:').selectOption('3');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect((await state(page)).goal).toBe(3);
  await page.getByRole('button', { name: 'حذف همه‌ی داده‌های من' }).click();
  await expect(page.getByRole('heading', { name: 'همه‌ی داده‌ها حذف شود؟' })).toBeVisible();
  await page.getByRole('button', { name: 'انصراف' }).click();
  expect((await state(page)).goal).toBe(3); // cancelled: nothing was deleted
});

test('share: a course link opens in a fresh browser, previews, and adds only after confirming', async ({ page, browser }) => {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await seed(page);
  await page.goto(COURSE);
  await page.getByText('خروجی و پرامپت').click();
  await page.getByRole('button', { name: 'کپی لینک اشتراک‌گذاری دوره' }).click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('#/import?d=');
  const link = await page.evaluate(() => navigator.clipboard.readText());

  const other = await (await browser.newContext({ baseURL: 'http://localhost:4173' })).newPage();
  await other.addInitScript(() => localStorage.setItem('wc:state', JSON.stringify({ onboarded: true })));
  await other.goto(link);
  await expect(other.getByRole('heading', { name: 'افزودن از لینک' })).toBeVisible();
  await expect(other.getByText('جبر خطی')).toBeVisible();
  expect((await state(other)).recent ?? []).toEqual([]); // previewing adds nothing
  await other.getByRole('button', { name: 'افزودن به کتابخانه‌ی من' }).click();
  await expect(other).toHaveURL(/#\/c\/fa-/);
  expect((await state(other)).recent.map((r: any) => r.key)).toEqual(['fa-جبر_خطی']);
  await other.close();
});

test('share: a broken or malicious link is refused and changes nothing', async ({ page }) => {
  await seed(page);
  await page.goto('#/import?d=not-a-real-link');
  await expect(page.getByText('این لینک باز نشد')).toBeVisible();
  await page.goto('#/import');
  await expect(page.getByText('لینک ناقص است')).toBeVisible();
  expect((await state(page)).recent ?? []).toEqual([]);
});

test('builder: typing words searches Wikipedia, and picking a result previews that article', async ({ page }) => {
  await seed(page);
  await stubWikipedia(page);
  // registered after stubWikipedia, so it wins for search requests
  await page.route('**/w/api.php**', (r, req = r.request()) => {
    const q = new URL(req.url()).searchParams;
    if (q.get('generator') !== 'search') return r.fallback();
    return r.fulfill({ json: { query: { pages: [{ title: 'Calculus', index: 1, description: 'Branch of maths' }, { title: 'Calculus (dental)', index: 2 }] } } });
  });
  await page.goto('#/new');
  await page.getByLabel('لینک مقاله‌ی ویکی‌پدیا').fill('calcul');
  await expect(page.getByRole('button', { name: /Calculus.*Branch of maths/ })).toBeVisible();
  await page.getByRole('button', { name: /Calculus.*Branch of maths/ }).click();
  await expect(page.getByRole('heading', { name: 'Calculus' })).toBeVisible();
  await expect(page.getByText('آنچه ساخته می‌شود')).toBeVisible();
});

test('reader: other-language versions come from Wikipedia language links and open in the reader', async ({ page }) => {
  await seed(page);
  await stubWikipedia(page);
  await page.route('**/w/api.php**', (r) => {
    const q = new URL(r.request().url()).searchParams;
    if (q.get('prop') !== 'langlinks') return r.fallback();
    return r.fulfill({ json: { query: { pages: [{ title: 'Calculus', langlinks: [{ lang: 'de', autonym: 'Deutsch', title: 'Analysis' }, { lang: 'fa', autonym: 'فارسی', title: 'حساب دیفرانسیل' }] }] } } });
  });
  await page.goto('#/read/en/Calculus');
  await page.getByRole('button', { name: 'زبان‌های دیگر' }).click();
  await expect(page.getByRole('link', { name: /Deutsch/ })).toBeVisible();
  await page.getByRole('link', { name: /فارسی/ }).click();
  await expect(page).toHaveURL(/#\/read\/fa\//);
});
