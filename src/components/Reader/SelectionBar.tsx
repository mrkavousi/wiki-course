import { useEffect, useState, type RefObject } from 'react';
import { ClipboardCopy, Image as ImageIcon, Share2 } from 'lucide-react';
import { shareText, type ShareInput } from '../../utils/shareImage';
import { useToast } from '../Toast/Toast';

type Pos = { top: number; left: number } | 'phone';

/** A small bar that appears over selected article text: copy it, send it as text, or turn it into a picture. */
export function SelectionBar({ within, source, focus, onImage }: { within: RefObject<HTMLElement | null>; source: Pick<ShareInput, 'article' | 'url' | 'thumbnail'>; focus: boolean; onImage: (text: string) => void }) {
  const [sel, setSel] = useState<{ text: string; pos: Pos } | null>(null);
  const toast = useToast();

  useEffect(() => {
    let t: number;
    const read = () => {
      const s = getSelection();
      const text = s?.toString().trim() ?? '';
      if (!s || s.isCollapsed || text.length < 10 || !within.current?.contains(s.getRangeAt(0).commonAncestorContainer)) return setSel(null);
      if (innerWidth < 1024) return setSel({ text, pos: 'phone' });
      const r = s.getRangeAt(0).getBoundingClientRect();
      const top = r.top > 90 ? r.top - 52 : r.bottom + 10;
      setSel({ text, pos: { top, left: Math.max(8, Math.min(r.left + r.width / 2 - 100, innerWidth - 208)) } });
    };
    const on = () => (clearTimeout(t), (t = window.setTimeout(read, 150))); // wait until the selection settles
    document.addEventListener('selectionchange', on);
    return () => (clearTimeout(t), document.removeEventListener('selectionchange', on));
  }, [within]);

  if (!sel) return null;
  const full = shareText({ text: sel.text, ...source });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      toast('متن کپی شد');
    } catch {
      toast('کپی نشد؛ متن را دستی کپی کن');
    }
  };
  const send = async () => {
    try {
      if (navigator.share) await navigator.share({ text: full });
      else await copy();
    } catch {
      /* the person closed the share sheet */
    }
  };
  const item = 'flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-fg/10';
  return (
    <div
      role="toolbar"
      aria-label="اشتراک‌گذاری متن انتخاب‌شده"
      onMouseDown={(e) => e.preventDefault()} // a click must not clear the selection it acts on
      style={sel.pos === 'phone' ? undefined : { top: sel.pos.top, left: sel.pos.left }}
      className={`fixed z-40 flex gap-0.5 rounded-full border border-line bg-panel p-1 shadow-2xl ${sel.pos === 'phone' ? `inset-x-0 mx-auto w-fit ${focus ? 'bottom-8' : 'bottom-36'}` : ''}`}
    >
      <button className={item} onClick={copy}>
        <ClipboardCopy className="size-4" />
        کپی
      </button>
      <button className={item} onClick={send}>
        <Share2 className="size-4" />
        متن
      </button>
      <button className={item} onClick={() => onImage(sel.text)}>
        <ImageIcon className="size-4" />
        تصویر
      </button>
    </div>
  );
}
