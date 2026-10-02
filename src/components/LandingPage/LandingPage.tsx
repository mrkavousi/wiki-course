import { useEffect, useRef } from 'react';
import { hero } from '../../animations/hero';
import { loadGsap } from '../../animations/gsap';
import { sections } from '../../animations/sections';
import { story } from '../../animations/story';
import { Navbar } from './Navbar';
import { Faq, Features, FinalCta, Hero, LandingFooter, MidCta, Problem, What } from './Sections';
import { HowItWorks, Showcase } from './Story';

/** Landing page: static content first (it reads fine without any script), GSAP scenes layered on top once its chunk arrives. */
export function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let off = () => {};
    let gone = false;
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (gone || !root.current) return;
      const mm = gsap.matchMedia();
      // reduced motion matches neither query, so no scene runs and the page stays fully static
      mm.add({ desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)', mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)' }, (ctx) => {
        const o = { desktop: !!ctx.conditions?.desktop };
        for (const scene of [hero, sections, story]) scene(gsap, root.current!, o);
      });
      // screenshots arrive lazily and shift layout, so measure again when each one has loaded
      const imgs = root.current.querySelectorAll('img');
      const refresh = () => ScrollTrigger.refresh();
      imgs.forEach((i) => i.addEventListener('load', refresh, { once: true }));
      off = () => mm.revert();
    });
    return () => {
      gone = true;
      off();
    };
  }, []);

  return (
    <div ref={root} dir="rtl" className="min-h-dvh overflow-x-clip bg-bg text-fg">
      <Navbar />
      <main id="main">
        <Hero />
        <Problem />
        <What />
        <HowItWorks />
        <Features />
        <Showcase />
        <MidCta />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
