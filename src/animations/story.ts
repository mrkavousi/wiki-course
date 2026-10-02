import type { Gsap, Scene } from './gsap';

/** Desktop only: a pinned stage whose layers are screens of the app. `enter(layer, previous)` adds the tweens that bring layer i in. */
function pinned(gsap: Gsap, stage: string, layers: string, end: string, enter: (tl: ReturnType<Gsap['timeline']>, layer: Element, prev: Element, i: number) => void, markers?: string) {
  const els = gsap.utils.toArray<Element>(layers);
  gsap.set(els.slice(1), { autoAlpha: 0 });
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: stage, start: 'top top', end, pin: true, scrub: 0.5, anticipatePin: 1 } });
  els.forEach((el, i) => {
    if (i === 0) return;
    tl.addLabel(`s${i}`);
    enter(tl, el, els[i - 1], i);
    if (markers) {
      tl.to(`${markers}[data-i="${i - 1}"]`, { opacity: 0.35, duration: 0.3 }, `s${i}`).to(`${markers}[data-i="${i}"]`, { opacity: 1, duration: 0.3 }, `s${i}`);
    }
    tl.to({}, { duration: 0.5 }); // hold, so each screen rests before the next arrives
  });
}

export const story: Scene = (gsap, root, { desktop }) => {
  if (!desktop) return;

  // How it works: each screen is wiped in from the side over the previous one while the step list follows along.
  gsap.set('[data-step][data-i]:not([data-i="0"])', { opacity: 0.35 });
  pinned(gsap, '[data-how]', '[data-how-layer]', '+=300%', (tl, el, prev) => {
    tl.fromTo(el, { autoAlpha: 1, clipPath: 'inset(0 0 0 100%)', scale: 1.08 }, { clipPath: 'inset(0 0 0 0%)', scale: 1, duration: 1 }, '<')
      .to(prev, { scale: 0.96, duration: 1 }, '<');
  }, '[data-step]');

  // Showcase: the next screen opens from the bottom edge like a navigation, the old one recedes.
  pinned(gsap, '[data-showcase]', '[data-show-layer]', '+=300%', (tl, el, prev, i) => {
    tl.fromTo(el, { autoAlpha: 1, clipPath: 'circle(0% at 50% 100%)', scale: 1.12, yPercent: 4 }, { clipPath: 'circle(150% at 50% 100%)', scale: 1, yPercent: 0, duration: 1 }, '<')
      .to(prev, { scale: 0.92, yPercent: -3, duration: 1 }, '<')
      .to(`[data-tab="${i - 1}"]`, { opacity: 0.4, duration: 0.3 }, '<')
      .to(`[data-tab="${i}"]`, { opacity: 1, duration: 0.3 }, '<');
  });
  gsap.set('[data-tab]:not([data-tab="0"])', { opacity: 0.4 });
};
