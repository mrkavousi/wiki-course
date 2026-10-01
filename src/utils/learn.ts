import type { Box, State } from '../types/course';
import { topicKey } from './course';

export const PASS = 75; // quiz % that counts as "I know this"
export const EMPTY_STATE: State = { known: [], saved: [], recent: [], notes: {}, boxes: {}, quiz: {}, days: [] };

/** Local calendar day as YYYY-MM-DD, so string comparison is date comparison. */
export const today = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const addDays = (day: string, n: number) => new Date(Date.parse(day) + n * 86_400_000).toISOString().slice(0, 10);

// Leitner boxes 1-5: a right answer moves the card up a box and further out; a wrong one sends it back to box 1, due again today.
const GAP = [0, 1, 2, 4, 8, 16]; // days until the next review, indexed by box
export function rate(prev: Box | undefined, ok: boolean, day: string): Box {
  const box = ok ? Math.min(5, (prev?.box ?? 0) + 1) : 1;
  return { box, due: ok ? addDays(day, GAP[box]) : day };
}

export const dueIds = (boxes: Record<string, Box>, day: string) => Object.keys(boxes).filter((id) => boxes[id].due <= day);

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

/** Restore a backup: lists are merged, per-item maps take the backup's value. */
export function mergeBackup(local: State, b: Partial<State>): State {
  return {
    known: uniq([...local.known, ...(b.known ?? [])], String),
    saved: uniq([...local.saved, ...(b.saved ?? [])], topicKey),
    recent: uniq([...(b.recent ?? []), ...local.recent], (c) => c.key),
    notes: { ...local.notes, ...b.notes },
    boxes: { ...local.boxes, ...b.boxes },
    quiz: { ...local.quiz, ...b.quiz },
    days: uniq([...local.days, ...(b.days ?? [])], String).sort(),
  };
}
