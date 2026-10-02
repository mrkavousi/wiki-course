import type { Scene } from './gsap';

/** Hero: text enters in sequence; while scrolling out, the text drifts up and the app window comes forward. */
export const hero: Scene = (gsap, root, { desktop }) => {
  const q = gsap.utils.selector(root);
  gsap.from(q('[data-hero-in]'), { y: 28, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out' });
  if (!desktop) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom 30%', scrub: 0.6 } });
  tl.to('[data-hero-text]', { yPercent: -12, opacity: 0.55, ease: 'none' }, 0)
    .fromTo('[data-hero-frame]', { scale: 0.9, rotateX: 7, y: 20 }, { scale: 1, rotateX: 0, y: 0, ease: 'none' }, 0)
    .to('[data-hero-bg]', { yPercent: 25, ease: 'none' }, 0)
    .to('[data-hero-bg2]', { yPercent: -15, ease: 'none' }, 0);
};
