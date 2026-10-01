export type Role = 'prereq' | 'next' | 'related';

export type Page = { title: string; lang: string; url: string; summary: string; thumbnail?: string };
export type Topic = Page & { role: Role; score: number; why: string };
export type Course = {
  key: string;
  root: Page;
  topics: Topic[];
  sources: { title: string; url: string }[]; // web pages the model cited (empty: the gateway has no web search)
  note?: string;
  generatedAt: string;
};
export type CourseRef = { key: string; title: string; lang: string; thumbnail?: string };

/** Study material for one article: shared by every course that contains it. */
export type Card = { q: string; a: string };
export type Question = { q: string; options: string[]; answer: number; explain: string };
export type Pack = { key: string; lang: string; title: string; keyPoints: string[]; cards: Card[]; quiz: Question[]; generatedAt: string };

/** Important terms of one article (AI-picked, verified to occur in its text): bolded by the enhanced reader. */
export type Terms = { key: string; lang: string; title: string; terms: string[]; generatedAt: string };

export type Box = { box: number; due: string }; // Leitner box 1-5, next review day (YYYY-MM-DD)
/** Everything the learner owns; lives in this browser (and in backup files). Keys are topicKey()s. */
export type State = {
  known: string[];
  saved: Page[]; // "my library"
  recent: CourseRef[]; // courses built on this device
  notes: Record<string, string>; // own-words explanation per topic
  boxes: Record<string, Box>; // per card id `${topicKey}#${i}`
  quiz: Record<string, number>; // best quiz % per topic
  days: string[]; // days with learning activity (streak)
};

/** OpenAI-compatible chat endpoint (ArvanCloud AI gateway). */
export type AI = { baseUrl: string; key: string; model: string };
