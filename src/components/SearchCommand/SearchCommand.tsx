import { useEffect, useRef, useState } from 'react';
import { BookOpen, FileText, Link2, Route, Search } from 'lucide-react';
import { allRefs, courseHref, readHref, useCourses, type Store } from '../../data/store';
import { parseWikiUrl, topicKey } from '../../utils/course';
import { ic } from '../ui';

type Props = { open: boolean; store: Store; onClose: () => void; onBuild: (url: string) => void; onRead: (url: string) => void };

const row = 'flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm hover:bg-fg/5 focus-visible:bg-fg/5';

/** Ctrl/Cmd+K: find a course, a topic inside your courses or a saved article, or paste a Wikipedia link to build or read it. */
export function SearchCommand({ open, store, onClose, onBuild, onRead }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const courses = useCourses(allRefs(store.state));

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) {
      setQ('');
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const needle = q.trim().toLowerCase();
  const has = (s: string) => s.toLowerCase().includes(needle);
  const link = (() => {
    try {
      return needle ? (parseWikiUrl(q), q.trim()) : '';
    } catch {
      return '';
    }
  })();
  const hits = !needle || link ? [] : (courses ?? []).filter((c) => has(c.root.title));
  const topics = !needle || link ? [] : (courses ?? []).flatMap((c) => c.topics.map((t) => ({ t, from: c.root.title }))).filter(({ t }) => has(t.title)).slice(0, 8);
  const saved = !needle || link ? [] : store.state.saved.filter((p) => has(p.title));
  const none = needle && !link && !hits.length && !topics.length && !saved.length;

  return (
    <dialog ref={ref} onClose={onClose} aria-label="جست‌وجو" className="m-auto mt-[10vh] w-[min(36rem,calc(100%-2rem))] rounded-lg border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/60">
      <div className="flex items-center gap-2 border-b border-line px-3">
        <Search className={`${ic} text-muted`} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (document.querySelector<HTMLElement>('#search-results a, #search-results button'))?.click()}
          aria-label="عبارت جست‌وجو یا لینک ویکی‌پدیا"
          placeholder="نام دوره، موضوع، یا لینک ویکی‌پدیا…"
          className="min-h-14 flex-1 bg-transparent text-base placeholder:text-muted focus:outline-none"
        />
        <kbd className="hidden text-xs text-muted sm:block">Esc</kbd>
      </div>
      <div id="search-results" className="max-h-[60vh] space-y-1 overflow-y-auto p-2" aria-live="polite">
        {!needle && <p className="p-3 text-sm text-muted">بنویس تا دوره‌ها و موضوع‌های دوره‌هایت پیدا شوند. یک لینک ویکی‌پدیا هم می‌توانی بچسبانی.</p>}
        {link && (
          <>
            <button className={row} onClick={() => (onClose(), onBuild(link))}><Link2 className={ic} />ساخت دوره از این لینک</button>
            <button className={row} onClick={() => (onClose(), onRead(link))}><BookOpen className={ic} />فقط خواندن مقاله</button>
          </>
        )}
        {hits.map((c) => (
          <a key={c.key} href={courseHref(c.key)} onClick={onClose} className={row}>
            <Route className={`${ic} text-accent`} />
            <span dir="auto" className="min-w-0 flex-1 truncate">{c.root.title}</span>
            <span className="text-xs text-muted">دوره</span>
          </a>
        ))}
        {topics.map(({ t, from }) => (
          <a key={`${from}:${topicKey(t)}`} href={readHref(t.lang, t.title)} onClick={onClose} className={row}>
            <FileText className={`${ic} text-muted`} />
            <span dir="auto" className="min-w-0 flex-1 truncate">{t.title}</span>
            <span dir="auto" className="max-w-32 truncate text-xs text-muted">{from}</span>
          </a>
        ))}
        {saved.map((p) => (
          <a key={topicKey(p)} href={readHref(p.lang, p.title)} onClick={onClose} className={row}>
            <FileText className={`${ic} text-muted`} />
            <span dir="auto" className="min-w-0 flex-1 truncate">{p.title}</span>
            <span className="text-xs text-muted">ذخیره‌شده</span>
          </a>
        ))}
        {none && <p className="p-3 text-sm text-muted">چیزی پیدا نشد. عبارت دیگری امتحان کن، یا لینک مقاله را بچسبان تا برایش دوره بسازیم.</p>}
      </div>
    </dialog>
  );
}
