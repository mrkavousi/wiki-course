import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ExternalLink, Highlighter, Info, Languages, List, Minus, Plus, RefreshCw, Sparkles, Star, Type } from 'lucide-react';
import type { AI, Page } from '../../types/course';
import { READER_SIZES, courseHref, findCourse, loadTerms, readHref, saveTerms, useReaderPrefs, type ReaderMode, type Store } from '../../data/store';
import { buildTerms, fetchArticle, fetchLangLinks, type Article, type LangLink } from '../../lib/build';
import { courseKey, pathOf, topicKey, wikiUrl } from '../../utils/course';
import type { Course } from '../../types/course';
import { FORMULA, boldSegments, parseArticle, termRegex, type Seg } from '../../utils/reader';
import { useToast } from '../Toast/Toast';
import { card, field, fa, ghost, ic, outline, primary } from '../ui';

type Props = { lang: string; title: string; course?: string; store: Store; ai: AI; needAI: () => boolean };
type Job = { status: string; error: string } | null;

const MODES: [ReaderMode, string, typeof BookOpen][] = [
  ['easy', 'ساده', BookOpen],
  ['enhanced', 'پیشرفته', Highlighter],
];

/** Text with each dropped formula shown as a small "formula" chip. */
function Plain({ text }: { text: string }) {
  return (
    <>
      {text.split(FORMULA).map((t, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="mx-1 rounded bg-fg/10 px-1.5 text-[0.75em] text-muted">فرمول</span>}
          {t}
        </Fragment>
      ))}
    </>
  );
}

function Para({ segs }: { segs: Seg[] }) {
  return (
    <p dir="auto" className="mb-[0.9em] leading-[2]">
      {segs.map((g, i) =>
        g.term === undefined ? (
          <Plain key={i} text={g.text} />
        ) : (
          <strong key={i} data-term={g.term} className="rounded box-decoration-clone bg-accent/15 px-0.5 font-bold">
            {g.text}
          </strong>
        ),
      )}
    </p>
  );
}

/** The element that scrolls the page: the nearest scrolling ancestor (desktop layout), else the window (phones). */
function scroller(from: HTMLElement | null): { top: () => number; max: () => number; to: (y: number) => void; target: EventTarget } {
  for (let el = from?.parentElement; el; el = el.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) {
      return { top: () => el.scrollTop, max: () => el.scrollHeight - el.clientHeight, to: (y) => el.scrollTo({ top: y }), target: el };
    }
  }
  const d = document.documentElement;
  return { top: () => scrollY, max: () => d.scrollHeight - innerHeight, to: (y) => scrollTo({ top: y }), target: window };
}

/** Other-language versions of the article, from Wikipedia's own language links; picking one opens it in this reader. */
function LangPicker({ lang, title, course, onClose }: { lang: string; title: string; course?: string; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [links, setLinks] = useState<LangLink[] | 'error'>();
  const [q, setQ] = useState('');
  useEffect(() => {
    dlg.current!.showModal();
    fetchLangLinks(lang, title).then(setLinks, () => setLinks('error'));
  }, [lang, title]);
  const needle = q.trim().toLowerCase();
  const rank = (l: LangLink) => (l.lang === 'fa' ? 0 : l.lang === 'en' ? 1 : 2);
  const shown = Array.isArray(links)
    ? links.filter((l) => !needle || [l.name, l.title, l.lang].some((s) => s.toLowerCase().includes(needle))).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
    : [];
  return (
    <dialog ref={dlg} onClose={onClose} aria-label="زبان‌های دیگر" className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-3xl border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm">
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold">
            <Languages className={ic} />
            این مقاله به زبان‌های دیگر
          </h2>
          <button onClick={() => dlg.current!.close()} className={ghost}>بستن</button>
        </div>
        <p className="text-sm leading-7 text-muted">نسخه‌هایی که ویکی‌پدیا خودش به این مقاله پیوند داده؛ متن هر زبان را نویسندگان همان ویکی‌پدیا نوشته‌اند و ترجمه‌ی ماشینی نیست.</p>
        {links === undefined && <p className="text-sm text-muted" role="status">در حال گرفتن فهرست زبان‌ها…</p>}
        {links === 'error' && <p className="text-sm text-danger" role="alert">فهرست زبان‌ها گرفته نشد؛ اتصال را بررسی کن.</p>}
        {Array.isArray(links) &&
          (links.length ? (
            <>
              {links.length > 8 && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجوی زبان…" aria-label="جست‌وجوی زبان" className={field} />}
              <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto rounded-xl border border-line">
                {shown.map((l) => (
                  <li key={l.lang}>
                    <a href={readHref(l.lang, l.title, course)} onClick={() => dlg.current!.close()} className="flex min-h-12 items-center justify-between gap-3 px-3 py-2 hover:bg-fg/5">
                      <span className="min-w-0">
                        <span dir="auto" className="block font-semibold">{l.name}</span>
                        <span dir="auto" className="block truncate text-sm text-muted">{l.title}</span>
                      </span>
                      <span className="shrink-0 rounded-md border border-line px-1.5 py-0.5 font-mono text-xs uppercase text-muted">{l.lang}</span>
                    </a>
                  </li>
                ))}
                {!shown.length && <li className="p-3 text-sm text-muted">زبانی با این نام نیست.</li>}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted" role="status">این مقاله در زبان دیگری نسخه ندارد.</p>
          ))}
      </div>
    </dialog>
  );
}

/** Previous and next topic of the course path as two equal buttons (one alone fills the row). */
function StepNav({ from, prev, next }: { from: Course; prev?: Page; next?: Page }) {
  if (!prev && !next) return null;
  const cell = `${ghost} min-w-0 flex-1`;
  return (
    <div className="flex gap-2">
      {prev && (
        <a href={readHref(prev.lang, prev.title, from.key)} className={cell}>
          <ArrowRight className={ic} />
          <span className="min-w-0 truncate"><span className="max-sm:hidden">موضوع </span>قبلی: <span dir="auto">{prev.title}</span></span>
        </a>
      )}
      {next && (
        <a href={readHref(next.lang, next.title, from.key)} className={cell}>
          <span className="min-w-0 truncate"><span className="max-sm:hidden">موضوع </span>بعدی: <span dir="auto">{next.title}</span></span>
          <ArrowLeft className={ic} />
        </a>
      )}
    </div>
  );
}

const HEADING = ['', '', 'mt-10 text-[1.4em]', 'mt-8 text-[1.2em]', 'mt-6 text-[1.08em]'];

/** Distraction-free article reader. Easy: clean text. Enhanced: the AI's key terms in bold, once per section. */
export function Reader({ lang, title, course: courseId, store, ai, needAI }: Props) {
  const [prefs, setPrefs] = useReaderPrefs();
  const [article, setArticle] = useState<Article>();
  const [error, setError] = useState('');
  const [terms, setTerms] = useState<string[]>(); // undefined = never computed for this article
  const [job, setJob] = useState<Job>(null);
  const [langs, setLangs] = useState(false);
  const key = courseKey(lang, title);
  const topic = topicKey({ lang, title });
  const known = store.state.known.includes(topic);
  const enhanced = prefs.mode === 'enhanced';
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const saved = store.state.saved.some((p) => topicKey(p) === topic);
  const savedAt = useRef(store.state.pos[topic]);
  // When opened from a course: the next topic on its path that isn't known yet, so reading can flow on.
  const [from, setFrom] = useState<Course | null>(null);
  useEffect(() => {
    let live = true;
    if (courseId) findCourse(courseId).then((c) => live && setFrom(c));
    else setFrom(null);
    return () => {
      live = false;
    };
  }, [courseId]);
  const steps = from ? pathOf(from) : [];
  const at = steps.findIndex((s) => topicKey(s.page) === topic);
  const prev = at > 0 ? steps[at - 1].page : undefined; // the step before this one on the course path
  const next = from ? pathOf(from).find((s) => topicKey(s.page) !== topic && !store.state.known.includes(topicKey(s.page)))?.page : undefined;

  // Reading position: restored once when the article is on screen, then saved a moment after each scroll.
  useEffect(() => {
    if (!article) return;
    const sc = scroller(root.current);
    const at = savedAt.current;
    if (at > 0.02 && at < 0.97) {
      sc.to(at * sc.max());
      toast('از جایی که مانده بودی ادامه می‌دهی');
    }
    let t: number;
    const save = () => {
      clearTimeout(t);
      t = window.setTimeout(() => sc.max() > 0 && store.setPos(topic, Math.min(1, sc.top() / sc.max())), 700);
    };
    sc.target.addEventListener('scroll', save, { passive: true });
    return () => (clearTimeout(t), sc.target.removeEventListener('scroll', save));
  }, [article, topic]); // eslint-disable-line react-hooks/exhaustive-deps -- store.setPos and toast are stable

  // Desktop shortcuts: M marks the article known, + and - change the text size.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() === 'm') store.toggleKnown(topic);
      else if (e.key === '+' || e.key === '=') setPrefs({ size: Math.min(READER_SIZES.length - 1, prefs.size + 1) });
      else if (e.key === '-') setPrefs({ size: Math.max(0, prefs.size - 1) });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    let live = true;
    fetchArticle(lang, title)
      .then((a) => live && setArticle(a))
      .catch((e) => live && setError(String(e.message ?? e)));
    loadTerms(key).then((t) => live && setTerms(t?.terms));
    return () => {
      live = false;
    };
  }, [lang, title, key]);

  const sections = useMemo(() => (article ? parseArticle(article.text, article.title) : []), [article]);
  const hasFormula = sections.some((s) => s.paras.some((p) => p.includes(FORMULA)));
  const res = useMemo(() => (enhanced && terms ? terms.map(termRegex) : null), [enhanced, terms]);

  // Bold pass: each section starts with a fresh `seen`, so a term is bolded at its first mention per section.
  const { blocks, used } = useMemo(() => {
    const used = new Set<number>();
    const blocks = sections.map((s) => {
      const seen = new Set<number>();
      const paras = s.paras.map((p) => (res ? boldSegments(p, res, seen) : [{ text: p }]));
      seen.forEach((i) => used.add(i));
      return { ...s, paras };
    });
    return { blocks, used };
  }, [sections, res]);

  const makeTerms = async () => {
    if (!article || needAI()) return false;
    setJob({ status: 'در حال بررسی مقاله…', error: '' });
    try {
      const list = await buildTerms(article, ai, (status) => setJob({ status, error: '' }));
      await saveTerms({ key, lang, title, terms: list, generatedAt: new Date().toISOString() });
      setTerms(list);
      setJob(null);
    } catch (e: any) {
      setJob({ status: '', error: String(e.message ?? e) });
    }
    return true;
  };

  // Switching to enhanced for the first time asks the AI once; without AI settings it stays in easy mode.
  const setMode = async (mode: ReaderMode) => {
    if (mode === 'enhanced' && terms === undefined && !job) {
      if (needAI()) return;
      setPrefs({ mode });
      await makeTerms();
    } else setPrefs({ mode });
  };

  const jump = (id: string, block: ScrollLogicalPosition) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block });
  const flashTerm = (i: number) => {
    const el = document.querySelector<HTMLElement>(`[data-term="${i}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('term-flash');
    void el.offsetWidth; // restart the animation
    el.classList.add('term-flash');
  };
  const back = () => (history.length > 1 ? history.back() : (location.hash = '#/'));

  const size = prefs.size;
  const bar = 'flex items-center overflow-hidden rounded-lg border border-line text-sm';
  const sizeBtn = 'flex size-11 items-center justify-center hover:bg-fg/5 disabled:opacity-40';

  return (
    <div ref={root} className="mx-auto max-w-3xl px-4 pb-44 lg:pb-16">
      {langs && <LangPicker lang={lang} title={article?.title ?? title} course={courseId} onClose={() => setLangs(false)} />}
      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-x-3 gap-y-2 glass border-b border-line px-4 py-2.5">
        <button onClick={back} className="flex min-h-11 items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowRight className={ic} />
          بازگشت
        </button>
        <span dir="auto" className="min-w-0 flex-1 basis-40 truncate font-bold">
          {article?.title ?? title}
        </span>
        <div className={bar} role="group" aria-label="حالت خوانش">
          {MODES.map(([m, label, Icon]) => (
            <button
              key={m}
              aria-pressed={prefs.mode === m}
              onClick={() => setMode(m)}
              className={`flex h-11 items-center gap-1.5 px-3 ${prefs.mode === m ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`}
            >
              <Icon className={ic} />
              {label}
            </button>
          ))}
        </div>
        <div className={bar} role="group" aria-label="اندازه‌ی متن">
          <button className={sizeBtn} aria-label="متن کوچک‌تر" title="متن کوچک‌تر" disabled={size === 0} onClick={() => setPrefs({ size: size - 1 })}>
            <Minus className={ic} />
          </button>
          <span className="flex items-center gap-1 px-1 text-muted" title="اندازه‌ی متن">
            <Type className={ic} />
            <span className="w-4 text-center text-xs tabular-nums">{fa(size + 1)}</span>
          </span>
          <button className={sizeBtn} aria-label="متن بزرگ‌تر" title="متن بزرگ‌تر" disabled={size === READER_SIZES.length - 1} onClick={() => setPrefs({ size: size + 1 })}>
            <Plus className={ic} />
          </button>
        </div>
        <button onClick={() => setLangs(true)} className={`${bar} h-11 gap-1.5 px-3 hover:bg-fg/5`} aria-label="زبان‌های دیگر" title="این مقاله به زبان‌های دیگر">
          <Languages className={ic} />
          <span className="max-sm:hidden">{lang.toUpperCase()}</span>
        </button>
      </div>

      {error ? (
        <div className={`${card} mt-8 space-y-3 p-6`}>
          <p className="text-danger">{error}</p>
          <a href={wikiUrl(lang, title)} target="_blank" rel="noopener noreferrer" className={ghost}>
            <ExternalLink className={ic} />
            باز کردن در ویکی‌پدیا
          </a>
        </div>
      ) : !article ? (
        <p className="mt-10 flex items-center justify-center gap-3 text-muted">
          <span className="size-4 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin" />
          در حال خواندن مقاله…
        </p>
      ) : (
        <article style={{ fontSize: `${READER_SIZES[size]}rem` }} className="mx-auto mt-6 max-w-[38em]">
          {article.thumbnail && <img src={article.thumbnail} alt="" decoding="async" className="mb-6 max-h-72 w-full rounded-lg bg-fg/5 object-cover" />}
          <h1 dir="auto" className="mb-3 text-[1.9em] font-extrabold leading-tight">
            {article.title}
          </h1>
          <p className="mb-5 text-[0.8em] leading-7 text-muted">
            منبع:{' '}
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
              ویکی‌پدیا
            </a>{' '}
            · CC BY-SA 4.0 · متن همین است که در ویکی‌پدیا آمده؛ هیچ بخشی را هوش مصنوعی نوشته یا تغییر نداده است.
          </p>

          {hasFormula && (
            <p className="mb-5 flex items-start gap-2 rounded-lg bg-fg/5 p-3 text-[0.85em] leading-7 text-muted">
              <Info className={`${ic} mt-1.5`} />
              فرمول‌ها در این نمای ساده نشان داده نمی‌شوند. برای دیدنشان مقاله را در ویکی‌پدیا باز کن.
            </p>
          )}

          {enhanced && terms === undefined && (
            <div className={`${card} mb-6 space-y-3 p-4 text-[0.85em] leading-7`}>
              <p>برای پررنگ‌کردن اصطلاحات مهم، هوش مصنوعی یک بار مقاله را بررسی می‌کند و نتیجه روی همین دستگاه می‌ماند.</p>
              <button className={primary} disabled={!!job?.status} onClick={makeTerms}>
                <Sparkles className={ic} />
                {job?.status || 'تشخیص اصطلاحات مهم'}
              </button>
              {job?.error && <p className="text-danger">{job.error}</p>}
            </div>
          )}

          {enhanced && terms !== undefined && (
            <div className={`${card} mb-6 space-y-2 p-4 text-[0.85em]`}>
              <div className="flex items-center justify-between gap-2">
                <b>اصطلاحات مهم</b>
                <button className="flex items-center gap-1 text-muted hover:text-fg disabled:opacity-50" disabled={!!job?.status} onClick={makeTerms} title="بررسی دوباره با هوش مصنوعی">
                  <RefreshCw className={`${ic} ${job?.status ? 'motion-safe:animate-spin' : ''}`} />
                  {job?.status || 'بررسی دوباره'}
                </button>
              </div>
              {used.size ? (
                <ul className="flex flex-wrap gap-1.5">
                  {[...used].sort((a, b) => a - b).map((i) => (
                    <li key={i}>
                      <button dir="auto" onClick={() => flashTerm(i)} className="rounded-full bg-accent/15 px-3 py-0.5 font-semibold hover:bg-accent/25">
                        {terms[i]}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">اصطلاحی در متن پیدا نشد.</p>
              )}
              {job?.error && <p className="text-danger">{job.error}</p>}
            </div>
          )}

          {blocks.length > 2 && (
            <details className="mb-6 rounded-lg border border-line bg-panel px-4 py-2 text-[0.85em]">
              <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">
                <List className={ic} />
                فهرست مطالب
              </summary>
              <ul className="mt-2 space-y-1">
                {blocks.slice(1).map((s, i) => (
                  <li key={i} style={{ paddingInlineStart: `${(s.level - 2) * 1}rem` }}>
                    <button dir="auto" onClick={() => jump(`sec-${i + 1}`, 'start')} className="min-h-11 text-start hover:text-accent">
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {blocks.map((s, i) => {
            const H = s.level <= 2 ? 'h2' : s.level === 3 ? 'h3' : 'h4';
            return (
              <section key={i}>
                {i > 0 && (
                  <H id={`sec-${i}`} dir="auto" className={`mb-3 scroll-mt-20 font-bold leading-snug ${HEADING[Math.min(s.level, 4)]}`}>
                    {s.title}
                  </H>
                )}
                {s.paras.map((segs, j) => (
                  <Para key={j} segs={segs} />
                ))}
              </section>
            );
          })}

          <footer className="mt-12 space-y-4 border-t border-line pt-6 text-base">
            <p className="text-sm leading-7 text-muted">
              متن از ویکی‌پدیا گرفته شده و با مجوز{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                CC BY-SA 4.0
              </a>{' '}
              منتشر می‌شود.{' '}
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-fg">
                صفحه‌ی اصلی و فهرست نویسندگان
              </a>
            </p>
            <div className="space-y-2 max-lg:hidden">
              <button className={`${known ? outline : primary} w-full`} aria-pressed={known} onClick={() => store.toggleKnown(topic)}>
                <Check className={ic} />
                {known ? 'بلدم (برای برداشتن بزن)' : 'خواندم و بلدم'}
              </button>
              {from && (
                <>
                  <StepNav from={from} prev={prev} next={next} />
                  <a href={courseHref(from.key)} className={`${ghost} w-full`}>
                    برگشت به دوره
                  </a>
                </>
              )}
            </div>
            <p className="hidden text-sm text-muted lg:block">میان‌بر: <kbd>M</kbd> بلدم · <kbd>+</kbd> و <kbd>-</kbd> اندازه‌ی متن</p>
          </footer>
        </article>
      )}

      {/* Phones: the actions stay within thumb reach, above the bottom navigation. */}
      {article && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-line bg-panel/95 p-2 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-3xl gap-2">
            <button className={`${known ? outline : primary} flex-1`} aria-pressed={known} onClick={() => store.toggleKnown(topic)}>
              <Check className={ic} />
              {known ? 'بلدم' : 'خواندم و بلدم'}
            </button>
            <button className={ghost} aria-pressed={saved} onClick={() => store.toggleSaved({ title: article.title, lang, url: article.url, summary: '', thumbnail: article.thumbnail })} aria-label={saved ? 'حذف از ذخیره‌شده‌ها' : 'ذخیره برای بعد'}>
              <Star className={`${ic} ${saved ? 'fill-current' : ''}`} />
              {saved ? 'ذخیره‌شده' : 'ذخیره'}
            </button>
          </div>
          {from && (prev || next) && (
            <div className="mx-auto mt-2 max-w-3xl">
              <StepNav from={from} prev={prev} next={next} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
