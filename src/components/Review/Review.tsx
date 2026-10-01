import { useEffect, useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { loadPack, type Store } from '../../data/store';
import { courseKey } from '../../utils/course';
import { dueIds, today } from '../../utils/learn';
import { Flashcards, type CardItem } from '../Flashcards/Flashcards';
import { fa, ghost } from '../ui';

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

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 py-8">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Layers className="size-7 text-accent" />
          مرور امروز
        </h2>
        <p className="text-sm leading-7 text-muted">
          تکرار فاصله‌دار: هر کارتی که یادت بود دیرتر برمی‌گردد، و هر کدام که یادت نبود زودتر. روزی چند دقیقه کافی است.
        </p>
      </div>
      {items === null ? (
        <p className="text-muted">در حال آماده کردن کارت‌ها…</p>
      ) : items.length ? (
        <>
          <p className="text-sm font-semibold">{fa(items.length)} کارت برای امروز</p>
          <Flashcards items={items} onRate={store.rateCard} />
        </>
      ) : (
        <div className="space-y-3 rounded-2xl border border-line p-6 text-center">
          <Sparkles className="mx-auto size-10 text-accent" />
          <p className="font-bold">همه‌ی مرورهای امروز تمام شد!</p>
          <p className="text-sm leading-7 text-muted">در هر دوره، تب «فلش‌کارت» یک موضوع را باز کن و کارت‌هایش را تمرین کن؛ از فردا به این‌جا می‌آیند.</p>
          <a href="#/" className={ghost}>برگشت به کتابخانه</a>
        </div>
      )}
    </div>
  );
}
