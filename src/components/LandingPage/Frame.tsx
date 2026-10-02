import type { ReactNode } from 'react';

export type ShotName = 'dashboard' | 'builder' | 'roadmap' | 'graph' | 'topic' | 'reader' | 'readerCards' | 'focus' | 'share' | 'insights' | 'library';

const url = (s: ShotName, dev: 'd' | 'm', theme: 'dark' | 'light') => `/landing/${s}-${dev}-${theme}.webp`;

/** One real screenshot of the app: desktop capture from md up, phone capture below. Both themes are in the DOM but only the active one loads (display:none images are never fetched). */
export function Shot({ shot, alt, eager }: { shot: ShotName; alt: string; eager?: boolean }) {
  return (['dark', 'light'] as const).map((theme) => (
    <picture key={theme} className={`shot-${theme} contents`}>
      <source media="(min-width: 768px)" srcSet={url(shot, 'd', theme)} />
      <img
        src={url(shot, 'm', theme)}
        alt={alt}
        width={1440}
        height={900}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        className="size-full object-cover object-top"
      />
    </picture>
  ));
}

/** Browser window on desktop, a phone body on small screens (the phone capture is portrait, so the box changes shape). Children fill the screen area. */
export function FrameShell({ children, className = '', ...rest }: { children: ReactNode; className?: string } & Record<`data-${string}`, string | undefined>) {
  return (
    <div className={`overflow-hidden border border-line bg-panel shadow-2xl shadow-black/30 max-md:mx-auto max-md:max-w-[15rem] max-md:rounded-[2rem] max-md:border-4 md:rounded-2xl ${className}`} {...rest}>
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-3 py-2 max-md:hidden" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-danger/70" />
        <span className="size-2.5 rounded-full bg-gold/70" />
        <span className="size-2.5 rounded-full bg-sub-biology/70" />
        <span className="mx-auto rounded-md bg-bg px-10 py-0.5 text-xs text-muted" dir="ltr">wiki-course.vercel.app</span>
      </div>
      <div className="relative aspect-[600/1266] md:aspect-[1440/900]">{children}</div>
    </div>
  );
}

export const Frame = ({ shot, alt, eager, ...rest }: { shot: ShotName; alt: string; eager?: boolean; className?: string } & Record<`data-${string}`, string | undefined>) => (
  <FrameShell {...rest}>
    <Shot shot={shot} alt={alt} eager={eager} />
  </FrameShell>
);
