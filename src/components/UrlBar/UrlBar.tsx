import { useState } from 'react';
import { primary } from '../ui';

type Props = { busy: boolean; onBuild: (url: string) => void };

export function UrlBar({ busy, onBuild }: Props) {
  const [url, setUrl] = useState('');
  return (
    <form
      className="flex min-w-0 flex-1 basis-80 gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (url.trim()) onBuild(url.trim());
      }}
    >
      <input
        dir="ltr"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://fa.wikipedia.org/wiki/…"
        aria-label="لینک مقاله‌ی ویکی‌پدیا"
        className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <button disabled={busy || !url.trim()} className={primary}>
        {busy ? 'در حال ساخت…' : 'بساز'}
      </button>
    </form>
  );
}
