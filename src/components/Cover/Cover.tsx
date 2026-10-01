import { seed, subjectOf, type Subject } from '../../utils/subject';

// Each subject gets its own motif and tint (tokens only). The title seeds small variations, so two math courses are siblings, not twins.
const TINT: Record<Subject, string> = {
  math: 'bg-linear-to-br from-sub-math/25 to-sub-math/5 text-sub-math',
  physics: 'bg-linear-to-br from-sub-physics/25 to-sub-physics/5 text-sub-physics',
  code: 'bg-linear-to-br from-sub-code/25 to-sub-code/5 text-sub-code',
  history: 'bg-linear-to-br from-sub-history/25 to-sub-history/5 text-sub-history',
  biology: 'bg-linear-to-br from-sub-biology/25 to-sub-biology/5 text-sub-biology',
  other: 'bg-linear-to-br from-fg/10 to-fg/0 text-muted',
};

function Motif({ subject, n }: { subject: Subject; n: number }) {
  const a = n % 5; // 0-4
  const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, opacity: 0.8 } as const;
  switch (subject) {
    case 'math': // grid, a circle and a triangle
      return (
        <g {...line}>
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${i * 25} 0V120M0 ${i * 15}H200`} opacity={0.2} />)}
          <circle cx={70 + a * 14} cy={60} r={30 + a * 3} />
          <path d={`M${120 - a * 6} 100L${160 - a * 6} 30L${185 - a * 6} 100Z`} />
        </g>
      );
    case 'physics': // orbits around a nucleus, plus a wave
      return (
        <g {...line}>
          <ellipse cx={100} cy={60} rx={80} ry={26} transform={`rotate(${-20 + a * 8} 100 60)`} />
          <ellipse cx={100} cy={60} rx={80} ry={26} transform={`rotate(${40 + a * 8} 100 60)`} />
          <circle cx={100} cy={60} r={7} fill="currentColor" stroke="none" />
          <path d={`M0 ${100 + a} q 25 -26 50 0 t 50 0 t 50 0 t 50 0`} opacity={0.35} />
        </g>
      );
    case 'code': // lines of code as blocks
      return (
        <g fill="currentColor" opacity={0.45}>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={20 + (i % 3) * 14} y={16 + i * 16} width={40 + ((n >>> i) % 5) * 22} height={8} rx={2} />
          ))}
          <rect x={150} y={16} width={30} height={88} rx={3} opacity={0.35} />
        </g>
      );
    case 'history': // contour lines like a map, with a few waypoints
      return (
        <g {...line}>
          {[18, 34, 50, 66, 82].map((r, i) => <ellipse key={r} cx={110 + a * 6} cy={64} rx={r * 1.6} ry={r} transform={`rotate(${i * 7 + a * 5} 110 64)`} opacity={0.5 - i * 0.07} />)}
          {[0, 1, 2].map((i) => <circle key={i} cx={40 + i * 55 + a * 4} cy={30 + ((i * 37 + a * 11) % 60)} r={3.5} fill="currentColor" stroke="none" />)}
        </g>
      );
    case 'biology': // overlapping cells
      return (
        <g {...line}>
          {[[60, 62, 34], [118, 44, 24], [140, 84, 30], [90, 100, 16]].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x + a * 4} cy={y} r={r} />
              <circle cx={x + a * 4 + r / 4} cy={y - r / 5} r={r / 3.5} fill="currentColor" stroke="none" opacity={0.6} />
            </g>
          ))}
        </g>
      );
    default: // dot grid
      return (
        <g fill="currentColor" opacity={0.3}>
          {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={14 + (i % 10) * 20} cy={22 + Math.floor(i / 10) * 26} r={2 + ((i + a) % 3)} />)}
        </g>
      );
  }
}

type Props = { title: string; summary?: string; thumbnail?: string; className?: string; subject?: Subject /* force a motif, e.g. for empty states */ };

/** Subject artwork for a course. Decorative (the title is always shown next to it), so it is hidden from assistive tech. */
export function Cover({ title, summary, thumbnail, className = '', subject: forced }: Props) {
  const subject = forced ?? subjectOf({ title, summary });
  return (
    <div className={`relative overflow-hidden ${TINT[subject]} ${className}`} aria-hidden="true" data-subject={subject}>
      <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <Motif subject={subject} n={seed(title)} />
      </svg>
      {thumbnail && <img src={thumbnail} alt="" loading="lazy" decoding="async" className="absolute bottom-2 start-2 size-12 rounded-md border-2 border-panel bg-panel object-cover" />}
    </div>
  );
}
