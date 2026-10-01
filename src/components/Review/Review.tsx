import { useEffect, useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { loadPack, type Store } from '../../data/store';
import { courseKey } from '../../utils/course';
import { dueIds, nextDue, today } from '../../utils/learn';
import { Flashcards, type CardItem } from '../Flashcards/Flashcards';
import { EmptyState, Skeleton } from '../States/States';
import { fa, ghost, inDays, primary } from '../ui';

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
  const back = nextDue(store.state.boxes, day);
  const finish = (
    <>
      <a href="#/" className={ghost}>خانه</a>
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
          <a href="#/" className={`${ghost} shrink-0`}>
            خروج
          </a>
        ) : null}
      </div>
      {items === null ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-52 w-full" />
          <p className="sr-only" role="status">در حال آماده کردن کارت‌ها…</p>
        </div>
      ) : items.length ? (
        <>
          <p className="text-sm font-semibold">{fa(items.length)} کارت برای امروز، حدود {fa(Math.max(1, Math.round(items.length / 2)))} دقیقه</p>
          <Flashcards items={items} boxes={store.state.boxes} onRate={store.rateCard} done={finish} />
        </>
      ) : (
        <EmptyState
          icon={Sparkles}
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
