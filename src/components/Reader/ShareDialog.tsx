import { useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { ShareInput } from '../../utils/shareImage';
import { ShareStudio } from '../ShareStudio/ShareStudio';
import { ghost, ic } from '../ui';

/** The share editor in a dialog. It is loaded on demand (React.lazy in Reader), so the ten templates never weigh on opening an article. */
export default function ShareDialog({ input, onClose }: { input: ShareInput; onClose: () => void }) {
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dlg.current!.showModal();
  }, []);
  return (
    <dialog ref={dlg} onClose={onClose} aria-label="اشتراک‌گذاری" className="m-auto max-h-[96dvh] w-[min(74rem,calc(100%-1rem))] overflow-y-auto rounded-3xl border border-line bg-panel p-0 text-fg shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm">
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold">
            <ImageIcon className={ic} />
            اشتراک‌گذاری
          </h2>
          <button onClick={() => dlg.current!.close()} className={ghost}>بستن</button>
        </div>
        <ShareStudio input={input} />
      </div>
    </dialog>
  );
}
