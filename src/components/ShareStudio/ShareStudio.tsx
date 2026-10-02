import { useEffect, useMemo, useRef, useState } from 'react';
import { ClipboardCopy, Download, Image as ImageIcon, Share2 } from 'lucide-react';
import { local } from '../../data/store';
import { DEFAULT_FORMAT, formatOf } from '../../share/formats';
import { canCopyImage, canShareFile, canShareText, copyImage, downloadBlob, shareFile, toBlob } from '../../share/imageExport';
import { DEFAULT_TEMPLATE, templateOf } from '../../share/templates';
import type { FormatId, Report, ShareData } from '../../share/types';
import { cleanQuote, shareText, type ShareInput } from '../../utils/shareImage';
import { useToast } from '../Toast/Toast';
import { ghost, ic, primary } from '../ui';
import { TemplateControls, type CoverMode } from './TemplateControls';
import { TemplatePreview } from './TemplatePreview';
import { TemplateSelector } from './TemplateSelector';

type Prefs = { template: string; accent?: string; format: FormatId };

/** The share editor: live preview, ten templates, the content fields and the buttons that send the picture or the text. */
export function ShareStudio({ input }: { input: ShareInput }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState<Prefs>(() => {
    const p = local.get<Partial<Prefs>>('wc:share', {});
    return { template: templateOf(p.template ?? DEFAULT_TEMPLATE).id, accent: typeof p.accent === 'string' ? p.accent : undefined, format: formatOf(p.format ?? DEFAULT_FORMAT).id };
  });
  useEffect(() => {
    local.set('wc:share', prefs);
  }, [prefs]);

  const [fields, setFields] = useState(() => ({
    title: input.title ?? '',
    body: cleanQuote(input.text),
    quote: '',
    category: '',
    tags: '', // as typed: «اشکانیان، ایران باستان»
    sourceTitle: input.article,
  }));
  const [cover, setCover] = useState<CoverMode>('none');
  const [upload, setUpload] = useState<string>();
  useEffect(() => () => void (upload && URL.revokeObjectURL(upload)), [upload]);
  const [report, setReport] = useState<Report | null>(null);
  const blob = useRef<Blob | null>(null); // ready before a tap, because share() has to run inside the tap

  const tags = useMemo(() => fields.tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean).slice(0, 3), [fields.tags]);
  const data = useMemo<ShareData>(
    () => ({
      ...fields,
      title: fields.title.trim(),
      body: fields.body.trim() || undefined,
      quote: fields.quote.trim() || undefined,
      category: fields.category.trim() || undefined,
      tags: tags.length ? tags : undefined,
      sourceUrl: input.url,
      coverImage: cover === 'article' ? input.thumbnail : cover === 'upload' ? upload : undefined,
      coverCredit: cover === 'article' ? 'تصویر: ویکی‌پدیا' : undefined,
      accentColor: prefs.accent,
      brandName: 'Wiki Course',
    }),
    [fields, tags, cover, upload, prefs.accent, input.url, input.thumbnail],
  );
  const template = templateOf(prefs.template);
  const format = formatOf(prefs.format);
  const plain: ShareInput = { title: data.title, text: [data.body, data.quote].filter(Boolean).join('\n\n'), article: data.sourceTitle ?? input.article, url: input.url };

  const guard = async (f: () => Promise<unknown>, ok?: string) => {
    try {
      await f();
      if (ok) toast(ok);
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast('انجام نشد؛ دوباره امتحان کن');
    }
  };
  const done = (c: HTMLCanvasElement, r: Report) => {
    setReport(r);
    blob.current = null;
    toBlob(c).then((b) => (blob.current = b));
  };
  const withBlob = (f: (b: Blob) => Promise<unknown>) => async () => {
    const b = blob.current ?? (await toBlob(document.querySelector<HTMLCanvasElement>('canvas[data-ready][data-preview]')!));
    if (b) await f(b);
  };
  const sendImage = () => guard(withBlob((b) => shareFile(b, shareText(plain))));
  const download = () => guard(withBlob(async (b) => downloadBlob(b, 'wiki-course.png')));
  const copyImg = () => guard(withBlob((b) => copyImage(b)), 'تصویر کپی شد');
  const copyText = () => guard(() => navigator.clipboard.writeText(shareText(plain)), 'متن کپی شد');
  const sendText = () => guard(() => navigator.share({ text: shareText(plain) }));
  const fileShare = canShareFile();
  const btn = `${ghost} flex-1 whitespace-nowrap`;

  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <div className="md:sticky md:top-0 md:self-start">
        <TemplatePreview template={template} data={data} format={format} onDone={done} />
        <p className="mt-2 text-center text-sm text-muted" dir="ltr">{format.w} × {format.h}</p>
      </div>
      <div className="min-w-0 space-y-5">
        <section aria-labelledby="tpl-title" className="space-y-2">
          <h3 id="tpl-title" className="text-sm font-semibold text-muted">قالب</h3>
          <TemplateSelector value={prefs.template} onChange={(id) => setPrefs({ ...prefs, template: id })} data={data} format={format} />
        </section>
        <TemplateControls
          values={fields}
          set={(p) => setFields((f) => ({ ...f, ...p }))}
          accent={prefs.accent}
          setAccent={(accent) => setPrefs({ ...prefs, accent })}
          format={prefs.format}
          setFormat={(f) => setPrefs({ ...prefs, format: f })}
          cover={cover}
          setCover={setCover}
          onUpload={(file) => {
            setUpload(URL.createObjectURL(file));
            setCover('upload');
          }}
          hasArticleImage={!!input.thumbnail}
          warn={report?.truncated ? 'متن برای این قالب کوتاه‌شده نمایش داده می‌شود' : report?.overflow ? 'همه‌ی محتوا در این قالب جا نمی‌شود؛ متن را کوتاه کن' : ''}
        />
        <div className="space-y-2">
          <div className="sticky bottom-0 bg-panel py-2">
            {fileShare ? (
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
          {!fileShare && <p className="text-sm leading-7 text-muted">این مرورگر اشتراک‌گذاری فایل را پشتیبانی نمی‌کند؛ تصویر را دانلود کن</p>}
          <div className="flex flex-wrap gap-2">
            {fileShare && (
              <button className={btn} onClick={download}>
                <Download className={ic} />
                دانلود تصویر
              </button>
            )}
            {canCopyImage() && (
              <button className={btn} onClick={copyImg}>
                <ImageIcon className={ic} />
                کپی تصویر
              </button>
            )}
            <button className={btn} onClick={copyText}>
              <ClipboardCopy className={ic} />
              کپی متن
            </button>
            {canShareText() && (
              <button className={btn} onClick={sendText}>
                <Share2 className={ic} />
                اشتراک متن
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
