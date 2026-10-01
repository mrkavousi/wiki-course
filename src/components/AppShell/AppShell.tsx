import { useEffect, useState } from 'react';
import { Compass, Flame, House, Layers, Library, Plus, Route, Search, Settings as SettingsIcon, TriangleAlert, WifiOff, X, ChartColumn } from 'lucide-react';
import type { ThemePref } from '../../data/store';
import { iconBtn, ic, fa, primary } from '../ui';

export type NavId = 'home' | 'library' | 'review' | 'discover' | 'insights' | 'settings';
type Props = {
  nav: NavId | null; // which item is current; null on pages that belong to none (the builder)
  due: number;
  streak: number;
  job: { status: string; error: string } | null;
  onDismissJob: () => void;
  saveOk: boolean;
  theme: { icon: typeof Search; label: string; next: () => void };
  onSearch: () => void;
  children: React.ReactNode;
};

const ITEMS: { id: NavId; href: string; label: string; icon: typeof House; mobile: boolean }[] = [
  { id: 'home', href: '#/', label: 'خانه', icon: House, mobile: true },
  { id: 'library', href: '#/library', label: 'کتابخانه', icon: Library, mobile: true },
  { id: 'review', href: '#/review', label: 'مرور', icon: Layers, mobile: true },
  { id: 'discover', href: '#/discover', label: 'کشف', icon: Compass, mobile: true },
  { id: 'insights', href: '#/insights', label: 'آمار', icon: ChartColumn, mobile: false },
];

function useOnline() {
  const [on, setOn] = useState(() => navigator.onLine);
  useEffect(() => {
    const f = () => setOn(navigator.onLine);
    addEventListener('online', f);
    addEventListener('offline', f);
    return () => (removeEventListener('online', f), removeEventListener('offline', f));
  }, []);
  return on;
}

const link = (on: boolean) => `relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium ${on ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-fg/5 hover:text-fg'}`;

/** Sidebar on desktop, bottom bar on phones, and one slim top bar for search, review status, streak and theme. */
export function AppShell({ nav, due, streak, job, onDismissJob, saveOk, theme, onSearch, children }: Props) {
  const online = useOnline();
  const ThemeIcon = theme.icon;
  const dueBadge = due > 0 && (
    <span className="ms-auto min-w-6 rounded-full bg-accent px-1.5 text-center text-xs font-bold text-on-accent" aria-label={`${fa(due)} کارت برای مرور`}>
      {fa(due)}
    </span>
  );

  return (
    <div className="flex min-h-dvh lg:h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-panel focus:px-3 focus:py-2">
        رفتن به محتوا
      </a>

      <aside aria-label="نوار کناری" className="hidden w-60 shrink-0 flex-col gap-1 border-e border-line bg-panel p-3 lg:flex">
        <a href="#/" className="mb-3 flex items-center gap-2 px-2 py-2 text-lg font-extrabold">
          <Route className="size-6 text-accent" />
          Wiki Course
        </a>
        <a href="#/new" className={`${primary} mb-3`}>
          <Plus className={ic} />
          ساخت دوره
        </a>
        <nav aria-label="اصلی" className="flex flex-col gap-1">
          {ITEMS.map(({ id, href, label, icon: Icon }) => (
            <a key={id} href={href} aria-current={nav === id ? 'page' : undefined} className={link(nav === id)}>
              <Icon className="size-5" />
              {label}
              {id === 'review' && dueBadge}
            </a>
          ))}
        </nav>
        <a href="#/settings" aria-current={nav === 'settings' ? 'page' : undefined} className={`${link(nav === 'settings')} mt-auto`}>
          <SettingsIcon className="size-5" />
          تنظیمات
        </a>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line bg-panel px-3 py-2">
          <a href="#/" className="flex size-11 shrink-0 items-center justify-center lg:hidden" aria-label="Wiki Course، صفحه‌ی اصلی">
            <Route className="size-6 text-accent" />
          </a>
          <button onClick={onSearch} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-bg px-3 text-start text-sm text-muted hover:border-accent/60 lg:max-w-md lg:flex-none lg:basis-96">
            <Search className={ic} />
            <span className="truncate">جست‌وجو در دوره‌ها و موضوع‌ها</span>
            <kbd className="ms-auto hidden font-sans text-xs lg:block" dir="ltr">Ctrl K</kbd>
          </button>
          <span className="ms-auto hidden lg:block" />
          <a href="#/review" className="hidden min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:bg-fg/5 sm:flex" title="مرور امروز">
            <Layers className={ic} />
            {due ? `${fa(due)} کارت` : 'مرور'}
          </a>
          <a href="#/insights" className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold hover:bg-fg/5" title="زنجیره‌ی یادگیری و آمار" aria-label={`${fa(streak)} روز پشت‌سرهم، دیدن آمار`}>
            <Flame className={`${ic} text-prereq`} />
            {fa(streak)}
          </a>
          <button className={iconBtn} onClick={theme.next} aria-label={theme.label} title={theme.label}>
            <ThemeIcon className="size-5" />
          </button>
        </header>

        {job && (
          <div role="status" className={`flex items-center gap-3 px-4 py-2 text-sm ${job.error ? 'bg-danger/10 text-danger' : 'bg-accent/10'}`}>
            {job.status && <span className="size-3.5 shrink-0 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin" />}
            <span className="min-w-0 flex-1 break-words">{job.error || job.status}</span>
            {job.error && (
              <button onClick={onDismissJob} aria-label="بستن پیام" className="flex size-9 items-center justify-center">
                <X className={ic} />
              </button>
            )}
          </div>
        )}
        {!online && (
          <p role="status" className="flex items-center gap-2 bg-gold/20 px-4 py-2 text-sm">
            <WifiOff className={ic} />
            آفلاینی. دوره‌ها و کارت‌های ذخیره‌شده کار می‌کنند؛ ساخت دوره و خواندن مقاله به اینترنت نیاز دارند.
          </p>
        )}
        {!saveOk && (
          <p className="flex items-center gap-2 bg-danger/10 px-4 py-2 text-sm text-danger">
            <TriangleAlert className={ic} />
            ذخیره در مرورگر ممکن نشد (حالت خصوصی یا فضای پر). تغییرات با بستن صفحه از بین می‌روند؛ از تنظیمات فایل پشتیبان بگیر.
          </p>
        )}

        <main id="main" tabIndex={-1} className="flex min-h-0 flex-1 flex-col pb-16 outline-none lg:pb-0">
          {children}
        </main>
      </div>

      <nav aria-label="اصلی" className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-panel lg:hidden">
        <ul className="grid h-16 grid-cols-5">
          {ITEMS.filter((i) => i.mobile).map(({ id, href, label, icon: Icon }) => (
            <li key={id}>
              <a href={href} aria-current={nav === id ? 'page' : undefined} className={`relative flex h-full flex-col items-center justify-center gap-0.5 text-xs font-medium ${nav === id ? 'text-accent' : 'text-muted'}`}>
                <Icon className="size-6" />
                {label}
                {id === 'review' && due > 0 && (
                  <span className="absolute end-1/4 top-1.5 min-w-5 rounded-full bg-accent px-1 text-center text-xs font-bold leading-5 text-on-accent" aria-label={`${fa(due)} کارت`}>
                    {fa(due)}
                  </span>
                )}
              </a>
            </li>
          ))}
          <li>
            <a href="#/settings" aria-current={nav === 'settings' ? 'page' : undefined} className={`flex h-full w-full flex-col items-center justify-center gap-0.5 text-xs font-medium ${nav === 'settings' ? 'text-accent' : 'text-muted'}`}>
              <SettingsIcon className="size-6" />
              تنظیمات
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
