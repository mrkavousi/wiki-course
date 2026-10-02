import { useEffect, useRef, useState } from 'react';
import { Check, ClipboardCopy, Download, Image as ImageIcon, Share2, TriangleAlert } from 'lucide-react';
import { local } from '../../data/store';
import { COLORS, DEFAULT_LOOK, FRAMES, H, W, cleanQuote, drawShareImage, shareText, type Look, type ShareInput } from '../../utils/shareImage';
import { useToast } from '../Toast/Toast';
import { ghost, ic, primary } from '../ui';

const MAX_CHARS = 700; // beyond this the picture would cut the text, so the editor says so

/** The picture and the text of one piece of an article, with a few looks to choose from; opens the phone's share sheet when it can take a file. */
export function ShareDialog({ input, onClose }: { input: ShareInput; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const blob = useRef<Blob | null>(null); // ready before a tap, because share() must run inside the tap
  const toast = useToast();
  const [title, setTitle] = useState(input.title ?? ''); // may be emptied: then the picture has no heading
  const [text, setText] = useState(() => cleanQuote(input.text));
  const [look, setLook] = useState<Look>(() => ({ ...DEFAULT_LOOK, ...local.get<Partial<Look>>('wc:share', {}) }));
  const [cut, setCut] = useState(false);
  const data: ShareInput = { ...input, title: title.trim(), text };
  const canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], 'a.png', { type: 'image/png' })] });
  const canShareText = typeof navigator.share === 'function';
  const canCopyImage = typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;

  useEffect(() => {
    dlg.current!.showModal();
  }, []);
  useEffect(() => {
    local.set('wc:share', look);
  }, [look]);

  useEffect(() => {
    let live = true;
    blob.current = null;
    const t = setTimeout(async () => {
      const { truncated } = await drawShareImage(canvas.current!, { ...input, title: title.trim(), text }, look);
      if (!live) return;
      setCut(truncated);
      canvas.current!.toBlob((b) => live && (blob.current = b), 'image/png');
    }, 120);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [title, text, look, input]);

  const file = () => (blob.current ? new File([blob.current], 'wiki-course.png', { type: 'image/png' }) : null);
  const guard = async (f: () => Promise<unknown>, ok?: string) => {
    try {
      await f();
      if (ok) toast(ok);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast('انجام نشد؛ دوباره امتحان کن');
    }
  };
  const sendImage = () => guard(async () => {
    const f = file();
    if (f) await navigator.share({ files: [f], text: shareText(data) });
  });
  const download = () => {
    if (!blob.current) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob.current);
    a.download = 'wiki-course.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const copyImage = () => guard(() => navigator.clipboard.write([new ClipboardItem({ 'image/png': blob.current! })]), 'تصویر کپی شد');
  const copyText = () => guard(() => navigator.clipboard.writeText(shareText(data)), 'متن کپی شد');
  const sendText = () => guard(() => navigator.share({ text: shareText(data) }));

  const seg = (on: boolean) => `flex min-h-11 flex-1 items-center justify-center px-3 text-sm ${on ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`;
  const btn = `${ghost} flex-1 whitespace-nowrap`;

  return (
    <dialog ref={dlg} onClose={onClose} aria-label="اشتراک‌گذاری" className="m-auto max-h-[96dvh] w-[min(58rem,calc(100%-1rem))] overflow-y-auto rounded-3xl border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm">
      <div className="grid gap-5 p-4 md:grid-cols-[auto_minmax(0,1fr)] md:p-6">
        <div className="mx-auto md:order-2">
          <canvas ref={canvas} width={W} height={H} role="img" aria-label="پیش‌نمایش تصویر استوری" className="aspect-[9/16] h-[42dvh] w-auto rounded-xl border border-line md:h-[72dvh]" />
        </div>
        <div className="min-w-0 space-y-4 md:order-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold">
              <ImageIcon className={ic} />
              اشتراک‌گذاری
            </h2>
            <button onClick={() => dlg.current!.close()} className={ghost}>بستن</button>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-muted">عنوان</span>
            <input dir="auto" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="بدون عنوان" className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-base focus:border-accent focus:outline-none" />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-muted">متن تصویر</span>
            <textarea dir="auto" value={text} onChange={(e) => setText(e.target.value)} rows={5} className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-base leading-7 focus:border-accent focus:outline-none" />
            {(cut || text.length > MAX_CHARS) && (
              <span className="flex items-start gap-1.5 text-sm text-gold" role="status">
                <TriangleAlert className={`${ic} mt-1`} />
                متن برای تصویر کمی بلند است و کوتاه‌شده نمایش داده می‌شود
              </span>
            )}
          </label>

          <div className="space-y-1.5" role="group" aria-label="قالب رنگ">
            <p className="text-sm font-semibold text-muted">قالب رنگ</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c.id} aria-pressed={look.color === c.id} onClick={() => setLook({ ...look, color: c.id })} className={`flex min-h-11 items-center gap-2 rounded-lg border px-2.5 text-sm ${look.color === c.id ? 'border-accent' : 'border-line hover:border-accent/50'}`}>
                  <span className="flex size-6 items-center justify-center rounded-full border border-line" style={{ background: `linear-gradient(135deg, ${c.bg[0]}, ${c.bg[1]})` }}>
                    {look.color === c.id && <Check className="size-4" style={{ color: c.accent }} aria-hidden="true" />}
                  </span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5" role="group" aria-label="قاب">
            <p className="text-sm font-semibold text-muted">قاب</p>
            <div className="flex overflow-hidden rounded-lg border border-line">
              {FRAMES.map((f) => (
                <button key={f.id} aria-pressed={look.frame === f.id} onClick={() => setLook({ ...look, frame: f.id })} className={seg(look.frame === f.id)}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="max-md:sticky max-md:bottom-0 max-md:bg-panel max-md:py-2">
            {canShareFile ? (
              <button className={`${primary} w-full`} onClick={sendImage}>
                <Share2 className={ic} />
                اشتراک‌گذاری
              </button>
            ) : (
              <button className={`${primary} w-full`} onClick={download}>
                <Download className={ic} />
                دانلود تصویر
              </button>
            )}
            </div>
            <p className="text-sm leading-7 text-muted">برای استوری اینستاگرام اشتراک‌گذاری را بزن و اینستاگرام را انتخاب کن</p>
            {!canShareFile && <p className="text-sm leading-7 text-muted">این مرورگر اشتراک‌گذاری فایل را پشتیبانی نمی‌کند؛ تصویر را دانلود کن</p>}
            <div className="flex flex-wrap gap-2">
              {canShareFile && (
                <button className={btn} onClick={download}>
                  <Download className={ic} />
                  دانلود تصویر
                </button>
              )}
              {canCopyImage && (
                <button className={btn} onClick={copyImage}>
                  <ImageIcon className={ic} />
                  کپی تصویر
                </button>
              )}
              <button className={btn} onClick={copyText}>
                <ClipboardCopy className={ic} />
                کپی متن
              </button>
              {canShareText && (
                <button className={btn} onClick={sendText}>
                  <Share2 className={ic} />
                  اشتراک متن
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
