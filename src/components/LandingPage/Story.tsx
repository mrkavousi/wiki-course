import { SHOWCASE, STEPS } from './content';
import { Frame, FrameShell, Shot } from './Frame';

const wrap = 'mx-auto w-full max-w-7xl px-4 md:px-8';

/** How it works. Desktop: pinned, the step list on one side and the app window wiping from screen to screen. Phones: a plain list, each step with its own screen. */
export function HowItWorks() {
  return (
    <section data-how id="how" aria-labelledby="how-title" className="border-t border-line bg-panel py-20 md:flex md:min-h-dvh md:items-center md:pb-6 md:pt-20">
      <div className={`${wrap} grid items-center gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16`}>
        <div>
          <p className="mb-4 flex items-center gap-3 font-mono text-sm text-muted"><span className="text-accent">۰۳</span><span className="h-px w-8 bg-line" aria-hidden="true" />چطور کار می‌کند</p>
          <h2 id="how-title" className="text-balance text-3xl font-extrabold leading-snug md:text-4xl">چهار قدم از یک لینک تا یادگیری</h2>
          <ol className="mt-8 space-y-8 md:mt-5 md:space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.n} data-step="" data-i={i}>
                <p className="font-mono text-sm text-accent">{s.n}</p>
                <h3 className="text-balance text-xl font-bold md:text-xl">{s.title}</h3>
                <p className="mt-1 text-pretty text-muted">{s.text}</p>
                <Frame shot={s.shot} alt={s.alt} className="mt-5 md:hidden" />
              </li>
            ))}
          </ol>
        </div>
        <FrameShell className="max-md:hidden">
          {STEPS.map((s, i) => (
            <div key={s.n} data-how-layer="" className="absolute inset-0">
              <Shot shot={s.shot} alt={s.alt} eager={i === 0} />
            </div>
          ))}
        </FrameShell>
      </div>
    </section>
  );
}

/** One big app window that stays pinned while the screens open one after another (desktop); a swipeable row of phone screens elsewhere. */
export function Showcase() {
  return (
    <section data-showcase aria-labelledby="show-title" className="border-t border-line py-20 md:flex md:min-h-dvh md:flex-col md:justify-center md:pb-8 md:pt-24">
      <div className={wrap}>
        <p className="mb-4 flex items-center gap-3 font-mono text-sm text-muted"><span className="text-accent">۰۵</span><span className="h-px w-8 bg-line" aria-hidden="true" />خود برنامه</p>
        <h2 id="show-title" className="text-balance max-w-3xl text-3xl font-extrabold leading-snug md:text-4xl">این خودِ برنامه است، نه یک طرح گرافیکی</h2>
        <FrameShell className="mx-auto mt-6 max-md:hidden md:w-[min(100%,calc((100dvh-17rem)*1.6))]">
          {SHOWCASE.map((s, i) => (
            <div key={s.shot} data-show-layer="" className="absolute inset-0">
              <Shot shot={s.shot} alt={s.alt} />
            </div>
          ))}
        </FrameShell>
        <ul className="mt-6 flex justify-center gap-6 text-sm font-medium max-md:hidden" aria-hidden="true">
          {SHOWCASE.map((s, i) => <li key={s.shot} data-tab={i}>{s.label}</li>)}
        </ul>
        <ul className="rail mt-8 md:hidden">
          {SHOWCASE.map((s) => (
            <li key={s.shot}>
              <Frame shot={s.shot} alt={s.alt} />
              <p className="mt-3 text-center text-sm font-medium">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
