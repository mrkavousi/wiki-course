import { useRef } from 'react';
import { Check } from 'lucide-react';
import { TEMPLATES } from '../../share/templates';
import type { Format, ShareData } from '../../share/types';
import { TemplateRenderer } from './TemplateRenderer';

/** Ten real thumbnails (the same engine at a small scale) as one radio group: arrow keys move the selection, Tab leaves the group. */
export function TemplateSelector({ value, onChange, data, format }: { value: string; onChange: (id: string) => void; data: ShareData; format: Format }) {
  const group = useRef<HTMLDivElement>(null);
  const scale = 150 / format.w;
  const move = (e: React.KeyboardEvent, i: number) => {
    // the page is right-to-left: the left arrow goes on to the next template
    const next = { ArrowLeft: i + 1, ArrowDown: i + 1, ArrowRight: i - 1, ArrowUp: i - 1, Home: 0, End: TEMPLATES.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const j = (next + TEMPLATES.length) % TEMPLATES.length;
    onChange(TEMPLATES[j].id);
    group.current?.querySelectorAll<HTMLElement>('[role=radio]')[j]?.focus();
  };
  return (
    <div ref={group} role="radiogroup" aria-label="قالب تصویر" className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2 md:grid md:grid-cols-5 md:overflow-visible">
      {TEMPLATES.map((t, i) => {
        const on = value === t.id;
        return (
          <button
            key={t.id}
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => move(e, i)}
            className={`group relative w-[7.5rem] shrink-0 snap-start rounded-xl border-2 p-1 text-start transition duration-200 motion-safe:hover:-translate-y-0.5 md:w-auto ${on ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent/50'}`}
          >
            <TemplateRenderer template={t} data={data} format={format} scale={scale} delay={450 + i * 60} label={`نمونه‌ی قالب ${t.name}`} className="block h-auto w-full rounded-lg" />
            <span className="mt-1 block truncate px-0.5 text-xs font-medium">{t.name}</span>
            {on && (
              <span className="absolute end-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-accent text-on-accent shadow motion-safe:animate-[pop_0.25s_ease-out]" aria-hidden="true">
                <Check className="size-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
