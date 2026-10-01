import { useState } from 'react';
import { BookOpen, Check, X, Layers, PartyPopper, SkipForward } from 'lucide-react';
import type { Question } from '../../types/course';
import { PASS } from '../../utils/learn';
import { ProgressBar } from '../Progress/Progress';
import { fa, ghost, ic, primary } from '../ui';

type Props = {
  questions: Question[];
  best?: number;
  onDone: (pct: number) => void;
  /** Where to send a learner who missed questions. */
  onReviewCards?: () => void;
  readHref?: string;
  /** What to offer after a pass (e.g. the next topic). */
  onContinue?: () => void;
  continueLabel?: string;
};

const LETTERS = ['الف', 'ب', 'ج', 'د', 'ه', 'و', 'ز', 'ح'];

const level = (pct: number) =>
  pct >= 90 ? 'تسلط عالی: این موضوع را خوب فهمیده‌ای.' : pct >= PASS ? 'تسلط کافی: این موضوع «بلدم» خورد.' : pct >= 50 ? 'نیمه‌راه: بخشی را فهمیده‌ای و بخشی هنوز نه.' : 'هنوز تسلط نداری؛ مرور کن و دوباره امتحان بده.';

/** Multiple choice, one question at a time with instant feedback and a skip; reports the final % once. Skipped questions count as wrong. Remount (key) to restart. */
export function Quiz({ questions, best, onDone, onReviewCards, readHref, onContinue, continueLabel }: Props) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [missed, setMissed] = useState<number[]>([]); // indexes of wrong or skipped questions
  const [skipped, setSkipped] = useState(0);
  const q = questions[i];
  const right = questions.length - missed.length; // only meaningful on the result screen
  const pct = Math.round((right / questions.length) * 100);

  if (!q) {
    const pass = pct >= PASS;
    return (
      <div className="space-y-4 rounded-lg border border-line p-5" role="status">
        <div className="space-y-2 text-center">
          <div className="relative mx-auto size-28">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-line)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke={pass ? 'var(--color-accent)' : 'var(--color-coral)'} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct * 0.974} 100`} className="transition-all duration-700" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold">{fa(pct)}٪</span>
            {pass && <PartyPopper className="pop absolute -end-3 -top-2 size-8 text-accent" aria-hidden="true" />}
          </div>
          <p className="text-lg font-bold">
            {fa(right)} از {fa(questions.length)} درست ({fa(pct)}٪)
          </p>
          <p className="text-sm leading-7">{level(pct)}</p>
          <ProgressBar value={pct} max={100} label="نتیجه‌ی آزمون" />
          <p className="text-xs text-muted">آستانه‌ی «بلدم»: {fa(PASS)}٪{skipped ? ` · ${fa(skipped)} سؤال را رد کردی و غلط حساب شد` : ''}</p>
        </div>
        {missed.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-bold">این‌ها را دوباره ببین:</p>
            <ul className="list-disc space-y-1 ps-5 text-sm leading-7">
              {missed.map((m) => <li key={m} dir="auto">{questions[m].q}</li>)}
            </ul>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          {pass && onContinue && (
            <button className={primary} onClick={onContinue}>
              {continueLabel ?? 'ادامه'}
            </button>
          )}
          {!pass && onReviewCards && (
            <button className={primary} onClick={onReviewCards}>
              <Layers className={ic} />
              مرور فلش‌کارت‌ها
            </button>
          )}
          {!pass && readHref && (
            <a className={ghost} href={readHref}>
              <BookOpen className={ic} />
              خواندن دوباره‌ی مقاله
            </a>
          )}
          <button className={ghost} onClick={() => { setI(0); setPicked(null); setMissed([]); setSkipped(0); }}>
            آزمون دوباره
          </button>
        </div>
      </div>
    );
  }

  const last = i + 1 === questions.length;
  const advance = (finalMissed: number[]) => {
    if (last) onDone(Math.round(((questions.length - finalMissed.length) / questions.length) * 100));
    setI(i + 1);
    setPicked(null);
  };
  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k !== q.answer) setMissed((m) => [...m, i]);
  };
  const skip = () => {
    const m = [...missed, i];
    setMissed(m);
    setSkipped((n) => n + 1);
    advance(m);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm text-muted">
          <span>
            سؤال {fa(i + 1)} از {fa(questions.length)}
          </span>
          <span>{best !== undefined ? `بهترین نتیجه: ${fa(best)}٪ · ` : ''}آستانه‌ی قبولی {fa(PASS)}٪</span>
        </div>
        <ProgressBar value={i} max={questions.length} label="پیشرفت آزمون" className="h-1.5" />
      </div>
      <p dir="auto" className="text-lg font-semibold leading-8">{q.q}</p>
      <ul className="space-y-2">
        {q.options.map((o, k) => {
          const look =
            picked === null ? 'border-line hover:border-accent/60'
            : k === q.answer ? 'border-accent bg-accent-soft'
            : k === picked ? 'border-danger bg-danger/10'
            : 'border-line opacity-60';
          return (
            <li key={k}>
              <button disabled={picked !== null} onClick={() => pick(k)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl border-2 p-3 text-start transition disabled:cursor-default ${look}`}>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fg/10 text-xs font-bold">{LETTERS[k] ?? k + 1}</span>
                <span dir="auto" className="flex-1 leading-7">{o}</span>
                {picked !== null && k === q.answer && <Check className={`${ic} text-accent`} aria-label="جواب درست" />}
                {picked !== null && k === picked && k !== q.answer && <span className="flex items-center gap-1 text-xs font-bold text-danger"><X className={ic} aria-hidden="true" />غلط</span>}
              </button>
            </li>
          );
        })}
      </ul>
      {picked === null ? (
        <button className={`${ghost} w-full`} onClick={skip}>
          <SkipForward className={ic} />
          نمی‌دانم، رد شو
        </button>
      ) : (
        <div className="space-y-3" role="status">
          <p className={`rounded-lg p-3 text-sm leading-7 ${picked === q.answer ? 'bg-accent-soft' : 'bg-danger/10'}`}>
            <b>{picked === q.answer ? 'درست! ' : 'نه دقیقاً. '}</b>
            {q.explain}
          </p>
          <button className={`${primary} w-full`} onClick={() => advance(missed)}>
            {last ? 'دیدن نتیجه' : 'سؤال بعد'}
          </button>
        </div>
      )}
    </div>
  );
}
