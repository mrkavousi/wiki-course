import assert from 'node:assert/strict';
import type { Course, State } from '../types/course';
import { cleanItems, cleanPack, courseKey, extractJson, extractLists, parseWikiUrl, ROLES } from './course';
import { courseMarkdown, nextStep, PROMPTS } from './export';
import { EMPTY_STATE, dueIds, mergeBackup, rate, streak } from './learn';

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
console.log('course.check ok');
