import { Check, CircleDashed, Layers, Play } from 'lucide-react';
import type { Page } from '../../types/course';
import { fa, ic } from '../ui';

export type NodeState = 'known' | 'next' | 'todo';
type Props = {
  page: Page;
  score?: number;
  state: NodeState;
  selected: boolean;
  size?: number;
  badge?: string;
  due?: number; // flashcards of this topic waiting for review
  onClick: () => void;
};

const RING: Record<NodeState, string> = {
  known: 'ring-accent',
  next: 'ring-accent shadow-[0_0_24px_var(--color-accent)] motion-safe:animate-pulse',
  todo: 'ring-line',
};

/** Round thumbnail with a state ring; falls back to the first letter when the article has no image. */
// Status is a word plus an icon, so it never rests on colour alone.
const STATUS = { known: ['بلدم', Check], next: ['گام بعدی', Play], todo: ['در صف', CircleDashed] } as const;

export function TopicNode({ page, score, state, selected, size = 84, badge, due, onClick }: Props) {
  const [statusText, StatusIcon] = STATUS[state];
  return (
    <button onClick={onClick} className="group flex w-36 flex-col items-center gap-1.5 text-center" aria-pressed={selected}>
      {badge && <span className="mb-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-on-accent">{badge}</span>}
      <span className="relative">
        <span
          data-orb
          style={{ width: size, height: size }}
          className={`flex items-center justify-center overflow-hidden rounded-full bg-panel text-2xl font-bold ring-4 transition-transform group-hover:scale-105 ${RING[state]} ${selected ? 'outline-2 outline-offset-4 outline-fg' : ''}`}
        >
          {page.thumbnail ? <img src={page.thumbnail} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /> : <span aria-hidden>{page.title[0]}</span>}
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
      <span className="flex items-center gap-1 text-xs font-medium">
        <StatusIcon className={ic} aria-hidden="true" />
        {statusText}
      </span>
      {score !== undefined && <span className="text-xs text-muted">ارتباط {fa(score)}٪</span>}
      {!!due && (
        <span className="flex items-center gap-1 text-xs font-medium text-accent">
          <Layers className={ic} aria-hidden="true" />
          {fa(due)} کارت برای مرور
        </span>
      )}
    </button>
  );
}
