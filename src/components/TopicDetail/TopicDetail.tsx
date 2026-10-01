import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Check, ClipboardCheck, ExternalLink, KeyRound, Loader, PenLine, Route, Sparkles, Star } from 'lucide-react';
import type { Course, Pack, Page, Role, Topic } from '../../types/course';
import { readHref, type Store } from '../../data/store';
import { topicKey } from '../../utils/course';
import { Flashcards } from '../Flashcards/Flashcards';
import { Quiz } from '../Quiz/Quiz';
import { chip, fa, ghost, ic, outline, primary } from '../ui';

type Job = { status: string; error: string } | null;
type Props = {
  course: Course;
  page: Page;
  topic?: Topic; // undefined = the course's own article
  store: Store;
  pack?: Pack;
  packJob: Job;
  busy: boolean; // a course build is running
  onBuildPack: () => void;
  onBuildCourse: (url: string) => void;
  next: Page | null; // the next topic on the path that isn't known yet (null: the whole path is known)
  onNext: () => void;
};

const ROLE: Record<Role | 'root', [string, string]> = {
  root: ['مقاله‌ی اصلی', 'bg-fg/10 text-fg'],
  prereq: ['پیش‌نیاز', 'bg-prereq/15 text-prereq'],
  next: ['پس‌نیاز', 'bg-next/15 text-next'],
  related: ['مرتبط', 'bg-related/15 text-related'],
};
const tool = 'flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-center text-sm font-medium hover:bg-fg/5';
const TABS = [['about', 'درباره'], ['cards', 'فلش‌کارت'], ['quiz', 'آزمون']] as const;

export function TopicDetail({ course, page, topic, store, pack, packJob, busy, onBuildPack, onBuildCourse, next, onNext }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('about');
  const [learned, setLearned] = useState(false); // just marked as known: show where to go next
  const { state } = store;
  const key = topicKey(page);
  const known = state.known.includes(key);
  const saved = state.saved.some((p) => topicKey(p) === key);
  useEffect(() => setLearned(false), [key]);
  // After a successful build: jump to the flashcards and nudge the quiz tab for a few seconds so it gets noticed.
  const [nudge, setNudge] = useState(false);
  const building = useRef(false);
  useEffect(() => {
    building.current = false;
    setNudge(false);
  }, [key]);
  useEffect(() => {
    if (packJob?.status) building.current = true;
    if (pack && building.current) {
      building.current = false;
      setTab('cards');
      setNudge(true);
      const t = setTimeout(() => setNudge(false), 6000);
      return () => clearTimeout(t);
    }
  }, [pack, packJob?.status]);
  const [roleLabel, roleChip] = ROLE[topic?.role ?? 'root'];

  const packCta = (what: string) => (
    <div className="space-y-3 rounded-lg border border-dashed border-line p-6 text-center">
      <p className="text-sm leading-7 text-muted">
        {what} این موضوع هنوز ساخته نشده. هوش مصنوعی از روی متن خود مقاله نکات کلیدی، ۶ فلش‌کارت و ۴ سؤال می‌سازد (محتوای تولیدشده، نه متن ویکی‌پدیا)؛ یک بار، و بعد روی همین دستگاه می‌ماند.
      </p>
      <button className={primary} disabled={!!packJob?.status} onClick={onBuildPack}>
        <Sparkles className={ic} />
        {packJob?.status || 'ساخت فلش‌کارت و آزمون'}
      </button>
      {packJob?.error && <p className="text-sm text-danger">{packJob.error}</p>}
    </div>
  );

  const about = (
    <div className="space-y-5">
      {page.thumbnail && <img src={page.thumbnail} alt="" loading="lazy" decoding="async" className="aspect-video w-full rounded-lg bg-fg/5 object-cover" />}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`${chip} font-semibold ${roleChip}`}>{roleLabel}</span>
          {topic && <span className={chip}>ارتباط {fa(topic.score)}٪</span>}
          {state.quiz[key] !== undefined && <span className={chip}>بهترین آزمون {fa(state.quiz[key])}٪</span>}
          {known && (
            <span className={`${chip} bg-accent-soft text-accent`}>
              <Check className={ic} aria-hidden="true" />
              بلدم
            </span>
          )}
        </div>
        <h2 dir="auto" className="text-2xl font-bold leading-snug">{page.title}</h2>
      </div>
      {topic?.why && (
        <p className="rounded-lg bg-fg/5 p-3 text-sm leading-7">
          <b className="text-accent">چرا در این مسیر؟ </b>
          <span className="text-xs text-muted">(تخمین هوش مصنوعی) </span>
          {topic.why}
        </p>
      )}
      <div className="space-y-1">
        <p dir="auto" className="leading-8">{page.summary}</p>
        <p className="text-xs text-muted">
          خلاصه از{' '}
          <a href={page.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">ویکی‌پدیا</a>
          {' '}(CC BY-SA 4.0)
        </p>
      </div>

      {pack?.keyPoints.length ? (
        <section>
          <h3 className="mb-2 flex items-center gap-2 font-bold">
            <KeyRound className={ic} />
            نکات کلیدی
          </h3>
          <ul className="list-disc space-y-1.5 ps-5 leading-7">
            {pack.keyPoints.map((p) => <li key={p} dir="auto">{p}</li>)}
          </ul>
        </section>
      ) : (
        packJob?.error && <p className="text-sm text-danger" role="alert">{packJob.error}</p>
      )}

      {learned && known && (
        <div className="space-y-2 rounded-lg border border-accent bg-accent-soft p-3" role="status">
          <p className="flex items-center gap-2 font-bold">
            <Check className={`${ic} text-accent`} />
            «{page.title}» را بلدی
          </p>
          <div className="flex flex-wrap gap-2">
            {next ? (
              <button className={primary} onClick={() => { setLearned(false); onNext(); }}>
                موضوع بعدی: <span dir="auto">{next.title}</span>
                <ArrowLeft className={ic} />
              </button>
            ) : (
              <p className="text-sm">همه‌ی مسیر را بلدی. وقت مرور یا یک دوره‌ی تازه است.</p>
            )}
            <button className={ghost} onClick={() => setTab('quiz')}>
              <ClipboardCheck className={ic} />
              آزمون این موضوع
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <a className={`${primary} min-w-0 flex-1`} href={readHref(page.lang, page.title, course.key)}>
            <BookOpen className={ic} />
            مطالعه‌ی مقاله
          </a>
          <button
            className={`${known ? outline : ghost} shrink-0`}
            aria-pressed={known}
            onClick={() => {
              store.toggleKnown(key, course.key);
              setLearned(!known);
            }}
          >
            <Check className={ic} />
            {known ? 'بلدم' : 'این را بلدم'}
          </button>
        </div>
        {/* secondary actions as one segmented toolbar; flashcards and the quiz have their own tabs above */}
        <div className="grid grid-flow-col auto-cols-fr divide-x divide-x-reverse divide-line overflow-hidden rounded-xl border border-line" role="group" aria-label="اقدام‌های بیشتر">
          <button className={tool} aria-pressed={saved} onClick={() => store.toggleSaved(page)}>
            <Star className={`size-5 ${saved ? 'fill-current text-accent' : ''}`} />
            {saved ? 'ذخیره‌شده' : 'ذخیره'}
          </button>
          <a className={tool} href={page.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-5" />
            ویکی‌پدیا
          </a>
          {topic && (
            <button className={`${tool} disabled:opacity-50`} disabled={busy} onClick={() => onBuildCourse(page.url)}>
              <Route className="size-5" />
              دوره‌ی این موضوع
            </button>
          )}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="flex items-center gap-2 font-bold">
          <PenLine className={ic} />
          با زبان خودت توضیح بده
        </span>
        <span className="block text-xs leading-6 text-muted">
          تکنیک فاینمن: اگر نتوانی ساده توضیحش بدهی، هنوز کامل نفهمیده‌ای. این یادداشت در خروجی Markdown و پرامپت «معلم خصوصی» هم می‌آید.
        </span>
        <textarea
          dir="auto"
          rows={4}
          value={state.notes[key] ?? ''}
          onChange={(e) => store.setNote(key, e.target.value)}
          placeholder="مثلاً: این مفهوم یعنی…"
          className="w-full rounded-lg border border-line bg-bg p-3 leading-7 placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </label>

      {!topic && (
        <div className="space-y-1 border-t border-line pt-3 text-xs leading-6 text-muted">
          {course.note && <p className="text-prereq">{course.note}</p>}
          <p>پیش‌نیازها، پس‌نیازها و نمره‌ها تخمین هوش مصنوعی‌اند، نه واقعیت قطعی.</p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div role="tablist" className="sticky top-0 z-10 flex border-b border-line bg-panel">
        {TABS.map(([id, text]) => {
          const n = id === 'cards' ? pack?.cards.length : id === 'quiz' ? pack?.quiz.length : 0;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => (setTab(id), id === 'quiz' && setNudge(false))}
              className={`relative flex-1 border-b-2 py-3 text-sm font-semibold transition ${tab === id ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'} ${id === 'quiz' && nudge && tab !== 'quiz' ? 'tab-nudge text-accent' : ''}`}
            >
              {text}
              {n ? ` (${fa(n)})` : ''}
              {id === 'quiz' && nudge && tab !== 'quiz' && <span className="absolute end-3 top-2 size-2 rounded-full bg-coral" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div className={`p-4 ${!pack ? "pb-24" : ""}`}>
        {tab === 'about' && about}
        {tab === 'cards' &&
          (pack?.cards.length ? (
            <Flashcards key={key} items={pack.cards.map((c, i) => ({ id: `${key}#${i}`, ...c }))} boxes={state.boxes} onRate={store.rateCard} />
          ) : (
            packCta('فلش‌کارت‌های')
          ))}
        {tab === 'quiz' &&
          (pack?.quiz.length ? (
            <Quiz
              key={key}
              questions={pack.quiz}
              best={state.quiz[key]}
              onDone={(pct) => store.quizDone(key, pct, course.key)}
              onReviewCards={() => setTab('cards')}
              readHref={readHref(page.lang, page.title, course.key)}
              onContinue={next ? onNext : undefined}
              continueLabel={next ? `موضوع بعدی: ${next.title}` : undefined}
            />
          ) : (
            packCta('آزمون')
          ))}
      </div>
      {/* Floating call to action: the one next step for a topic without a study pack. Bottom-left in the viewport; above the phone tab bar. */}
      {!pack && tab === 'about' && (
        <button
          onClick={onBuildPack}
          disabled={!!packJob?.status}
          className={`${primary} fixed bottom-20 left-4 z-30 min-h-12 rounded-full px-5 shadow-xl lg:bottom-6 ${packJob?.status ? 'max-w-[calc(100vw-2rem)]' : ''}`}
        >
          {packJob?.status ? <Loader className={`${ic} motion-safe:animate-spin`} /> : <Sparkles className={ic} />}
          <span className="truncate">{packJob?.status || 'ساخت فلش‌کارت و آزمون'}</span>
        </button>
      )}
    </div>
  );
}
