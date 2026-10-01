import { Check } from 'lucide-react';
import type { Page } from '../../types/course';
import { fa } from '../ui';

export type NodeState = 'known' | 'next' | 'todo';
type Props = {
  page: Page;
  score?: number;
  state: NodeState;
  selected: boolean;
  size?: number;
  badge?: string;
  onClick: () => void;
};

const RING: Record<NodeState, string> = {
  known: 'ring-accent',
  next: 'ring-accent shadow-[0_0_24px_var(--color-accent)] motion-safe:animate-pulse',
  todo: 'ring-line',
};

/** Round thumbnail with a state ring; falls back to the first letter when the article has no image. */
export function TopicNode({ page, score, state, selected, size = 84, badge, onClick }: Props) {
  return (
    <button onClick={onClick} className="group flex w-36 flex-col items-center gap-1.5 text-center" aria-pressed={selected}>
      {badge && <span className="mb-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-on-accent">{badge}</span>}
      <span className="relative">
        <span
          style={{ width: size, height: size }}
          className={`flex items-center justify-center overflow-hidden rounded-full bg-panel text-2xl font-bold ring-4 transition-transform group-hover:scale-105 ${RING[state]} ${selected ? 'outline-2 outline-offset-4 outline-fg' : ''}`}
        >
          {page.thumbnail ? <img src={page.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : page.title[0]}
        </span>
        {state === 'known' && (
          <span className="absolute -bottom-1 -end-1 flex size-7 items-center justify-center rounded-full bg-accent text-on-accent">
            <Check className="size-4" strokeWidth={3} />
          </span>
        )}
      </span>
      <span dir="auto" className="line-clamp-2 text-sm font-semibold leading-snug">
        {page.title}
      </span>
      {score !== undefined && <span className="text-xs text-muted">{fa(score)}٪</span>}
    </button>
  );
}
