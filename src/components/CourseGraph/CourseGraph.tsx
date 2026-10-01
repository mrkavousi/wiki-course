import { useEffect, useMemo, useRef, useState } from 'react';
import type { Course, Role } from '../../types/course';
import { topicKey } from '../../utils/course';
import { fa } from '../ui';

type Props = { course: Course; known: Set<string>; selectedKey: string | null; onSelect: (key: string) => void };

// Theme tokens; set through `style` because SVG presentation attributes don't take var().
const ROLE_COLOR: Record<Role, string> = { prereq: 'var(--color-prereq)', next: 'var(--color-next)', related: 'var(--color-related)' };
const DOT: Record<Role, string> = { prereq: 'bg-prereq', next: 'bg-next', related: 'bg-related' };
const LEGEND: [Role, string][] = [['prereq', 'پیش‌نیاز (راست)'], ['related', 'مرتبط (پایین)'], ['next', 'پس‌نیاز (چپ)']];
const clampK = (k: number) => Math.min(3, Math.max(0.4, k));
const id = (s: string) => `clip-${s.replace(/[^\p{L}\p{N}]/gu, '_')}`;

type BubbleProps = { x: number; y: number; r: number; title: string; thumbnail?: string; color: string; known: boolean; selected: boolean; onClick: () => void };

function Bubble({ x, y, r, title, thumbnail, color, known, selected, onClick }: BubbleProps) {
  const clip = id(title + r);
  return (
    <g data-node transform={`translate(${x} ${y})`} className="cursor-pointer" onClick={onClick}>
      <clipPath id={clip}>
        <circle r={r} />
      </clipPath>
      <circle r={r} className="fill-panel" />
      {thumbnail && <image href={thumbnail} x={-r} y={-r} width={r * 2} height={r * 2} clipPath={`url(#${clip})`} preserveAspectRatio="xMidYMid slice" />}
      <circle r={r} fill="none" strokeWidth={selected ? 4 : 2} style={{ stroke: color, filter: selected ? `drop-shadow(0 0 8px ${color})` : undefined }} />
      {known && (
        <g transform={`translate(${r * 0.72} ${-r * 0.72})`}>
          <circle r={10} className="fill-accent" />
          <path d="M-4.5 0.5 L-1.5 3.5 L4.5 -3" fill="none" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="stroke-on-accent" />
        </g>
      )}
      <text
        y={r + 16}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        strokeWidth={4}
        paintOrder="stroke"
        style={{ unicodeBidi: 'plaintext' }}
        className="pointer-events-none fill-fg stroke-bg"
      >
        {title.length > 20 ? title.slice(0, 19) + '…' : title}
      </text>
    </g>
  );
}

export function CourseGraph({ course, known, selectedKey, onSelect }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });

  useEffect(() => {
    const el = svg.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    const wheel = (e: WheelEvent) => { // native listener: React's onWheel is passive
      e.preventDefault();
      setView((v) => ({ ...v, k: clampK(v.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1)) }));
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => { ro.disconnect(); el.removeEventListener('wheel', wheel); };
  }, []);

  // One evenly spaced ring grouped by role, clockwise: prerequisites centred on the right (Persian reads right to left,
  // before -> after), then related (bottom), then next steps (left / top).
  const placed = useMemo(() => {
    const R = Math.max(170, Math.min(size.w, size.h) / 2 - 50);
    const order = (['prereq', 'related', 'next'] as Role[]).flatMap((role) => course.topics.filter((t) => t.role === role).sort((a, b) => b.score - a.score));
    const step = (2 * Math.PI) / Math.max(order.length, 1);
    const start = -((order.filter((t) => t.role === 'prereq').length - 1) / 2) * step;
    return order.map((t, i) => {
      let r = R * (1.05 - 0.3 * (t.score / 100)); // higher score = closer
      if (order.length > 10 && i % 2) r *= 0.8; // stagger a crowded ring so neighbouring labels don't collide
      const a = start + i * step;
      return { t, x: r * Math.cos(a), y: r * Math.sin(a) };
    });
  }, [course, size]);

  return (
    <div className="dots relative h-full w-full overflow-hidden">
      <svg
        ref={svg}
        viewBox={`${-size.w / 2} ${-size.h / 2} ${size.w} ${size.h}`}
        className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as Element).closest('[data-node]')) return;
          drag.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x, dy = e.clientY - d.y;
          drag.current = { x: e.clientX, y: e.clientY };
          setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {placed.map(({ t, x, y }) => (
            <g key={topicKey(t)} className="pointer-events-none">
              <line x2={x} y2={y} strokeOpacity={0.25 + 0.5 * (t.score / 100)} strokeWidth={1 + 3 * (t.score / 100)} strokeLinecap="round" style={{ stroke: ROLE_COLOR[t.role] }} />
              <g transform={`translate(${x / 2} ${y / 2})`}>
                <rect x={-26} y={-12.5} width={52} height={25} rx={12.5} className="fill-bg" style={{ stroke: ROLE_COLOR[t.role] }} />
                <text textAnchor="middle" dy={4.5} fontSize={13} fontWeight={700} className="fill-fg">{fa(t.score)}٪</text>
              </g>
            </g>
          ))}
          {placed.map(({ t, x, y }) => (
            <Bubble
              key={topicKey(t)}
              x={x}
              y={y}
              r={26}
              title={t.title}
              thumbnail={t.thumbnail}
              color={ROLE_COLOR[t.role]}
              known={known.has(topicKey(t))}
              selected={topicKey(t) === selectedKey}
              onClick={() => onSelect(topicKey(t))}
            />
          ))}
          <Bubble
            x={0}
            y={0}
            r={40}
            title={course.root.title}
            thumbnail={course.root.thumbnail}
            color="var(--color-fg)"
            known={known.has(topicKey(course.root))}
            selected={topicKey(course.root) === selectedKey}
            onClick={() => onSelect(topicKey(course.root))}
          />
        </g>
      </svg>
      <ul className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-panel/90 px-3 py-2 text-xs text-muted">
        {LEGEND.map(([role, label]) => (
          <li key={role} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-full ${DOT[role]}`} />
            {label}
          </li>
        ))}
        <li>نزدیک‌تر به مرکز یعنی نمره‌ی بیشتر</li>
        <li className="hidden sm:block">اسکرول برای زوم · کشیدن برای جابه‌جایی</li>
      </ul>
    </div>
  );
}
