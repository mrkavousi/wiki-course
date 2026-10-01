import { useEffect, useState } from 'react';
import { Check, PartyPopper, X } from 'lucide-react';
import { fa, ghost, ic, primary } from '../ui';

export type CardItem = { id: string; q: string; a: string; topic?: string };
type Props = { items: CardItem[]; onRate: (id: string, ok: boolean) => void };

/** One card at a time: recall, flip (click or Space), grade yourself (1/2). Grades feed the Leitner boxes. Remount (key) to restart. */
export function Flashcards({ items, onRate }: Props) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [right, setRight] = useState(0);
  const card = items[i];

  const grade = (ok: boolean) => {
    onRate(card.id, ok);
    if (ok) setRight((n) => n + 1);
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
      } else if (flipped && (e.key === '1' || e.key === '۱')) grade(false);
      else if (flipped && (e.key === '2' || e.key === '۲')) grade(true);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  if (!items.length) return <p className="text-muted">کارتی نیست.</p>;

  if (!card) {
    return (
      <div className="space-y-3 rounded-2xl border border-line p-6 text-center">
        <PartyPopper className="mx-auto size-10 text-accent" />
        <p className="font-bold">
          تمام شد: {fa(right)} از {fa(items.length)} کارت را یادت بود.
        </p>
        <p className="text-sm leading-7 text-muted">کارت‌هایی که یادت نبود امروز دوباره می‌آیند؛ بقیه با فاصله‌ی بیشتر (۱، ۲، ۴، ۸ و ۱۶ روز بعد).</p>
        <button className={ghost} onClick={() => { setI(0); setRight(0); }}>
          یک دور دیگر
        </button>
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
      <div className="h-1.5 overflow-hidden rounded-full bg-fg/10">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(i / items.length) * 100}%` }} />
      </div>
      <button
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? 'نمایش سؤال' : 'نمایش جواب'}
        className={`flex min-h-52 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 text-center transition ${flipped ? 'border-accent bg-accent/10' : 'border-line bg-bg hover:border-accent/60'}`}
      >
        <span className="text-xs font-bold text-muted">{flipped ? 'جواب' : 'سؤال'}</span>
        <span dir="auto" className="text-lg font-semibold leading-8">{flipped ? card.a : card.q}</span>
        {!flipped && <span className="text-xs text-muted">اول جواب را در ذهنت بگو، بعد کارت را برگردان (Space)</span>}
      </button>
      {flipped && (
        <div className="grid grid-cols-2 gap-2">
          <button className={`${ghost} text-danger`} onClick={() => grade(false)}>
            <X className={ic} />
            یادم نبود <kbd className="text-xs opacity-60">۱</kbd>
          </button>
          <button className={primary} onClick={() => grade(true)}>
            <Check className={ic} />
            یادم بود <kbd className="text-xs opacity-70">۲</kbd>
          </button>
        </div>
      )}
    </div>
  );
}
