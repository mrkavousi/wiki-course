import { useState } from 'react';
import { ChartNoAxesColumn, Check, Download, Link2, Moon, Sun, SunMoon, Trash2, Upload, X } from 'lucide-react';
import type { AI } from '../../types/course';
import { MAX_LINK, backupJson, restoreJson, transferLink, wipeAll, type Store, type ThemePref } from '../../data/store';
import { testAI } from '../../lib/build';
import { download } from '../../utils/export';
import { today } from '../../utils/learn';
import { summarize, type Totals } from '../../utils/usage';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';
import { useToast } from '../Toast/Toast';
import { ago, card, fa, field, ghost, ic, primary } from '../ui';
import type { UsageKind } from '../../types/course';

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

const KIND_LABEL: Record<UsageKind, string> = { course: 'ساخت دوره', pack: 'فلش‌کارت و آزمون', terms: 'اصطلاحات خوانشگر', test: 'تست اتصال' };
const toman = (n: number) => `${fa(Math.round(n))} تومان`;
const tokens = (t: Totals) => `${fa(t.inT + t.outT)} توکن`;

/** AI usage and estimated cost: tokens come from the gateway's `usage` field, the price is the learner's own (cost is an estimate, not the invoice). */
function UsageStats({ store }: { store: Store }) {
  const { usage, price } = store.state;
  const [clear, setClear] = useState(false);
  const sum = summarize(usage, price, today());
  const last = [...usage].reverse().slice(0, 8);
  const cell = (label: string, t: Totals) => (
    <div className="rounded-xl bg-surface-2 p-3 text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-lg font-bold tabular-nums">{t.calls ? `${t.est ? 'حدود ' : ''}${toman(t.cost)}` : '۰ تومان'}</p>
      <p className="text-xs text-muted">{fa(t.calls)} فراخوانی · {tokens(t)}</p>
    </div>
  );
  const priceField = (k: 'in' | 'out', label: string) => (
    <label className="block space-y-1">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        dir="ltr"
        value={price[k]}
        onChange={(e) => store.setPrice({ ...price, [k]: Math.max(0, Number(e.target.value) || 0) })}
        className={`${field} text-start`}
      />
    </label>
  );
  return (
    <Section title="مصرف هوش مصنوعی و هزینه‌ها">
      <p className="text-sm leading-7 text-muted">هر بار که هوش مصنوعی جواب می‌دهد، تعداد توکن‌ها روی همین دستگاه ثبت می‌شود و با قیمت پایین ضرب می‌شود. این عدد تخمین است؛ مبلغ نهایی را صورت‌حساب ابرآروان تعیین می‌کند.</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {cell('امروز', sum.today)}
        {cell('۷ روز اخیر', sum.week)}
        {cell('کل', sum.all)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {priceField('in', 'قیمت ورودی (تومان برای هر ۱ میلیون توکن)')}
        {priceField('out', 'قیمت خروجی (تومان برای هر ۱ میلیون توکن)')}
      </div>
      {usage.length > 0 ? (
        <>
          <div>
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold">
              <ChartNoAxesColumn className={ic} aria-hidden="true" />
              به تفکیک کار
            </h3>
            <ul className="divide-y divide-line rounded-xl border border-line text-sm">
              {(Object.keys(KIND_LABEL) as UsageKind[]).filter((k) => sum.byKind[k]).map((k) => (
                <li key={k} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span className="font-medium">{KIND_LABEL[k]}</span>
                  <span className="text-muted">{fa(sum.byKind[k]!.calls)} بار · {tokens(sum.byKind[k]!)} · {toman(sum.byKind[k]!.cost)}</span>
                </li>
              ))}
            </ul>
            {sum.retries > 0 && <p className="mt-1 text-xs text-muted">{fa(sum.retries)} از فراخوانی‌ها تلاش دوباره بودند (پاسخ قبلی ناقص بود)؛ آن‌ها هم هزینه دارند.</p>}
            {usage.some((u) => u.est) && <p className="mt-1 text-xs text-muted">برای بعضی فراخوانی‌ها gateway تعداد توکن نداد و از روی طول متن حدس زده شد (با «حدود» مشخص است).</p>}
          </div>
          <details>
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold">آخرین فراخوانی‌ها</summary>
            <ul className="divide-y divide-line rounded-xl border border-line text-sm">
              {last.map((u) => (
                <li key={`${u.t}:${u.inT}:${u.outT}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <span>{KIND_LABEL[u.kind]}{u.retry ? ' (تلاش دوباره)' : ''}</span>
                  <span className="text-muted">{ago(u.t)} · {fa(u.inT)} ورودی + {fa(u.outT)} خروجی{u.est ? ' (حدودی)' : ''}</span>
                </li>
              ))}
            </ul>
          </details>
          <button className={ghost} onClick={() => setClear(true)}>
            <Trash2 className={ic} />
            پاک کردن لاگ مصرف
          </button>
          <ConfirmModal open={clear} danger title="پاک کردن لاگ مصرف؟" text="فقط فهرست فراخوانی‌ها و آمار هزینه پاک می‌شود. دوره‌ها و پیشرفتت دست نمی‌خورد." confirmLabel="پاک کردن" onConfirm={() => (store.clearUsage(), setClear(false))} onCancel={() => setClear(false)} />
        </>
      ) : (
        <p className="text-sm text-muted">هنوز فراخوانی ثبت نشده. بعد از اولین ساخت دوره، آمار اینجا پر می‌شود.</p>
      )}
      <p className="text-xs text-muted">این لاگ در فایل پشتیبان هم می‌آید و با بازیابی ادغام می‌شود. قیمت پیش‌فرض مدل Gemini 2.5 Flash-lite در ابرآروان است؛ اگر تعرفه عوض شد خودت اصلاحش کن.</p>
    </Section>
  );
}

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
      const p = await restoreJson(await file.text());
      store.restore(p.state);
      setDataMsg({ kind: 'ok', text: `پشتیبان بازیابی شد (${fa(p.courses.length)} دوره). فایل به داده‌های فعلی اضافه شد و چیزی پاک نشد.${p.skipped ? ` ${fa(p.skipped)} مورد نامعتبر نادیده گرفته شد.` : ''}` });
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

      <UsageStats store={store} />

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

      <Section title="انتقال به دستگاه دیگر با لینک">
        <p className="text-xs leading-6 text-muted">
          بدون حساب کاربری و بدون سرور: همه‌ی دوره‌ها و پیشرفتت در خود لینک فشرده می‌شود (هیچ‌جا فرستاده نمی‌شود). لینک را برای خودت بفرست و در دستگاه دیگر باز کن. هر کس این لینک را داشته باشد همه‌ی یادداشت‌هایت را می‌بیند؛ مثل پسورد با آن رفتار کن.
        </p>
        <button
          type="button"
          className={ghost}
          onClick={async () => {
            const link = await transferLink(store.state);
            if (link.length > MAX_LINK) return setDataMsg({ kind: 'err', text: 'داده‌هایت برای یک لینک زیادی بزرگ است. از فایل پشتیبان استفاده کن.' });
            try {
              await navigator.clipboard.writeText(link);
              toast('لینک انتقال کپی شد');
            } catch {
              window.prompt('این لینک را کپی کن:', link); // clipboard blocked
            }
          }}
        >
          <Link2 className={ic} />
          کپی لینک انتقال
        </button>
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
          location.hash = '#/app';
          location.reload();
        }}
      />
    </div>
  );
}
