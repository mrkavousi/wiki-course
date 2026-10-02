// GSAP is loaded here and nowhere else, so the landing chunk is the only one that carries it.
export type Gsap = typeof import('gsap').gsap;

export async function loadGsap() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

/** Every scene gets the root element and a gsap instance; all of them run inside one gsap.matchMedia(), so they are reverted together. */
export type Scene = (gsap: Gsap, root: HTMLElement, o: { desktop: boolean }) => void;
