// Sample content for tests and visual checks: the Parthian-empire article and the seven cases a template must survive.
import type { ShareData } from './types';

export const DEMO: ShareData = {
  title: 'به قدرت رسیدن یک امپراتوری',
  body: 'پیش از آنکه ارشک دودمان اشکانی را بنیان‌گذاری کند، رئیس قبیله پرنی از قبایل آسیای میانه و یکی از چندین قبیله عشایر متحد بوده. پرنی‌ها در سرزمین داهه در شمال پارت زندگی می‌کردند و یکی از قبایل هم پیمان داهه بودند.',
  quote: 'اینکه چرا سال ۲۴۷ پ.م به‌عنوان اولین سال حکومت اشکانی در نظر گرفته می‌شود، موضوعی تاریخی و قابل بررسی است.',
  sourceTitle: 'شاهنشاهی اشکانی',
  sourceUrl: 'https://fa.wikipedia.org/wiki/شاهنشاهی_اشکانی',
  category: 'تاریخ',
  tags: ['اشکانیان', 'ایران باستان'],
  brandName: 'Wiki Course',
};

const more = 'سلسله‌ی اشکانی بیش از چهار سده بر بخش بزرگی از غرب آسیا فرمان راند و میان روم و چین پیوند بازرگانی برقرار کرد. ';

export const CASES: Record<string, ShareData> = {
  short: { ...DEMO, title: 'اشکانیان', body: 'سلسله‌ای ایرانی در دوران باستان.', quote: undefined, tags: undefined },
  medium: DEMO,
  long: { ...DEMO, title: 'به قدرت رسیدن یک امپراتوری بزرگ در شرق جهان باستان و پیامدهای آن برای ایران', body: `${DEMO.body} ${more.repeat(10)}`, quote: `${DEMO.quote} ${DEMO.quote}` },
  mixed: { ...DEMO, title: 'Wiki Course و هوش مصنوعی: AI در 2026', body: 'ساخت دوره با OpenAI و رابط React انجام می‌شود. متن مقاله با مجوز CC BY-SA 4.0 از ویکی‌پدیا گرفته شده و در سال 2026 هم به‌روز است. نام Wiki Course کنار متن فارسی درست نمایش داده می‌شود.', quote: 'The best way to learn is to build: یادگیری با ساختن بهتر است.' },
  noImage: { ...DEMO, coverImage: undefined },
  noQuote: { ...DEMO, quote: undefined },
};
