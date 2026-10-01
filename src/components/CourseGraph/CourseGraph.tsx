import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Course, Role } from '../../types/course';
import { topicKey } from '../../utils/course';
import { Maximize } from 'lucide-react';
import { fa, ic } from '../ui';

type Props = { course: Course; known: Set<string>; selectedKey: string | null; onSelect: (key: string) => void };

// Theme tokens; set through `style` because SVG presentation attributes don't take var().
const ROLE_COLOR: Record<Role, string> = { prereq: 'var(--color-prereq)', next: 'var(--color-next)', related: 'var(--color-related)' };
const DOT: Record<Role, string> = { prereq: 'bg-prereq', next: 'bg-next', related: 'bg-related' };
const LEGEND: [Role, string][] = [['prereq', 'پیش‌نیاز (راست)'], ['related', 'مرتبط (پایین)'], ['next', 'پس‌نیاز (چپ)']];
const clampK = (k: number) => Math.min(3, Math.max(0.2, k));
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

  // Start from one ring grouped by role, clockwise: prerequisites centred on the right (Persian reads right to left,
  // before -> after), then related (bottom), then next steps (left / top). Then push overlapping bubbles apart
  // (labels are wide, so the "too close" test is an ellipse) and keep a pull toward the starting spot so roles stay grouped.
  const placed = useMemo(() => {
    const GAP = 125; // arc length one bubble + label needs
    const roles = (['prereq', 'related', 'next'] as Role[]).map((role) => course.topics.filter((t) => t.role === role).sort((a, b) => b.score - a.score));
    const n = Math.max(course.topics.length, 1);
    // each role owns a wedge sized by its count; inside it, higher scores sit on inner rings, and a ring holds as many bubbles as its arc fits
    let a0 = -(roles[0].length / n) * Math.PI;
    const pts = roles.flatMap((list) => {
      const w = (list.length / n) * 2 * Math.PI;
      const out: { t: (typeof list)[number]; hx: number; hy: number; x: number; y: number }[] = [];
      for (let k = 0, i = 0; i < list.length; k++) {
        const r = 150 + k * 115;
        const cap = Math.max(1, Math.min(list.length - i, Math.floor((w * r) / GAP)));
        for (let j = 0; j < cap; j++, i++) {
          const a = a0 + (w * (j + 0.5)) / cap;
          out.push({ t: list[i], hx: r * Math.cos(a), hy: r * Math.sin(a), x: r * Math.cos(a), y: r * Math.sin(a) });
        }
      }
      a0 += w;
      return out;
    });
    const GX = 105, GY = 80; // half-extent of the space one bubble + label needs
    for (let it = 0; it < 80; it++) {
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j];
          const dx = q.x - p.x || 0.01, dy = q.y - p.y || 0.01;
          const d = Math.hypot(dx / GX, dy / GY);
          if (d >= 1) continue;
          const push = (1 - d) * 0.5;
          p.x -= dx * push * 0.5; p.y -= dy * push * 0.5;
          q.x += dx * push * 0.5; q.y += dy * push * 0.5;
        }
        const d0 = Math.hypot(p.x / GX, p.y / GY);
        if (d0 < 1.3) { p.x += (p.x || 1) * (1.3 - d0) * 0.3; p.y += p.y * (1.3 - d0) * 0.3; } // keep clear of the centre bubble
        p.x += (p.hx - p.x) * 0.02; p.y += (p.hy - p.y) * 0.02;
      }
    }
    return pts;
  }, [course, size]);

  // Zoom to fit all bubbles whenever the layout changes; the user can then pan and zoom freely.
  const fit = useCallback(() => {
    const xs = placed.map((p) => p.x), ys = placed.map((p) => p.y);
    const [x0, x1, y0, y1] = [Math.min(0, ...xs) - 90, Math.max(0, ...xs) + 90, Math.min(0, ...ys) - 70, Math.max(0, ...ys) + 90];
    const k = clampK(Math.min(1, size.w / (x1 - x0), (size.h - 50) / (y1 - y0)));
    setView({ x: -((x0 + x1) / 2) * k, y: -((y0 + y1) / 2) * k, k });
  }, [placed, size]);
  useEffect(fit, [fit]);

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
              <line className="edge" x2={x} y2={y} strokeOpacity={0.25 + 0.5 * (t.score / 100)} strokeWidth={1 + 3 * (t.score / 100)} strokeLinecap="round" style={{ stroke: ROLE_COLOR[t.role] }} />
              <g transform={`translate(${x / 2} ${y / 2})`} display={placed.length > 16 ? 'none' : undefined}>
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
      <button onClick={fit} className="absolute start-3 top-3 flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-panel/90 px-3 text-sm font-medium hover:border-accent/60">
        <Maximize className={ic} />
        نمایش همه
      </button>
      <ul className="pointer-events-none absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-panel/90 px-3 py-2 text-xs text-muted">
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
