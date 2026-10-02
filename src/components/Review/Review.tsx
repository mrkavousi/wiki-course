import { useEffect, useState } from 'react';
import { CalendarDays, Layers, Sparkles } from 'lucide-react';
import { loadPack, type Store } from '../../data/store';
import { courseKey } from '../../utils/course';
import { addDays, dueIds, nextDue, today } from '../../utils/learn';
import { Flashcards, type CardItem } from '../Flashcards/Flashcards';
import { EmptyState, Skeleton } from '../States/States';
import { card, fa, ghost, inDays, primary } from '../ui';

/** Today's due cards from every topic in one session; the list is fixed when the page opens. */
export function Review({ store }: { store: Store }) {
  const [items, setItems] = useState<CardItem[] | null>(null);

  useEffect(() => {
    const byTopic = new Map<string, number[]>(); // card id = `${topicKey}#${index}`
    for (const id of dueIds(store.state.boxes, today())) {
      const at = id.lastIndexOf('#');
      byTopic.set(id.slice(0, at), [...(byTopic.get(id.slice(0, at)) ?? []), Number(id.slice(at + 1))]);
    }
    Promise.all(
      [...byTopic].map(async ([tk, indexes]) => {
        const sep = tk.indexOf(':'); // topicKey = `${lang}:${title}`
        const title = tk.slice(sep + 1);
        const pack = await loadPack(courseKey(tk.slice(0, sep), title));
        return indexes.flatMap((n) => (pack?.cards[n] ? [{ id: `${tk}#${n}`, ...pack.cards[n], topic: title }] : []));
      }),
    ).then((rows) => setItems(rows.flat()));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- a session doesn't reshuffle while you grade

  const day = today();
  const dueCount = dueIds(store.state.boxes, day).length;
  const missing = items ? Math.max(0, dueCount - items.length) : 0; // due cards whose study pack is gone from this browser
  const back = nextDue(store.state.boxes, day);
  // Cards that will come due on each of the next three days, so tomorrow isn't a surprise.
  const upcoming = [1, 2, 3].map((n) => ({ n, count: Object.values(store.state.boxes).filter((b) => b.due === addDays(day, n)).length }));
  const finish = (
    <>
      <a href="#/app" className={ghost}>خانه</a>
      <a href="#/library" className={ghost}>کتابخانه</a>
    </>
  );

  return (
    <div className="mx-auto w-full max-w-xl space-y-5 px-4 py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Layers className="size-7 text-accent" />
            مرور امروز
          </h1>
          <p className="text-sm leading-7 text-muted">
            هر کارتی که راحت یادت بود دیرتر برمی‌گردد و هر کدام که سخت بود زودتر. نتیجه‌ی هر کارت همان لحظه ذخیره می‌شود؛ هر وقت خواستی بیرون برو و بعداً ادامه بده.
          </p>
        </div>
        {items?.length ? (
          <a href="#/app" className={`${ghost} shrink-0`}>
            خروج
          </a>
        ) : null}
      </div>
      <section className={`${card} p-3`} aria-label="برنامه‌ی سه روز آینده">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
          <CalendarDays className="size-4 text-accent" aria-hidden="true" />
          برنامه‌ی سه روز آینده
        </h2>
        <ul className="grid grid-cols-3 gap-2 text-center">
          {upcoming.map(({ n, count }) => (
            <li key={n} className="rounded-xl bg-surface-2 px-2 py-2">
              <span className="block text-xl font-bold tabular-nums">{fa(count)}</span>
              <span className="block text-xs text-muted">کارت · {inDays(n)}</span>
            </li>
          ))}
        </ul>
      </section>
      {items === null ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-52 w-full" />
          <p className="sr-only" role="status">در حال آماده کردن کارت‌ها…</p>
        </div>
      ) : items.length ? (
        <>
          {missing > 0 && (
            <p className="rounded-lg bg-gold/20 p-3 text-sm leading-7">
              {fa(missing)} کارت دیگر هم وقت مرور دارد، ولی بسته‌ی مطالعه‌اش روی این دستگاه نیست. پیشرفتت نگه داشته شده؛ بسته را در همان دوره دوباره بساز یا پشتیبانت را بازیابی کن.
            </p>
          )}
          <p className="text-sm font-semibold">{fa(items.length)} کارت برای امروز، حدود {fa(Math.max(1, Math.round(items.length / 2)))} دقیقه</p>
          <Flashcards items={items} boxes={store.state.boxes} onRate={store.rateCard} done={finish} />
        </>
      ) : missing > 0 ? (
        <EmptyState icon={Layers} art="other" title="کارت‌هایت منتظرند، ولی متنشان اینجا نیست" text={`${fa(missing)} کارت وقت مرور دارد، اما بسته‌ی مطالعه‌ی آن‌ها از این مرورگر پاک شده. پیشرفتت از بین نرفته: بسته را در همان دوره دوباره بساز یا پشتیبانت را از تنظیمات بازیابی کن.`}>
          <a href="#/library" className={primary}>
            رفتن به کتابخانه
          </a>
        </EmptyState>
      ) : (
        <EmptyState
          icon={Sparkles} art="physics"
          title="امروز همه‌ی کارت‌هایت را مرور کرده‌ای"
          text={`${back ? `مرور بعدی ${inDays(Math.round((Date.parse(back) - Date.parse(day)) / 86_400_000))} است. ` : 'هنوز کارتی نساخته‌ای؛ در هر دوره، تب «فلش‌کارت» یک موضوع را باز کن. '}برای ادامه، یک موضوع جدید شروع کن.`}
        >
          <a href="#/new" className={primary}>
            شروع یک موضوع جدید
          </a>
          <a href="#/library" className={ghost}>
            کتابخانه
          </a>
        </EmptyState>
      )}
    </div>
  );
}
