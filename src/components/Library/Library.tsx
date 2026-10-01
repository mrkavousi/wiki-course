import { useMemo, useState } from 'react';
import { Archive, ArchiveRestore, BookOpen, LayoutGrid, List, Plus, Search, SearchX, Star, Trash2 } from 'lucide-react';
import type { BuildOpts, Course, Page } from '../../types/course';
import { allRefs, deleteCourse, local, useCourses, type Store } from '../../data/store';
import { topicKey, wikiUrl } from '../../utils/course';
import { today } from '../../utils/learn';
import { courseStats, STATUS_LABEL, type Status } from '../../utils/progress';
import { SUBJECT_LABEL, subjectOf, type Subject } from '../../utils/subject';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import { CourseCard, CourseCardSkeleton } from '../CourseCard/CourseCard';
import { EmptyState } from '../States/States';
import { useToast } from '../Toast/Toast';
import { card, field, ghost, ic, iconBtn, primary } from '../ui';
import { readHref } from '../../data/store';

type Props = { store: Store; onBuild: (url: string, o?: { opts?: BuildOpts; force?: boolean }) => void };
type Sort = 'last' | 'progress' | 'created';
type View = 'grid' | 'list';

const select = `${field} !w-auto min-h-11 py-2 text-sm`;

export function Library({ store, onBuild }: Props) {
  const { state } = store;
  const day = today();
  const toast = useToast();
  const refs = allRefs(state);
  const courses = useCourses(refs);
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('');
  const [status, setStatus] = useState<'' | Status>('');
  const [subject, setSubject] = useState<'' | Subject>('');
  const [sort, setSort] = useState<Sort>('last');
  const [favOnly, setFavOnly] = useState(false);
  const [view, setViewState] = useState<View>(() => (local.get<View>('wc:lib', 'grid') === 'list' ? 'list' : 'grid'));
  const [doomed, setDoomed] = useState<Course | null>(null);
  const setView = (v: View) => (setViewState(v), local.set('wc:lib', v));

  const rows = useMemo(
    () =>
      (courses ?? []).map((c) => ({ c, s: courseStats(c, state, day), subject: subjectOf({ title: c.root.title, summary: c.root.summary }), fav: state.saved.some((p) => topicKey(p) === topicKey(c.root)) })),
    [courses, state, day],
  );
  const langs = [...new Set(rows.map((r) => r.c.root.lang))];
  const needle = q.trim().toLowerCase();
  const shown = rows
    .filter((r) => (status ? r.s.status === status : r.s.status !== 'archived')) // archived courses only show when asked for
    .filter((r) => (!lang || r.c.root.lang === lang) && (!subject || r.subject === subject) && (!favOnly || r.fav))
    .filter((r) => !needle || `${r.c.root.title} ${r.c.root.summary}`.toLowerCase().includes(needle))
    .sort((a, b) => (sort === 'progress' ? b.s.pct - a.s.pct : sort === 'created' ? b.c.generatedAt.localeCompare(a.c.generatedAt) : b.s.last - a.s.last));
  const filtered = !!(q || lang || status || subject || favOnly);
  const clear = () => (setQ(''), setLang(''), setStatus(''), setSubject(''), setFavOnly(false));

  // Saved topics that have no course yet (a star on a course card is a favourite; these were saved from inside a course).
  const courseTopics = new Set(rows.map((r) => topicKey(r.c.root)));
  const loose: Page[] = state.saved.filter((p) => !courseTopics.has(topicKey(p)));

  const archive = (c: Course, on: boolean) => {
    store.setArchived(c.key, on);
    toast(on ? 'به بایگانی رفت' : 'از بایگانی درآمد');
  };
  const remove = async () => {
    const c = doomed!;
    setDoomed(null);
    await deleteCourse(c.key);
    store.forgetCourse(c.key);
    toast('دوره حذف شد');
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">کتابخانه‌ی من</h1>
          <p className="text-sm text-muted">{courses ? `${rows.length.toLocaleString('fa')} دوره` : 'در حال بارگذاری…'}</p>
        </div>
        <a href="#/new" className={primary}>
          <Plus className={ic} />
          ساخت دوره
        </a>
      </header>

      <div className="flex flex-wrap items-center gap-2" role="search">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-label="جست‌وجو در کتابخانه" placeholder="جست‌وجو در عنوان و خلاصه" className={`${field} ps-9`} />
        </div>
        <select aria-label="زبان" value={lang} onChange={(e) => setLang(e.target.value)} className={select}>
          <option value="">همه‌ی زبان‌ها</option>
          {langs.map((l) => <option key={l} value={l}>{l === 'fa' ? 'فارسی' : l === 'en' ? 'English' : l}</option>)}
        </select>
        <select aria-label="وضعیت" value={status} onChange={(e) => setStatus(e.target.value as Status | '')} className={select}>
          <option value="">همه‌ی وضعیت‌ها</option>
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select aria-label="موضوع" value={subject} onChange={(e) => setSubject(e.target.value as Subject | '')} className={select}>
          <option value="">همه‌ی حوزه‌ها</option>
          {(Object.keys(SUBJECT_LABEL) as Subject[]).map((s) => <option key={s} value={s}>{SUBJECT_LABEL[s]}</option>)}
        </select>
        <select aria-label="مرتب‌سازی" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
          <option value="last">آخرین فعالیت</option>
          <option value="progress">بیشترین پیشرفت</option>
          <option value="created">تازه‌ترین</option>
        </select>
        <button className={`${ghost} ${favOnly ? 'border-accent bg-accent-soft text-accent' : ''}`} aria-pressed={favOnly} onClick={() => setFavOnly(!favOnly)}>
          <Star className={`${ic} ${favOnly ? 'fill-current' : ''}`} />
          ذخیره‌شده‌ها
        </button>
        <div className="flex overflow-hidden rounded-lg border border-line" role="group" aria-label="نحوه‌ی نمایش">
          {(
            [
              ['grid', 'شبکه‌ای', LayoutGrid],
              ['list', 'فهرستی', List],
            ] as const
          ).map(([v, label, Icon]) => (
            <button key={v} aria-pressed={view === v} aria-label={label} title={label} onClick={() => setView(v)} className={`${iconBtn} rounded-none ${view === v ? 'bg-accent text-on-accent hover:bg-accent' : ''}`}>
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      </div>

      {courses === undefined ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : shown.length ? (
        <ul className={view === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'} aria-live="polite">
          {shown.map(({ c, s }) => (
            <li key={c.key}>
              <CourseCard
                course={c}
                state={state}
                day={day}
                variant={view}
                level={2}
                onToggleSaved={() => store.toggleSaved(c.root)}
                menu={
                  <>
                    <button onClick={() => archive(c, s.status !== 'archived')} aria-label={s.status === 'archived' ? `برگرداندن «${c.root.title}» از بایگانی` : `بایگانی «${c.root.title}»`} title={s.status === 'archived' ? 'برگرداندن از بایگانی' : 'بایگانی'} className={iconBtn}>
                      {s.status === 'archived' ? <ArchiveRestore className="size-5" /> : <Archive className="size-5" />}
                    </button>
                    {state.recent.some((r) => r.key === c.key) && (
                      <button onClick={() => setDoomed(c)} aria-label={`حذف «${c.root.title}»`} title="حذف" className={`${iconBtn} text-danger`}>
                        <Trash2 className="size-5" />
                      </button>
                    )}
                  </>
                }
              />
            </li>
          ))}
        </ul>
      ) : filtered ? (
        <EmptyState icon={SearchX} title="دوره‌ای پیدا نشد" text="با این جست‌وجو و فیلترها چیزی نیست. فیلترها را بردار یا عبارت دیگری امتحان کن.">
          <button className={ghost} onClick={clear}>
            پاک کردن فیلترها
          </button>
        </EmptyState>
      ) : (
        <EmptyState icon={BookOpen} title="کتابخانه‌ات خالی است" text="اولین دوره‌ات را از لینک یک مقاله بساز؛ همین‌جا می‌ماند و پیشرفتت دیده می‌شود.">
          <a href="#/new" className={primary}>ساخت دوره</a>
        </EmptyState>
      )}

      {loose.length > 0 && (
        <section aria-label="موضوع‌های ذخیره‌شده">
          <h2 className="mb-2 text-lg font-bold">برای بعد ذخیره کرده‌ای</h2>
          <ul className="space-y-2">
            {loose.map((p) => (
              <li key={topicKey(p)} className={`${card} flex flex-wrap items-center gap-3 p-3`}>
                <span dir="auto" className="min-w-0 flex-1 truncate font-medium">{p.title}</span>
                <a href={readHref(p.lang, p.title)} className={ghost}>
                  <BookOpen className={ic} />
                  بخوان
                </a>
                <button className={ghost} onClick={() => onBuild(p.url || wikiUrl(p.lang, p.title))}>
                  ساخت دوره
                </button>
                <button className={iconBtn} onClick={() => store.toggleSaved(p)} aria-label={`حذف «${p.title}» از ذخیره‌شده‌ها`} title="حذف از ذخیره‌شده‌ها">
                  <Star className="size-5 fill-current text-accent" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmModal
        open={!!doomed}
        danger
        title={`حذف «${doomed?.root.title ?? ''}»؟`}
        text="دوره از این دستگاه پاک می‌شود. علامت «بلدم»، یادداشت‌ها، فلش‌کارت‌ها و آزمون‌های مقاله‌ها می‌مانند؛ اگر دوباره بسازی، همه سر جایشان‌اند."
        confirmLabel="حذف دوره"
        onConfirm={remove}
        onCancel={() => setDoomed(null)}
      />
    </div>
  );
}
