import { ArrowLeft, Check, Route } from 'lucide-react';
import { courseHref } from '../../data/store';
import { APP, FAQ, FEATURES, FINAL, HERO, MID, PROBLEM, WHAT } from './content';
import { Frame } from './Frame';
import { scrollToId } from './Navbar';
import { chip, chipBase, ghost, primary } from '../ui';

const cta = `${primary} min-h-12 px-6 text-base`;
const ctaGhost = `${ghost} min-h-12 px-6 text-base`;
const wrap = 'mx-auto w-full max-w-7xl px-4 md:px-8';
/** Section label: number, name. */
const Label = ({ n, children }: { n: string; children: string }) => (
  <p className="mb-4 flex items-center gap-3 font-mono text-sm text-muted" data-reveal>
    <span className="text-accent">{n}</span>
    <span className="h-px w-8 bg-line" aria-hidden="true" />
    {children}
  </p>
);

export function Hero() {
  return (
    <section data-hero aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-28 md:pb-32 md:pt-28">
      <div data-hero-bg className="hero-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div data-hero-bg2 className="dots pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden="true" />
      <div className={wrap}>
        <div data-hero-text className="mx-auto max-w-4xl text-center">
          <p data-hero-in className="text-pretty mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-sm text-muted">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            {HERO.eyebrow}
          </p>
          <h1 id="hero-title" data-hero-in className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-7xl md:leading-[1.15]">
            {HERO.title[0]} <span className="block text-grad">{HERO.title[1]}</span>
          </h1>
          <p data-hero-in className="text-pretty mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl">{HERO.lead}</p>
          <div data-hero-in className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a href={APP} className={cta}>{HERO.primary}<ArrowLeft className="size-[1.15em]" aria-hidden="true" /></a>
            <button onClick={() => scrollToId('#how')} className={ctaGhost}>{HERO.secondary}</button>
          </div>
          <ul data-hero-in className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-muted">
            {HERO.meta.map((m) => (
              <li key={m} className="flex items-center gap-1.5 whitespace-nowrap"><Check className="size-4 text-accent" aria-hidden="true" />{m}</li>
            ))}
          </ul>
        </div>
        <div className="mx-auto mt-12 max-w-5xl [perspective:1400px] md:mt-10">
          <Frame data-hero-frame="" shot="dashboard" alt={HERO.alt} eager className="will-change-transform" />
        </div>
      </div>
    </section>
  );
}

export function Problem() {
  return (
    <section data-problem id="problem" aria-labelledby="problem-title" className="border-t border-line py-20 md:py-32">
      <div className={`${wrap} grid gap-12 md:grid-cols-2 md:items-center`}>
        <div>
          <Label n="۰۱">{PROBLEM.label}</Label>
          <h2 id="problem-title" data-reveal className="text-balance text-3xl font-extrabold leading-snug md:text-5xl">{PROBLEM.title}</h2>
          <p data-reveal className="text-pretty mt-5 max-w-lg text-lg text-muted">{PROBLEM.text}</p>
        </div>
        <div>
          <ol className="mx-auto flex max-w-md flex-col gap-2" aria-label="موضوع‌ها به‌ترتیب یادگیری">
            {PROBLEM.chips.map((c, i) => (
              <li key={c} data-chip className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-2.5 elev">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{(i + 1).toLocaleString('fa')}</span>
                <span className="font-medium">{c}</span>
                {i === PROBLEM.chips.length - 1 && <span className={`${chipBase} ms-auto bg-accent-soft text-accent`}>مقاله‌ی اصلی</span>}
              </li>
            ))}
          </ol>
          <p data-problem-after className="text-pretty mt-4 text-center text-sm text-muted">{PROBLEM.after}</p>
        </div>
      </div>
    </section>
  );
}

export function What() {
  return (
    <section data-what id="what" aria-labelledby="what-title" className="border-t border-line bg-panel py-20 md:py-32">
      <div className={`${wrap} grid items-center gap-12 md:grid-cols-[1fr_1.2fr]`}>
        <div>
          <Label n="۰۲">{WHAT.label}</Label>
          <h2 id="what-title" data-reveal className="text-balance text-3xl font-extrabold leading-snug md:text-5xl">{WHAT.title}</h2>
          <ul className="mt-8 space-y-4">
            {WHAT.points.map((p) => (
              <li key={p} data-reveal className="flex gap-3 text-lg text-muted">
                <Route className="mt-1.5 size-5 shrink-0 text-accent" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <Frame data-what-frame="" shot={WHAT.shot} alt={WHAT.alt} />
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="border-t border-line py-20 md:py-32">
      <div className={wrap}>
        <Label n="۰۴">امکانات</Label>
        <h2 id="features-title" data-reveal className="text-balance max-w-3xl text-3xl font-extrabold leading-snug md:text-5xl">از «می‌خواهم یاد بگیرم» تا «یاد گرفتم»</h2>
        <div className="mt-16 space-y-24 md:mt-24 md:space-y-40">
          {FEATURES.map((f, i) => (
            <article key={f.label} aria-labelledby={`f${i}`} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
              <div>
                <p data-reveal className={`${chipBase} bg-accent-soft text-accent`}>{f.label}</p>
                <h3 id={`f${i}`} data-reveal className="text-balance mt-4 text-2xl font-extrabold leading-snug md:text-4xl">{f.title}</h3>
                <p data-reveal className="text-pretty mt-4 text-lg text-muted">{f.text}</p>
                <ul data-reveal className="mt-5 flex flex-wrap gap-2">
                  {f.bullets.map((b) => <li key={b} className={`${chip} whitespace-nowrap`}>{b}</li>)}
                </ul>
              </div>
              <Frame data-feature-frame="" shot={f.shot} alt={f.alt} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MidCta() {
  return (
    <section aria-label="شروع" className="border-t border-line bg-panel py-14 md:py-20">
      <div className={`${wrap} flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-start`}>
        <p data-reveal className="text-pretty max-w-xl text-2xl font-extrabold leading-snug md:text-3xl">{MID.text}</p>
        <a data-reveal href={courseHref('fa-جبر_خطی')} className={cta}>{MID.cta}<ArrowLeft className="size-[1.15em]" aria-hidden="true" /></a>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-20 md:py-32">
      <div className={`${wrap} grid gap-10 md:grid-cols-[1fr_1.6fr]`}>
        <div>
          <Label n="۰۶">سؤال‌های پرتکرار</Label>
          <h2 id="faq-title" data-reveal className="text-balance text-3xl font-extrabold leading-snug md:text-4xl">قبل از شروع</h2>
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4" data-reveal>
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="text-2xl text-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="text-pretty mt-2 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section data-final aria-labelledby="final-title" className="relative overflow-hidden border-t border-line py-24 text-center md:py-40">
      <div data-final-glow className="hero-bg pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="dots pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" aria-hidden="true" />
      <div className={wrap}>
        <h2 id="final-title" data-reveal className="text-balance mx-auto max-w-3xl text-3xl font-extrabold leading-snug md:text-6xl md:leading-snug">{FINAL.title}</h2>
        <p data-reveal className="text-pretty mx-auto mt-5 max-w-xl text-lg text-muted md:text-xl">{FINAL.text}</p>
        <a data-reveal href={APP} className={`${cta} mt-10`}>{FINAL.cta}<ArrowLeft className="size-[1.15em]" aria-hidden="true" /></a>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-line py-8 text-sm text-muted">
      <div className={`${wrap} flex flex-wrap items-center justify-between gap-4`}>
        <p>Wiki Course · محتوای مقاله‌ها از ویکی‌پدیا (CC BY-SA)</p>
        <nav aria-label="پیوندهای پایین صفحه" className="flex flex-wrap">
          <a href="#/about" className="inline-flex min-h-11 items-center px-3 hover:text-fg hover:underline">درباره</a>
          <a href="#/privacy" className="inline-flex min-h-11 items-center px-3 hover:text-fg hover:underline">حریم خصوصی</a>
          <a href="https://github.com/mrkavousi/wiki-course" className="inline-flex min-h-11 items-center px-3 hover:text-fg hover:underline" rel="noopener">کد منبع</a>
        </nav>
      </div>
    </footer>
  );
}
