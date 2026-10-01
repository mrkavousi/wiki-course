import type { LucideIcon } from 'lucide-react';
import { TriangleAlert } from 'lucide-react';
import type { Subject } from '../../utils/subject';
import { Cover } from '../Cover/Cover';
import { ic, primary } from '../ui';

/** Nothing here yet: say why, and offer the next step as children (buttons or links). */
export function EmptyState({ icon: Icon, title, text, art = 'other', children }: { icon: LucideIcon; title: string; text: string; art?: Subject; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md space-y-3 rounded-lg border border-dashed border-line p-6 text-center">
      <Cover title={title} subject={art} className="h-20 w-full rounded-md" />
      <Icon className="mx-auto size-9 text-accent" aria-hidden="true" />
      <p className="font-bold">{title}</p>
      <p className="text-sm leading-7 text-muted">{text}</p>
      {children && <div className="flex flex-wrap justify-center gap-2 pt-1">{children}</div>}
    </div>
  );
}

type ErrorProps = { title: string; text: string; lost?: string; onRetry?: () => void; retryLabel?: string; children?: React.ReactNode };

/** Something failed: what happened, whether anything was lost, and a way forward. */
export function ErrorState({ title, text, lost = 'چیزی از دست نرفته است.', onRetry, retryLabel = 'تلاش دوباره', children }: ErrorProps) {
  return (
    <div role="alert" className="space-y-2 rounded-lg border border-danger/40 bg-danger/10 p-4">
      <p className="flex items-center gap-2 font-bold text-danger">
        <TriangleAlert className={ic} aria-hidden="true" />
        {title}
      </p>
      <p dir="auto" className="break-words text-sm leading-7">{text}</p>
      <p className="text-sm text-muted">{lost}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {onRetry && (
          <button type="button" className={primary} onClick={onRetry}>
            {retryLabel}
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/** Grey placeholder while data loads; never animates for people who prefer reduced motion. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`rounded-md shimmer ${className}`} />;
}
