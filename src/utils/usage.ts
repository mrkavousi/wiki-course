// Pure helpers for the AI usage log: token guesses, cost estimates and the totals shown in settings.
import type { Usage, UsageKind } from '../types/course';
import { addDays, today } from './learn';

/** Used only when the gateway returns no `usage`: Persian and English text average about 3 characters per token. ponytail: a rough guess, flagged as `est` in the log. */
export const estimateTokens = (s: string) => Math.ceil(s.length / 3);

type Price = { in: number; out: number };
export const costOf = (inT: number, outT: number, price: Price) => (inT / 1e6) * price.in + (outT / 1e6) * price.out;

export type Totals = { calls: number; inT: number; outT: number; cost: number; est: boolean };
const EMPTY: Totals = { calls: 0, inT: 0, outT: 0, cost: 0, est: false };
const add = (t: Totals, u: Usage, price: Price): Totals => ({ calls: t.calls + 1, inT: t.inT + u.inT, outT: t.outT + u.outT, cost: t.cost + costOf(u.inT, u.outT, price), est: t.est || !!u.est });

/** Totals for today, the last 7 days and everything, plus a breakdown by kind of task; `retries` counts the re-asks inside `all`. */
export function summarize(rows: Usage[], price: Price, day: string) {
  const from = addDays(day, -6);
  const out = { today: EMPTY, week: EMPTY, all: EMPTY, byKind: {} as Partial<Record<UsageKind, Totals>>, retries: 0 };
  for (const u of rows) {
    const d = today(new Date(u.t));
    out.all = add(out.all, u, price);
    if (d >= from) out.week = add(out.week, u, price);
    if (d === day) out.today = add(out.today, u, price);
    out.byKind[u.kind] = add(out.byKind[u.kind] ?? EMPTY, u, price);
    if (u.retry) out.retries++;
  }
  return out;
}
