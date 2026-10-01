import { useEffect, useRef, useState } from 'react';
import { Check, Download, Upload, X } from 'lucide-react';
import type { AI } from '../../types/course';
import { backupJson, restoreJson, type Store } from '../../data/store';
import { testAI } from '../../lib/build';
import { download } from '../../utils/export';
import { today } from '../../utils/learn';
import { ghost, ic, primary } from '../ui';

type Props = { open: boolean; ai: AI; store: Store; onSave: (ai: AI) => void; onClose: () => void };

// text-base (16px): smaller inputs make iOS Safari zoom the page on focus.
const input = 'w-full rounded-lg border border-line bg-bg px-3 py-2 text-base placeholder:text-muted focus:border-accent focus:outline-none';

/** Native <dialog>: AI endpoint settings plus backup/restore of everything stored in this browser. */
export function Settings({ open, ai, store, onSave, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState(ai);
  const [msg, setMsg] = useState<{ kind: 'info' | 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) {
      setForm(ai);
      setMsg(null);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open, ai]);

  const set = (k: keyof AI) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value.trim() });

  const test = async () => {
    setMsg({ kind: 'info', text: 'در حال تست اتصال…' });
    try {
      setMsg((await testAI(form)) ? { kind: 'ok', text: 'اتصال برقرار است' } : { kind: 'err', text: 'پاسخ خالی برگشت؛ یک بار دیگر امتحان کن' });
    } catch (e: any) {
      setMsg({ kind: 'err', text: e.message });
    }
  };
  const backup = async () => download(`wiki-course-backup-${today()}.json`, await backupJson(store.state), 'application/json');
  const restore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // let the same file be picked again
    if (!file) return;
    try {
      store.restore(await restoreJson(await file.text()));
      setMsg({ kind: 'ok', text: 'پشتیبان بازیابی شد' });
    } catch (err: any) {
      setMsg({ kind: 'err', text: err instanceof SyntaxError ? 'فایل JSON معتبر نیست' : err.message });
    }
  };

  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(34rem,calc(100%-2rem))] rounded-2xl border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/60">
      <form method="dialog" onSubmit={() => onSave(form)} className="space-y-4 p-5">
        <h2 className="text-xl font-bold">تنظیمات</h2>
        <fieldset className="space-y-3">
          <legend className="mb-1 font-semibold">هوش مصنوعی (gateway آروان یا هر endpoint سازگار با OpenAI)</legend>
          <label className="block space-y-1">
            <span className="text-sm">آدرس gateway (تا ‎/v1)</span>
            <input dir="ltr" type="url" required value={form.baseUrl} onChange={set('baseUrl')} placeholder="https://arvancloudai.ir/gateway/models/…/v1" className={input} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">API key</span>
            <input dir="ltr" type="password" required autoComplete="off" value={form.key} onChange={set('key')} className={input} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm">مدل</span>
            <input dir="ltr" required value={form.model} onChange={set('model')} placeholder="Gemini-2.5-Flash-lite" className={input} />
          </label>
          <p className="text-xs leading-6 text-muted">فقط در همین مرورگر ذخیره و مستقیم به همان آدرس فرستاده می‌شود؛ نه در کد سایت است و نه در فایل پشتیبان.</p>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button className={primary}>ذخیره</button>
          <button type="button" className={ghost} onClick={test}>
            تست اتصال
          </button>
          <button type="button" className={ghost} onClick={() => ref.current?.close()}>
            بستن
          </button>
        </div>
      </form>
      <section className="space-y-2 border-t border-line p-5">
        <h3 className="font-semibold">پشتیبان‌گیری</h3>
        <p className="text-xs leading-6 text-muted">
          کتابخانه، پیشرفت، یادداشت‌ها، فلش‌کارت‌ها و دوره‌های ساخته‌شده فقط در همین مرورگرند. برای انتقال به گوشی یا دستگاه دیگر، فایل پشتیبان بگیر و آن‌جا بازیابی کن.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghost} onClick={backup}>
            <Download className={ic} />
            دانلود فایل پشتیبان
          </button>
          <label className={`${ghost} cursor-pointer`}>
            <Upload className={ic} />
            بازیابی از فایل
            <input type="file" accept="application/json,.json" className="sr-only" onChange={restore} />
          </label>
        </div>
      </section>
      {msg && (
        <p role="status" className={`flex items-start gap-2 px-5 pb-5 text-sm ${msg.kind === 'err' ? 'text-danger' : ''}`}>
          {msg.kind === 'ok' && <Check className={`${ic} mt-1 text-accent`} />}
          {msg.kind === 'err' && <X className={`${ic} mt-1`} />}
          <span className="min-w-0 break-words">{msg.text}</span>
        </p>
      )}
    </dialog>
  );
}
