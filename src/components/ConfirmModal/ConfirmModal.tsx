import { useEffect, useRef } from 'react';
import { btn, ghost } from '../ui';

type Props = { open: boolean; title: string; text: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void };

/** Native <dialog>: focus is trapped, Esc cancels, and focus returns to the opener. Cancel is the default focus so Enter never destroys anything. */
export function ConfirmModal({ open, title, text, confirmLabel, danger, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onCancel={(e) => (e.preventDefault(), onCancel())} className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-lg border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/60">
      <div className="space-y-3 p-5">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm leading-7 text-muted">{text}</p>
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" autoFocus className={ghost} onClick={onCancel}>
            انصراف
          </button>
          <button type="button" className={`${btn} ${danger ? 'bg-danger text-bg' : 'bg-accent text-on-accent'} hover:brightness-110`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
