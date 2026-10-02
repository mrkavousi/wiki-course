import type { Scene } from './gsap';

/** Small reveals, the scattered-to-ordered topics, feature parallax and the closing glow. Everything starts from the final, readable layout. */
export const sections: Scene = (gsap, root, { desktop }) => {
  const q = gsap.utils.selector(root);

  gsap.utils.toArray<HTMLElement>(q('[data-reveal]')).forEach((el) => {
    gsap.from(el, { y: 32, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Problem: the same topics scatter and then fall into learning order as the section scrolls by.
  const chips = gsap.utils.toArray<HTMLElement>(q('[data-chip]'));
  const w = Math.min(root.clientWidth, 900);
  chips.forEach((c, i) => {
    const a = i * 2.4; // deterministic, so a resize does not reshuffle
    gsap.fromTo(c, { x: Math.cos(a) * w * 0.28, y: Math.sin(a * 1.7) * 90, rotate: Math.sin(a) * 14, opacity: 0.55 }, { x: 0, y: 0, rotate: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: '[data-problem]', start: 'top 65%', end: 'center 45%', scrub: 0.6 } });
  });
  gsap.from('[data-problem-after]', { opacity: 0, y: 12, scrollTrigger: { trigger: '[data-problem]', start: 'center 55%', end: 'center 40%', scrub: true } });

  if (desktop) {
    gsap.utils.toArray<HTMLElement>(q('[data-feature-frame]')).forEach((el) => {
      gsap.fromTo(el, { yPercent: 6, scale: 0.96 }, { yPercent: -6, scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    gsap.from('[data-what-frame]', { x: -60, opacity: 0.4, scale: 0.94, ease: 'none', scrollTrigger: { trigger: '[data-what]', start: 'top 85%', end: 'top 30%', scrub: 0.6 } });
  }

  gsap.fromTo('[data-final-glow]', { scale: 0.6, opacity: 0.3 }, { scale: 1.1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '[data-final]', start: 'top bottom', end: 'center center', scrub: 0.6 } });
};
