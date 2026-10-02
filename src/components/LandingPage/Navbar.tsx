import { useEffect, useRef } from 'react';
import { ArrowLeft, Route } from 'lucide-react';
import { APP, NAV_LINKS } from './content';
import { primary } from '../ui';

/** In-page scrolling is done with buttons: a `#id` href would be read by the hash router as a page. */
export const scrollToId = (id: string) =>
  document.getElementById(id.slice(1))?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

/** Transparent over the hero, compact with a border once the page scrolls; a thin bar shows the reading progress. */
export function Navbar() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const f = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      el.dataset.scrolled = String(scrollY > 24);
      el.style.setProperty('--p', String(max > 0 ? Math.min(scrollY / max, 1) : 0));
    };
    f();
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, []);
  return (
    <header ref={ref} data-scrolled="false" className="group fixed inset-x-0 top-0 z-40 border-b border-transparent transition-colors duration-300 data-[scrolled=true]:border-line data-[scrolled=true]:bg-panel/80 data-[scrolled=true]:backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 group-data-[scrolled=true]:h-14 md:px-8">
        <a href="#/welcome" onClick={(e) => (e.preventDefault(), scrollTo({ top: 0 }))} className="flex items-center gap-2 text-lg font-extrabold" aria-label="Wiki Course، بالای صفحه">
          <span className="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-accent to-sub-physics text-on-accent"><Route className="size-5" /></span>
          <span>Wiki <span className="text-grad">Course</span></span>
        </a>
        <nav aria-label="بخش‌های صفحه" className="ms-6 hidden gap-1 md:flex">
          {NAV_LINKS.map(([id, label]) => (
            <button key={id} onClick={() => scrollToId(id)} className="min-h-11 rounded-lg px-3 text-sm font-medium text-muted hover:text-fg">{label}</button>
          ))}
        </nav>
        <a href={APP} className={`${primary} ms-auto`}>
          باز کردن اپ
          <ArrowLeft className="size-[1.15em]" aria-hidden="true" />
        </a>
      </div>
      <div className="h-0.5 origin-right scale-x-[var(--p,0)] bg-accent" aria-hidden="true" />
    </header>
  );
}
