import { useEffect, useState } from 'react';
import { Flame, Moon, Route, Settings as SettingsIcon, Sun, SunMoon, TriangleAlert, X } from 'lucide-react';
import type { AI } from './types/course';
import { applyTheme, courseHref, findCourse, loadAI, local, readHref, saveAI, saveCourse, useRoute, useStore, type ThemePref } from './data/store';
import { buildCourse } from './lib/build';
import { courseKey, parseWikiUrl } from './utils/course';
import { streak, today } from './utils/learn';
import { CourseView } from './components/CourseView/CourseView';
import { Library } from './components/Library/Library';
import { Reader } from './components/Reader/Reader';
import { Review } from './components/Review/Review';
import { Settings } from './components/Settings/Settings';
import { UrlBar } from './components/UrlBar/UrlBar';
import { fa, ic } from './components/ui';

// icon, next preference when clicked, label
const THEMES: Record<ThemePref, [typeof Sun, ThemePref, string]> = {
  auto: [SunMoon, 'light', 'تم: خودکار (مثل سیستم)'],
  light: [Sun, 'dark', 'تم: روشن'],
  dark: [Moon, 'auto', 'تم: تیره'],
};
const iconBtn = 'flex size-9 items-center justify-center rounded-lg hover:bg-fg/10';

export default function App() {
  const store = useStore();
  const route = useRoute();
  const [ai, setAi] = useState<AI>(loadAI);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [job, setJob] = useState<{ status: string; error: string } | null>(null);
  const [rev, setRev] = useState(0); // remounts the course view after a rebuild of the same course
  const [theme, setTheme] = useState<ThemePref>(() => local.get('wc:theme', 'auto'));

  useEffect(() => {
    navigator.storage?.persist?.(); // ask the browser not to evict our data under storage pressure
  }, []);

  useEffect(() => {
    local.set('wc:theme', theme);
    applyTheme(theme);
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const follow = () => applyTheme(theme);
    mq.addEventListener('change', follow);
    return () => mq.removeEventListener('change', follow);
  }, [theme]);

  const needAI = () => {
    if (ai.baseUrl && ai.key) return false;
    setSettingsOpen(true);
    return true;
  };

  // Open the course for a link if this device has it, else build it in the browser, keep it here and open it.
  const build = async (url: string, force = false) => {
    try {
      const { lang, title } = parseWikiUrl(url);
      const cached = !force && (await findCourse(courseKey(lang, title)));
      if (cached) return void (location.hash = courseHref(cached.key));
      if (needAI()) return;
      setJob({ status: 'شروع…', error: '' });
      const course = await buildCourse(url, ai, (status) => setJob({ status, error: '' }));
      await saveCourse(course);
      store.addRecent(course);
      setJob(null);
      setRev((n) => n + 1);
      location.hash = courseHref(course.key);
    } catch (e: any) {
      setJob({ status: '', error: String(e.message ?? e) });
    }
  };

  // Reading needs no AI: straight to the reader.
  const read = (url: string) => {
    try {
      const { lang, title } = parseWikiUrl(url);
      setJob(null);
      location.hash = readHref(lang, title);
    } catch (e: any) {
      setJob({ status: '', error: String(e.message ?? e) });
    }
  };

  const [ThemeIcon, nextTheme, themeLabel] = THEMES[theme];
  const busy = !!job?.status;
  // A new key remounts the page, so every screen opens scrolled to the top.
  const page = route.name === 'read' ? `read:${route.lang}:${route.title}` : route.name;

  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <header className="border-b border-line bg-panel">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <a href="#/" className="order-1 flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Route className="size-6 text-accent" />
            Wiki Course
          </a>
          {/* phones: logo and icons share the first row, the link box gets its own row below */}
          <div className="order-2 ms-auto flex items-center gap-1 sm:order-3 sm:ms-0">
            <span className="me-1 flex items-center gap-1 text-sm font-semibold" title="روزهای پشت‌سرهم یادگیری">
              <Flame className={`${ic} text-prereq`} />
              {fa(streak(store.state.days, today()))}
            </span>
            <button className={iconBtn} onClick={() => setTheme(nextTheme)} aria-label={themeLabel} title={themeLabel}>
              <ThemeIcon className="size-5" />
            </button>
            <button className={iconBtn} onClick={() => setSettingsOpen(true)} aria-label="تنظیمات" title="تنظیمات">
              <SettingsIcon className="size-5" />
            </button>
          </div>
          <div className="order-3 min-w-0 basis-full sm:order-2 sm:flex-1 sm:basis-80">
            <UrlBar busy={busy} onBuild={(url) => build(url)} onRead={read} />
          </div>
        </div>
        {job && (
          <div role="status" className={`flex items-center gap-3 px-4 py-2 text-sm ${job.error ? 'bg-danger/10 text-danger' : 'bg-accent/10'}`}>
            {job.status && <span className="size-3.5 shrink-0 rounded-full border-2 border-accent border-t-transparent motion-safe:animate-spin" />}
            <span className="flex-1">{job.error || job.status}</span>
            {job.error && (
              <button onClick={() => setJob(null)} aria-label="بستن پیام">
                <X className={ic} />
              </button>
            )}
          </div>
        )}
        {!store.saveOk && (
          <p className="flex items-center gap-2 bg-danger/10 px-4 py-2 text-sm text-danger">
            <TriangleAlert className={ic} />
            ذخیره در مرورگر ممکن نشد (حالت خصوصی یا فضای پر). تغییرات با بستن صفحه از بین می‌روند؛ از تنظیمات فایل پشتیبان بگیر.
          </p>
        )}
      </header>

      {route.name === 'course' ? (
        <CourseView key={`${route.key}:${rev}`} courseKey={route.key} store={store} ai={ai} busy={busy} needAI={needAI} onBuild={build} />
      ) : (
        <div key={page} className="min-h-0 flex-1 lg:overflow-y-auto">
          {route.name === 'read' ? (
            <Reader lang={route.lang} title={route.title} store={store} ai={ai} needAI={needAI} />
          ) : route.name === 'review' ? (
            <Review store={store} />
          ) : (
            <Library store={store} busy={busy} onBuild={build} />
          )}
        </div>
      )}

      <Settings
        open={settingsOpen}
        ai={ai}
        store={store}
        onSave={(next) => {
          saveAI(next);
          setAi(next);
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
