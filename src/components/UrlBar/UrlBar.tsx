import { useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { ghost, ic, primary } from '../ui';

type Props = { busy: boolean; onBuild: (url: string) => void; onRead: (url: string) => void };

export function UrlBar({ busy, onBuild, onRead }: Props) {
  const [url, setUrl] = useState('');
  const link = url.trim();
  return (
    <form
      className="flex w-full min-w-0 flex-wrap gap-2 sm:flex-nowrap"
      onSubmit={(e) => {
        e.preventDefault();
        if (link) onBuild(link);
      }}
    >
      <input
        dir="ltr"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://fa.wikipedia.org/wiki/…"
        aria-label="لینک مقاله‌ی ویکی‌پدیا"
        className="min-w-0 flex-1 basis-full rounded-lg border border-line bg-bg px-3 py-2 text-base placeholder:text-muted focus:border-accent focus:outline-none sm:basis-0"
      />
      <button disabled={busy || !link} className={`${primary} flex-1 sm:flex-none`}>
        <Sparkles className={ic} />
        {busy ? 'در حال ساخت…' : 'ساخت دوره'}
      </button>
      <button type="button" disabled={!link} onClick={() => onRead(link)} className={`${ghost} flex-1 sm:flex-none`} title="خواندن مقاله در خوانشگر ساده (بدون هوش مصنوعی)">
        <BookOpen className={ic} />
        بخوان
      </button>
    </form>
  );
}
