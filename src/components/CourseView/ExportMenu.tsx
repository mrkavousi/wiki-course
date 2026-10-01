import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Archive, ArchiveRestore, ClipboardCopy, Download, EllipsisVertical, Link2, RefreshCw, X } from 'lucide-react';
import type { Course } from '../../types/course';
import { MAX_LINK, courseShareLink } from '../../data/store';
import { PROMPTS, courseMarkdown, download, type ExportCtx } from '../../utils/export';
import { ghost, ic, iconBtn } from '../ui';

type Props = {
  ctx: ExportCtx;
  busy: boolean;
  archived: boolean;
  onArchive: () => void;
  onRebuild: () => void;
  copy: (text: string, done?: string) => Promise<void>;
  toast: (msg: string) => void;
};

const W = 320; // popover width on desktop
const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-0.5 py-1.5">
    <h3 className="px-3 pb-1 text-xs font-semibold text-muted">{title}</h3>
    {children}
  </section>
);

/** Export, share, AI prompts and course upkeep in one menu: a popover under its button on desktop, a bottom sheet on phones (never pushes the page down). */
export function ExportMenu({ ctx, busy, archived, onArchive, onRebuild, copy, toast }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null); // null = bottom sheet
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { course } = ctx;

  const show = () => {
    const r = btn.current!.getBoundingClientRect();
    setPos(innerWidth >= 1024 ? { top: r.bottom + 8, left: Math.max(8, Math.min(r.right - W, innerWidth - W - 8)) } : null);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    btn.current?.focus();
  };

  useLayoutEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const away = () => setOpen(false);
    addEventListener('keydown', esc);
    addEventListener('hashchange', away);
    addEventListener('resize', away);
    return () => (removeEventListener('keydown', esc), removeEventListener('hashchange', away), removeEventListener('resize', away));
  }, [open]);

  const Item = ({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) => (
    <button
      disabled={disabled}
      className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm hover:bg-fg/5 disabled:opacity-50"
      onClick={() => {
        setOpen(false);
        onClick();
      }}
    >
      {children}
    </button>
  );

  return (
    <>
      <button ref={btn} className={ghost} aria-haspopup="true" aria-expanded={open} onClick={() => (open ? close() : show())}>
        <EllipsisVertical className={ic} />
        خروجی و پرامپت
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50" onClick={close}>
            <div className={`absolute inset-0 ${pos ? '' : 'bg-black/40 backdrop-blur-sm'}`} aria-hidden="true" />
            <div
              ref={panel}
              role="group"
              aria-label="خروجی و پرامپت"
              onClick={(e) => e.stopPropagation()}
              style={pos ? { top: pos.top, left: pos.left, width: W } : undefined}
              className={`absolute divide-y divide-line overflow-y-auto border border-line bg-panel shadow-2xl ${pos ? 'max-h-[min(34rem,calc(100dvh-6rem))] rounded-2xl p-1.5' : 'sheet pb-safe inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl p-3'}`}
            >
              {!pos && (
                <div className="flex items-center justify-between pb-2">
                  <span className="px-3 font-bold">خروجی و پرامپت</span>
                  <button className={iconBtn} onClick={close} aria-label="بستن">
                    <X className={ic} />
                  </button>
                </div>
              )}
              <Group title="خروجی و اشتراک‌گذاری">
                <Item onClick={() => download(`${course.root.title}.md`, courseMarkdown(ctx))}>
                  <Download className={ic} />
                  دانلود رودمپ (Markdown)
                </Item>
                <Item
                  onClick={async () => {
                    const link = await courseShareLink(course as Course);
                    if (link.length > MAX_LINK) return toast('این دوره برای یک لینک زیادی بزرگ است؛ از «دانلود رودمپ» استفاده کن');
                    await copy(link, 'لینک دوره کپی شد؛ هر کس بازش کند می‌تواند این دوره را اضافه کند');
                  }}
                >
                  <Link2 className={ic} />
                  کپی لینک اشتراک‌گذاری دوره
                </Item>
              </Group>
              <Group title="پرامپت آماده برای هوش مصنوعی">
                {PROMPTS.map((p) => (
                  <Item key={p.id} onClick={() => copy(p.build(ctx))}>
                    <ClipboardCopy className={ic} />
                    {p.label}
                  </Item>
                ))}
              </Group>
              <Group title="مدیریت دوره">
                <Item onClick={onArchive}>
                  {archived ? <ArchiveRestore className={ic} /> : <Archive className={ic} />}
                  {archived ? 'برگرداندن از بایگانی' : 'بایگانی'}
                </Item>
                <Item disabled={busy} onClick={onRebuild}>
                  <RefreshCw className={ic} />
                  ساخت دوباره‌ی این دوره
                </Item>
              </Group>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
