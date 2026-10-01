import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { ic } from '../ui';

const Ctx = createContext<(message: string) => void>(() => {});
/** `const toast = useToast(); toast('ذخیره شد')` */
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const timer = useRef<number>(undefined);
  const show = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(''), 3000);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {/* above the phone bottom bar (h-16 + safe area) */}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 lg:bottom-6">
        {msg && (
          <div className="flex items-center gap-2 rounded-lg bg-fg px-4 py-2.5 text-sm text-bg shadow-lg motion-safe:animate-[page-in_0.18s_ease-out]">
            <Check className={ic} />
            {msg}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
