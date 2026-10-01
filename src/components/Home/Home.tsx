import { ArrowLeft, BookOpenCheck, Compass, Layers, PartyPopper, Route, Sparkles, X } from 'lucide-react';
import type { BuildOpts } from '../../types/course';
import { allRefs, courseHref, useCourses, type Store } from '../../data/store';
import { nextDue, streak as streakOf, today } from '../../utils/learn';
import { courseStats, nextAction, weekStats } from '../../utils/progress';
import { CourseBuilder, type Job } from '../CourseBuilder/CourseBuilder';
import { CourseCard, CourseCardSkeleton } from '../CourseCard/CourseCard';
import { ActivityChart, ProgressBar, StreakWidget } from '../Progress/Progress';
import { EmptyState } from '../States/States';
import { card, fa, ghost, ic, inDays, primary } from '../ui';

type Props = {
  store: Store;
  job: Job;
  hasAI: boolean;
  onBuild: (url: string, o?: { opts?: BuildOpts; force?: boolean }) => void;
  onRead: (url: string) => void;
  onSettings: () => void;
};

const ONBOARDING = [
  [Route, 'دوره چیست؟', 'هر مقاله‌ی ویکی‌پدیا را به یک مسیر تبدیل می‌کنیم: پیش‌نیازها، خود مقاله و قدم‌های بعدی.'],
  [BookOpenCheck, 'پیشرفتت کجا می‌ماند؟', 'همه‌چیز فقط در همین مرورگر ذخیره می‌شود. برای دستگاه دیگر، از تنظیمات پشتیبان بگیر.'],
  [Layers, 'مرور امروز چیست؟', 'کارت‌هایی که وقتشان رسیده تا فراموش نشوند. هر روز چند دقیقه کافی است.'],
] as const;

export function Home({ store, job, hasAI, onBuild, onRead, onSettings }: Props) {
  const { state } = store;
  const day = today();
  const refs = allRefs(state);
  const courses = useCourses(refs);
  const due = Object.values(state.boxes).filter((b) => b.due <= day).length;
  const action = courses && nextAction(state, courses, day, courseHref);
  const week = weekStats(state, day);
  const stats = courses?.map((c) => ({ c, s: courseStats(c, state, day) }));
  const active = stats?.filter((x) => x.s.status === 'active').sort((a, b) => b.s.last - a.s.last).slice(0, 3);
  const fresh = stats?.filter((x) => x.s.status === 'new').slice(0, 3);
  const showReview = action?.kind !== 'review';
  const back = nextDue(state.boxes, day);

  return (
    <div className="page-in mx-auto w-full max-w-6xl space-y-10 px-4 py-6">
      <header className="hero-bg space-y-3 rounded-3xl border border-line/60 px-4 pb-8 pt-10 text-center sm:pt-14">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          از هر مقاله، یک <span className="text-grad">مسیر</span> یادگیری
        </h1>
        <p className="mx-auto max-w-xl text-muted">لینک یک مقاله‌ی ویکی‌پدیا را بچسبان؛ پیش‌نیازها را پیدا کن، یاد بگیر، مرور کن و واقعاً به خاطر بسپار.</p>
      </header>

      <section className={`${card} mx-auto max-w-3xl p-4 elev-hi`} aria-label="ساخت دوره">
        <CourseBuilder compact job={job} hasAI={hasAI} recent={state.recent} onBuild={onBuild} onRead={onRead} onSettings={onSettings} />
      </section>

      {!state.onboarded && (
        <section className="relative rounded-lg border border-line bg-accent-soft/60 p-4" aria-label="شروع سریع">
          <button onClick={store.dismissOnboarding} aria-label="بستن راهنما" className="absolute end-1 top-1 flex size-11 items-center justify-center rounded-lg hover:bg-fg/10">
            <X className={ic} />
          </button>
          <ul className="grid gap-4 pe-10 sm:grid-cols-3">
            {ONBOARDING.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-3">
                <Icon className="mt-1 size-5 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm leading-7 text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <section className={`${card} border-accent/40 bg-accent-soft/40 p-5 ${showReview ? 'lg:col-span-2' : 'lg:col-span-3'}`} aria-label="قدم بعدی">
          <p className="mb-1 text-sm font-semibold text-accent">قدم بعدی</p>
          {action ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <p dir="auto" className="text-xl font-bold">{action.label}</p>
                <p className="text-sm text-muted">
                  {action.hint}
                  {action.kind === 'review' && ` حدود ${fa(Math.max(1, Math.round(due / 2)))} دقیقه.`}
                </p>
              </div>
              <a href={action.href} className={`${primary} px-6`}>
                {action.kind === 'review' ? 'شروع مرور' : action.kind === 'new' ? 'ساخت دوره' : 'ادامه'}
                <ArrowLeft className={ic} />
              </a>
            </div>
          ) : (
            <div className="h-14 motion-safe:animate-pulse rounded-md bg-fg/10" aria-hidden="true" />
          )}
        </section>

        {showReview && (
          <section className={`${card} p-5`} aria-label="مرور امروز">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-muted">
              <Layers className={ic} />
              مرور امروز
            </p>
            <p className="font-bold">امروز همه‌ی کارت‌هایت را مرور کرده‌ای</p>
            <p className="text-sm leading-7 text-muted">
              {back ? `مرور بعدی ${inDays(Math.round((Date.parse(back) - Date.parse(day)) / 86_400_000))} است. ` : ''}
              برای حفظ ریتم، می‌توانی یک موضوع جدید شروع کنی.
            </p>
          </section>
        )}

        <section className="lg:col-span-2" aria-label="دوره‌های فعال">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">دوره‌های فعال</h2>
            <a href="#/library" className="inline-flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
              همه‌ی کتابخانه
            </a>
          </div>
          {!active ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </div>
          ) : active.length ? (
            <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {active.map(({ c }) => (
                <CourseCard key={c.key} course={c} state={state} day={day} onToggleSaved={() => store.toggleSaved(c.root)} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Route} art="history" title="هنوز دوره‌ای شروع نکرده‌ای" text="یک لینک بچسبان یا یکی از دوره‌های آماده را شروع کن. هر پیشرفتی که داشته باشی همین‌جا دیده می‌شود.">
              <a href="#/new" className={primary}>ساخت دوره</a>
              <a href="#/discover" className={ghost}>
                <Compass className={ic} />
                دیدن دوره‌های آماده
              </a>
            </EmptyState>
          )}
        </section>

        <section className={`${card} space-y-4 p-5`} aria-label="پیشرفت هفته">
          <h2 className="font-bold">پیشرفت این هفته</h2>
          <StreakWidget streak={streakOf(state.days, day)} active={week.active} goal={state.goal} />
          <ProgressBar value={week.active} max={state.goal} label="روزهای فعال این هفته نسبت به هدف" />
          <ActivityChart state={state} day={day} />
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              [week.known, 'موضوع یادگرفته‌شده'],
              [week.cards, 'کارت مرورشده'],
              [week.minutes, 'دقیقه یادگیری'],
            ].map(([n, label]) => (
              <div key={label}>
                <dd className="text-xl font-bold">{fa(n as number)}</dd>
                <dt className="text-xs text-muted">{label}</dt>
              </div>
            ))}
          </dl>
          <a href="#/insights" className="flex min-h-11 items-center text-sm font-medium text-accent hover:underline">
            آمار کامل
          </a>
        </section>
      </div>

      {fresh && fresh.length > 0 && (
        <section aria-label="پیشنهاد">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Sparkles className={`${ic} text-accent`} />
            برای شروع پیشنهاد می‌کنیم
          </h2>
          <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fresh.map(({ c }) => (
              <CourseCard key={c.key} course={c} state={state} day={day} onToggleSaved={() => store.toggleSaved(c.root)} />
            ))}
          </div>
        </section>
      )}
      {stats && stats.length > 0 && stats.every((x) => x.s.status === 'done') && (
        <EmptyState icon={PartyPopper} art="biology" title="همه‌ی دوره‌ها را تمام کرده‌ای" text="وقت یک موضوع تازه است." />
      )}
    </div>
  );
}
