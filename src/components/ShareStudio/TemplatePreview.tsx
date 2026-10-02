import type { Format, Report, ShareData, ShareTemplate } from '../../share/types';
import { TemplateRenderer } from './TemplateRenderer';

/** The big live preview. The key restarts the fade when the template changes. */
export function TemplatePreview({ template, data, format, onDone }: { template: ShareTemplate; data: ShareData; format: Format; onDone: (c: HTMLCanvasElement, r: Report) => void }) {
  return (
    <div key={template.id} className="page-in">
      <TemplateRenderer preview template={template} data={data} format={format} label={`پیش‌نمایش قالب ${template.name}`} onDone={onDone} className="mx-auto block h-auto max-h-[46dvh] w-auto max-w-full rounded-xl border border-line shadow-lg md:max-h-[74dvh]" />
    </div>
  );
}
