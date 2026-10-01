import { Archive, ArrowLeft, CircleCheck, CircleDashed, CirclePlay, Layers, Star } from 'lucide-react';
import type { Course, State } from '../../types/course';
import { courseHref } from '../../data/store';
import { topicKey } from '../../utils/course';
import { courseStats, STATUS_LABEL, type Status } from '../../utils/progress';
import { SUBJECT_LABEL, subjectOf } from '../../utils/subject';
import { Cover } from '../Cover/Cover';
import { ProgressBar } from '../Progress/Progress';
import { Skeleton } from '../States/States';
import { ago, badge, card, fa, ic, lift } from '../ui';

// Status is always icon + text, never colour alone.
const STATUS_ICON: Record<Status, typeof CircleDashed> = { new: CircleDashed, active: CirclePlay, done: CircleCheck, archived: Archive };

type Props = {
  course: Course;
  state: State;
  day: string;
  variant?: 'grid' | 'list';
  /** Heading level of the title: 2 under a page title, 3 under a section heading. */
  level?: 2 | 3;
  onToggleSaved?: () => void;
  /** Extra controls (archive, delete...) shown beside the star. They sit above the card's link. */
  menu?: React.ReactNode;
};

/** A course as a compact card. The whole card is one link (the title's ::after), so the star and menu need `relative z-10`. */
export function CourseCard({ course, state, day, variant = 'grid', level = 3, onToggleSaved, menu }: Props) {
  const H = `h${level}` as 'h2' | 'h3';
  const s = courseStats(course, state, day);
  const Icon = STATUS_ICON[s.status];
  const saved = state.saved.some((p) => topicKey(p) === topicKey(course.root));
  const list = variant === 'list';
  const cta = s.status === 'done' ? 'مرور دوباره' : s.status === 'new' ? 'شروع دوره' : 'ادامه‌ی یادگیری';

  return (
    <article className={`${card} ${lift} group relative flex overflow-hidden ${s.status === 'archived' ? 'opacity-75' : ''} ${list ? 'flex-row items-stretch' : 'flex-col'}`}>
      <Cover title={course.root.title} summary={course.root.summary} thumbnail={course.root.thumbnail} className={list ? 'hidden w-36 shrink-0 sm:block' : 'h-28 w-full'} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <div className="flex items-start gap-2 pe-20">
          <H dir="auto" className="min-w-0 flex-1 text-base font-bold leading-snug">
            <a href={courseHref(course.key)} className="line-clamp-2 outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-accent">
              {course.root.title}
            </a>
          </H>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className={badge}>{course.root.lang}</span>
          <span className="flex items-center gap-1 font-medium text-fg">
            <Icon className={ic} aria-hidden="true" />
            {STATUS_LABEL[s.status]}
          </span>
          <span>{SUBJECT_LABEL[subjectOf({ title: course.root.title, summary: course.root.summary })]}</span>
        </div>
        <ProgressBar value={s.done} max={s.total} label={`پیشرفت «${course.root.title}»`} className="h-1.5" />
        <p className="text-sm text-muted">
          {fa(s.done)} از {fa(s.total)} گام
          {s.last ? ` · ${ago(s.last)}` : ''}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
          {s.due > 0 ? (
            <span className="flex items-center gap-1 text-sm font-medium text-accent">
              <Layers className={ic} aria-hidden="true" />
              {fa(s.due)} کارت برای مرور
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-sm font-semibold text-accent">
            {cta}
            <ArrowLeft className={ic} aria-hidden="true" />
          </span>
        </div>
      </div>
      <div className="absolute end-1 top-1 z-10 flex items-center rounded-lg bg-panel/85 backdrop-blur">
        {menu}
        {onToggleSaved && (
          <button onClick={onToggleSaved} aria-pressed={saved} aria-label={saved ? `حذف «${course.root.title}» از ذخیره‌شده‌ها` : `ذخیره‌ی «${course.root.title}»`} className="flex size-11 items-center justify-center rounded-lg text-accent hover:bg-fg/10">
            <Star className={`size-5 ${saved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>
    </article>
  );
}

/** Same footprint as a card while the course loads. */
export function CourseCardSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'list' }) {
  return (
    <div className={`${card} flex overflow-hidden ${variant === 'list' ? 'h-32 flex-row' : 'flex-col'}`} aria-hidden="true">
      <Skeleton className={variant === 'list' ? 'hidden w-36 rounded-none sm:block' : 'h-28 rounded-none'} />
      <div className="flex-1 space-y-2 p-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
