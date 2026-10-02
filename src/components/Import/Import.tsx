import { useEffect, useState } from 'react';
import { Download, Link2 } from 'lucide-react';
import { applyBackup, courseHref, parseBackup, type Parsed, type Store } from '../../data/store';
import { unpack } from '../../utils/share';
import { ErrorState, Skeleton } from '../States/States';
import { useToast } from '../Toast/Toast';
import { badge, card, fa, ghost, ic, primary } from '../ui';

type Phase = { kind: 'loading' } | { kind: 'ready'; p: Parsed } | { kind: 'error'; text: string };

const hasState = (s: Parsed['state']) => Object.values(s).some((v) => (Array.isArray(v) ? v.length : v && Object.keys(v).length));

/** Opens a share or transfer link: shows what is inside and adds it only after the learner agrees. */
export function Import({ data, store }: { data: string; store: Store }) {
  const toast = useToast();
  const [phase, setPhase] = useState<Phase>({ kind: 'loading' });

  useEffect(() => {
    let live = true;
    (async () => {
      if (!data) throw new Error('empty');
      const p = parseBackup(await unpack(data));
      if (!p.courses.length && !hasState(p.state)) throw new Error('nothing');
      if (live) setPhase({ kind: 'ready', p });
    })().catch((e: Error) => {
      const text =
        e.message === 'too-big' ? 'محتوای این لینک بیش از حد بزرگ است.'
        : e.message === 'empty' ? 'لینک ناقص است؛ احتمالاً هنگام فرستادن بریده شده.'
        : e.message === 'nothing' ? 'چیز قابل‌استفاده‌ای در این لینک نبود.'
        : e instanceof SyntaxError || e.name === 'InvalidCharacterError' || /gzip|format/i.test(e.message) ? 'این لینک خراب است؛ احتمالاً هنگام فرستادن بریده شده.'
        : e.message;
      if (live) setPhase({ kind: 'error', text });
    });
    return () => {
      live = false;
    };
  }, [data]);

  if (phase.kind === 'loading') {
    return (
      <div className="mx-auto w-full max-w-xl space-y-3 p-4" aria-busy="true">
        <h1 className="sr-only">افزودن از لینک</h1>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (phase.kind === 'error') {
    return (
      <div className="mx-auto w-full max-w-xl p-4">
        <h1 className="sr-only">افزودن از لینک</h1>
        <ErrorState title="این لینک باز نشد" text={phase.text} lost="چیزی به داده‌هایت اضافه یا از آن کم نشد.">
          <a href="#/app" className={ghost}>برگشت به خانه</a>
        </ErrorState>
      </div>
    );
  }

  const { p } = phase;
  const withProgress = hasState(p.state);
  const add = async () => {
    await applyBackup(p);
    p.courses.forEach(store.addRecent);
    if (withProgress) store.restore(p.state);
    toast(p.courses.length === 1 ? 'دوره اضافه شد' : 'داده‌ها اضافه شد');
    location.hash = p.courses.length === 1 ? courseHref(p.courses[0].key) : '#/library';
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 px-4 py-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold">
          <Link2 className="size-6 text-accent" />
          افزودن از لینک
        </h1>
        <p className="text-sm text-muted">این لینک را کسی ساخته. چیزی اضافه نمی‌شود، مگر خودت تأیید کنی.</p>
      </header>
      <section className={`${card} space-y-3 p-4`}>
        {p.courses.length > 0 && (
          <ul className="space-y-2">
            {p.courses.map((c) => (
              <li key={c.key} className="flex items-center gap-2">
                <span dir="auto" className="min-w-0 flex-1 truncate font-bold">{c.root.title}</span>
                <span className={badge}>{c.root.lang}</span>
                <span className="text-sm text-muted">{fa(c.topics.length + 1)} موضوع</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm leading-7 text-muted">
          {p.packs.length > 0 && `${fa(p.packs.length)} بسته‌ی فلش‌کارت و آزمون. `}
          {withProgress
            ? `پیشرفت (${fa(p.state.known?.length ?? 0)} موضوع بلدشده، ${fa(Object.keys(p.state.notes ?? {}).length)} یادداشت) با داده‌های فعلی‌ات ادغام می‌شود و چیزی پاک نمی‌شود.`
            : 'فقط خود دوره اضافه می‌شود؛ پیشرفت و یادداشت‌های تو دست نمی‌خورد.'}
        </p>
        {p.skipped > 0 && <p className="rounded-lg bg-gold/20 p-3 text-sm">{fa(p.skipped)} مورد نامعتبر بود و نادیده گرفته شد.</p>}
      </section>
      <div className="flex flex-wrap gap-2">
        <button className={primary} onClick={add}>
          <Download className={ic} />
          افزودن به کتابخانه‌ی من
        </button>
        <a href="#/app" className={ghost}>
          انصراف
        </a>
      </div>
    </div>
  );
}
