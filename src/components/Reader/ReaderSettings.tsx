import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlignJustify, BookOpen, Check, Highlighter, Languages, LayoutGrid, Minus, Plus, SlidersHorizontal, X } from 'lucide-react';
import { READER_BGS, READER_FONTS, READER_SIZES, type ReaderBg, type ReaderFont, type ReaderMode, type ReaderPrefs } from '../../data/store';
import { fa, ghost, ic, iconBtn } from '../ui';

type Props = { prefs: ReaderPrefs; set: (p: Partial<ReaderPrefs>) => void; onMode: (m: ReaderMode) => void; onLang: () => void; lang: string };

const W = 320; // popover width on desktop
const SWATCH: Record<ReaderBg, string> = { app: 'bg-linear-to-br from-bg to-panel', light: 'bg-[#fbfbf9]', paper: 'bg-[#f4ecd8]', dark: 'bg-[#0b1210]' };
const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2 px-3 py-3">
    <h3 className="text-sm font-semibold text-muted">{title}</h3>
    {children}
  </section>
);
const seg = (on: boolean) => `flex min-h-11 flex-1 items-center justify-center gap-1.5 px-3 text-sm ${on ? 'bg-accent text-on-accent' : 'hover:bg-fg/5'}`;

/** Everything about how the article looks in one place: a popover under its button on desktop, a bottom sheet on phones (same pattern as ExportMenu). */
export function ReaderSettings({ prefs, set, onMode, onLang, lang }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; maxH: number } | null>(null); // null = bottom sheet
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const show = () => {
    const r = btn.current!.getBoundingClientRect();
    setPos(innerWidth >= 1024 ? { top: r.bottom + 8, maxH: innerHeight - r.bottom - 16, left: Math.max(8, Math.min(r.right - W, innerWidth - W - 8)) } : null);
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

  const modes: [ReaderMode, string, typeof BookOpen][] = [['easy', 'ساده', BookOpen], ['enhanced', 'پیشرفته', Highlighter]];
  const bar = 'flex overflow-hidden rounded-lg border border-line';
  const { size } = prefs;

  return (
    <>
      <button ref={btn} className={`${ghost} shrink-0 max-sm:px-3`} aria-label="تنظیمات خوانشگر" aria-haspopup="true" aria-expanded={open} onClick={() => (open ? close() : show())}>
        <SlidersHorizontal className={ic} />
        <span className="max-sm:hidden">تنظیمات</span>
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50" onClick={close}>
            <div className={`absolute inset-0 ${pos ? '' : 'bg-black/40 backdrop-blur-sm'}`} aria-hidden="true" />
            <div
              ref={panel}
              role="group"
              aria-label="تنظیمات خوانشگر"
              onClick={(e) => e.stopPropagation()}
              style={pos ? { top: pos.top, left: pos.left, width: W, maxHeight: Math.max(pos.maxH, 200) } : undefined}
              className={`absolute divide-y divide-line overflow-y-auto border border-line bg-panel shadow-2xl ${pos ? 'overscroll-contain rounded-2xl' : 'sheet pb-safe inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl'}`}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-bold">تنظیمات خوانشگر</span>
                <button className={iconBtn} onClick={close} aria-label="بستن">
                  <X className={ic} />
                </button>
              </div>
              <Group title="حالت خوانش">
                <div className={bar} role="group" aria-label="حالت خوانش">
                  {modes.map(([m, label, Icon]) => (
                    <button key={m} aria-pressed={prefs.mode === m} onClick={() => onMode(m)} className={seg(prefs.mode === m)}>
                      <Icon className={ic} />
                      {label}
                    </button>
                  ))}
                </div>
              </Group>
              <Group title="اندازه‌ی متن">
                <div className={`${bar} items-center`} role="group" aria-label="اندازه‌ی متن">
                  <button className={seg(false)} aria-label="متن کوچک‌تر" disabled={size === 0} onClick={() => set({ size: size - 1 })}>
                    <Minus className={ic} />
                  </button>
                  <span className="w-12 text-center text-sm tabular-nums text-muted">{fa(size + 1)} از {fa(READER_SIZES.length)}</span>
                  <button className={seg(false)} aria-label="متن بزرگ‌تر" disabled={size === READER_SIZES.length - 1} onClick={() => set({ size: size + 1 })}>
                    <Plus className={ic} />
                  </button>
                </div>
              </Group>
              <Group title="قلم">
                <div className={bar} role="group" aria-label="قلم">
                  {(Object.keys(READER_FONTS) as ReaderFont[]).map((f) => (
                    <button key={f} aria-pressed={prefs.font === f} onClick={() => set({ font: f })} style={{ fontFamily: READER_FONTS[f][1] }} className={seg(prefs.font === f)}>
                      {READER_FONTS[f][0]}
                    </button>
                  ))}
                </div>
              </Group>
              <Group title="پس‌زمینه‌ی متن">
                <div className="grid grid-cols-4 gap-2" role="group" aria-label="پس‌زمینه‌ی متن">
                  {(Object.keys(READER_BGS) as ReaderBg[]).map((b) => (
                    <button key={b} aria-pressed={prefs.bg === b} onClick={() => set({ bg: b })} className={`flex min-h-11 flex-col items-center gap-1 rounded-lg border p-1.5 text-xs ${prefs.bg === b ? 'border-accent' : 'border-line hover:border-accent/50'}`}>
                      <span className={`flex size-7 items-center justify-center rounded-full border border-line ${SWATCH[b]}`}>{prefs.bg === b && <Check className="size-4 text-accent" aria-hidden="true" />}</span>
                      {READER_BGS[b]}
                    </button>
                  ))}
                </div>
              </Group>
              <Group title="نمای فصل‌ها">
                <div className={bar} role="group" aria-label="نمای فصل‌ها">
                  {([[true, 'کارت', LayoutGrid], [false, 'ساده', AlignJustify]] as const).map(([v, label, Icon]) => (
                    <button key={label} aria-pressed={prefs.cards === v} onClick={() => set({ cards: v })} className={seg(prefs.cards === v)}>
                      <Icon className={ic} />
                      {label}
                    </button>
                  ))}
                </div>
              </Group>
              <Group title="زبان">
                <button
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-line px-3 text-start text-sm hover:bg-fg/5"
                  onClick={() => {
                    setOpen(false);
                    onLang();
                  }}
                >
                  <Languages className={ic} />
                  زبان‌های دیگر
                  <span className="ms-auto rounded-md border border-line px-1.5 py-0.5 font-mono text-xs uppercase text-muted">{lang}</span>
                </button>
              </Group>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
