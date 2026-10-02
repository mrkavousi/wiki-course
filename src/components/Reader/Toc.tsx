import { useEffect, useRef } from 'react';
import { fa } from '../ui';

export type TocItem = { title: string; level: number };

/** Table of contents: every section is its own card; the one being read is highlighted (desktop keeps it in view inside the column). */
export function Toc({ items, active, onJump, sticky }: { items: TocItem[]; active: number; onJump: (i: number) => void; sticky?: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    if (!sticky) return;
    const el = list.current?.querySelector<HTMLElement>('[aria-current]');
    const box = list.current;
    if (el && box && (el.offsetTop < box.scrollTop || el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight)) box.scrollTop = el.offsetTop - box.clientHeight / 2; // not scrollIntoView: that would move the page too
  }, [active, sticky]);
  return (
    <ul ref={list} className={`space-y-1.5 ${sticky ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain pe-1' : 'mt-2'}`}>
      {items.map((s, i) => (
        <li key={i} style={{ marginInlineStart: `${Math.min(s.level - 2, 3) * 0.75}rem` }}>
          <button
            dir="auto"
            onClick={() => onJump(i)}
            aria-current={active === i ? 'location' : undefined}
            className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-1.5 text-start text-sm transition-colors ${active === i ? 'border-accent bg-accent-soft font-bold' : 'border-line bg-panel hover:border-accent/50'}`}
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-fg/10 text-xs tabular-nums text-muted">{fa(i + 1)}</span>
            <span className="min-w-0">{s.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
