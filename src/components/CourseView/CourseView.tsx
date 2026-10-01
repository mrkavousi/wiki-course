import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardCopy, Download, Network, PartyPopper, RefreshCw, Route, Star } from 'lucide-react';
import type { AI, Course, Pack, Page } from '../../types/course';
import { findCourse, loadPack, savePack, type Store } from '../../data/store';
import { buildPack } from '../../lib/build';
import { courseKey, pathOf, topicKey } from '../../utils/course';
import { PROMPTS, courseMarkdown, download, nextStep, type ExportCtx } from '../../utils/export';
import { CourseGraph } from '../CourseGraph/CourseGraph';
import { Roadmap } from '../Roadmap/Roadmap';
import { TopicDetail } from '../TopicDetail/TopicDetail';
import { fa, ghost, ic, primary } from '../ui';

type Props = {
  courseKey: string;
  store: Store;
  ai: AI;
  busy: boolean;
  needAI: () => boolean;
  onBuild: (url: string, force?: boolean) => void;
};

/** A <details> menu entry that closes the menu when picked. */
function MenuItem({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      disabled={disabled}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm hover:bg-fg/5 disabled:opacity-50"
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
  const [toast, setToast] = useState('');
  const aside = useRef<HTMLElement>(null);

  useEffect(() => {
    let live = true;
    findCourse(key).then(async (c) => {
      if (!live) return;
      setCourse(c);
      if (!c) return;
      setSelected(topicKey(c.root));
      const rows = await Promise.all([c.root, ...c.topics].map(async (p) => [topicKey(p), await loadPack(courseKey(p.lang, p.title))] as const));
      if (live) setPacks(Object.fromEntries(rows.filter((r) => r[1])) as Record<string, Pack>);
    });
    return () => {
      live = false;
    };
  }, [key]);

  if (course === undefined) return <p className="p-6 text-muted">در حال باز کردن دوره…</p>;
  if (course === null) {
    return (
      <div className="space-y-3 p-6">
        <p>این دوره روی این دستگاه نیست. لینکش را دوباره بساز، یا از تنظیمات فایل پشتیبان را بازیابی کن.</p>
        <a href="#/" className={ghost}>برگشت به کتابخانه</a>
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

  const select = (k: string) => {
    setSelected(k);
    if (innerWidth < 1024) aside.current?.scrollIntoView({ behavior: 'smooth' }); // the panel sits below the path on phones
  };
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2500);
  };
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash('کپی شد؛ در ChatGPT، Gemini یا Claude بچسبان');
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-panel px-4 py-2.5">
        <a href="#/" className="flex items-center gap-1 text-sm text-muted hover:text-fg">
          <ArrowRight className={ic} />
          کتابخانه
        </a>
        <h2 dir="auto" className="text-lg font-bold">{course.root.title}</h2>
        <button className={ghost} aria-pressed={saved} onClick={() => store.toggleSaved(course.root)}>
          <Star className={`${ic} ${saved ? 'fill-current' : ''}`} />
          {saved ? 'در کتابخانه' : 'ذخیره'}
        </button>
        <div className="flex min-w-48 flex-1 items-center gap-2 text-sm">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-fg/10" role="progressbar" aria-label="پیشرفت مسیر" aria-valuenow={done} aria-valuemax={steps.length}>
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
          </div>
          <span className="whitespace-nowrap text-muted">
            {fa(done)} از {fa(steps.length)}
          </span>
        </div>
        <button className={primary} onClick={() => select(topicKey(nextStep(ctx)))}>
          {done === steps.length ? (
            <>
              همه را بلدی
              <PartyPopper className={ic} />
            </>
          ) : (
            <>
              ادامه
              <ArrowLeft className={ic} />
            </>
          )}
        </button>
        <div className="flex overflow-hidden rounded-lg border border-line text-sm" role="group" aria-label="نما">
          {(
            [
              ['roadmap', 'مسیر', Route],
              ['graph', 'گراف', Network],
            ] as const
          ).map(([v, label, Icon]) => (
            <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-1.5 ${view === v ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`}>
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
          <div className="z-30 mt-2 w-72 max-w-full space-y-0.5 rounded-xl border border-line bg-panel p-2 shadow-2xl lg:absolute lg:end-0">
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
            <MenuItem disabled={busy} onClick={() => onBuild(course.root.url, true)}>
              <RefreshCw className={ic} />
              ساخت دوباره‌ی این دوره
            </MenuItem>
          </div>
        </details>
      </div>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className={view === 'roadmap' ? 'lg:flex-1 lg:overflow-y-auto' : 'h-[65vh] lg:h-auto lg:flex-1'}>
          {view === 'roadmap' ? (
            <Roadmap course={course} known={known} selectedKey={topicKey(page)} onSelect={select} />
          ) : (
            <CourseGraph course={course} known={known} selectedKey={topicKey(page)} onSelect={select} />
          )}
        </section>
        <aside ref={aside} className="border-t border-line bg-panel lg:w-[26rem] lg:overflow-y-auto lg:border-s lg:border-t-0">
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
          />
        </aside>
      </main>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm text-bg shadow-xl">
          <Check className={ic} />
          {toast}
        </div>
      )}
    </div>
  );
}
