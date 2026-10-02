import { Compass, Database, FileQuestion, Globe, KeyRound, ShieldCheck } from 'lucide-react';
import { ic, primary, ghost, card } from '../ui';

/** Small links under every static page. */
export function Footer() {
  return (
    <footer className="mx-auto mt-6 flex max-lg:hidden w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 border-t border-line px-4 py-4 text-sm text-muted">
      <span>Wiki Course · محتوای مقاله‌ها از ویکی‌پدیا (CC BY-SA)</span>
      <nav aria-label="پیوندهای پایین صفحه" className="flex">
        <a href="#/about" className="inline-flex min-h-11 items-center px-2 hover:text-fg hover:underline">درباره</a>
        <a href="#/privacy" className="inline-flex min-h-11 items-center px-2 hover:text-fg hover:underline">حریم خصوصی</a>
        <a href="#/settings" className="inline-flex min-h-11 items-center px-2 hover:text-fg hover:underline">تنظیمات</a>
      </nav>
    </footer>
  );
}

function Page({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <p className="text-muted">{lead}</p>
      </header>
      {children}
    </div>
  );
}

const STEPS = [
  ['۱. لینک را بچسبان', 'هر مقاله‌ی ویکی‌پدیا به فارسی یا انگلیسی.'],
  ['۲. مسیر ساخته می‌شود', 'پیش‌نیازها، خود مقاله و قدم‌های بعدی کنار هم می‌آیند.'],
  ['۳. یاد بگیر و مرور کن', 'فلش‌کارت و آزمون، با مرور فاصله‌دار تا چیزی فراموش نشود.'],
] as const;

export function About() {
  return (
    <Page title="درباره‌ی Wiki Course" lead="ویکی‌پدیا پر از دانش است ولی ترتیب یادگرفتن ندارد. این ابزار برای هر مقاله یک مسیر یادگیری می‌سازد.">
      <ol className="grid gap-3 sm:grid-cols-3">
        {STEPS.map(([t, d]) => (
          <li key={t} className={`${card} space-y-1 p-4`}>
            <p className="font-bold">{t}</p>
            <p className="text-sm leading-7 text-muted">{d}</p>
          </li>
        ))}
      </ol>
      <section className="space-y-2">
        <h2 className="text-lg font-bold">منبع محتوا</h2>
        <p className="leading-8">متن مقاله‌ها از ویکی‌پدیا گرفته می‌شود و تحت مجوز CC BY-SA است. هر موضوع پیوندی به مقاله‌ی اصلی دارد. پیش‌نیازها، فلش‌کارت‌ها و آزمون‌ها را یک مدل هوش مصنوعی تولید می‌کند و ممکن است اشتباه کند؛ برای موضوع‌های مهم به خود مقاله مراجعه کن.</p>
      </section>
      <div className="flex flex-wrap gap-2">
        <a href="#/new" className={primary}>ساخت اولین دوره</a>
        <a href="#/discover" className={ghost}>
          <Compass className={ic} />
          دوره‌های آماده
        </a>
      </div>
    </Page>
  );
}

const FACTS = [
  [Database, 'پیشرفتت فقط در مرورگر تو می‌ماند', 'دوره‌ها، کارت‌ها، نتیجه‌ی آزمون‌ها و آمار در حافظه‌ی همین مرورگر ذخیره می‌شوند. حسابی وجود ندارد و چیزی به سرور ما فرستاده نمی‌شود. برای دستگاه دیگر از تنظیمات فایل پشتیبان بگیر.'],
  [Globe, 'مقاله‌ها مستقیم از ویکی‌پدیا می‌آیند', 'برای خواندن و ساختن دوره، مرورگرت به ویکی‌پدیا درخواست می‌فرستد؛ آن سرویس مثل هر بازدید دیگری آدرس IP تو را می‌بیند.'],
  [KeyRound, 'کلید و آدرس هوش مصنوعی', 'اگر در تنظیمات سرویس هوش مصنوعی وارد کنی، کلید فقط در مرورگرت می‌ماند و متن مقاله مستقیم برای همان سرویس فرستاده می‌شود. ما آن را نمی‌بینیم.'],
  [ShieldCheck, 'بدون ردیاب', 'ابزار تحلیل یا تبلیغاتی در این برنامه نیست. پاک‌کردن داده‌ها از تنظیمات همه‌چیز را از مرورگرت حذف می‌کند.'],
] as const;

export function Privacy() {
  return (
    <Page title="حریم خصوصی" lead="کوتاه: داده‌های تو روی دستگاه خودت می‌ماند.">
      <ul className="space-y-3">
        {FACTS.map(([Icon, t, d]) => (
          <li key={t} className={`${card} flex gap-3 p-4`}>
            <Icon className="mt-1 size-5 shrink-0 text-accent" aria-hidden="true" />
            <span>
              <span className="block font-bold">{t}</span>
              <span className="block text-sm leading-7 text-muted">{d}</span>
            </span>
          </li>
        ))}
      </ul>
    </Page>
  );
}

export function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <FileQuestion className="size-14 text-accent" aria-hidden="true" />
      <h1 className="text-3xl font-extrabold">این صفحه پیدا نشد</h1>
      <p className="text-muted">آدرس اشتباه است یا صفحه جابه‌جا شده.</p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <a href="#/" className={primary}>برگشت به خانه</a>
        <a href="#/library" className={ghost}>کتابخانه</a>
      </div>
    </div>
  );
}
