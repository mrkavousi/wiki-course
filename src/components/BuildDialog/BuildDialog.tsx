import { useEffect, useRef } from 'react';
import { Check, Loader, Sparkles } from 'lucide-react';
import { ProgressBar } from '../Progress/Progress';
import { ErrorState } from '../States/States';
import { ghost, ic } from '../ui';

/** `build` marks a failed course build (other errors, e.g. a reader link, show in the shell banner). */
export type Job = { status: string; error: string; stage?: number; build?: boolean } | null;
/** Named stages of a build; `buildCourse` reports the index (see Status in lib/build.ts). */
export const STAGES = ['خواندن مقاله‌ی مبدأ', 'پیدا کردن پیش‌نیازها و چیدن مسیر', 'بررسی مقاله‌ها در ویکی‌پدیا', 'ذخیره‌ی دوره'];

type Props = { job: Job; open: boolean; onHide: () => void; onRetry?: () => void };

/** Build progress as a modal over a blurred page, so the build is the only thing on screen; Esc or the button sends it to the background. */
export function BuildDialog({ job, open, onHide, onRetry }: Props) {
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dlg.current!;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={dlg}
      onCancel={(e) => (e.preventDefault(), onHide())}
      aria-label="پیشرفت ساخت"
      className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-3xl border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-md"
    >
      {job && (
        <div className="space-y-4 p-6">
          {job.error ? (
            <ErrorState title="ساخت دوره کامل نشد" text={job.error} lost="چیزی ذخیره نشد و دوره‌های قبلی‌ات سالم‌اند." onRetry={onRetry}>
              <button className={ghost} onClick={onHide}>
                بستن
              </button>
            </ErrorState>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Sparkles className="size-6 motion-safe:animate-pulse" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-bold">در حال ساخت دوره…</h2>
                  <p className="truncate text-sm text-muted" role="status">{job.status}</p>
                </div>
              </div>
              <ProgressBar value={Math.min((job.stage ?? 0) + 0.5, STAGES.length)} max={STAGES.length} label="پیشرفت ساخت دوره" className="h-2" />
              <ol className="space-y-2.5">
                {STAGES.map((label, i) => {
                  const at = job.stage ?? 0;
                  const state = i < at ? 'done' : i === at ? 'now' : 'todo';
                  return (
                    <li key={label} className={`flex items-center gap-2.5 text-sm ${state === 'todo' ? 'text-muted' : ''} ${state === 'now' ? 'font-semibold' : ''}`} aria-current={state === 'now' ? 'step' : undefined}>
                      {state === 'done' ? <Check className={`${ic} text-accent`} /> : state === 'now' ? <Loader className={`${ic} text-accent motion-safe:animate-spin`} /> : <span className="size-[1.15em] shrink-0 rounded-full border border-line" />}
                      {label}
                      <span className="sr-only">{state === 'done' ? '(انجام شد)' : state === 'now' ? '(در حال انجام)' : '(در صف)'}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="text-sm leading-7 text-muted">معمولاً بین ۱۰ تا ۴۰ ثانیه طول می‌کشد. می‌توانی این پنجره را ببندی؛ ساخت در پس‌زمینه ادامه پیدا می‌کند.</p>
              <button className={`${ghost} w-full`} onClick={onHide}>
                ادامه در پس‌زمینه
              </button>
            </>
          )}
        </div>
      )}
    </dialog>
  );
}
