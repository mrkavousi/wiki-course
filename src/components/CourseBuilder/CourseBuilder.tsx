import { useEffect, useRef, useState } from 'react';
import { BookOpen, Check, ClipboardPaste, ExternalLink, KeyRound, Loader, Sparkles } from 'lucide-react';
import type { BuildOpts, CourseRef, Depth, Purpose } from '../../types/course';
import { courseHref, findCourse } from '../../data/store';
import { DEFAULT_OPTS, DEPTH_CAP, previewArticle, type Preview } from '../../lib/build';
import { courseKey, parseWikiUrl, wikiUrl } from '../../utils/course';
import { MIN_PER_TOPIC } from '../../utils/progress';
import { Cover } from '../Cover/Cover';
import { ErrorState } from '../States/States';
import { Skeleton } from '../States/States';
import { badge, card, fa, field, fmtMinutes, ghost, ic, outline, primary } from '../ui';

export type Job = { status: string; error: string; stage?: number } | null;
/** Named stages of a build; `buildCourse` reports the index (see Status in lib/build.ts). */
export const STAGES = ['خواندن مقاله‌ی مبدأ', 'پیدا کردن پیش‌نیازها و چیدن مسیر', 'بررسی مقاله‌ها در ویکی‌پدیا', 'ذخیره‌ی دوره'];

const DEPTHS: [Depth, string][] = [['quick', 'سریع'], ['standard', 'استاندارد'], ['deep', 'عمیق']];
const PURPOSES: [Purpose, string][] = [['general', 'درک کلی'], ['exam', 'امتحان'], ['work', 'کار'], ['research', 'پژوهش']];
const EXAMPLES = ['جبر خطی', 'یادگیری ماشین', 'شاهنشاهی اشکانی'];
/** Path length at a depth: prerequisites + the article + next steps (related topics sit beside the path). */
const steps = (d: Depth) => 2 * DEPTH_CAP[d] + 1;

type Props = {
  job: Job;
  hasAI: boolean;
  recent: CourseRef[];
  onBuild: (url: string, o?: { opts?: BuildOpts; force?: boolean }) => void;
  onRead: (url: string) => void;
  onSettings: () => void;
  /** Home variant: just the input; submitting continues on the builder page. */
  compact?: boolean;
};

type Pre = { state: 'idle' } | { state: 'loading' } | { state: 'ready'; p: Preview; exists: boolean } | { state: 'error'; kind: string; message: string };

export function CourseBuilder({ job, hasAI, recent, onBuild, onRead, onSettings, compact }: Props) {
  const [url, setUrl] = useState(() => (compact ? '' : new URLSearchParams(location.hash.split('?')[1]).get('url') ?? ''));
  const [invalid, setInvalid] = useState('');
  const [pre, setPre] = useState<Pre>({ state: 'idle' });
  const [opts, setOpts] = useState<BuildOpts>(DEFAULT_OPTS);
  const input = useRef<HTMLInputElement>(null);
  const run = useRef(0); // ignores a preview that finished after the link was changed
  const building = !!job?.status;

  const check = async (raw: string) => {
    const link = raw.trim();
    if (!link) return;
    try {
      parseWikiUrl(link);
    } catch (e: any) {
      return setInvalid(e.message);
    }
    setInvalid('');
    if (compact) return void (location.hash = `#/new?url=${encodeURIComponent(link)}`);
    const me = ++run.current;
    setPre({ state: 'loading' });
    try {
      const p = await previewArticle(link);
      const exists = !!(await findCourse(courseKey(p.lang, p.title)));
      if (me === run.current) setPre({ state: 'ready', p, exists });
    } catch (e: any) {
      if (me === run.current) setPre({ state: 'error', kind: e.kind ?? 'network', message: e.message });
    }
  };

  useEffect(() => {
    if (!compact && url) check(url);
    else if (!compact) input.current?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- only a link carried in the address is checked on arrival

  const paste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      setUrl(text);
      check(text);
    } catch {
      input.current?.focus(); // clipboard blocked: the user can paste by hand
    }
  };
  const pick = (u: string) => {
    setUrl(u);
    check(u);
  };

  const form = (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        check(url);
      }}
      noValidate
    >
      <label htmlFor="wiki-url" className="block text-sm font-semibold">
        لینک مقاله‌ی ویکی‌پدیا
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex min-w-0 flex-1 gap-2">
          <input
            ref={input}
            id="wiki-url"
            dir="ltr"
            inputMode="url"
            value={url}
            disabled={building}
            onChange={(e) => {
              setUrl(e.target.value);
              setInvalid('');
              if (pre.state !== 'idle') setPre({ state: 'idle' });
            }}
            placeholder="https://fa.wikipedia.org/wiki/…"
            aria-invalid={!!invalid}
            aria-describedby={invalid ? 'wiki-url-err' : undefined}
            className={`${field} min-w-0 flex-1 py-3 text-start text-lg ${invalid ? 'border-danger' : ''}`}
          />
          <button type="button" onClick={paste} disabled={building} className={`${ghost} shrink-0`} aria-label="چسباندن از کلیپ‌بورد" title="چسباندن از کلیپ‌بورد">
            <ClipboardPaste className={ic} />
          </button>
        </div>
        <button disabled={building || !url.trim() || pre.state === 'loading'} className={`${primary} sm:px-6`}>
          {compact ? <Sparkles className={ic} /> : pre.state === 'loading' ? <Loader className={`${ic} motion-safe:animate-spin`} /> : <Sparkles className={ic} />}
          {compact ? 'ساخت دوره' : pre.state === 'loading' ? 'در حال بررسی…' : 'بررسی مقاله'}
        </button>
      </div>
      {invalid && (
        <p id="wiki-url-err" role="alert" className="text-sm text-danger">
          {invalid}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
        <span className="text-muted">نمونه:</span>
        {EXAMPLES.map((t) => (
          <button key={t} type="button" disabled={building} onClick={() => pick(wikiUrl('fa', t))} className="min-h-11 rounded-lg border border-line px-3 text-sm hover:border-accent hover:text-accent disabled:opacity-50">
            {t}
          </button>
        ))}
        {recent.slice(0, 2).map((c) => (
          <button key={c.key} type="button" disabled={building} dir="auto" onClick={() => pick(wikiUrl(c.lang, c.title))} className="min-h-11 max-w-48 truncate rounded-lg border border-dashed border-line px-3 text-sm hover:border-accent hover:text-accent disabled:opacity-50" title="از تاریخچه">
            {c.title}
          </button>
        ))}
        {url.trim() && !invalid && (
          <button type="button" onClick={() => onRead(url.trim())} className="ms-auto flex min-h-11 items-center gap-1.5 px-2 text-sm text-muted hover:text-fg">
            <BookOpen className={ic} />
            فقط بخوان، بدون ساخت دوره
          </button>
        )}
      </div>
    </form>
  );

  if (compact) return form;

  return (
    <div className="space-y-6">
      {form}

      {job && (
        <section aria-label="پیشرفت ساخت" className={`${card} space-y-3 p-4`}>
          {job.error ? (
            <ErrorState
              title="ساخت دوره کامل نشد"
              text={job.error}
              lost="چیزی ذخیره نشد و دوره‌های قبلی‌ات سالم‌اند."
              onRetry={pre.state === 'ready' ? () => onBuild(pre.p.url, { opts, force: pre.exists }) : undefined}
            />
          ) : (
            <>
              <p className="font-bold">در حال ساخت دوره…</p>
              <ol className="space-y-2">
                {STAGES.map((label, i) => {
                  const at = job.stage ?? 0;
                  const state = i < at ? 'done' : i === at ? 'now' : 'todo';
                  return (
                    <li key={label} className={`flex items-center gap-2 text-sm ${state === 'todo' ? 'text-muted' : ''}`} aria-current={state === 'now' ? 'step' : undefined}>
                      {state === 'done' ? <Check className={`${ic} text-accent`} /> : state === 'now' ? <Loader className={`${ic} text-accent motion-safe:animate-spin`} /> : <span className="size-[1.15em] shrink-0 rounded-full border border-line" />}
                      {label}
                      <span className="sr-only">{state === 'done' ? '(انجام شد)' : state === 'now' ? '(در حال انجام)' : '(در صف)'}</span>
                    </li>
                  );
                })}
              </ol>
              <p className="text-sm text-muted">{job.status}</p>
              <p className="text-sm text-muted">معمولاً بین ۱۰ تا ۴۰ ثانیه طول می‌کشد. می‌توانی در این مدت جای دیگری از برنامه بروی؛ ساخت ادامه پیدا می‌کند.</p>
            </>
          )}
        </section>
      )}

      {pre.state === 'loading' && (
        <div className={`${card} flex gap-4 p-4`} aria-hidden="true">
          <Skeleton className="size-24 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      )}

      {pre.state === 'error' && (
        <ErrorState
          title={pre.kind === 'notfound' ? 'مقاله پیدا نشد' : pre.kind === 'unsupported' ? 'این صفحه مقاله‌ی مشخصی نیست' : 'اتصال برقرار نشد'}
          text={pre.message}
          lost="چیزی از دست نرفته است؛ لینک را اصلاح کن یا دوباره امتحان کن."
          onRetry={pre.kind === 'network' ? () => check(url) : undefined}
        />
      )}

      {pre.state === 'ready' && (
        <>
          <section className={`${card} flex flex-col overflow-hidden sm:flex-row`} aria-label="پیش‌نمایش مقاله">
            <Cover title={pre.p.title} summary={pre.p.summary} thumbnail={pre.p.thumbnail} className="h-28 shrink-0 sm:h-auto sm:w-40" />
            <div className="min-w-0 flex-1 space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h2 dir="auto" className="text-xl font-bold">{pre.p.title}</h2>
                <span className={badge}>{pre.p.lang}</span>
              </div>
              {pre.p.description && <p dir="auto" className="text-sm text-muted">{pre.p.description}</p>}
              <p dir="auto" className="line-clamp-4 text-sm leading-7">{pre.p.summary}</p>
              <p className="flex flex-wrap items-center gap-x-3 text-xs text-muted">
                <a href={pre.p.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1 hover:text-fg hover:underline">
                  <ExternalLink className={ic} />
                  منبع: ویکی‌پدیا
                </a>
                {pre.p.updated && <span>آخرین ویرایش مقاله: {new Date(pre.p.updated).toLocaleDateString('fa')}</span>}
              </p>
            </div>
          </section>

          {pre.exists && (
            <p className="flex flex-wrap items-center gap-3 rounded-lg bg-accent-soft p-3 text-sm">
              <Check className={`${ic} text-accent`} />
              <span className="flex-1">این دوره از قبل روی این دستگاه هست.</span>
              <a href={courseHref(courseKey(pre.p.lang, pre.p.title))} className={outline}>
                باز کردن دوره
              </a>
            </p>
          )}

          <fieldset className="space-y-2" disabled={building}>
            <legend className="mb-1 font-bold">چقدر عمیق؟</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {DEPTHS.map(([d, label]) => (
                <label key={d} className="flex cursor-pointer flex-col gap-1 rounded-lg border border-line bg-panel p-3 has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
                  <span className="flex items-center gap-2 font-semibold">
                    <input type="radio" name="depth" checked={opts.depth === d} onChange={() => setOpts({ ...opts, depth: d })} className="size-4 accent-accent" />
                    {label}
                  </span>
                  <span className="text-sm text-muted">
                    تا {fa(DEPTH_CAP[d])} موضوع در هر بخش · {fmtMinutes(steps(d) * MIN_PER_TOPIC)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2" disabled={building}>
            <legend className="mb-1 font-bold">برای چه می‌خوانی؟</legend>
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map(([v, label]) => (
                <label key={v} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
                  <input type="radio" name="purpose" checked={opts.purpose === v} onChange={() => setOpts({ ...opts, purpose: v })} className="size-4 accent-accent" />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          <section className="rounded-lg border border-line p-4" aria-label="طرح کلی دوره">
            <h3 className="mb-2 font-bold">آنچه ساخته می‌شود</h3>
            <p className="text-sm leading-7 text-muted">
              پیش‌نیازها، خود مقاله، قدم‌های بعدی و مطالب مرتبط، هرکدام با نمره و دلیل. حدود {fa(steps(opts.depth))} گام در مسیر، یعنی {fmtMinutes(steps(opts.depth) * MIN_PER_TOPIC)} مطالعه.
              فهرست دقیق را هوش مصنوعی هنگام ساخت تعیین می‌کند؛ فلش‌کارت و آزمون هر موضوع بعداً و به‌درخواست خودت ساخته می‌شود.
            </p>
          </section>

          {!hasAI && (
            <p className="flex flex-wrap items-center gap-3 rounded-lg bg-gold/20 p-3 text-sm">
              <KeyRound className={ic} />
              <span className="flex-1">برای ساخت دوره، هوش مصنوعی باید در تنظیمات وصل باشد. خواندن مقاله بدون آن هم کار می‌کند.</span>
              <button type="button" className={ghost} onClick={onSettings}>
                باز کردن تنظیمات
              </button>
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button className={primary} disabled={building} onClick={() => onBuild(pre.p.url, { opts, force: pre.exists })}>
              <Sparkles className={ic} />
              {pre.exists ? 'ساخت دوباره با این تنظیمات' : 'ساخت دوره'}
            </button>
            <button className={ghost} onClick={() => onRead(pre.p.url)}>
              <BookOpen className={ic} />
              فقط بخوان
            </button>
          </div>
        </>
      )}

    </div>
  );
}
