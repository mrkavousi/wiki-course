import assert from 'node:assert/strict';
import type { Course, State } from '../types/course';
import { cleanItems, cleanPack, courseKey, extractJson, extractLists, parseWikiUrl, ROLES } from './course';
import { courseMarkdown, nextStep, PROMPTS } from './export';
import { EMPTY_STATE, dueIds, mergeBackup, rate, streak } from './learn';
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

// Leitner: right answers climb boxes and push the due date out; a wrong answer resets to box 1, due today.
let box = rate(undefined, true, '2026-10-01');
assert.deepEqual(box, { box: 1, due: '2026-10-02' });
box = rate(box, true, '2026-10-02');
assert.deepEqual(box, { box: 2, due: '2026-10-04' });
assert.deepEqual(rate({ box: 5, due: '' }, true, '2026-10-01'), { box: 5, due: '2026-10-17' });
assert.deepEqual(rate(box, false, '2026-10-04'), { box: 1, due: '2026-10-04' });
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
console.log('course.check ok');
