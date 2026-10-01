import { BookOpen, ChartColumn, Layers, TriangleAlert } from 'lucide-react';
import { allRefs, courseHref, readHref, useCourses, type Store } from '../../data/store';
import { PASS, nextDue, streak, today } from '../../utils/learn';
import { courseStats, weakTopics, weekStats } from '../../utils/progress';
import { ActivityChart, Heatmap, ProgressBar, StreakWidget } from '../Progress/Progress';
import { EmptyState, Skeleton } from '../States/States';
import { card, fa, field, ghost, ic, inDays, primary } from '../ui';

const split = (key: string) => ({ lang: key.slice(0, key.indexOf(':')), title: key.slice(key.indexOf(':') + 1) });
const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className={`${card} space-y-3 p-5`}>
    <h2 className="font-bold">{title}</h2>
    {children}
  </section>
);

/** Every number here points at something to do: weak topics link to the article, due cards to review, courses to their next step. */
export function Insights({ store }: { store: Store }) {
  const { state } = store;
  const day = today();
  const courses = useCourses(allRefs(state));
  const week = weekStats(state, day);
  const due = Object.values(state.boxes).filter((b) => b.due <= day).length;
  const back = nextDue(state.boxes, day);
  const weak = weakTopics(state).slice(0, 6);
  const quizzes = Object.entries(state.quiz).sort((a, b) => a[1] - b[1]);
  const rows = courses?.map((c) => ({ c, s: courseStats(c, state, day) })).filter((x) => x.s.status !== 'archived' && (x.s.done > 0 || x.s.last));
  const empty = !state.days.length && !Object.keys(state.quiz).length;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">پیشرفت من</h1>
        <p className="text-sm text-muted">فقط عددهایی که به تصمیم بعدی‌ات کمک می‌کنند.</p>
      </header>

      {empty && (
        <EmptyState icon={ChartColumn} art="math" title="هنوز آماری نداری" text="با اولین موضوعی که بلد شدی، کارتی که مرور کردی یا آزمونی که دادی، اینجا پر می‌شود.">
          <a href="#/library" className={primary}>رفتن به کتابخانه</a>
        </EmptyState>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
        <Panel title="هدف هفته">
          <StreakWidget streak={streak(state.days, day)} active={week.active} goal={state.goal} />
          <ProgressBar value={week.active} max={state.goal} label="روزهای فعال این هفته نسبت به هدف" />
          <label className="flex flex-wrap items-center gap-2 text-sm">
            <span>هدفم در هفته:</span>
            <select value={state.goal} onChange={(e) => store.setGoal(Number(e.target.value))} className={`${field} !w-auto min-h-11 py-2 text-sm`}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{fa(n)} روز</option>)}
            </select>
          </label>
        </Panel>

        <Panel title="مرور بعدی">
          {due ? (
            <>
              <p className="text-3xl font-extrabold">{fa(due)} <span className="text-base font-medium text-muted">کارت منتظر است</span></p>
              <a href="#/review" className={primary}><Layers className={ic} />شروع مرور</a>
            </>
          ) : (
            <p className="text-sm leading-7 text-muted">
              همه‌ی کارت‌ها مرور شده‌اند.{back ? ` مرور بعدی ${inDays(Math.round((Date.parse(back) - Date.parse(day)) / 86_400_000))} است.` : ' هنوز کارتی نساخته‌ای.'}
            </p>
          )}
        </Panel>

        <Panel title="این هفته">
          <ActivityChart state={state} day={day} />
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[[week.known, 'موضوع یادگرفته‌شده'], [week.cards, 'کارت مرورشده'], [week.minutes, 'دقیقه یادگیری']].map(([n, l]) => (
              <div key={l}>
                <dd className="text-xl font-bold">{fa(n as number)}</dd>
                <dt className="text-xs text-muted">{l}</dt>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted">دقیقه‌ها زمانی است که صفحه‌ی مطالعه یا مرور باز بوده؛ تخمین است.</p>
        </Panel>

        <Panel title="۱۲ هفته‌ی گذشته">
          <Heatmap state={state} day={day} />
          <p className="text-sm text-muted">{fa(state.known.length)} موضوع را تا امروز بلد شده‌ای.</p>
        </Panel>

        <Panel title="موضوع‌هایی که مرور لازم دارند">
          {weak.length ? (
            <ul className="space-y-2">
              {weak.map((w) => {
                const { lang, title } = split(w.key);
                return (
                  <li key={w.key} className="flex flex-wrap items-center gap-2 text-sm">
                    <TriangleAlert className={`${ic} text-prereq`} aria-hidden="true" />
                    <span dir="auto" className="min-w-0 flex-1 truncate font-medium">{title}</span>
                    <span className="text-muted">{w.why === 'quiz' ? `آزمون ${fa(w.pct ?? 0)}٪ (کمتر از ${fa(PASS)}٪)` : 'کارت‌ها هنوز جا نیفتاده'}</span>
                    <a href={readHref(lang, title)} className={ghost}><BookOpen className={ic} />بخوان</a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted">موضوع ضعیفی نمی‌بینم. آزمون‌هایی که زیر {fa(PASS)}٪ بمانند اینجا می‌آیند.</p>
          )}
        </Panel>

        <Panel title="نتیجه‌ی آزمون‌ها">
          {quizzes.length ? (
            <ul className="space-y-2">
              {quizzes.slice(0, 8).map(([k, pct]) => (
                <li key={k} className="space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <span dir="auto" className="truncate">{split(k).title}</span>
                    <span className={pct >= PASS ? 'font-semibold text-accent' : 'text-muted'}>{fa(pct)}٪ {pct >= PASS ? '· قبول' : ''}</span>
                  </div>
                  <ProgressBar value={pct} max={100} label={`بهترین آزمون ${split(k).title}`} className="h-1.5" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">هنوز آزمونی نداده‌ای. آستانه‌ی «بلدم» {fa(PASS)}٪ است.</p>
          )}
        </Panel>
      </div>

      <Panel title="پیشرفت دوره‌ها">
        {!rows ? (
          <Skeleton className="h-16" />
        ) : rows.length ? (
          <ul className="space-y-3">
            {rows.map(({ c, s }) => (
              <li key={c.key} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <a href={courseHref(c.key)} dir="auto" className="inline-flex min-h-11 min-w-0 items-center truncate font-medium hover:text-accent hover:underline">{c.root.title}</a>
                  <span className="text-muted">{fa(s.done)} از {fa(s.total)} گام</span>
                </div>
                <ProgressBar value={s.done} max={s.total} label={`پیشرفت ${c.root.title}`} className="h-1.5" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">هنوز دوره‌ای را شروع نکرده‌ای.</p>
        )}
      </Panel>
    </div>
  );
}
