// Subject of an article from keywords, so every course gets a fitting cover without an extra AI field.
export type Subject = 'math' | 'physics' | 'code' | 'history' | 'biology' | 'other';

export const SUBJECT_LABEL: Record<Subject, string> = {
  math: 'ریاضی',
  physics: 'فیزیک',
  code: 'برنامه‌نویسی',
  history: 'تاریخ',
  biology: 'زیست‌شناسی',
  other: 'عمومی',
};

// Persian and English stems; the first subject with the most hits wins (title hits count double).
const WORDS: Record<Exclude<Subject, 'other'>, RegExp> = {
  math: /ریاضی|جبر|هندسه|حساب|ماتریس|بردار|معادله|احتمال|آمار|math|algebra|geometry|calculus|matrix|vector|equation|probability|statistic|theorem/i,
  physics: /فیزیک|کوانتوم|مکانیک|نسبیت|انرژی|نیرو|موج|ذره|اتم|physics|quantum|mechanic|relativity|energy|particle|thermodynamic|optic/i,
  code: /برنامه‌نویسی|برنامه نویسی|نرم‌افزار|رایانه|کامپیوتر|الگوریتم|یادگیری ماشین|هوش مصنوعی|programming|software|computer|algorithm|machine learning|artificial intelligence|python|javascript|database/i,
  history: /تاریخ|شاهنشاهی|امپراتوری|جنگ|سلسله|باستان|پادشاه|history|empire|dynasty|war\b|ancient|kingdom|revolution|medieval|century/i,
  biology: /زیست|سلول|ژن|ژنتیک|گیاه|جانور|تکامل|پزشکی|biology|cell\b|gene|genetic|species|evolution|organism|anatomy|protein|ecolog/i,
};

export function subjectOf(p: { title: string; summary?: string }): Subject {
  let best: Subject = 'other';
  let top = 0;
  for (const [s, re] of Object.entries(WORDS) as [Exclude<Subject, 'other'>, RegExp][]) {
    const n = (re.test(p.title) ? 2 : 0) + (re.test(p.summary ?? '') ? 1 : 0);
    if (n > top) [best, top] = [s, n];
  }
  return best;
}

/** Small stable number from a title, for varying a cover's pattern. */
export const seed = (title: string) => [...title].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
