import type { Course } from '../../types/course';
import { pathOf, topicKey } from '../../utils/course';
import { TopicNode, type NodeState } from '../TopicNode/TopicNode';

type Props = {
  course: Course;
  known: Set<string>;
  selectedKey: string | null;
  onSelect: (key: string) => void;
};

const Head = ({ children, className }: { children: string; className: string }) => (
  <h3 className={`mb-1 mt-6 text-center text-sm font-bold ${className}`}>{children}</h3>
);

export function Roadmap({ course, known, selectedKey, onSelect }: Props) {
  const steps = pathOf(course);
  const nextIdx = steps.findIndex((s) => !known.has(topicKey(s.page))); // first unknown step
  const rootIdx = steps.findIndex((s) => !s.topic);
  const related = course.topics.filter((t) => t.role === 'related');

  return (
    <div className="mx-auto max-w-md px-4 pb-10 pt-2">
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
              <div style={{ transform: `translateX(${Math.sin(i * 1.1) * 56}px)` }}>
                <TopicNode
                  page={s.page}
                  score={s.topic?.score}
                  state={state}
                  selected={key === selectedKey}
                  size={s.topic ? 84 : 112}
                  badge={i === nextIdx ? (i === 0 ? 'از اینجا شروع کن' : 'گام بعدی') : undefined}
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
              <TopicNode
                key={topicKey(t)}
                page={t}
                score={t.score}
                size={64}
                state={known.has(topicKey(t)) ? 'known' : 'todo'}
                selected={topicKey(t) === selectedKey}
                onClick={() => onSelect(topicKey(t))}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
