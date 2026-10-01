import { useEffect, useRef, useState } from 'react';
import { PartyPopper } from 'lucide-react';
import type { Box, Grade } from '../../types/course';
import { nextInterval } from '../../utils/learn';
import { ProgressBar } from '../Progress/Progress';
import { fa, ghost, inDays } from '../ui';

export type CardItem = { id: string; q: string; a: string; topic?: string };
type Props = {
  items: CardItem[];
  boxes: Record<string, Box>; // current Leitner boxes, only to show the next interval on each button
  onRate: (id: string, grade: Grade) => void;
  /** Shown on the finished screen, e.g. links back to the course or home. */
  done?: React.ReactNode;
};

const GRADES: { grade: Grade; label: string; key: string; style: string }[] = [
  { grade: 'hard', label: 'سخت بود', key: '1', style: 'border-line hover:bg-fg/5' },
  { grade: 'good', label: 'خوب بود', key: '2', style: 'border-accent bg-accent text-on-accent hover:brightness-110' },
  { grade: 'easy', label: 'آسان بود', key: '3', style: 'border-accent text-accent hover:bg-accent/10' },
];
const DIGITS: Record<string, string> = { '۱': '1', '۲': '2', '۳': '3' };

/** One card at a time: recall, flip (click or Space), rate (1/2/3). Ratings feed the Leitner boxes; each is saved at once, so leaving mid-way loses nothing. Remount (key) to restart. */
export function Flashcards({ items, boxes, onRate, done }: Props) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState<Record<Grade, number>>({ hard: 0, good: 0, easy: 0 });
  const card = items[i];
  // Swipe on a flipped card: right = good, left = hard (physical directions, so RTL doesn't flip the meaning). The buttons stay for everyone else.
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const grade = (g: Grade) => {
    onRate(card.id, g);
    setTally((t) => ({ ...t, [g]: t[g] + 1 }));
    setFlipped(false);
    setI((n) => n + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!card || t.closest('input, textarea, select')) return;
      if (e.code === 'Space') {
        if (t.closest('button, a, summary')) return; // Space already clicks those
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped) {
        const hit = GRADES.find((g) => g.key === (DIGITS[e.key] ?? e.key));
        if (hit) grade(hit.grade);
      }
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  if (!items.length) return <p className="text-muted">کارتی نیست.</p>;

  if (!card) {
    return (
      <div className="space-y-4 rounded-lg border border-line p-6 text-center" role="status">
        <PartyPopper className="mx-auto size-10 text-accent" />
        <p className="text-lg font-bold">مرور تمام شد؛ {fa(items.length)} کارت</p>
        <p className="text-sm text-muted">
          آسان: {fa(tally.easy)} · خوب: {fa(tally.good)} · سخت: {fa(tally.hard)}
        </p>
        <p className="text-sm leading-7 text-muted">کارت‌های سخت فردا برمی‌گردند و بقیه با فاصله‌ی بیشتر (۱، ۲، ۴، ۸ و ۱۶ روز بعد).</p>
        <div className="flex flex-wrap justify-center gap-2">
          {done}
          <button className={ghost} onClick={() => { setI(0); setTally({ hard: 0, good: 0, easy: 0 }); }}>
            یک دور دیگر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-sm text-muted">
        <span>
          کارت {fa(i + 1)} از {fa(items.length)}
        </span>
        {card.topic && <span dir="auto" className="truncate">{card.topic}</span>}
      </div>
      <ProgressBar value={i} max={items.length} label="پیشرفت مرور" className="h-1.5" />
      <button
        onPointerDown={(e) => (start.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = start.current;
          start.current = null;
          swiped.current = false;
          if (!s || !flipped || e.pointerType === 'mouse') return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > 80 && Math.abs(dx) > 2 * Math.abs(e.clientY - s.y)) {
            swiped.current = true; // the click that follows this release must not flip the card back
            grade(dx > 0 ? 'good' : 'hard');
          }
        }}
        onClick={() => (swiped.current ? (swiped.current = false) : setFlipped((f) => !f))}
        style={{ touchAction: 'pan-y' }}
        aria-label={flipped ? 'نمایش سؤال' : 'نمایش جواب'}
        className={`flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 text-center transition ${flipped ? 'border-accent bg-accent-soft' : 'border-line bg-panel hover:border-accent/60'}`}
      >
        <span className="text-xs font-bold text-muted">{flipped ? 'جواب' : 'سؤال'}</span>
        <span dir="auto" className="text-lg font-semibold leading-8">{flipped ? card.a : card.q}</span>
        {!flipped && <span className="text-xs text-muted">اول جواب را در ذهنت بگو، بعد کارت را برگردان (Space)</span>}
      </button>
      {flipped ? (
        <div className="space-y-2">
        <p className="text-center text-xs text-muted lg:hidden">یا کارت را بکش: به راست «خوب»، به چپ «سخت»</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="چقدر یادت بود؟">
          {GRADES.map((g) => (
            <button key={g.grade} className={`flex min-h-14 flex-col items-center justify-center rounded-lg border px-2 text-sm font-semibold transition ${g.style}`} onClick={() => grade(g.grade)}>
              <span>
                {g.label} <kbd className="text-xs opacity-70">{fa(Number(g.key))}</kbd>
              </span>
              <span className="text-xs font-normal opacity-80">{inDays(nextInterval(boxes[card.id], g.grade))}</span>
            </button>
          ))}
        </div>
        </div>
      ) : (
        <p className="min-h-14 text-center text-sm text-muted">بعد از دیدن جواب، یکی از سه گزینه‌ی «سخت»، «خوب» یا «آسان» را بزن.</p>
      )}
    </div>
  );
}
