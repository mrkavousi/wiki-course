import { useEffect, useState } from 'react';
import type { Course, CourseRef, Page } from '../../types/course';
import { courseHref, findCourse, type Store } from '../../data/store';
import { courseKey, pathOf, topicKey, wikiUrl } from '../../utils/course';
import { dueIds, PASS, streak, today } from '../../utils/learn';
import { card, fa } from '../ui';

type Props = { store: Store; samples: CourseRef[]; busy: boolean; onBuild: (url: string) => void };

const TIPS = [
  ['🧭', 'از پیش‌نیازها شروع کن', 'مسیر به ترتیب اهمیت چیده شده. هر چه بلدی را علامت بزن تا «گام بعدی» معلوم شود.'],
  ['✍️', 'با زبان خودت بنویس', 'بعد از خواندن هر مقاله، در چند جمله توضیحش بده (تکنیک فاینمن).'],
  ['🎯', 'خودت را بیازما', `آزمون هر موضوع را بده؛ با ${fa(PASS)}٪ «بلدم» می‌خورد.`],
  ['🔁', 'هر روز کمی مرور', 'فلش‌کارت‌ها با فاصله‌ی بیشتر و بیشتر برمی‌گردند تا در حافظه‌ی بلندمدت بمانند.'],
] as const;

const refPage = (c: CourseRef): Page => ({ title: c.title, lang: c.lang, url: wikiUrl(c.lang, c.title), summary: '', thumbnail: c.thumbnail });

function Thumb({ src, title, className }: { src?: string; title: string; className: string }) {
  return src ? (
    <img src={src} alt="" loading="lazy" decoding="async" className={`shrink-0 bg-fg/10 object-cover ${className}`} />
  ) : (
    <span className={`flex shrink-0 items-center justify-center bg-fg/10 font-bold text-muted ${className}`}>{title[0]}</span>
  );
}

export function Library({ store, samples, busy, onBuild }: Props) {
  const { state } = store;
  const day = today();
  const due = dueIds(state.boxes, day).length;
  const known = new Set(state.known);
  const savedKeys = new Set(state.saved.map(topicKey));
  const courses = [...new Map([...state.recent, ...samples].map((c) => [c.key, c])).values()];
  // undefined = still loading, null = not built yet
  const [savedCourses, setSavedCourses] = useState<Record<string, Course | null>>({});

  // Progress bars need each saved topic's course (built on this device or a bundled sample).
  useEffect(() => {
    let live = true;
    Promise.all(state.saved.map(async (p) => [topicKey(p), await findCourse(courseKey(p.lang, p.title), samples)] as const)).then(
      (rows) => live && setSavedCourses(Object.fromEntries(rows)),
    );
    return () => {
      live = false;
    };
  }, [state.saved, samples]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      {!state.saved.length && !state.recent.length && (
        <section className={`${card} space-y-2 p-6`}>
          <h2 className="text-2xl font-extrabold">از هر مقاله، یک دوره 🎓</h2>
          <p className="leading-8 text-muted">
            لینک یک مقاله‌ی ویکی‌پدیا (فارسی یا انگلیسی) را بالا بچسبان. پیش‌نیازها، قدم‌های بعدی و مطالب مرتبطش را با تصویر و خلاصه می‌گیری، تیک «بلدم» می‌زنی، فلش‌کارت مرور می‌کنی و آزمون
            می‌دهی. یا یکی از دوره‌های نمونه‌ی پایین را باز کن.
          </p>
        </section>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <a href="#/review" className={`${card} p-4 transition hover:border-accent`}>
          <p className="text-sm text-muted">مرور امروز</p>
          <p className="text-2xl font-bold">🃏 {fa(due)} کارت</p>
          <p className="text-xs text-muted">{due ? 'بزن تا شروع کنیم' : 'فعلاً چیزی برای مرور نیست'}</p>
        </a>
        <div className={`${card} p-4`}>
          <p className="text-sm text-muted">روزهای پشت‌سرهم</p>
          <p className="text-2xl font-bold">🔥 {fa(streak(state.days, day))}</p>
          <p className="text-xs text-muted">هر روز یک کار کوچک: بلدم، مرور یا آزمون</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-sm text-muted">موضوع‌هایی که بلدی</p>
          <p className="text-2xl font-bold">✓ {fa(state.known.length)}</p>
          <p className="text-xs text-muted">در همه‌ی دوره‌ها مشترک است</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">کتابخانه‌ی من</h2>
        {!state.saved.length ? (
          <p className="text-muted">هنوز چیزی ذخیره نکرده‌ای. در هر دوره یا موضوع روی «☆ ذخیره» بزن تا این‌جا بماند.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.saved.map((p) => {
              const k = topicKey(p);
              const c = savedCourses[k];
              const steps = c ? pathOf(c) : [];
              const done = steps.filter((s) => known.has(topicKey(s.page))).length;
              return (
                <li key={k} className={`${card} relative`}>
                  <button
                    disabled={!c && busy}
                    onClick={() => (c ? (location.hash = courseHref(c.key)) : onBuild(p.url))}
                    className="flex w-full items-center gap-3 p-3 pe-10 text-start"
                  >
                    <Thumb src={p.thumbnail} title={p.title} className="h-16 w-16 rounded-xl" />
                    <span className="min-w-0 flex-1 space-y-1.5">
                      <span dir="auto" className="block truncate font-bold">{p.title}</span>
                      {c ? (
                        <>
                          <span className="block h-1.5 overflow-hidden rounded-full bg-fg/10">
                            <span className="block h-full rounded-full bg-accent" style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
                          </span>
                          <span className="block text-xs text-muted">
                            {fa(done)} از {fa(steps.length)} گام
                          </span>
                        </>
                      ) : (
                        <span className="block text-xs text-muted">{c === null ? 'دوره هنوز ساخته نشده؛ بزن تا ساخته شود' : '…'}</span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => store.toggleSaved(p)}
                    aria-label={`حذف «${p.title}» از کتابخانه`}
                    title="حذف از کتابخانه"
                    className="absolute end-2 top-2 rounded-full px-2 text-lg text-accent hover:bg-fg/10"
                  >
                    ★
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">همه‌ی دوره‌ها</h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const saved = savedKeys.has(topicKey(c));
            return (
              <li key={c.key} className={`${card} flex items-center gap-3 p-2`}>
                <Thumb src={c.thumbnail} title={c.title} className="h-11 w-11 rounded-lg" />
                <a href={courseHref(c.key)} dir="auto" className="min-w-0 flex-1 truncate font-medium hover:text-accent">
                  {c.title}
                </a>
                <span className="text-xs uppercase text-muted">{c.lang}</span>
                <button
                  onClick={() => store.toggleSaved(refPage(c))}
                  aria-pressed={saved}
                  aria-label={saved ? `حذف «${c.title}» از کتابخانه` : `ذخیره‌ی «${c.title}» در کتابخانه`}
                  className="rounded-full px-2 text-lg text-accent hover:bg-fg/10"
                >
                  {saved ? '★' : '☆'}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">چطور بهتر یاد بگیریم؟</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TIPS.map(([icon, title, text]) => (
            <li key={title} className={`${card} p-4`}>
              <p className="font-bold">
                {icon} {title}
              </p>
              <p className="text-sm leading-7 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
