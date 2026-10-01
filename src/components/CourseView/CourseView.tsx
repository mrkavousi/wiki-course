import { useEffect, useRef, useState } from 'react';
import { Archive, ArchiveRestore, ArrowLeft, ArrowRight, ChevronDown, CircleCheck, CircleDashed, CirclePlay, ClipboardCopy, Clock, Download, ExternalLink, Network, PartyPopper, RefreshCw, Route, Star } from 'lucide-react';
import type { AI, Course, Pack, Page } from '../../types/course';
import { findCourse, loadPack, savePack, type Store } from '../../data/store';
import { buildPack } from '../../lib/build';
import { PASS, dueIds, today } from '../../utils/learn';
import { STATUS_LABEL, courseStats } from '../../utils/progress';
import { courseKey, pathOf, topicKey } from '../../utils/course';
import { PROMPTS, courseMarkdown, download, nextStep, type ExportCtx } from '../../utils/export';
import { CourseGraph } from '../CourseGraph/CourseGraph';
import { Roadmap } from '../Roadmap/Roadmap';
import { TopicDetail } from '../TopicDetail/TopicDetail';
import { Cover } from '../Cover/Cover';
import { ProgressBar } from '../Progress/Progress';
import { ErrorState, Skeleton } from '../States/States';
import { useToast } from '../Toast/Toast';
import { badge, fa, fmtMinutes, ghost, ic, primary } from '../ui';

type Props = {
  courseKey: string;
  store: Store;
  ai: AI;
  busy: boolean;
  needAI: () => boolean;
  onBuild: (url: string, o?: { opts?: Course['opts']; force?: boolean }) => void;
};

const DEPTH_LABEL = { quick: 'سریع', standard: 'استاندارد', deep: 'عمیق' };

/** A <details> menu entry that closes the menu when picked. */
function MenuItem({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      className="flex w-full items-center gap-2 min-h-11 rounded-lg px-3 py-2 text-start text-sm hover:bg-fg/5 disabled:opacity-50"
      onClick={(e) => {
        e.currentTarget.closest('details')!.open = false;
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export function CourseView({ courseKey: key, store, ai, busy, needAI, onBuild }: Props) {
  const [course, setCourse] = useState<Course | null>(); // undefined = loading, null = not on this device
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'roadmap' | 'graph'>('roadmap');
  const [packs, setPacks] = useState<Record<string, Pack>>({}); // by topicKey
  const [packJob, setPackJob] = useState<{ key: string; status: string; error: string } | null>(null);
  const toast = useToast();
  const aside = useRef<HTMLElement>(null);

  useEffect(() => {
    let live = true;
    findCourse(key).then(async (c) => {
      if (!live) return;
      setCourse(c);
      if (!c) return;
      setSelected(topicKey(c.root));
      store.touch(c.key);
      const rows = await Promise.all([c.root, ...c.topics].map(async (p) => [topicKey(p), await loadPack(courseKey(p.lang, p.title))] as const));
      if (live) setPacks(Object.fromEntries(rows.filter((r) => r[1])) as Record<string, Pack>);
    });
    return () => {
      live = false;
    };
  }, [key]);

  if (course === undefined) {
    return (
      <div className="space-y-3 p-4" aria-busy="true">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
        <p className="sr-only" role="status">در حال باز کردن دوره…</p>
      </div>
    );
  }
  if (course === null) {
    return (
      <div className="mx-auto w-full max-w-xl p-4">
        <ErrorState title="این دوره روی این دستگاه نیست" text="شاید روی دستگاه دیگری ساخته شده یا داده‌های مرورگر پاک شده است." lost="چیزی خراب نشده؛ فقط این دوره اینجا نیست.">
          <a href="#/new" className={ghost}>ساخت دوباره از لینک</a>
          <a href="#/library" className={ghost}>برگشت به کتابخانه</a>
        </ErrorState>
        <p className="mt-3 text-sm text-muted">اگر پشتیبان داری، از تنظیمات بازیابی‌اش کن.</p>
      </div>
    );
  }

  const known = new Set(store.state.known);
  const steps = pathOf(course);
  const done = steps.filter((s) => known.has(topicKey(s.page))).length;
  const page = [course.root, ...course.topics].find((p) => topicKey(p) === selected) ?? course.root;
  const topic = course.topics.find((t) => topicKey(t) === topicKey(page));
  const saved = store.state.saved.some((p) => topicKey(p) === topicKey(course.root));
  const ctx: ExportCtx = { course, known, notes: store.state.notes, packs };
  const stats = courseStats(course, store.state, today());
  const StatusIcon = { new: CircleDashed, active: CirclePlay, done: CircleCheck, archived: Archive }[stats.status];
  const archived = stats.status === 'archived';
  const due: Record<string, number> = {};
  for (const id of dueIds(store.state.boxes, today())) due[id.slice(0, id.lastIndexOf('#'))] = (due[id.slice(0, id.lastIndexOf('#'))] ?? 0) + 1;
  const passed = [course.root, ...course.topics].filter((p) => (store.state.quiz[topicKey(p)] ?? 0) >= PASS).length;

  const select = (k: string) => {
    setSelected(k);
    if (innerWidth < 1024) aside.current?.scrollIntoView({ behavior: 'smooth' }); // the panel sits below the path on phones
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast('کپی شد؛ در ChatGPT، Gemini یا Claude بچسبان');
    } catch {
      window.prompt('این متن را کپی کن:', text); // clipboard blocked (e.g. insecure context)
    }
  };
  const makePack = async (p: Page) => {
    if (needAI()) return;
    const k = topicKey(p);
    setPackJob({ key: k, status: 'شروع…', error: '' });
    try {
      const pack = await buildPack(p, ai, (status) => setPackJob({ key: k, status, error: '' }));
      await savePack(pack);
      setPacks((x) => ({ ...x, [k]: pack }));
      setPackJob(null);
    } catch (e: any) {
      setPackJob({ key: k, status: '', error: String(e.message ?? e) });
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 flex-col gap-3 border-b border-line bg-panel p-4 sm:flex-row">
        <Cover title={course.root.title} summary={course.root.summary} thumbnail={course.root.thumbnail} className="h-24 w-full shrink-0 rounded-lg sm:h-auto sm:w-40" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <a href="#/library" className="flex min-h-11 items-center gap-1 text-muted hover:text-fg">
              <ArrowRight className={ic} />
              کتابخانه
            </a>
            <span className={badge}>{course.root.lang}</span>
            <span className="flex items-center gap-1 font-medium">
              <StatusIcon className={ic} aria-hidden="true" />
              {STATUS_LABEL[stats.status]}
            </span>
            {course.opts && <span className="text-muted">عمق: {DEPTH_LABEL[course.opts.depth]}</span>}
            <span className="flex items-center gap-1 text-muted">
              <Clock className={ic} aria-hidden="true" />
              {stats.minutes ? `${fmtMinutes(stats.minutes)} مانده` : 'تمام شد'}
            </span>
            <a href={course.root.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-1 text-muted hover:text-fg hover:underline">
              <ExternalLink className={ic} aria-hidden="true" />
              منبع: ویکی‌پدیا
            </a>
          </div>
          <h1 dir="auto" className="text-2xl font-extrabold leading-snug">{course.root.title}</h1>
          <p dir="auto" className="line-clamp-2 text-sm leading-7 text-muted lg:line-clamp-1">{course.root.summary}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <ProgressBar value={done} max={steps.length} label="پیشرفت مسیر" className="h-2 w-48 max-w-full" />
            <span className="whitespace-nowrap font-medium">
              {fa(done)} از {fa(steps.length)} گام ({fa(stats.pct)}٪)
            </span>
            <span className="text-muted">
              {fa(passed)} آزمون با {fa(PASS)}٪ یا بیشتر قبول شده
              {stats.due ? ` · ${fa(stats.due)} کارت منتظر مرور` : ''}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button className={primary} onClick={() => select(topicKey(nextStep(ctx)))}>
              {done === steps.length ? (
                <>
                  همه را بلدی، مرور دوباره
                  <PartyPopper className={ic} />
                </>
              ) : (
                <>
                  {done ? 'ادامه‌ی یادگیری' : 'شروع دوره'}
                  <ArrowLeft className={ic} />
                </>
              )}
            </button>
            <button className={ghost} aria-pressed={saved} onClick={() => store.toggleSaved(course.root)}>
              <Star className={`${ic} ${saved ? 'fill-current' : ''}`} />
              {saved ? 'ذخیره‌شده' : 'ذخیره'}
            </button>
            <button
              className={ghost}
              onClick={() => {
                store.setArchived(course.key, !archived);
                toast(archived ? 'از بایگانی درآمد' : 'به بایگانی رفت');
              }}
            >
              {archived ? <ArchiveRestore className={ic} /> : <Archive className={ic} />}
              {archived ? 'برگرداندن از بایگانی' : 'بایگانی'}
            </button>
            <div className="flex overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label="نما">
              {(
                [
                  ['roadmap', 'مسیر', Route],
                  ['graph', 'گراف', Network],
                ] as const
              ).map(([v, label, Icon]) => (
                <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`flex min-h-11 items-center gap-1.5 px-3 ${view === v ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`}>
                  <Icon className={ic} />
                  {label}
                </button>
              ))}
            </div>
            <details className="relative">
              <summary className={`${ghost} cursor-pointer list-none`}>
                خروجی و پرامپت
                <ChevronDown className={ic} />
              </summary>
              {/* in the flow on phones (a dropdown would run off-screen), a dropdown from lg up */}
              <div className="z-30 mt-2 w-72 max-w-full space-y-0.5 rounded-lg border border-line bg-panel p-2 shadow-lg lg:absolute lg:end-0">
                <MenuItem onClick={() => download(`${course.root.title}.md`, courseMarkdown(ctx))}>
                  <Download className={ic} />
                  دانلود رودمپ (Markdown)
                </MenuItem>
                <p className="px-3 pt-2 text-xs text-muted">کپی پرامپت آماده برای هوش مصنوعی:</p>
                {PROMPTS.map((p) => (
                  <MenuItem key={p.id} onClick={() => copy(p.build(ctx))}>
                    <ClipboardCopy className={ic} />
                    {p.label}
                  </MenuItem>
                ))}
                <hr className="my-1 border-line" />
                <MenuItem disabled={busy} onClick={() => onBuild(course.root.url, { force: true, opts: course.opts })}>
                  <RefreshCw className={ic} />
                  ساخت دوباره‌ی این دوره
                </MenuItem>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className={view === 'roadmap' ? 'lg:flex-1 lg:overflow-y-auto' : 'h-[65vh] lg:h-auto lg:flex-1'}>
          {view === 'roadmap' ? (
            <Roadmap course={course} known={known} selectedKey={topicKey(page)} onSelect={select} due={due} />
          ) : (
            <CourseGraph course={course} known={known} selectedKey={topicKey(page)} onSelect={select} />
          )}
        </section>
        <aside ref={aside} aria-label="جزئیات موضوع" className="border-t border-line bg-panel lg:w-[26rem] lg:overflow-y-auto lg:border-s lg:border-t-0">
          <TopicDetail
            course={course}
            page={page}
            topic={topic}
            store={store}
            pack={packs[topicKey(page)]}
            packJob={packJob?.key === topicKey(page) ? packJob : null}
            busy={busy}
            onBuildPack={() => makePack(page)}
            onBuildCourse={(url) => onBuild(url)}
            next={done === steps.length ? null : nextStep(ctx)}
            onNext={() => select(topicKey(nextStep(ctx)))}
          />
        </aside>
      </div>

    </div>
  );
}
