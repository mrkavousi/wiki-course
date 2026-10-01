import { useState } from 'react';
import { Check, Download, Moon, Sun, SunMoon, Trash2, Upload, X } from 'lucide-react';
import type { AI } from '../../types/course';
import { backupJson, restoreJson, wipeAll, type Store, type ThemePref } from '../../data/store';
import { testAI } from '../../lib/build';
import { download } from '../../utils/export';
import { today } from '../../utils/learn';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import { useToast } from '../Toast/Toast';
import { card, fa, field, ghost, ic, primary } from '../ui';

type Props = { ai: AI; store: Store; theme: ThemePref; onTheme: (t: ThemePref) => void; onSave: (ai: AI) => void };
type Msg = { kind: 'info' | 'ok' | 'err'; text: string } | null;

const THEMES: [ThemePref, string, typeof Sun][] = [['auto', 'مثل سیستم', SunMoon], ['light', 'روشن', Sun], ['dark', 'تیره', Moon]];

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className={`${card} space-y-3 p-5`}>
    <h2 className="font-bold">{title}</h2>
    {children}
  </section>
);
const Note = ({ msg }: { msg: Msg }) =>
  msg && (
    <p role={msg.kind === 'err' ? 'alert' : 'status'} className={`flex items-start gap-2 text-sm ${msg.kind === 'err' ? 'text-danger' : ''}`}>
      {msg.kind === 'ok' && <Check className={`${ic} mt-1 text-accent`} />}
      {msg.kind === 'err' && <X className={`${ic} mt-1`} />}
      <span className="min-w-0 break-words">{msg.text}</span>
    </p>
  );

/** Settings page: appearance, weekly goal, AI endpoint, backup/restore and deleting everything stored in this browser. */
export function Settings({ ai, store, theme, onTheme, onSave }: Props) {
  const toast = useToast();
  const [form, setForm] = useState(ai);
  const [wipe, setWipe] = useState(false);
  const [aiMsg, setAiMsg] = useState<Msg>(null);
  const [dataMsg, setDataMsg] = useState<Msg>(null);

  const set = (k: keyof AI) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value.trim() });

  const test = async () => {
    setAiMsg({ kind: 'info', text: 'در حال تست اتصال…' });
    try {
      setAiMsg((await testAI(form)) ? { kind: 'ok', text: 'اتصال برقرار است' } : { kind: 'err', text: 'پاسخ خالی برگشت؛ یک بار دیگر امتحان کن' });
    } catch (e: any) {
      setAiMsg({ kind: 'err', text: e.message });
    }
  };
  const backup = async () => {
    download(`wiki-course-backup-${today()}.json`, await backupJson(store.state), 'application/json');
    store.markBackup();
    setDataMsg({ kind: 'ok', text: 'فایل پشتیبان ساخته شد' });
  };
  const restore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again
    if (!file) return;
    try {
      store.restore(await restoreJson(await file.text()));
      setDataMsg({ kind: 'ok', text: 'پشتیبان بازیابی شد. دوره‌ها، پیشرفت و یادداشت‌های فایل به داده‌های فعلی اضافه شدند و چیزی پاک نشد.' });
    } catch (err: any) {
      setDataMsg({ kind: 'err', text: err instanceof SyntaxError ? 'این فایل JSON معتبر نیست. چیزی تغییر نکرد.' : err.message });
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-6">
      <header>
        <h1 className="text-2xl font-extrabold">تنظیمات</h1>
        <p className="text-sm text-muted">همه‌چیز فقط در همین مرورگر ذخیره می‌شود.</p>
      </header>

      <Section title="ظاهر">
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="تم">
          {THEMES.map(([id, label, Icon]) => (
            <label key={id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-panel px-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent">
              <input type="radio" name="theme" checked={theme === id} onChange={() => onTheme(id)} className="size-4 accent-accent" />
              <Icon className={ic} />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="هدف یادگیری">
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span>هدفم در هفته:</span>
          <select value={store.state.goal} onChange={(e) => store.setGoal(Number(e.target.value))} className={`${field} !w-auto min-h-11 py-2 text-sm`}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n} value={n}>{fa(n)} روز فعال</option>)}
          </select>
        </label>
      </Section>

      <Section title="هوش مصنوعی (gateway آروان یا هر endpoint سازگار با OpenAI)">
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
            toast('تنظیمات هوش مصنوعی ذخیره شد');
          }}
        >
          <label className="block space-y-1">
            <span className="text-sm">آدرس gateway (تا ‎/v1)</span>
            <input dir="ltr" type="url" required value={form.baseUrl} onChange={set('baseUrl')} placeholder="https://arvancloudai.ir/gateway/models/…/v1" className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">API key</span>
            <input dir="ltr" type="password" required autoComplete="off" value={form.key} onChange={set('key')} className={field} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">مدل</span>
            <input dir="ltr" required value={form.model} onChange={set('model')} placeholder="Gemini-2.5-Flash-lite" className={field} />
          </label>
          <p className="text-xs leading-6 text-muted">فقط در همین مرورگر ذخیره و مستقیم به همان آدرس فرستاده می‌شود؛ نه در کد سایت است و نه در فایل پشتیبان.</p>
          <div className="flex flex-wrap gap-2">
            <button className={primary}>ذخیره</button>
            <button type="button" className={ghost} onClick={test}>
              تست اتصال
            </button>
          </div>
          <Note msg={aiMsg} />
        </form>
      </Section>

      <Section title="پشتیبان‌گیری">
        <p className="text-xs leading-6 text-muted">
          کتابخانه، پیشرفت، یادداشت‌ها، فلش‌کارت‌ها و دوره‌های ساخته‌شده فقط در همین مرورگرند. برای انتقال به گوشی یا دستگاه دیگر، فایل پشتیبان بگیر و آن‌جا بازیابی کن.
        </p>
        <p className="text-sm">{store.state.lastBackup ? `آخرین پشتیبان یا بازیابی: ${new Date(store.state.lastBackup).toLocaleString('fa')}` : 'هنوز پشتیبان نگرفته‌ای.'}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghost} onClick={backup}>
            <Download className={ic} />
            دانلود فایل پشتیبان
          </button>
          <label className={`${ghost} cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent`}>
            <Upload className={ic} />
            بازیابی از فایل
            <input type="file" accept="application/json,.json" className="sr-only" onChange={restore} />
          </label>
        </div>
        <Note msg={dataMsg} />
      </Section>

      <Section title="حذف همه‌ی داده‌ها">
        <p className="text-xs leading-6 text-muted">دوره‌ها، پیشرفت، یادداشت‌ها، فلش‌کارت‌ها و تنظیمات هوش مصنوعی را از این مرورگر پاک می‌کند. قابل برگشت نیست، مگر فایل پشتیبان داشته باشی.</p>
        <button type="button" className={`${ghost} text-danger`} onClick={() => setWipe(true)}>
          <Trash2 className={ic} />
          حذف همه‌ی داده‌های من
        </button>
      </Section>

      <ConfirmModal
        open={wipe}
        danger
        title="همه‌ی داده‌ها حذف شود؟"
        text={`${fa(store.state.recent.length)} دوره، ${fa(store.state.known.length)} موضوع بلدشده و همه‌ی یادداشت‌ها و کارت‌ها پاک می‌شوند. اگر پشتیبان نگرفته‌ای، برنمی‌گردند.`}
        confirmLabel="بله، همه را حذف کن"
        onCancel={() => setWipe(false)}
        onConfirm={async () => {
          await wipeAll();
          location.hash = '#/';
          location.reload();
        }}
      />
    </div>
  );
}
