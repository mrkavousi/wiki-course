import { useEffect, useState } from 'react';
import { Archive, ArrowLeft, ArrowRight, CircleCheck, CircleDashed, CirclePlay, Clock, ExternalLink, Gauge, Layers, Network, PartyPopper, Route, Star } from 'lucide-react';
import type { AI, Course, Pack, Page } from '../../types/course';
import { courseHref, findCourse, loadPack, savePack, type Store } from '../../data/store';
import { buildPack } from '../../lib/build';
import { PASS, dueIds, today } from '../../utils/learn';
import { LEVEL_LABEL, STATUS_LABEL, courseStats, levelOf } from '../../utils/progress';
import { courseKey, pathOf, topicKey } from '../../utils/course';
import { nextStep, type ExportCtx } from '../../utils/export';
import { ExportMenu } from './ExportMenu';
import { CourseGraph } from '../CourseGraph/CourseGraph';
import { Roadmap } from '../Roadmap/Roadmap';
import { TopicDetail } from '../TopicDetail/TopicDetail';
import { Cover } from '../Cover/Cover';
import { ProgressBar } from '../Progress/Progress';
import { ErrorState, Skeleton } from '../States/States';
import { useToast } from '../Toast/Toast';
import { badge, chip, chipBase, fa, fmtMinutes, ghost, ic, primary } from '../ui';

type Props = {
  courseKey: string;
  topicParam?: string; // topicKey from the address: phones show that topic as a screen of its own
  store: Store;
  ai: AI;
  busy: boolean;
  needAI: () => boolean;
  onBuild: (url: string, o?: { opts?: Course['opts']; force?: boolean }) => void;
};

const DEPTH_LABEL = { quick: 'سریع', standard: 'استاندارد', deep: 'عمیق' };

export function CourseView({ courseKey: key, topicParam, store, ai, busy, needAI, onBuild }: Props) {
  const [course, setCourse] = useState<Course | null>(); // undefined = loading, null = not on this device
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<'roadmap' | 'graph'>('roadmap');
  const [packs, setPacks] = useState<Record<string, Pack>>({}); // by topicKey
  const [packJob, setPackJob] = useState<{ key: string; status: string; error: string } | null>(null);
  const toast = useToast();

  useEffect(() => {
    let live = true;
    findCourse(key).then(async (c) => {
      if (!live) return;
      setCourse(c);
      if (!c) return;
      setSelected(topicParam ?? topicKey(c.root));
      store.touch(c.key);
      const rows = await Promise.all([c.root, ...c.topics].map(async (p) => [topicKey(p), await loadPack(courseKey(p.lang, p.title))] as const));
      if (live) setPacks(Object.fromEntries(rows.filter((r) => r[1])) as Record<string, Pack>);
    });
    return () => {
      live = false;
    };
  }, [key]);

  // Declared before the early returns below: hooks must run on every render.
  useEffect(() => {
    if (topicParam) setSelected(topicParam);
  }, [topicParam]);

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
  const at = steps.findIndex((s) => topicKey(s.page) === topicKey(page));
  const prev: Page | null = at > 0 ? steps[at - 1].page : null; // the step before this one on the path
  const topic = course.topics.find((t) => topicKey(t) === topicKey(page));
  const saved = store.state.saved.some((p) => topicKey(p) === topicKey(course.root));
  const ctx: ExportCtx = { course, known, notes: store.state.notes, packs };
  const stats = courseStats(course, store.state, today());
  const StatusIcon = { new: CircleDashed, active: CirclePlay, done: CircleCheck, archived: Archive }[stats.status];
  const archived = stats.status === 'archived';
  const due: Record<string, number> = {};
  for (const id of dueIds(store.state.boxes, today())) due[id.slice(0, id.lastIndexOf('#'))] = (due[id.slice(0, id.lastIndexOf('#'))] ?? 0) + 1;
  const passed = [course.root, ...course.topics].filter((p) => (store.state.quiz[topicKey(p)] ?? 0) >= PASS).length;

  // Phones: a topic is its own screen (own address, so Back returns to the path). Desktop keeps the two-pane layout.
  const select = (k: string) => {
    setSelected(k);
    if (innerWidth < 1024) location.hash = courseHref(key, k);
    else history.replaceState(null, '', courseHref(key, k));
  };
  const copy = async (text: string, done = 'کپی شد؛ در ChatGPT، Gemini یا Claude بچسبان') => {
    try {
      await navigator.clipboard.writeText(text);
      toast(done);
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
      <header className={`shrink-0 flex-col gap-3 border-b border-line bg-panel p-4 sm:flex-row ${topicParam ? 'max-lg:hidden lg:flex' : 'flex'}`}>
        <Cover title={course.root.title} summary={course.root.summary} thumbnail={course.root.thumbnail} className="h-24 w-full shrink-0 rounded-lg sm:h-auto sm:w-40" />
        <div className="min-w-0 flex-1 space-y-2">
          {/* phones: one scrollable row of the tags that matter; the library link, language and source live elsewhere on small screens */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm max-sm:flex-nowrap max-sm:gap-x-2 max-sm:overflow-x-auto max-sm:[&>*]:shrink-0">
            <a href="#/library" className="flex min-h-11 items-center gap-1 text-muted hover:text-fg max-sm:hidden">
              <ArrowRight className={ic} />
              کتابخانه
            </a>
            <span className={`${badge} max-sm:hidden`}>{course.root.lang}</span>
            <span className={`${chipBase} ${stats.status === 'active' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted'}`}>
              <StatusIcon className={ic} aria-hidden="true" />
              {STATUS_LABEL[stats.status]}
            </span>
            <span className={chip}>
              <Gauge className={ic} aria-hidden="true" />
              سطح <span className="max-sm:hidden">تقریبی: </span>{LEVEL_LABEL[levelOf(course)]}
            </span>
            {course.opts && (
              <span className={`${chip} max-sm:hidden`}>
                <Layers className={ic} aria-hidden="true" />
                عمق {DEPTH_LABEL[course.opts.depth]}
              </span>
            )}
            <span className={chip}>
              <Clock className={ic} aria-hidden="true" />
              {stats.minutes ? <>{fmtMinutes(stats.minutes)}<span className="max-sm:hidden"> مانده</span></> : 'تمام شد'}
            </span>
            <a href={course.root.url} target="_blank" rel="noopener noreferrer" className={`${chip} min-h-8 hover:text-fg max-sm:hidden`}>
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
          <div className="flex flex-wrap items-center gap-2 pt-1 max-sm:flex-nowrap">
            <button className={`${primary} min-w-0 max-sm:flex-1 max-sm:px-3`} onClick={() => select(topicKey(nextStep(ctx)))}>
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
            <button className={`${ghost} max-sm:px-3`} aria-pressed={saved} aria-label={saved ? 'ذخیره‌شده' : 'ذخیره'} onClick={() => store.toggleSaved(course.root)}>
              <Star className={`${ic} ${saved ? 'fill-current' : ''}`} />
              <span className="max-sm:hidden">{saved ? 'ذخیره‌شده' : 'ذخیره'}</span>
            </button>
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label="نما">
              {(
                [
                  ['roadmap', 'مسیر', Route],
                  ['graph', 'گراف', Network],
                ] as const
              ).map(([v, label, Icon]) => (
                <button key={v} aria-pressed={view === v} aria-label={label} onClick={() => setView(v)} className={`flex min-h-11 items-center gap-1.5 px-3 ${view === v ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`}>
                  <Icon className={ic} />
                  <span className="max-sm:hidden">{label}</span>
                </button>
              ))}
            </div>
            <ExportMenu
              ctx={ctx}
              busy={busy}
              archived={archived}
              copy={copy}
              toast={toast}
              onArchive={() => {
                store.setArchived(course.key, !archived);
                toast(archived ? 'از بایگانی درآمد' : 'به بایگانی رفت');
              }}
              onRebuild={() => onBuild(course.root.url, { force: true, opts: course.opts })}
            />
          </div>
        </div>
      </header>

      {topicParam && (
        <nav aria-label="مسیر صفحه" className="flex items-center gap-2 border-b border-line bg-panel px-4 py-1 text-sm lg:hidden">
          <a href={courseHref(key)} className="flex min-h-11 min-w-0 items-center gap-1 text-muted hover:text-fg">
            <ArrowRight className={ic} />
            <span dir="auto" className="truncate">{course.root.title}</span>
          </a>
          <span aria-hidden="true" className="text-muted">/</span>
          <span dir="auto" aria-current="page" className="min-w-0 truncate font-semibold">{page.title}</span>
        </nav>
      )}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className={`${view === 'roadmap' ? 'lg:flex-1 lg:overflow-y-auto' : 'h-[65vh] lg:h-auto lg:flex-1'} ${topicParam ? 'max-lg:hidden' : ''}`}>
          {view === 'roadmap' ? (
            <Roadmap course={course} known={known} selectedKey={topicKey(page)} onSelect={select} due={due} />
          ) : (
            <CourseGraph course={course} known={known} selectedKey={topicKey(page)} onSelect={select} />
          )}
        </section>
        <aside aria-label="جزئیات موضوع" className={`${topicParam ? '' : 'max-lg:hidden'} border-t border-line bg-panel lg:w-[26rem] lg:overflow-y-auto lg:border-s lg:border-t-0`}>
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
            prev={prev}
            onPrev={() => prev && select(topicKey(prev))}
          />
        </aside>
      </div>

    </div>
  );
}
