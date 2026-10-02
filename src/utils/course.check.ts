import assert from 'node:assert/strict';
import type { Course, State } from '../types/course';
import { cleanItems, cleanPack, courseKey, extractJson, extractLists, parseWikiUrl, ROLES } from './course';
import { courseMarkdown, nextStep, PROMPTS } from './export';
import { EMPTY_STATE, dueIds, mergeBackup, nextDue, nextInterval, rate, streak } from './learn';
import { courseStats, daysAt, levelOf, nextAction, weakTopics, weekStats } from './progress';
import { sanitizeCourse, sanitizePack, sanitizePage, sanitizeState, pack as packLink, unpack } from './share';
import { seed, subjectOf } from './subject';
import { FORMULA, boldSegments, cleanTerms, outline, parseArticle, termRegex } from './reader';

assert.deepEqual(parseWikiUrl('https://en.wikipedia.org/wiki/Linear_algebra#History'), { lang: 'en', title: 'Linear algebra' });
assert.deepEqual(parseWikiUrl('fa.m.wikipedia.org/wiki/%D8%AC%D8%A8%D8%B1_%D8%AE%D8%B7%DB%8C'), { lang: 'fa', title: 'جبر خطی' });
assert.throws(() => parseWikiUrl('https://example.com/wiki/X'));

assert.deepEqual(extractJson('here:\n```json\n{"a":1}\n```'), { a: 1 });
assert.throws(() => extractJson('no json'));

const items = cleanItems([{ title: ' A ', score: 150 }, { title: 'B', score: 'x' }, { nope: 1 }, { title: 'C', score: 40, why: 'w' }]);
assert.deepEqual(items.map((i) => [i.title, i.score]), [['A', 100], ['C', 40], ['B', 0]]);
assert.equal(cleanItems(undefined).length, 0);
assert.equal(cleanItems(Array.from({ length: 9 }, (_, i) => ({ title: `t${i}`, score: i }))).length, 6);
assert.equal(cleanItems(Array.from({ length: 9 }, (_, i) => ({ title: `t${i}`, score: i })), 3).length, 3);

// A reply cut off mid-way keeps every complete item; junk from the cut is dropped by the cleaners.
const cut = '```json\n{"prereq":[{"title":"A","score":9},{"title":"B","score":8}],"next":[{"title":"C","score":7},{"title":"D","sc';
const roles = extractLists(cut, ROLES);
assert.deepEqual(roles.prereq, [{ title: 'A', score: 9 }, { title: 'B', score: 8 }]);
assert.deepEqual(cleanItems(roles.next).map((i) => i.title), ['C']);
assert.deepEqual(roles.related, []);
assert.throws(() => extractLists('```json', ROLES));

const packCut = '{"keyPoints":["یک","دو \\"نقل\\""],"cards":[{"q":"س۱","a":"ج۱"},{"q":"س۲"}],"quiz":[{"q":"ق","options":["a","b","c","d"],"answer":2,"explain":"e"},{"q":"x","options":["a","b"],"ans';
const pack = cleanPack(extractLists(packCut, ['keyPoints', 'cards', 'quiz']));
assert.deepEqual(pack.keyPoints, ['یک', 'دو "نقل"']);
assert.deepEqual(pack.cards, [{ q: 'س۱', a: 'ج۱' }]);
assert.equal(pack.quiz.length, 1);
assert.equal(cleanPack({ quiz: [{ q: 'q', options: ['a', 'b'], answer: 2 }, { q: 'q', options: ['a', ''], answer: 0 }] }).quiz.length, 0);

// Leitner: good climbs a box, easy two, hard drops one and is due tomorrow.
let box = rate(undefined, 'good', '2026-10-01');
assert.deepEqual(box, { box: 1, due: '2026-10-02' });
box = rate(box, 'good', '2026-10-02');
assert.deepEqual(box, { box: 2, due: '2026-10-04' });
assert.deepEqual(rate({ box: 5, due: '' }, 'good', '2026-10-01'), { box: 5, due: '2026-10-17' });
assert.deepEqual(rate(box, 'hard', '2026-10-04'), { box: 1, due: '2026-10-05' });
assert.deepEqual(rate({ box: 1, due: '' }, 'hard', '2026-10-04'), { box: 1, due: '2026-10-05' }, 'hard never goes below box 1');
assert.deepEqual(rate({ box: 2, due: '' }, 'easy', '2026-10-01'), { box: 4, due: '2026-10-09' });
assert.deepEqual(rate(undefined, 'easy', '2026-10-01'), { box: 2, due: '2026-10-03' });
assert.equal(nextInterval({ box: 2, due: '' }, 'good'), 4);
assert.equal(nextInterval({ box: 4, due: '' }, 'hard'), 1);
assert.equal(nextInterval(undefined, 'easy'), 2);
assert.equal(nextDue({ a: { box: 1, due: '2026-10-01' }, b: { box: 2, due: '2026-10-05' }, c: { box: 2, due: '2026-10-03' } }, '2026-10-02'), '2026-10-03');
assert.equal(nextDue({ a: { box: 1, due: '2026-10-01' } }, '2026-10-02'), null);
assert.deepEqual(dueIds({ a: { box: 1, due: '2026-10-01' }, b: { box: 2, due: '2026-10-03' } }, '2026-10-02'), ['a']);

assert.equal(streak(['2026-09-29', '2026-09-30', '2026-10-01'], '2026-10-01'), 3);
assert.equal(streak(['2026-09-29', '2026-09-30'], '2026-10-01'), 2); // today not done yet
assert.equal(streak(['2026-09-28'], '2026-10-01'), 0);

const local: State = { ...EMPTY_STATE, known: ['fa:a'], notes: { 'fa:a': 'old' }, days: ['2026-10-01'] };
const merged = mergeBackup(local, { known: ['fa:a', 'fa:b'], notes: { 'fa:a': 'new' }, days: ['2026-09-30'] });
assert.deepEqual(merged.known, ['fa:a', 'fa:b']);
assert.equal(merged.notes['fa:a'], 'new');
assert.deepEqual(merged.days, ['2026-09-30', '2026-10-01']);

const page = (title: string) => ({ title, lang: 'fa', url: `https://fa.wikipedia.org/wiki/${title}`, summary: `${title} summary` });
const course: Course = {
  key: 'fa-X',
  root: page('X'),
  topics: [
    { ...page('P1'), role: 'prereq', score: 90, why: 'w1' },
    { ...page('P2'), role: 'prereq', score: 50, why: 'w2' },
    { ...page('N1'), role: 'next', score: 80, why: 'w3' },
    { ...page('R1'), role: 'related', score: 40, why: 'w4' },
  ],
  sources: [],
  generatedAt: '',
};
const ctx = { course, known: new Set(['fa:P1']), notes: { 'fa:P2': 'my words' }, packs: {} };
const md = courseMarkdown(ctx);
assert.ok(md.includes('1. [x] **P1** — پیش‌نیاز · 90%'));
assert.ok(md.includes('2. [ ] **P2**') && md.includes('یادداشت من: my words'));
assert.ok(md.indexOf('**X**') < md.indexOf('**N1**'), 'root sits between prerequisites and next steps');
assert.ok(md.includes('## مطالب مرتبط') && md.includes('**R1**'));
assert.equal(nextStep(ctx).title, 'P2');
const tutor = PROMPTS.find((p) => p.id === 'tutor')!.build(ctx);
assert.ok(tutor.includes('گام بعدی من: «P2»') && tutor.includes('my words') && tutor.includes('1. ✓ P1'));

assert.equal(courseKey('en', 'Linear algebra'), 'en-Linear_algebra');

// New state fields merge sensibly: a day's counters keep the larger value, meta and pos take the backup's.
const withLog: State = { ...EMPTY_STATE, log: { '2026-10-01': { cards: 5, known: 0, quiz: 0, sec: 60 } }, meta: { a: { last: 1 } }, goal: 3 };
const m2 = mergeBackup(withLog, { log: { '2026-10-01': { cards: 2, known: 1, quiz: 0, sec: 90 } }, meta: { a: { last: 9, archived: true } }, pos: { 'fa:x': 0.4 } });
assert.deepEqual(m2.log['2026-10-01'], { cards: 5, known: 1, quiz: 0, sec: 90 });
assert.deepEqual(m2.meta.a, { last: 9, archived: true });
assert.equal(m2.pos['fa:x'], 0.4);
assert.equal(m2.goal, 3, 'scalars keep the local value');
assert.deepEqual(mergeBackup(EMPTY_STATE, {}), EMPTY_STATE, 'an old v1 backup (no new fields) changes nothing');

// Subject covers.
assert.equal(subjectOf({ title: 'جبر خطی' }), 'math');
assert.equal(subjectOf({ title: 'Quantum mechanics' }), 'physics');
assert.equal(subjectOf({ title: 'Python (programming language)' }), 'code');
assert.equal(subjectOf({ title: 'شاهنشاهی اشکانی' }), 'history');
assert.equal(subjectOf({ title: 'Cat', summary: 'a small organism and species of animal' }), 'biology');
assert.equal(subjectOf({ title: 'Banana' }), 'other');
assert.equal(seed('x'), seed('x'));

// ---------- reader ----------
// Plain-text extract: "== H ==" headings, one paragraph per line, formulas as runs of indented junk lines.
const extract = [
  'Linear algebra is the study of lines such as',
  '',
  '  ',
  '    a',
  '      1',
  'and their maps, with Gauss in 1809.',
  '== History ==',
  '',
  'It began early. Gauss used it.',
  'Second paragraph.',
  '=== Gauss ===',
  'Carl Friedrich Gauss worked on it.',
  '== See also ==',
  '',
  '== پانویس ==',
  '== Empty ==',
].join('\n');
const secs = parseArticle(extract, 'Linear algebra');
assert.deepEqual(secs.map((s) => [s.level, s.title, s.paras.length]), [[1, 'Linear algebra', 1], [2, 'History', 2], [3, 'Gauss', 1]]);
assert.equal(secs[0].paras[0], `Linear algebra is the study of lines such as ${FORMULA} and their maps, with Gauss in 1809.`);

// Terms: whole words only, Persian letter variants and ZWNJ suffixes tolerated.
assert.ok(termRegex('Gauss').test('Carl Gauss.') && !termRegex('Gauss').test('Gaussian'));
assert.ok(termRegex('ماتریس').test('ماتریس‌ها مهم‌اند') && !termRegex('ماتریس').test('ماتریسی‌شدن'.replace('‌', '')));
assert.ok(termRegex('علي').test('علی رفت'), 'Arabic yeh matches Persian yeh');
assert.ok(termRegex('نرم افزار').test('نرم‌افزار'), 'a space in the term matches a ZWNJ in the text');
assert.ok(termRegex('f(x)').test('the value f(x) is'), 'regex metacharacters in terms are escaped');
assert.deepEqual(cleanTerms(['Gauss', ' gauss ', 'Newton', 'x', 7, 'a'.repeat(80)], 'Carl Gauss lived'), ['Gauss']);
assert.deepEqual(cleanTerms('nope', 'text'), []);

// Bolding: first mention per section only, longest wins at the same spot, overlaps skipped, text preserved.
const terms = ['linear', 'linear algebra', 'Gauss'].map(termRegex);
const seen = new Set<number>();
const segs = boldSegments('Linear algebra needs Gauss and linear maps.', terms, seen);
assert.deepEqual(segs.filter((s) => s.term !== undefined).map((s) => [s.text, s.term]), [['Linear algebra', 1], ['Gauss', 2]]);
assert.equal(segs.map((s) => s.text).join(''), 'Linear algebra needs Gauss and linear maps.');
const next = boldSegments('Gauss again, and linear.', terms, seen); // same section: Gauss already bolded
assert.deepEqual(next.filter((s) => s.term !== undefined).map((s) => s.text), ['linear']);
assert.equal(boldSegments('no terms here', terms, new Set()).length, 1);
assert.ok(outline(secs).startsWith('## Linear algebra') && !outline(secs).includes(FORMULA));

assert.ok(courseMarkdown({ ...ctx, packs: { 'fa:P1': { key: 'fa-P1', lang: 'fa', title: 'P1', keyPoints: ['kp'], cards: [], quiz: [], generatedAt: '' } } }).includes('نکته‌ی کلیدی: kp'));
assert.ok(!/\p{Extended_Pictographic}/u.test(md + tutor), 'exports contain no emoji');

// ---------- progress ----------
const st: State = { ...EMPTY_STATE, known: ['fa:P1'], boxes: { 'fa:P2#0': { box: 1, due: '2026-10-01' }, 'fa:Z#0': { box: 1, due: '2026-10-01' } } };
const cs = courseStats(course, st, '2026-10-02');
assert.deepEqual([cs.total, cs.done, cs.pct, cs.due, cs.status], [4, 1, 25, 1, 'active'], 'due counts only this course\'s cards');
assert.equal(courseStats(course, { ...EMPTY_STATE }, '2026-10-02').status, 'new');
assert.equal(courseStats(course, { ...EMPTY_STATE, meta: { 'fa-X': { last: 5, archived: true } } }, '2026-10-02').status, 'archived');
assert.equal(courseStats(course, { ...EMPTY_STATE, known: ['fa:P1', 'fa:P2', 'fa:X', 'fa:N1'] }, '2026-10-02').status, 'done');

const wk = weekStats({ ...EMPTY_STATE, days: ['2026-10-02', '2026-09-20'], log: { '2026-10-02': { cards: 4, known: 1, quiz: 0, sec: 600 }, '2026-09-20': { cards: 9, known: 9, quiz: 9, sec: 9999 } } }, '2026-10-02');
assert.deepEqual([wk.rows.length, wk.active, wk.cards, wk.known, wk.minutes], [7, 1, 4, 1, 10], 'only the last 7 days count');

const href = (k: string) => `#/c/${k}`;
assert.equal(nextAction(st, [course], '2026-10-02', href).kind, 'review');
assert.equal(nextAction({ ...st, boxes: {} }, [course], '2026-10-02', href).href, '#/c/fa-X');
assert.equal(nextAction({ ...EMPTY_STATE, meta: { 'fa-X': { last: 5 } } }, [course], '2026-10-02', href).kind, 'continue');
assert.equal(nextAction(EMPTY_STATE, [], '2026-10-02', href).href, '#/new');
assert.deepEqual(weakTopics({ ...EMPTY_STATE, quiz: { 'fa:A': 50, 'fa:B': 90 }, boxes: { 'fa:C#1': { box: 1, due: '' }, 'fa:A#0': { box: 1, due: '' } } }).map((w) => [w.key, w.why]), [['fa:A', 'quiz'], ['fa:C', 'cards']]);

assert.equal(levelOf({ ...course, topics: [] }), 'intro');
assert.equal(levelOf(course), 'mid', 'two prerequisites is mid');
assert.equal(levelOf({ ...course, topics: Array.from({ length: 4 }, (_, i) => ({ ...page(`Q${i}`), role: 'prereq' as const, score: 1, why: '' })) }), 'adv');
assert.equal(daysAt(132, 30), 5);
assert.equal(daysAt(5, 60), 1);

// Course route carries an optional topic: #/c/<key>?t=<topicKey>.
// ---------- share links and untrusted imports ----------
assert.equal(sanitizePage({ title: 'T', lang: 'fa', url: 'javascript:alert(1)', summary: 's' })!.url, 'https://fa.wikipedia.org/wiki/T', 'a non-Wikipedia link is replaced');
assert.equal(sanitizePage({ title: 'T', lang: 'fa', url: 'https://evil.example/x' })!.url.startsWith('https://fa.wikipedia.org/'), true);
assert.equal(sanitizePage({ title: 'T', lang: 'F A!' }), null);
assert.equal(sanitizePage({ title: 'T', lang: 'fa', thumbnail: 'javascript:1' })!.thumbnail, undefined);
const good = { ...course, topics: [...course.topics, { title: 'Bad', lang: 'fa', role: 'hacker', score: 5 }, { title: 'Hi', lang: 'fa', role: 'next', score: 999, why: 'w' }] };
const clean = sanitizeCourse(good)!;
assert.equal(clean.topics.length, course.topics.length + 1, 'an unknown role is dropped');
assert.equal(clean.topics.at(-1)!.score, 100, 'scores are clamped');
assert.equal(sanitizeCourse({ ...course, key: 'fa-Other' }), null, 'a forged key is rejected');
assert.equal(sanitizeCourse({ ...course, topics: 'nope' }), null);
assert.equal(sanitizeCourse(null), null);
assert.equal(sanitizePack({ key: 'fa-P1', lang: 'fa', title: 'P1', cards: [{ q: 'a', a: 'b' }] })!.cards.length, 1);
assert.equal(sanitizePack({ key: 'fa-WRONG', lang: 'fa', title: 'P1', cards: [{ q: 'a', a: 'b' }] }), null);
const imported = sanitizeState({
  known: ['fa:a', 5, ''], days: ['2026-10-01', 'yesterday'], notes: { 'fa:a': 'n', 'fa:b': 7 }, quiz: { 'fa:a': 250, 'fa:b': 'x' },
  boxes: { 'fa:a#0': { box: 9, due: '2026-10-01' }, 'fa:b#0': { box: 1, due: 'soon' } }, pos: { 'fa:a': 3 }, log: { '2026-10-01': { cards: -4, known: 'x', quiz: 2, sec: 5 }, today: {} },
  goal: 99, lastBackup: 'x', recent: [{ key: 'fa-X', title: 'X', lang: 'fa' }, { key: 'forged', title: 'X', lang: 'fa' }],
});
assert.deepEqual(imported.known, ['fa:a']);
assert.deepEqual(imported.days, ['2026-10-01']);
assert.deepEqual(imported.notes, { 'fa:a': 'n' });
assert.deepEqual(imported.quiz, { 'fa:a': 100 });
assert.deepEqual(imported.boxes, { 'fa:a#0': { box: 5, due: '2026-10-01' } });
assert.deepEqual(imported.pos, { 'fa:a': 1 });
assert.deepEqual(imported.log, { '2026-10-01': { cards: 0, known: 0, quiz: 2, sec: 5 } });
assert.deepEqual(imported.recent!.map((r) => r.key), ['fa-X']);
assert.ok(!('goal' in imported) && !('lastBackup' in imported), 'scalars are never imported');

// Compression streams are async; the file runs as CommonJS, so no top-level await.
(async () => {
  const roundTrip = JSON.stringify({ a: 'سلام', b: 'x'.repeat(5000) });
  assert.equal(await unpack(await packLink(roundTrip)), roundTrip, 'a link round-trips Persian text');
  assert.ok((await packLink(roundTrip)).length < roundTrip.length / 5, 'the link is compressed');
  assert.match(await packLink('x'), /^[A-Za-z0-9_-]+$/, 'url-safe, nothing to escape in a fragment');
  await assert.rejects(unpack(await packLink('x'.repeat(100_000)), 1000), /too-big/, 'a small link cannot expand past the cap');
  await assert.rejects(unpack('not-gzip'));
  console.log('course.check ok');
})();

// ---------- AI usage log ----------
import { costOf, estimateTokens, summarize } from './usage';
import { mergeUsage } from './learn';
const PRICE = { in: 26_000, out: 104_000 };
assert.equal(costOf(1_000_000, 1_000_000, PRICE), 130_000, 'cost = input and output tokens at their own price per 1M');
assert.equal(costOf(0, 0, PRICE), 0);
assert.equal(estimateTokens('x'.repeat(30)), 10, 'about 3 characters per token');
const D = (iso: string) => new Date(`${iso}T12:00:00`).getTime();
const rows = [
  { t: D('2026-10-01'), kind: 'course' as const, model: 'm', inT: 1000, outT: 500 },
  { t: D('2026-10-07'), kind: 'pack' as const, model: 'm', inT: 2000, outT: 1000, retry: true },
  { t: D('2026-10-07'), kind: 'pack' as const, model: 'm', inT: 100, outT: 50, est: true },
];
const su = summarize(rows, PRICE, '2026-10-07');
assert.equal(su.today.calls, 2, 'two calls today');
assert.equal(su.week.calls, 3, 'the 1st is within 7 days of the 7th');
assert.equal(summarize(rows, PRICE, '2026-10-09').week.calls, 2, 'the 1st falls out of the window by the 9th');
assert.equal(su.all.inT, 3100);
assert.equal(su.byKind.pack?.calls, 2);
assert.equal(su.retries, 1);
assert.ok(su.all.est && !su.byKind.course?.est, 'a guessed count marks only the totals that include it');
assert.equal(mergeUsage(rows, rows).length, 3, 'merging the same log twice adds nothing');
assert.equal(mergeUsage([], rows, 2).length, 2, 'the log is capped, newest kept');
assert.equal(sanitizeState({ usage: [{ t: 1, kind: 'pack', model: 'm', inT: 5, outT: 6 }, { t: 1, kind: 'evil', inT: 1, outT: 1 }, { t: 'x' }] }).usage?.length, 1, 'bad usage rows are dropped');
assert.equal(sanitizeState({ price: { in: 1, out: 1 } }).price, undefined, 'the price is never imported from a file');
