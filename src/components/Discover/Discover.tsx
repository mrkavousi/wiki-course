import { BookOpen, Compass, Sparkles } from 'lucide-react';
import type { BuildOpts } from '../../types/course';
import { allRefs, readHref, useCourses, type Store } from '../../data/store';
import { courseKey, topicKey } from '../../utils/course';
import { today } from '../../utils/learn';
import { courseStats } from '../../utils/progress';
import { CourseCard, CourseCardSkeleton } from '../CourseCard/CourseCard';
import { EmptyState } from '../States/States';
import { badge, card, fa, ghost, ic, primary } from '../ui';

type Props = { store: Store; onBuild: (url: string, o?: { opts?: BuildOpts; force?: boolean }) => void };

/** Two sources of ideas, personal first: next topics from courses you have, then ready-made courses you haven't started (a swipeable rail on phones). */
export function Discover({ store, onBuild }: Props) {
  const { state } = store;
  const day = today();
  const courses = useCourses(allRefs(state));
  const built = new Set((courses ?? []).map((c) => c.key));
  const known = new Set(state.known);

  const fresh = courses?.filter((c) => courseStats(c, state, day).status === 'new');
  // Next steps and related topics of courses in progress that have no course of their own yet.
  const seen = new Set<string>();
  const ideas = (courses ?? [])
    .filter((c) => courseStats(c, state, day).status !== 'new' && courseStats(c, state, day).status !== 'archived')
    .flatMap((c) => c.topics.filter((t) => t.role !== 'prereq').map((t) => ({ t, from: c.root.title })))
    .filter(({ t }) => !known.has(topicKey(t)) && !built.has(courseKey(t.lang, t.title)) && !seen.has(topicKey(t)) && !!seen.add(topicKey(t)))
    .sort((a, b) => b.t.score - a.t.score)
    .slice(0, 9);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">کشف</h1>
        <p className="text-sm text-muted">یک مسیر آماده را شروع کن، یا از دوره‌هایی که داری یک قدم جلوتر برو.</p>
      </header>

      <section aria-label="قدم بعدی از دوره‌های تو">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Sparkles className={`${ic} text-accent`} />
          قدم بعدی از دوره‌های تو
        </h2>
        {ideas.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map(({ t, from }) => (
              <li key={topicKey(t)} className={`${card} flex flex-col gap-2 p-4`}>
                <div className="flex items-center gap-2">
                  <h3 dir="auto" className="min-w-0 flex-1 truncate font-bold">{t.title}</h3>
                  <span className={badge}>{t.lang}</span>
                </div>
                <p dir="auto" className="line-clamp-3 text-sm leading-7 text-muted">{t.summary}</p>
                <p className="text-xs text-muted">از دوره‌ی «{from}» · ارتباط {fa(t.score)}٪</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <button className={primary} onClick={() => onBuild(t.url)}>ساخت دوره</button>
                  <a className={ghost} href={readHref(t.lang, t.title)}><BookOpen className={ic} />بخوان</a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">وقتی در یک دوره پیشرفت کنی، قدم‌های بعدی و موضوع‌های مرتبطش اینجا پیشنهاد می‌شوند.</p>
        )}
      </section>
      <section aria-label="دوره‌های آماده">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          <Compass className={`${ic} text-accent`} />
          دوره‌های آماده برای شروع
        </h2>
        {!fresh ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : fresh.length ? (
          <div className="rail sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {fresh.map((c) => <CourseCard key={c.key} course={c} state={state} day={day} onToggleSaved={() => store.toggleSaved(c.root)} />)}
          </div>
        ) : (
          <EmptyState icon={Sparkles} art="biology" title="همه‌ی دوره‌های آماده را شروع کرده‌ای" text="یک لینک ویکی‌پدیا بچسبان تا دوره‌ی خودت را بسازی.">
            <a href="#/new" className={primary}>ساخت دوره</a>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
