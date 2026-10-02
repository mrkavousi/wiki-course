export const toBlob = (c: HTMLCanvasElement) => new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));

export function downloadBlob(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

const asFile = (b: Blob) => new File([b], 'wiki-course.png', { type: 'image/png' });
export const canShareFile = () => typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([], 'a.png', { type: 'image/png' })] });
export const canCopyImage = () => typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;
export const canShareText = () => typeof navigator.share === 'function';

export const shareFile = (b: Blob, text: string) => navigator.share({ files: [asFile(b)], text });
export const copyImage = (b: Blob) => navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]);
