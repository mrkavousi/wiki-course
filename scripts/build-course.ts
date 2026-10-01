// Builds a course in Node and saves it as a bundled sample: body in public/courses/<key>.json, listed in src/data/samples.json
// (the app itself builds courses in the browser).
// Run: npm run build:course -- <wikipedia url>        (.env: AI_BASE_URL, AI_API_KEY, optional AI_MODEL)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import type { CourseRef } from '../src/types/course';
import { buildCourse } from '../src/lib/build';

try { process.loadEnvFile('.env'); } catch {}
const { AI_BASE_URL, AI_API_KEY, AI_MODEL = 'Gemini-2.5-Flash-lite' } = process.env;
const url = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!url || !AI_BASE_URL || !AI_API_KEY) {
  console.error('usage: npm run build:course -- <wikipedia url>   (.env needs AI_BASE_URL and AI_API_KEY)');
  process.exit(1);
}

try {
  const course = await buildCourse(url, { baseUrl: AI_BASE_URL, key: AI_API_KEY, model: AI_MODEL }, (m) => console.log(m));
  writeFileSync(`public/courses/${course.key}.json`, JSON.stringify(course, null, 1));
  const idx = 'src/data/samples.json';
  const list: CourseRef[] = existsSync(idx) ? JSON.parse(readFileSync(idx, 'utf8')) : [];
  const ref: CourseRef = { key: course.key, title: course.root.title, lang: course.root.lang, thumbnail: course.root.thumbnail };
  writeFileSync(idx, JSON.stringify([ref, ...list.filter((c) => c.key !== course.key)], null, 1));
  console.log(`${course.key}: ${course.topics.length} topics (${course.topics.map((t) => t.role[0]).join('')})`);
} catch (e: any) {
  console.error(e.message);
  process.exit(1);
}
