import type { Course, Pack, Page } from '../types/course';
import { ROLE_LABEL, pathOf, topicKey } from './course';

/** What the exports need: the course, what the learner knows, their notes and any study packs (all keyed by topicKey). */
export type ExportCtx = { course: Course; known: Set<string>; notes: Record<string, string>; packs: Record<string, Pack> };

const isKnown = (c: ExportCtx, p: Page) => c.known.has(topicKey(p));
const oneLine = (s: string) => s.replace(/\s*\n+\s*/g, ' ').trim();
export const nextStep = (c: ExportCtx) => pathOf(c.course).find((s) => !isKnown(c, s.page))?.page ?? c.course.root;

/** The roadmap as Markdown: checkboxes for what you know, why each step is there, key points, flashcards and your notes. */
export function courseMarkdown(c: ExportCtx) {
  const { root } = c.course;
  const out = [`# دوره: ${root.title}`, '', root.url, '', `> ${oneLine(root.summary)}`, '', '## مسیر یادگیری', ''];
  pathOf(c.course).forEach((s, i) => {
    const p = s.page;
    const k = topicKey(p);
    out.push(`${i + 1}. [${isKnown(c, p) ? 'x' : ' '}] **${p.title}** — ${s.topic ? `${ROLE_LABEL[s.topic.role]} · ${s.topic.score}%` : 'موضوع اصلی'}`);
    if (s.topic?.why) out.push(`   - چرا: ${oneLine(s.topic.why)}`);
    if (p.summary) out.push(`   - خلاصه: ${oneLine(p.summary)}`);
    for (const kp of c.packs[k]?.keyPoints ?? []) out.push(`   - 🔑 ${kp}`);
    if (c.notes[k]?.trim()) out.push(`   - ✍️ یادداشت من: ${oneLine(c.notes[k])}`);
    out.push(`   - ${p.url}`);
  });
  const related = c.course.topics.filter((t) => t.role === 'related');
  if (related.length) {
    out.push('', '## مطالب مرتبط', '', ...related.map((t) => `- [${isKnown(c, t) ? 'x' : ' '}] **${t.title}** · ${t.score}% — ${oneLine(t.why)} ${t.url}`));
  }
  const decks = [root, ...c.course.topics].filter((p) => c.packs[topicKey(p)]?.cards.length);
  if (decks.length) {
    out.push('', '## فلش‌کارت‌ها');
    for (const p of decks) out.push('', `### ${p.title}`, '', ...c.packs[topicKey(p)].cards.map((x) => `- **س:** ${x.q}\n  **ج:** ${x.a}`));
  }
  out.push('', '---', `ساخته‌شده با Wiki Course · ${new Date().toLocaleDateString('fa')}`);
  return out.join('\n');
}

const intro = (c: ExportCtx) =>
  [
    `دارم «${c.course.root.title}» را یاد می‌گیرم (${c.course.root.url}).`,
    'مسیر یادگیری من (✓ = بلدم، ○ = هنوز نه):',
    ...pathOf(c.course).map((s, i) => `${i + 1}. ${isKnown(c, s.page) ? '✓' : '○'} ${s.page.title} — ${s.topic ? ROLE_LABEL[s.topic.role] : 'موضوع اصلی'}`),
  ].join('\n');

/** Ready-to-paste prompts for any chat AI, filled with this learner's roadmap and progress. */
export const PROMPTS: { id: string; label: string; build: (c: ExportCtx) => string }[] = [
  {
    id: 'tutor',
    label: 'معلم خصوصی برای گام بعدی',
    build: (c) => {
      const next = nextStep(c);
      const note = c.notes[topicKey(next)]?.trim();
      return `${intro(c)}

گام بعدی من: «${next.title}» (${next.url})
${note ? `توضیح خودم از آن تا الان: «${oneLine(note)}» — اول ایرادها و جاهای خالی همین توضیح را بگو.\n` : ''}
نقش تو: معلم خصوصی صبور من باش.
- اول با یک سؤال کوتاه بسنج چقدر می‌دانم.
- «${next.title}» را در بخش‌های کوتاه و با مثال‌های ملموس درس بده.
- بعد از هر بخش یک سؤال بپرس و منتظر جوابم بمان؛ اگر اشتباه گفتم با راهنمایی کمکم کن، نه با جواب مستقیم.
- در پایان در ۵ خط جمع‌بندی کن و بگو برای گام بعد آماده‌ام یا نه.`;
    },
  },
  {
    id: 'plan',
    label: 'برنامه‌ی مطالعه‌ی روزانه',
    build: (c) => `${intro(c)}

برای موضوع‌های ○ (به همین ترتیب) یک برنامه‌ی مطالعه‌ی روزانه بساز، روزی حدود ۳۰ دقیقه.
برای هر روز: هدف یادگیری، چه چیزی بخوانم (ترجیحاً همان مقاله‌ی ویکی‌پدیا)، یک تمرین کوتاه و یک سؤال خودآزمایی.
هر چند روز یک جلسه‌ی مرور بگذار (تکرار فاصله‌دار).`,
  },
  {
    id: 'quiz',
    label: 'از من امتحان بگیر',
    build: (c) => `${intro(c)}

از موضوع‌های ✓ (چیزهایی که فکر می‌کنم بلدم) از من امتحان بگیر؛ اگر هیچ ✓ ندارم، از پیش‌نیازها.
۸ سؤال مفهومی، یکی‌یکی. بعد از هر جواب منتظر بمان، بازخورد کوتاه بده و جواب درست را توضیح بده.
در پایان بگو کدام موضوع را باید دوباره مرور کنم.`,
  },
  {
    id: 'simple',
    label: 'ساده و با مثال توضیح بده',
    build: (c) => `${intro(c)}

«${c.course.root.title}» را برای کسی که تازه شروع کرده توضیح بده:
- با زبان ساده و یک تشبیه روزمره
- یک مثال واقعی
- اصطلاح‌های تخصصی را اول تعریف کن
- در پایان یک نقشه‌ی ذهنی متنی کوتاه از مفاهیم اصلی بکش.`,
  },
];

/** Save text as a file (browser only). */
export function download(name: string, text: string, type = 'text/markdown') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
