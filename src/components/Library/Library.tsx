import { useEffect, useState } from 'react';
import { CircleCheck, Compass, Flame, GraduationCap, Layers, PartyPopper, PenLine, Repeat, ShieldCheck, Sparkles, Star, Target } from 'lucide-react';
import type { Course, CourseRef, Page } from '../../types/course';
import { courseHref, findCourse, SAMPLES, type Store } from '../../data/store';
import { courseKey, pathOf, topicKey, wikiUrl } from '../../utils/course';
import { dueIds, PASS, streak, today } from '../../utils/learn';
import { badge, card, fa, ic, lift, primary } from '../ui';
import { UrlBar } from '../UrlBar/UrlBar';

type Props = { store: Store; busy: boolean; onBuild: (url: string) => void; onRead: (url: string) => void };

// icon, title, text, icon-badge tint
const TIPS = [
  [Compass, 'از پیش‌نیازها شروع کن', 'مسیر به ترتیب اهمیت چیده شده. هر چه بلدی را علامت بزن تا «گام بعدی» معلوم شود.', 'bg-fg/10 text-fg'],
  [PenLine, 'با زبان خودت بنویس', 'بعد از خواندن هر مقاله، در چند جمله توضیحش بده (تکنیک فاینمن).', 'bg-accent/10 text-accent'],
  [Target, 'خودت را بیازما', `آزمون هر موضوع را بده؛ با ${fa(PASS)}٪ «بلدم» می‌خورد.`, 'bg-prereq/10 text-prereq'],
  [Repeat, 'هر روز کمی مرور', 'فلش‌کارت‌ها با فاصله‌ی بیشتر و بیشتر برمی‌گردند تا در حافظه‌ی بلندمدت بمانند.', 'bg-related/10 text-related'],
] as const;

const starBtn = 'flex size-9 items-center justify-center rounded-full text-accent hover:bg-fg/10';

const refPage = (c: CourseRef): Page => ({ title: c.title, lang: c.lang, url: wikiUrl(c.lang, c.title), summary: '', thumbnail: c.thumbnail });

function Thumb({ src, title, className }: { src?: string; title: string; className: string }) {
  // The fallback letter is always decorative: the real title renders as its own text right beside it,
  // so it's hidden from assistive tech/text extraction here once, rather than trusting every caller to ask for it.
  return src ? (
    <img src={src} alt="" loading="lazy" decoding="async" className={`shrink-0 bg-fg/10 object-cover ${className}`} />
  ) : (
    <span className={`flex shrink-0 items-center justify-center bg-fg/10 font-bold text-muted ${className}`} aria-hidden="true">
      {title[0]}
    </span>
  );
}

export function Library({ store, busy, onBuild, onRead }: Props) {
  const { state } = store;
  const day = today();
  const due = dueIds(state.boxes, day).length;
  const known = new Set(state.known);
  const savedKeys = new Set(state.saved.map(topicKey));
  const courses = [...new Map([...state.recent, ...SAMPLES].map((c) => [c.key, c])).values()];
  const isNew = !state.recent.length && !state.saved.length && !state.known.length && !state.days.length;
  // undefined = still loading, null = not built yet
  const [savedCourses, setSavedCourses] = useState<Record<string, Course | null>>({});

  // Progress bars need each saved topic's course (built on this device or a bundled sample).
  useEffect(() => {
    let live = true;
    Promise.all(state.saved.map(async (p) => [topicKey(p), await findCourse(courseKey(p.lang, p.title))] as const)).then(
      (rows) => live && setSavedCourses(Object.fromEntries(rows)),
    );
    return () => {
      live = false;
    };
  }, [state.saved]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      {/* Hero section */}
      <section className="space-y-6 text-center">
        <div>
          <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-extrabold">
            <GraduationCap className="size-8 text-accent" />
            از هر مقاله، یک مسیر یادگیری هوشمند بساز
          </h1>
          <p className="leading-8 text-muted">
            با چسباندن لینک هر مقاله‌ی ویکی‌پدیا (فارسی یا انگلیسی)، نقشه راه، خلاصه‌ها، فلش‌کارت‌ها و آزمون‌های اختصاصی آن را در چند ثانیه تحویل بگیر.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:max-w-2xl sm:mx-auto">
          <UrlBar busy={busy} onBuild={onBuild} onRead={onRead} hero />
          <div className="flex flex-wrap justify-center gap-2">
            {['جبر خطی', 'یادگیری ماشین', 'شاهنشاهی اشکانی'].map((title) => (
              <button
                key={title}
                disabled={busy}
                onClick={() => onBuild(wikiUrl('fa', title))}
                className="rounded-full border border-accent bg-accent/10 px-3 py-1 text-sm font-medium text-accent hover:bg-accent/20 disabled:opacity-50"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isNew ? (
        <section className={`${card} flex items-center gap-3 bg-accent/5 p-4 text-sm`}>
          <Sparkles className="size-8 flex-none text-accent" />
          <p className="text-muted">با یکی از پیشنهادهای بالا یا لینک خودت شروع کن؛ آمار مرور و زنجیره‌ی یادگیری بعد از اولین قدم اینجا ظاهر می‌شود.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a href="#/review" className={`${card} ${lift} bg-accent/5 p-4 hover:border-accent`}>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/10">
              <Layers className="size-5 text-accent" />
            </div>
            <p className="text-sm text-muted">مرور امروز</p>
            <p className="text-2xl font-bold">{fa(due)} کارت</p>
            <p className="text-sm text-muted">{due ? 'بزن تا شروع کنیم' : 'امروز کارت جدیدی نداری؛ برای حفظ زنجیره سراغ یک دوره‌ی جدید برو'}</p>
          </a>
          <div className={`${card} bg-prereq/5 p-4`}>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-prereq/10">
              <Flame className="size-5 text-prereq" />
            </div>
            <p className="text-sm text-muted">زنجیره یادگیری</p>
            <p className="text-2xl font-bold">{fa(streak(state.days, day))}</p>
            <p className="text-sm text-muted">با هر مرور روزانه، زنجیره‌ات را حفظ کن</p>
          </div>
          <div className={`${card} bg-accent/5 p-4`}>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-accent/10">
              <CircleCheck className="size-5 text-accent" />
            </div>
            <p className="text-sm text-muted">جعبه‌ی دانشی که مسلط شدی</p>
            <p className="text-2xl font-bold">{fa(state.known.length)}</p>
            <p className="text-sm text-muted">هر موضوع بلد شده، در تمام دوره‌ها پیش‌نیاز حساب می‌شود و نیازی به دوباره خواندن ندارد</p>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-bold">کتابخانه‌ی من</h2>
        {!state.saved.length ? (
          <p className="text-muted">هنوز دوره‌ای به کتابخانه اضافه نکرده‌ای. دوره‌های زیر را امتحان کن.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {state.saved.map((p) => {
              const k = topicKey(p);
              const c = savedCourses[k];
              const steps = c ? pathOf(c) : [];
              const done = steps.filter((s) => known.has(topicKey(s.page))).length;
              return (
                <li key={k} className={`${card} ${lift} relative`}>
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
                    className={`${starBtn} absolute end-2 top-2`}
                  >
                    <Star className="size-5 fill-current" />
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
              <li key={c.key} className={`${card} ${lift} flex items-center gap-3 p-2`}>
                <Thumb src={c.thumbnail} title={c.title} className="h-11 w-11 rounded-lg" />
                <a href={courseHref(c.key)} dir="auto" className="min-w-0 flex-1 truncate font-medium hover:text-accent">
                  {c.title}
                </a>
                <span className={badge}>{c.lang}</span>
                <button
                  onClick={() => store.toggleSaved(refPage(c))}
                  aria-pressed={saved}
                  aria-label={saved ? `حذف «${c.title}» از کتابخانه` : `ذخیره‌ی «${c.title}» در کتابخانه`}
                  className={starBtn}
                >
                  <Star className={`size-5 ${saved ? 'fill-current' : ''}`} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">چطور بهتر یاد بگیریم؟</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TIPS.map(([Icon, title, text, tint]) => (
            <li key={title} className={`${card} p-4`}>
              <div className={`mb-3 flex size-10 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="size-5" />
              </div>
              <p className="mb-2 font-bold">{title}</p>
              <p className="text-sm leading-7 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Privacy notice */}
      <section className={`${card} flex items-start gap-3 p-4 text-sm`}>
        <ShieldCheck className="mt-0.5 size-5 flex-none text-accent" />
        <span>
          <span className="block font-bold">مدیریت داده‌ها و حریم خصوصی</span>
          <span className="text-muted">
            اطلاعات شما بدون نیاز به ثبت‌نام روی همین دستگاه ذخیره می‌شود. برای انتقال به دستگاه دیگر از تنظیمات نسخه‌ی پشتیبان بگیر.
          </span>
        </span>
      </section>
    </div>
  );
}
