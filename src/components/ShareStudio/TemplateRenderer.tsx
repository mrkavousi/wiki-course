import { memo, useEffect, useRef } from 'react';
import { drawTemplate } from '../../share/canvasRenderer';
import type { Format, Report, ShareData, ShareTemplate } from '../../share/types';

type Props = {
  template: ShareTemplate;
  data: ShareData;
  format: Format;
  scale?: number; // 1 = the exported size; thumbnails use a small one
  delay?: number; // wait before drawing, so typing does not redraw on every key
  label: string;
  preview?: boolean; // marks the full-size canvas that is exported
  className?: string;
  onDone?: (canvas: HTMLCanvasElement, report: Report) => void;
};

/** One canvas that always shows `template` drawn with `data`. The report of the last draw is also written to data-* attributes (used by the tests). */
export const TemplateRenderer = memo(function TemplateRenderer({ template, data, format, scale = 1, delay = 120, label, preview, className, onDone }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const el = ref.current!;
    const t = setTimeout(async () => {
      const r = await drawTemplate(el, template, data, format, scale);
      if (!r) return; // a newer draw took over
      Object.assign(el.dataset, { template: template.id, truncated: String(r.truncated), overflow: String(r.overflow), minFont: String(Math.round(r.minFontPx)), image: String(r.usedImage), ready: 'true' });
      done.current?.(el, r);
    }, delay);
    return () => {
      clearTimeout(t);
      delete el.dataset.ready;
    };
  }, [template, data, format, scale, delay]);
  return <canvas ref={ref} role="img" aria-label={label} data-preview={preview ? '' : undefined} className={className} />;
});
