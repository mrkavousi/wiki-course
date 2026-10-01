import { useLayoutEffect, useRef, useState } from 'react';
import type { Course } from '../../types/course';
import { pathOf, topicKey } from '../../utils/course';
import { TopicNode, type NodeState } from '../TopicNode/TopicNode';

type Props = {
  course: Course;
  known: Set<string>;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  due?: Record<string, number>; // due cards per topicKey
};

// done: solid accent; next: bright and flowing; todo: faint flowing dashes toward the goal; related: faint, flowing out of the main article.
const LINK = {
  done: 'stroke-accent stroke-[3]',
  next: 'edge stroke-accent stroke-[3]',
  todo: 'edge stroke-muted/60 stroke-2',
  related: 'edge stroke-related/50 stroke-2',
};

const Head = ({ children, className }: { children: string; className: string }) => (
  <h2 className={`mb-1 mt-6 text-center text-sm font-bold ${className}`}>{children}</h2>
);

type Link = { d: string; state: 'done' | 'next' | 'todo' | 'related' };

/** Curve between two points, leaving and entering vertically so it flows down the path. */
const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const m = (a.y + b.y) / 2;
  return `M${a.x} ${a.y} C${a.x} ${m} ${b.x} ${m} ${b.x} ${b.y}`;
};

export function Roadmap({ course, known, selectedKey, onSelect, due }: Props) {
  const steps = pathOf(course);
  const nextIdx = steps.findIndex((s) => !known.has(topicKey(s.page))); // first unknown step
  const rootIdx = steps.findIndex((s) => !s.topic);
  const related = course.topics.filter((t) => t.role === 'related');

  // Connectors are measured from the real node positions (the zig-zag and headings make row heights vary), then drawn in one SVG behind the nodes.
  const box = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [h, setH] = useState(0);
  const sig = steps.map((s) => topicKey(s.page)).join() + related.length;
  useLayoutEffect(() => {
    const el = box.current!;
    const measure = () => {
      const o = el.getBoundingClientRect();
      const at = (key: string) => {
        const r = el.querySelector(`[data-key="${CSS.escape(key)}"] [data-orb]`)?.getBoundingClientRect();
        return r && { x: r.left + r.width / 2 - o.left, y: r.top + r.height / 2 - o.top };
      };
      const out: Link[] = [];
      steps.forEach((s, i) => {
        const a = at(topicKey(s.page)), b = steps[i + 1] && at(topicKey(steps[i + 1].page));
        if (a && b) out.push({ d: curve(a, b), state: known.has(topicKey(steps[i + 1].page)) ? 'done' : i + 1 === nextIdx ? 'next' : 'todo' });
      });
      const root = at(topicKey(course.root));
      related.forEach((t) => {
        const b = at(topicKey(t));
        if (root && b) out.push({ d: curve(root, b), state: 'related' });
      });
      setLinks(out);
      setH(o.height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, nextIdx, known]);

  return (
    <div ref={box} className="relative mx-auto max-w-md px-4 pb-10 pt-2">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 w-full" height={h} style={{ overflow: 'visible' }}>
        {links.map((l, i) => (
          <path key={i} d={l.d} fill="none" strokeLinecap="round" className={LINK[l.state]} />
        ))}
      </svg>
      {steps.map((s, i) => {
        const key = topicKey(s.page);
        const state: NodeState = known.has(key) ? 'known' : i === nextIdx ? 'next' : 'todo';
        return (
          <div key={key}>
            {i === 0 && rootIdx > 0 && <Head className="text-prereq">اول این‌ها (پیش‌نیاز)</Head>}
            {i === rootIdx && <Head className="text-fg">مقاله‌ی اصلی</Head>}
            {i === rootIdx + 1 && <Head className="text-next">بعدش این‌ها (پس‌نیاز)</Head>}
            {/* ponytail: zig-zag by index; no real layout engine. Only the node moves, so the row never overflows on phones. */}
            <div className="flex justify-center py-3">
              <div data-key={key} style={{ transform: `translateX(${Math.sin(i * 1.1) * 56}px)` }}>
                <TopicNode
                  page={s.page}
                  score={s.topic?.score}
                  state={state}
                  selected={key === selectedKey}
                  size={s.topic ? 84 : 112}
                  badge={i === nextIdx ? (i === 0 ? 'از اینجا شروع کن' : 'گام بعدی') : undefined}
                  due={due?.[key]}
                  onClick={() => onSelect(key)}
                />
              </div>
            </div>
          </div>
        );
      })}
      {related.length > 0 && (
        <section className="mt-8 border-t border-line pt-2">
          <Head className="text-related">مطالب مرتبط</Head>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {related.map((t) => (
              <div key={topicKey(t)} data-key={topicKey(t)}>
              <TopicNode
                page={t}
                score={t.score}
                size={64}
                state={known.has(topicKey(t)) ? 'known' : 'todo'}
                selected={topicKey(t) === selectedKey}
                due={due?.[topicKey(t)]}
                onClick={() => onSelect(topicKey(t))}
              />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
