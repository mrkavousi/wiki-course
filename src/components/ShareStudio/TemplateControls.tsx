import { Check } from 'lucide-react';
import { FORMATS } from '../../share/formats';
import type { FormatId } from '../../share/types';

export const ACCENTS = [['#087F73', 'تیل'], ['#075E57', 'تیل تیره'], ['#1D5D9B', 'آبی'], ['#6B9A12', 'سبز'], ['#C2410C', 'نارنجی'], ['#9D174D', 'آلبالویی']] as const;
export type CoverMode = 'none' | 'article' | 'upload';

/** What the person typed, exactly as typed (spaces and commas included); the picture gets a cleaned copy. */
export type Fields = { title: string; body: string; quote: string; category: string; tags: string; sourceTitle: string };

type Props = {
  values: Fields;
  set: (p: Partial<Fields>) => void;
  accent?: string;
  setAccent: (c?: string) => void;
  format: FormatId;
  setFormat: (f: FormatId) => void;
  cover: CoverMode;
  setCover: (m: CoverMode) => void;
  onUpload: (file: File) => void;
  hasArticleImage: boolean;
  warn: string;
};

const input = 'w-full rounded-xl border border-line bg-bg px-3 py-2 text-base focus:border-accent focus:outline-none';
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-1">
    <span className="text-sm font-semibold text-muted">{label}</span>
    {children}
  </label>
);
const seg = (on: boolean) => `flex min-h-11 flex-1 items-center justify-center whitespace-nowrap px-3 text-sm ${on ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`;

/** Everything the person can change: the content, the picture, the accent colour and the size. */
export function TemplateControls({ values, set, accent, setAccent, format, setFormat, cover, setCover, onUpload, hasArticleImage, warn }: Props) {
  return (
    <div className="space-y-4">
      <Field label="عنوان">
        <input dir="auto" value={values.title} onChange={(e) => set({ title: e.target.value })} maxLength={120} placeholder="بدون عنوان" className={input} />
      </Field>
      <Field label="متن">
        <textarea dir="auto" value={values.body} onChange={(e) => set({ body: e.target.value })} rows={4} className={`${input} leading-7`} />
      </Field>
      <Field label="نقل‌قول">
        <textarea dir="auto" value={values.quote} onChange={(e) => set({ quote: e.target.value })} rows={2} placeholder="اختیاری" className={`${input} leading-7`} />
      </Field>
      {warn && (
        <p role="status" className="text-sm text-gold">
          {warn}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="دسته">
          <input dir="auto" value={values.category} onChange={(e) => set({ category: e.target.value })} maxLength={30} placeholder="مثلاً تاریخ" className={input} />
        </Field>
        <Field label="برچسب‌ها (با ویرگول جدا کن)">
          <input dir="auto" value={values.tags} onChange={(e) => set({ tags: e.target.value })} placeholder="مثلاً اشکانیان، ایران باستان" className={input} />
        </Field>
      </div>
      <Field label="نام مقاله‌ی منبع">
        <input dir="auto" value={values.sourceTitle} onChange={(e) => set({ sourceTitle: e.target.value })} maxLength={80} className={input} />
      </Field>

      <div className="space-y-1.5" role="group" aria-label="تصویر">
        <p className="text-sm font-semibold text-muted">تصویر پس‌زمینه یا کنار متن</p>
        <div className="flex overflow-hidden rounded-lg border border-line">
          <button aria-pressed={cover === 'none'} onClick={() => setCover('none')} className={seg(cover === 'none')}>بدون تصویر</button>
          {hasArticleImage && (
            <button aria-pressed={cover === 'article'} onClick={() => setCover('article')} className={seg(cover === 'article')}>تصویر مقاله</button>
          )}
          <label className={`${seg(cover === 'upload')} cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-accent`}>
            تصویر خودم
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          </label>
        </div>
        {cover === 'article' && <p className="text-sm leading-7 text-muted">مجوز تصویر ممکن است با مجوز متن فرق کند؛ نام ویکی‌پدیا زیر تصویر می‌آید</p>}
      </div>

      <div className="space-y-1.5" role="group" aria-label="رنگ تأکید">
        <p className="text-sm font-semibold text-muted">رنگ تأکید</p>
        <div className="flex flex-wrap gap-2">
          <button aria-pressed={!accent} onClick={() => setAccent(undefined)} className={`min-h-11 rounded-lg border px-3 text-sm ${!accent ? 'border-accent bg-accent-soft' : 'border-line hover:border-accent/50'}`}>پیش‌فرض قالب</button>
          {ACCENTS.map(([c, name]) => (
            <button key={c} aria-pressed={accent === c} aria-label={name} title={name} onClick={() => setAccent(c)} className={`flex size-11 items-center justify-center rounded-full border-2 ${accent === c ? 'border-fg' : 'border-line'}`} style={{ background: c }}>
              {accent === c && <Check className="size-5 text-white" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5" role="group" aria-label="اندازه‌ی تصویر">
        <p className="text-sm font-semibold text-muted">اندازه‌ی تصویر</p>
        <div className="flex flex-wrap overflow-hidden rounded-lg border border-line">
          {FORMATS.map((f) => (
            <button key={f.id} aria-pressed={format === f.id} onClick={() => setFormat(f.id)} className={seg(format === f.id)}>
              {f.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
