export type Role = 'prereq' | 'next' | 'related';

export type Page = { title: string; lang: string; url: string; summary: string; thumbnail?: string };
export type Topic = Page & { role: Role; score: number; why: string };
export type Course = {
  key: string;
  root: Page;
  topics: Topic[];
  sources: { title: string; url: string }[]; // web pages the model cited (empty: the gateway has no web search)
  note?: string;
  opts?: BuildOpts; // how it was built; absent on older courses and bundled samples
  generatedAt: string;
};
export type Depth = 'quick' | 'standard' | 'deep';
export type Purpose = 'general' | 'exam' | 'work' | 'research';
export type BuildOpts = { depth: Depth; purpose: Purpose };
export type CourseRef = { key: string; title: string; lang: string; thumbnail?: string };

/** Study material for one article: shared by every course that contains it. */
export type Card = { q: string; a: string };
export type Question = { q: string; options: string[]; answer: number; explain: string };
export type Pack = { key: string; lang: string; title: string; keyPoints: string[]; cards: Card[]; quiz: Question[]; generatedAt: string };

/** Important terms of one article (AI-picked, verified to occur in its text): bolded by the enhanced reader. */
export type Terms = { key: string; lang: string; title: string; terms: string[]; generatedAt: string };

export type Box = { box: number; due: string }; // Leitner box 1-5, next review day (YYYY-MM-DD)
export type Grade = 'hard' | 'good' | 'easy';
export type Day = { cards: number; known: number; quiz: number; sec: number }; // one day of activity
/** Everything the learner owns; lives in this browser (and in backup files). Keys are topicKey()s. */
export type State = {
  known: string[];
  saved: Page[]; // "my library"
  recent: CourseRef[]; // courses built on this device
  notes: Record<string, string>; // own-words explanation per topic
  boxes: Record<string, Box>; // per card id `${topicKey}#${i}`
  quiz: Record<string, number>; // best quiz % per topic
  days: string[]; // days with learning activity (streak)
  meta: Record<string, { last: number; archived?: boolean }>; // per courseKey: last activity (ms) and archive flag
  log: Record<string, Day>; // per YYYY-MM-DD: what was done that day (weekly progress, insights)
  pos: Record<string, number>; // reader scroll position 0-1 per topic
  goal: number; // active days per week the learner aims for
  onboarded: boolean; // the first-visit tips were dismissed
  lastBackup: string; // ISO time of the last backup download or restore
  usage: Usage[]; // log of AI calls (newest last, capped), for the cost stats in settings
  price: { in: number; out: number }; // toman per 1M input / output tokens, to estimate cost from `usage`
};

export type UsageKind = 'course' | 'pack' | 'terms' | 'test';
/** One answered AI call. `est` = the gateway sent no token counts, so they were guessed from text length; `retry` = a re-ask after a weak reply. */
export type Usage = { t: number; kind: UsageKind; model: string; inT: number; outT: number; est?: boolean; retry?: boolean };

/** OpenAI-compatible chat endpoint (ArvanCloud AI gateway). */
export type AI = { baseUrl: string; key: string; model: string };
