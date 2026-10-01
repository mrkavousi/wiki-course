import { useEffect, useState } from 'react';
import { Moon, Sun, SunMoon } from 'lucide-react';
import type { AI, BuildOpts } from './types/course';
import { applyTheme, courseHref, findCourse, loadAI, local, readHref, saveAI, saveCourse, useRoute, useStore, type ThemePref } from './data/store';
import { DEFAULT_OPTS, buildCourse } from './lib/build';
import { courseKey, parseWikiUrl } from './utils/course';
import { dueIds, streak, today } from './utils/learn';
import { AppShell, type NavId } from './components/AppShell/AppShell';
import { CourseBuilder, type Job } from './components/CourseBuilder/CourseBuilder';
import { CourseView } from './components/CourseView/CourseView';
import { Discover } from './components/Discover/Discover';
import { Home } from './components/Home/Home';
import { Insights } from './components/Insights/Insights';
import { Library } from './components/Library/Library';
import { Reader } from './components/Reader/Reader';
import { Review } from './components/Review/Review';
import { SearchCommand } from './components/SearchCommand/SearchCommand';
import { Settings } from './components/Settings/Settings';
import { ToastProvider } from './components/Toast/Toast';

// icon, next preference when clicked, label
const THEMES: Record<ThemePref, [typeof Sun, ThemePref, string]> = {
  auto: [SunMoon, 'light', 'تم: خودکار (مثل سیستم)'],
  light: [Sun, 'dark', 'تم: روشن'],
  dark: [Moon, 'auto', 'تم: تیره'],
};
const NAV: Record<string, NavId | null> = { home: 'home', library: 'library', course: 'library', read: 'library', review: 'review', discover: 'discover', insights: 'insights', new: null };

export default function App() {
  const store = useStore();
  const route = useRoute();
  const [ai, setAi] = useState<AI>(loadAI);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [job, setJob] = useState<Job>(null);
  const [rev, setRev] = useState(0); // remounts the course view after a rebuild of the same course
  const [theme, setTheme] = useState<ThemePref>(() => local.get('wc:theme', 'auto'));
  const hasAI = !!(ai.baseUrl && ai.key);

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

  // Learning time: 15 s ticks while the tab is visible on a study page. ponytail: foreground time, not measured reading.
  const studying = route.name === 'course' || route.name === 'read' || route.name === 'review';
  useEffect(() => {
    if (!studying) return;
    const t = setInterval(() => document.visibilityState === 'visible' && store.addSeconds(15), 15_000);
    return () => clearInterval(t);
  }, [studying, store.addSeconds]);

  // Ctrl/Cmd+K opens search from anywhere.
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    addEventListener('keydown', f);
    return () => removeEventListener('keydown', f);
  }, []);

  const needAI = () => {
    if (hasAI) return false;
    setSettingsOpen(true);
    return true;
  };

  // Open the course for a link if this device has it, else build it in the browser, keep it here and open it.
  const build = async (url: string, o: { opts?: BuildOpts; force?: boolean } = {}) => {
    try {
      const { lang, title } = parseWikiUrl(url);
      const cached = !o.force && (await findCourse(courseKey(lang, title)));
      if (cached) return void (location.hash = courseHref(cached.key));
      if (needAI()) return;
      setJob({ status: 'شروع…', error: '', stage: 0 });
      const course = await buildCourse(url, ai, (status, stage) => setJob((j) => ({ status, error: '', stage: stage ?? j?.stage })), o.opts ?? DEFAULT_OPTS);
      setJob({ status: 'در حال ذخیره…', error: '', stage: 3 });
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
  const builder = <CourseBuilder job={job} hasAI={hasAI} recent={store.state.recent} onBuild={build} onRead={read} onSettings={() => setSettingsOpen(true)} />;

  return (
    <ToastProvider>
      <AppShell
        nav={NAV[route.name]}
        due={dueIds(store.state.boxes, today()).length}
        streak={streak(store.state.days, today())}
        // the builder page shows progress and errors itself
        job={route.name === 'new' ? null : job}
        onDismissJob={() => setJob(null)}
        saveOk={store.saveOk}
        theme={{ icon: ThemeIcon, label: themeLabel, next: () => setTheme(nextTheme) }}
        onSettings={() => setSettingsOpen(true)}
        onSearch={() => setSearchOpen(true)}
      >
        {route.name === 'course' ? (
          <CourseView key={`${route.key}:${rev}`} courseKey={route.key} store={store} ai={ai} busy={busy} needAI={needAI} onBuild={build} />
        ) : (
          <div key={page} className="page-in min-h-0 flex-1 lg:overflow-y-auto">
            {route.name === 'read' ? (
              <Reader lang={route.lang} title={route.title} store={store} ai={ai} needAI={needAI} />
            ) : route.name === 'review' ? (
              <Review store={store} />
            ) : route.name === 'discover' ? (
              <Discover store={store} onBuild={build} />
            ) : route.name === 'insights' ? (
              <Insights store={store} />
            ) : route.name === 'library' ? (
              <Library store={store} onBuild={build} />
            ) : route.name === 'new' ? (
              <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6">
                <header>
                  <h1 className="text-2xl font-extrabold">ساخت دوره</h1>
                  <p className="text-sm text-muted">لینک مقاله را بچسبان، عمق و هدفت را انتخاب کن و مسیر یادگیری‌ات را بگیر.</p>
                </header>
                {builder}
              </div>
            ) : (
              <Home store={store} job={job} hasAI={hasAI} onBuild={build} onRead={read} onSettings={() => setSettingsOpen(true)} />
            )}
          </div>
        )}
      </AppShell>

      <SearchCommand open={searchOpen} store={store} onClose={() => setSearchOpen(false)} onBuild={build} onRead={read} />
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
    </ToastProvider>
  );
}
