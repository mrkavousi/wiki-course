// The text side of sharing a piece of an article: what is copied or sent. The picture is made by src/share/.
import { FORMULA } from './reader';

export type ShareInput = { text: string; title?: string; article: string; url: string; thumbnail?: string };

const SITE = 'wiki-course.vercel.app';

/** Quote text without the formula placeholders and with tidy spaces. */
export const cleanQuote = (t: string) =>
  t.replaceAll(FORMULA, ' ').split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n\n');

/** The text that is copied or sent: the quote, where it comes from (CC BY-SA asks for that) and the link. */
export function shareText({ text, title, article, url }: ShareInput) {
  return [title, cleanQuote(text), `— از مقاله‌ی «${article}» در ویکی‌پدیا\n${url}`, `Wiki Course · ${SITE}`].filter(Boolean).join('\n\n');
}
