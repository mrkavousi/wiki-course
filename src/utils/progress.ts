import type { Course, State } from '../types/course';
import { pathOf, topicKey } from './course';
import { PASS, addDays, dueIds } from './learn';

export type Status = 'new' | 'active' | 'done' | 'archived';
export const STATUS_LABEL: Record<Status, string> = { new: 'شروع‌نشده', active: 'در حال یادگیری', done: 'کامل‌شده', archived: 'بایگانی‌شده' };

/** Minutes per topic, only used for rough estimates. */
export const MIN_PER_TOPIC = 12;

export type Level = 'intro' | 'mid' | 'adv';
export const LEVEL_LABEL: Record<Level, string> = { intro: 'مقدماتی', mid: 'متوسط', adv: 'پیشرفته' };
/** Rough level from how much a learner must know first: 0-1 prerequisites intro, 2-3 mid, more advanced. ponytail: a heuristic, not an assessment. */
export const levelOf = (c: Course): Level => {
  const n = c.topics.filter((t) => t.role === 'prereq').length;
  return n <= 1 ? 'intro' : n <= 3 ? 'mid' : 'adv';
};
/** Days to finish `minutes` of study at `perDay` minutes a day. */
export const daysAt = (minutes: number, perDay: number) => Math.max(1, Math.ceil(minutes / perDay));

export function courseStats(course: Course, state: State, day: string) {
  const steps = pathOf(course);
  const known = new Set(state.known);
  const done = steps.filter((s) => known.has(topicKey(s.page))).length;
  const keys = new Set([course.root, ...course.topics].map(topicKey));
  const due = dueIds(state.boxes, day).filter((id) => keys.has(id.slice(0, id.lastIndexOf('#')))).length;
  const meta = state.meta[course.key];
  const status: Status = meta?.archived ? 'archived' : done === steps.length ? 'done' : done || meta?.last ? 'active' : 'new';
  return { total: steps.length, done, pct: Math.round((done / steps.length) * 100), due, status, last: meta?.last ?? 0, minutes: (steps.length - done) * MIN_PER_TOPIC };
}

/** Totals for the 7 days ending today. */
export function weekStats(state: State, day: string) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(day, i - 6));
  const rows = days.map((d) => ({ day: d, ...(state.log[d] ?? { cards: 0, known: 0, quiz: 0, sec: 0 }), active: state.days.includes(d) }));
  return {
    rows,
    active: rows.filter((r) => r.active).length,
    cards: rows.reduce((n, r) => n + r.cards, 0),
    known: rows.reduce((n, r) => n + r.known, 0),
    minutes: Math.round(rows.reduce((n, r) => n + r.sec, 0) / 60),
  };
}

export type Action = { kind: 'review' | 'continue' | 'new'; label: string; hint: string; href: string };

/** The one thing to do next: due cards, else the most recent unfinished course, else a new topic. */
export function nextAction(state: State, courses: Course[], day: string, href: (key: string) => string): Action {
  const due = dueIds(state.boxes, day).length;
  if (due) return { kind: 'review', label: `مرور ${due.toLocaleString('fa')} کارت`, hint: 'کارت‌ها وقتش رسیده؛ چند دقیقه کافی است.', href: '#/review' };
  const open = courses
    .map((c) => ({ c, s: courseStats(c, state, day) }))
    .filter((x) => x.s.status === 'active')
    .sort((a, b) => b.s.last - a.s.last)[0];
  if (open) return { kind: 'continue', label: `ادامه‌ی ${open.c.root.title}`, hint: `${open.s.done.toLocaleString('fa')} از ${open.s.total.toLocaleString('fa')} گام انجام شده.`, href: href(open.c.key) };
  const fresh = courses.find((c) => courseStats(c, state, day).status === 'new');
  if (fresh) return { kind: 'continue', label: `شروع ${fresh.root.title}`, hint: 'اولین گام این مسیر منتظر توست.', href: href(fresh.key) };
  return { kind: 'new', label: 'شروع یک موضوع جدید', hint: 'لینک یک مقاله‌ی ویکی‌پدیا بچسبان تا برایش مسیر یادگیری بسازیم.', href: '#/new' };
}

/** Topics whose best quiz is under the pass mark, or whose cards keep falling back to box 1; weakest first. */
export type Weak = { key: string; why: 'quiz' | 'cards'; pct?: number };
export function weakTopics(state: State): Weak[] {
  const rows: Weak[] = Object.entries(state.quiz).filter(([, p]) => p < PASS).map(([key, pct]) => ({ key, why: 'quiz', pct }));
  const seen = new Set(rows.map((r) => r.key));
  for (const [id, b] of Object.entries(state.boxes)) {
    const key = id.slice(0, id.lastIndexOf('#'));
    if (b.box === 1 && !seen.has(key)) {
      seen.add(key);
      rows.push({ key, why: 'cards' });
    }
  }
  return rows.sort((a, b) => (a.pct ?? 100) - (b.pct ?? 100));
}
