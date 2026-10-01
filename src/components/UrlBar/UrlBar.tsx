import { useState } from 'react';
import { BookOpen, ClipboardPaste, Sparkles } from 'lucide-react';
import { ghost, ic, primary } from '../ui';

type Props = { busy: boolean; onBuild: (url: string) => void; onRead: (url: string) => void; hero?: boolean };

export function UrlBar({ busy, onBuild, onRead, hero }: Props) {
  const [url, setUrl] = useState('');
  const link = url.trim();

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch {}
  };

  if (hero) {
    return (
      <form
        className="flex w-full gap-2 rounded-2xl bg-panel p-1.5 ring-1 ring-line glow transition-shadow focus-within:ring-2 focus-within:ring-accent/40"
        onSubmit={(e) => {
          e.preventDefault();
          if (link) onBuild(link);
        }}
      >
        <input
          dir="ltr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="لینک مقاله ویکی‌پدیا را وارد یا پیست کن (فارسی یا انگلیسی)…"
          aria-label="لینک مقاله‌ی ویکی‌پدیا"
          className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-3 text-lg placeholder:text-muted focus:outline-none"
        />
        <button type="button" disabled={busy} onClick={paste} className={`${ghost} flex-none border-0`} aria-label="چسباندن از کلیپ‌بورد" title="چسباندن از کلیپ‌بورد">
          <ClipboardPaste className={ic} />
        </button>
        <button disabled={busy || !link} className={`${primary} flex-none px-6`}>
          <Sparkles className={ic} />
          شروع یادگیری
        </button>
      </form>
    );
  }

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
