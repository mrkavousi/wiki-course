import type { Box, Day, Grade, State } from '../types/course';
import { topicKey } from './course';

export const PASS = 75; // quiz % that counts as "I know this"
export const EMPTY_STATE: State = { known: [], saved: [], recent: [], notes: {}, boxes: {}, quiz: {}, days: [], meta: {}, log: {}, pos: {}, goal: 5, onboarded: false, lastBackup: '' };
export const EMPTY_DAY: Day = { cards: 0, known: 0, quiz: 0, sec: 0 };

/** Local calendar day as YYYY-MM-DD, so string comparison is date comparison. */
export const today = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
export const addDays = (day: string, n: number) => new Date(Date.parse(day) + n * 86_400_000).toISOString().slice(0, 10);

// Leitner boxes 1-5: good moves a card up a box and further out, easy up two, hard down one and due tomorrow.
const GAP = [0, 1, 2, 4, 8, 16]; // days until the next review, indexed by box
const STEP: Record<Grade, number> = { hard: -1, good: 1, easy: 2 };
export function rate(prev: Box | undefined, grade: Grade, day: string): Box {
  const box = Math.min(5, Math.max(1, (prev?.box ?? 0) + STEP[grade]));
  return { box, due: addDays(day, grade === 'hard' ? 1 : GAP[box]) };
}
/** Days until the card comes back if graded now (shown on the rating buttons). */
export const nextInterval = (prev: Box | undefined, grade: Grade) => (grade === 'hard' ? 1 : GAP[Math.min(5, Math.max(1, (prev?.box ?? 0) + STEP[grade]))]);

export const dueIds = (boxes: Record<string, Box>, day: string) => Object.keys(boxes).filter((id) => boxes[id].due <= day);
/** The earliest day a card is due after today, or null when nothing is scheduled. */
export const nextDue = (boxes: Record<string, Box>, day: string) =>
  Object.values(boxes).map((b) => b.due).filter((d) => d > day).sort()[0] ?? null;

/** Consecutive active days up to today; yesterday's streak still counts until today is over. */
export function streak(days: string[], day: string) {
  const set = new Set(days);
  let d = set.has(day) ? day : addDays(day, -1);
  let n = 0;
  while (set.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

const uniq = <T,>(xs: T[], key: (x: T) => string) => [...new Map(xs.map((x) => [key(x), x])).values()];

/** Restore a backup: lists are merged, per-item maps take the backup's value, a day's counters keep the larger one. */
export function mergeBackup(local: State, b: Partial<State>): State {
  const log = { ...local.log };
  for (const [d, v] of Object.entries(b.log ?? {})) {
    const l = log[d] ?? EMPTY_DAY;
    log[d] = { cards: Math.max(l.cards, v.cards ?? 0), known: Math.max(l.known, v.known ?? 0), quiz: Math.max(l.quiz, v.quiz ?? 0), sec: Math.max(l.sec, v.sec ?? 0) };
  }
  return {
    ...local,
    known: uniq([...local.known, ...(b.known ?? [])], String),
    saved: uniq([...local.saved, ...(b.saved ?? [])], topicKey),
    recent: uniq([...(b.recent ?? []), ...local.recent], (c) => c.key),
    notes: { ...local.notes, ...b.notes },
    boxes: { ...local.boxes, ...b.boxes },
    quiz: { ...local.quiz, ...b.quiz },
    days: uniq([...local.days, ...(b.days ?? [])], String).sort(),
    meta: { ...local.meta, ...b.meta },
    log,
    pos: { ...local.pos, ...b.pos },
  };
}
