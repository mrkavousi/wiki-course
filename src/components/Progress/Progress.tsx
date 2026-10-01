import { Flame } from 'lucide-react';
import type { State } from '../../types/course';
import { addDays } from '../../utils/learn';
import { weekStats } from '../../utils/progress';
import { fa } from '../ui';

type BarProps = { value: number; max: number; label: string; className?: string };

/** One progress bar for the whole app. `label` is read by screen readers. */
export function ProgressBar({ value, max, label, className = 'h-2' }: BarProps) {
  return (
    <div className={`overflow-hidden rounded-full bg-fg/10 ${className}`} role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-accent motion-safe:transition-[width] motion-safe:duration-500" style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} />
    </div>
  );
}

const dayName = new Intl.DateTimeFormat('fa', { weekday: 'short' });
const level = (n: number) => (n === 0 ? 'bg-fg/10' : n < 3 ? 'bg-accent/30' : n < 8 ? 'bg-accent/60' : 'bg-accent');
const actions = (d: { cards: number; known: number; quiz: number }) => d.cards + d.known + d.quiz;

/** The last 7 days as bars; the number under each bar is what was done (cards + topics + quizzes). */
export function ActivityChart({ state, day }: { state: State; day: string }) {
  const { rows } = weekStats(state, day);
  const max = Math.max(1, ...rows.map(actions));
  return (
    <ol className="flex h-28 items-end gap-2" aria-label="فعالیت ۷ روز گذشته">
      {rows.map((r) => {
        const n = actions(r);
        return (
          <li key={r.day} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${fa(n)} فعالیت`}>
            <span className="text-xs text-muted">{n ? fa(n) : ''}</span>
            <span className={`w-full rounded-sm ${r.active ? 'bg-accent' : 'bg-fg/10'}`} style={{ height: `${Math.max(6, (n / max) * 64)}px` }} />
            <span className={`text-xs ${r.day === day ? 'font-bold text-fg' : 'text-muted'}`}>{dayName.format(new Date(`${r.day}T12:00`))}</span>
            <span className="sr-only">{r.active ? 'روز فعال' : 'بدون فعالیت'}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** 12 weeks of activity, one square per day; level is shown by fill and by the number in the label. */
export function Heatmap({ state, day }: { state: State; day: string }) {
  const days = Array.from({ length: 84 }, (_, i) => addDays(day, i - 83));
  const total = days.filter((d) => state.days.includes(d)).length;
  return (
    <div role="img" aria-label={`${fa(total)} روز فعال در ۱۲ هفته‌ی گذشته`} className="grid grid-flow-col grid-rows-7 gap-1">
      {days.map((d) => (
        <span key={d} title={d} className={`aspect-square min-w-0 rounded-sm ${level(state.log[d] ? actions(state.log[d]) : state.days.includes(d) ? 1 : 0)}`} />
      ))}
    </div>
  );
}

/** Streak plus how this week compares with the goal. */
export function StreakWidget({ streak, active, goal }: { streak: number; active: number; goal: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 items-center justify-center rounded-lg bg-gold/20 text-prereq">
        <Flame className="size-6" />
      </span>
      <div>
        <p className="text-lg font-bold leading-tight">{fa(streak)} روز پشت‌سرهم</p>
        <p className="text-sm text-muted">
          این هفته {fa(active)} از {fa(goal)} روز هدف
          {active >= goal && <span className="text-accent"> · هدف هفته انجام شد</span>}
        </p>
      </div>
    </div>
  );
}
