import { useState } from 'react';
import type { Question } from '../../types/course';
import { PASS } from '../../utils/learn';
import { fa, ghost, primary } from '../ui';

type Props = { questions: Question[]; best?: number; onDone: (pct: number) => void };

const LETTERS = ['الف', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح'];

/** Multiple choice, one question at a time with instant feedback; reports the final % once. Remount (key) to restart. */
export function Quiz({ questions, best, onDone }: Props) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const q = questions[i];
  const pct = Math.round((right / questions.length) * 100);

  if (!q) {
    return (
      <div className="space-y-3 rounded-2xl border border-line p-6 text-center">
        <p className="text-3xl">{pct >= PASS ? '🎉' : '📚'}</p>
        <p className="text-lg font-bold">
          {fa(right)} از {fa(questions.length)} درست ({fa(pct)}٪)
        </p>
        <p className="text-sm leading-7 text-muted">
          {pct >= PASS ? 'پاس شدی؛ این موضوع «بلدم» خورد.' : `برای «بلدم» حداقل ${fa(PASS)}٪ لازم است. مقاله و فلش‌کارت‌ها را مرور کن و دوباره امتحان بده.`}
        </p>
        <button className={ghost} onClick={() => { setI(0); setPicked(null); setRight(0); }}>
          آزمون دوباره
        </button>
      </div>
    );
  }

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setRight((n) => n + 1);
  };
  const next = () => {
    if (i + 1 === questions.length) onDone(pct); // `right` already counts this answer
    setI(i + 1);
    setPicked(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-muted">
        <span>
          سؤال {fa(i + 1)} از {fa(questions.length)}
        </span>
        {best !== undefined && <span>بهترین نتیجه: {fa(best)}٪</span>}
      </div>
      <p dir="auto" className="text-lg font-semibold leading-8">{q.q}</p>
      <ul className="space-y-2">
        {q.options.map((o, k) => {
          const look =
            picked === null ? 'border-line hover:border-accent/60'
            : k === q.answer ? 'border-accent bg-accent/10'
            : k === picked ? 'border-danger bg-danger/10'
            : 'border-line opacity-60';
          return (
            <li key={k}>
              <button disabled={picked !== null} onClick={() => pick(k)} className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-start transition disabled:cursor-default ${look}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fg/10 text-xs font-bold">{LETTERS[k] ?? k + 1}</span>
                <span dir="auto" className="flex-1 leading-7">{o}</span>
                {picked !== null && k === q.answer && <span aria-label="جواب درست">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {picked !== null && (
        <div className="space-y-3">
          <p className={`rounded-xl p-3 text-sm leading-7 ${picked === q.answer ? 'bg-accent/10' : 'bg-danger/10'}`}>
            <b>{picked === q.answer ? 'درست! ' : 'نه دقیقاً. '}</b>
            {q.explain}
          </p>
          <button className={`${primary} w-full`} onClick={next}>
            {i + 1 === questions.length ? 'دیدن نتیجه' : 'سؤال بعد'}
          </button>
        </div>
      )}
    </div>
  );
}
