# Wiki Course — Handover

For developers and AI agents picking this project up. Read this first, then `AGENTS.md` (the short rule list) and `graphify-out/GRAPH_REPORT.md` (the code map).

- **Status (2026-10-02):** v0.4.0 (see `CHANGELOG.md`): the v0.3 product (app shell, dashboard, builder, library, insights) with a visual redesign, an installable offline PWA, and About, Privacy and 404 pages. Live at https://wiki-course.vercel.app. Source: github.com/mrkavousi/wiki-course. Every push to `main` auto-deploys on Vercel (about 20 s).
- **Stack:** React 19, TypeScript 7, Vite 8, Tailwind 4 (`@tailwindcss/vite`), `lucide-react` (and `gsap` for the landing page only). About 4,500 lines of TypeScript in `src/` and `scripts/`. No backend, no database, no server-side environment variables.
- **Language:** the UI, README and AI-generated content are Persian (RTL). Code, comments, commits and this document are English.

## 1. What it is

Paste a Wikipedia link (any language) and get a **course**: prerequisites, next steps and related articles, each with a thumbnail, a summary, an AI score (0–100) and a one-sentence reason. The learner:

- follows the course as a Duolingo-style **roadmap** or a radial **graph**, and marks topics as known;
- reads any article in an in-app **reader** (easy mode, or enhanced mode with AI-picked key terms in bold);
- builds a per-topic **study pack** on demand (key points, 6 flashcards, 4 quiz questions) and reviews cards with Leitner boxes;
- saves topics to a **library**, writes own-words notes (Feynman technique), and keeps a day streak;
- exports the roadmap as Markdown or copies one of 4 ready-made prompts for ChatGPT, Gemini or Claude;
- backs everything up to a JSON file to move it to another device.

It is a personal, local-first tool: all learner data lives in the browser.

| Route (hash) | Component | Purpose |
|---|---|---|
| `#/` (new visitors), `#/welcome` | `LandingPage` | marketing story with real screenshots; returning visitors are redirected from `#/` to `#/app` (see `useRoute` in `store.ts`) |
| `#/app` | `Home` | dashboard: builder strip, the one next action, today's review, active courses, weekly progress, suggestions |
| `#/new` (`?url=` or `?q=`) | `CourseBuilder` | paste a link or type words (Wikipedia search), preview the article, choose depth and purpose, build; progress is a blurred modal with named stages |
| `#/library` | `Library` | search, filters (language, status, subject), sort, grid/list, favourite, archive, delete |
| `#/c/<courseKey>` (`?t=<topicKey>`) | `CourseView` with `Roadmap`, `CourseGraph`, `TopicDetail` | course overview (cover, level, progress, mastery) and the selected topic (tabs: about, flashcards, quiz). With `?t=` a phone shows that topic as its own screen with a breadcrumb (Back returns to the path); desktop keeps two panes and keeps the address in sync |
| `#/read/<lang>/<title>` (`?c=<courseKey>`) | `Reader` | article reader (needs no AI in easy mode); remembers the scroll position; reading progress, card contents (sticky column on desktop) and a settings popover (mode, size, font, background, chapter cards, language), focus mode, copy/share of chapters and selected text (`utils/shareImage.ts`, `ShareDialog`, `SelectionBar`). With `?c=` it offers the course's next topic |
| `#/review` | `Review` | today's due flashcards across all topics, three ratings |
| `#/discover` | `Discover` | unstarted sample courses and next topics from your own courses |
| `#/import?d=<gzip+base64url>` | `Import` | opens a share or transfer link: previews what is inside and adds it only after confirmation |
| `#/settings` | `Settings` | theme, weekly goal, AI endpoint, backup and restore, delete all data |
| `#/insights` | `Insights` | weekly goal, activity, weak topics, quiz results, course completion |

`AppShell` wraps every route: sidebar on desktop, bottom bar and a hamburger drawer on phones, a top bar with search (Ctrl/Cmd+K), due count, streak and theme. Settings is the `#/settings` page (theme, weekly goal, AI endpoint, backup/restore, delete all data).

## 2. Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # assertions for all pure logic (src/utils/course.check.ts) - must pass
npm run build      # tsc && vite build: exactly what Vercel runs
npm run preview    # serve dist/ (a production-like check)
```

Node 20 or newer (developed on 24).

**AI settings.** Open Settings (`#/settings`) and enter the gateway URL (up to `/v1`), the API key and the model (default `Gemini-2.5-Flash-lite`). They are stored only in this browser's localStorage. Without them you can still open the sample courses, read articles in easy mode, and use everything that needs no AI. Building courses, study packs and key terms needs them.

**Node CLI (optional).** `.env` (gitignored; see `.env.example`) holds `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`. Then `npm run build:course -- <wikipedia url>` builds a course in Node, writes `public/courses/<courseKey>.json` and registers it in `src/data/samples.json`. The browser app never reads `.env`.

## 3. Architecture

```
Browser (React SPA, static files on Vercel)
  |-- Wikipedia: REST page summary + Action API       (CORS: origin=*)   src/lib/build.ts
  |-- AI gateway: OpenAI-compatible /chat/completions (CORS: *)          src/lib/build.ts
  '-- Storage: localStorage (state, prefs, AI settings)
               Cache Storage "wiki-course" (courses, packs, terms)       src/data/store.ts
```

The browser calls both services directly, so requests come from the user's own network and no server is needed. (Google's own AI endpoints were unreachable from the owner's network, HTTP 403, which is why an Iranian OpenAI-compatible gateway is used.)

### Module map

| Path | Responsibility |
|---|---|
| `src/App.tsx` | state and orchestration: route switch, `build(url, {opts, force})`, `read()`, theme, search shortcut, learning-time ticker |
| `src/data/store.ts` | **all persistence and routing:** guarded `local`, `kv` (Cache Storage with a localStorage fallback), `SAMPLES`, `findCourse`/`saveCourse`, `loadPack`/`savePack`, `loadTerms`/`saveTerms`, `backupJson`/`restoreJson`, AI settings, `applyTheme`; hooks `useStore` (learner state and actions), `useCourses` (loads full courses for a list, cached), `deleteCourse`, `wipeAll`, `useReaderPrefs`, `useRoute`; `courseHref`/`readHref` |
| `src/data/samples.json` | list of bundled sample courses (their bodies are `public/courses/*.json`) |
| `src/lib/build.ts` | **network and AI** (browser and Node): Wikipedia fetchers, `previewArticle` (builder preview), `searchArticles` (builder search), `fetchLangLinks` (reader language picker), `DEPTH_CAP`, `getJson` retry, `chat`, `askJson`, prompts, `buildCourse`, `buildPack`, `buildTerms`, `fetchArticle`, `testAI` |
| `src/utils/course.ts` | pure: `topicKey`, `courseKey`, `parseWikiUrl`, `extractJson`/`extractLists`, `cleanItems`, `cleanPack`, `pathOf` |
| `src/utils/learn.ts` | pure: Leitner `rate(prev, 'hard'\|'good'\|'easy')`, `nextInterval`, `nextDue`, `dueIds`, `streak`, `mergeBackup`, `PASS`, `EMPTY_STATE` |
| `src/utils/progress.ts` | pure: `courseStats` (done, status, due), `weekStats`, `nextAction` (the single recommended CTA), `weakTopics` |
| `src/utils/subject.ts` | pure: `subjectOf` keyword classifier (math, physics, code, history, biology) and `seed`; drives the cover art |
| `src/utils/usage.ts` | pure: `estimateTokens`, `costOf`, `summarize` (today / 7 days / all, by kind) for the cost stats in settings; `lib/build.ts` calls `setUsageSink` per answered AI call and `App` wires it to `store.logUsage` |
| `src/utils/export.ts` | pure: `courseMarkdown`, `PROMPTS`, `nextStep`; plus `download` (browser only) |
| `src/utils/reader.ts` | pure: `parseArticle`, `termRegex`, `cleanTerms`, `boldSegments`, `outline` |
| `src/utils/course.check.ts` | the only test file: asserts for every pure function above |
| `src/types/course.ts` | all shared types (`Course`, `Topic`, `Pack`, `Terms`, `State`, `AI`, ...) |
| `src/components/*` | one folder per component; `ui.ts` has shared class strings (`btn`, `primary`, `ghost`, `outline`, `card`, `iconBtn`, `field`, `ic`, `chip`), `fa()` (Persian digits), `ago()`, `inDays()`, `fmtMinutes()`. Shared pieces: `Cover`, `CourseCard`, `Progress` (`ProgressBar`, `ActivityChart`, `Heatmap`, `StreakWidget`), `States` (`EmptyState`, `ErrorState`, `Skeleton`), `Toast` (`useToast`), `ConfirmModal`, `SearchCommand`, `CourseView/ExportMenu` (portal popover on desktop, bottom sheet on phones) |
| `src/components/Pages/Pages.tsx` | `About`, `Privacy`, `NotFound` and the `Footer` shown under static pages (routes `about`, `privacy`, `notfound` in `useRoute`; an unknown `#/x` is `notfound`, a bare `#main` stays home) |
| `src/index.css` | `@font-face` for the self-hosted font, Tailwind `@theme`: color tokens (dark values in `@theme`, light palette in `[data-theme=light]`), type scale, reduced-motion guard, and utilities `.page-in`, `.dots`, `.term-flash`, `.hero-bg`, `.text-grad`, `.glass`, `.shimmer`, `.stagger`, `.pop`, `.flip-in`, `.edge`, `.drawer`, `.sheet`, `.rail` (a card row that becomes a swipeable rail below 640 px) |
| `public/sw.js`, `public/manifest.webmanifest` | PWA: the service worker (registered in `src/main.tsx`, production only) caches same-origin GETs; icons, `og.png` and `fonts/` live beside them |
| `index.html` | RTL shell, font preload, manifest and `og:*` tags, inline pre-paint theme script (**must stay in sync with `applyTheme`**) |
| `scripts/build-course.ts` | Node CLI around `buildCourse` |

Rule of thumb: logic that needs no browser and no network goes in `utils/` (and gets an assert in `course.check.ts`); network and AI in `lib/build.ts`; anything that persists or routes in `data/store.ts`; React in `components/`.

### Main flows

1. **Build a course** (`App.build` → `buildCourse`): the builder first turns words into a link (`searchArticles`, debounced), then parse the URL → `summary()` and `leadLinks()` in parallel → `askJson(coursePrompt)` returns prereq/next/related → each title is verified with `resolve()` (REST summary, then a search fallback; the model often misses ی/ي, ZWNJ or capitalisation) → titles are de-duplicated across roles → `saveCourse` + `addRecent` → navigate to `#/c/<key>`.
2. **Study pack** (`CourseView.makePack` → `buildPack`): first 8,000 characters of the article text → `askJson(packPrompt)` → `cleanPack` → `savePack`.
3. **Reader** (`Reader`): `fetchArticle` returns the whole plain-text extract → `parseArticle` → sections. Enhanced mode: `loadTerms`, or `buildTerms` (an outline goes to the AI; `cleanTerms` keeps only terms that really occur in the text) → `termRegex` + `boldSegments` bold each term at its first mention per section.

## 4. Data model and compatibility rules

- `topicKey(page) = "<lang>:<title>"` identifies an article inside learner state.
- `courseKey(lang, title) = "<lang>-<title with runs of non-letters/digits replaced by _>"` is the storage key for courses, packs and terms, and the sample file name.
- `State` (localStorage `wc:state`): `known: topicKey[]`, `saved: Page[]`, `recent: CourseRef[]`, `notes: {topicKey: text}`, `boxes: {"<topicKey>#<cardIndex>": {box 1-5, due YYYY-MM-DD}}`, `quiz: {topicKey: best %}`, `days: YYYY-MM-DD[]`. Added in v0.3 (all with defaults in `EMPTY_STATE`): `meta: {courseKey: {last, archived?}}` (last activity, archive flag), `log: {day: {cards, known, quiz, sec}}` (feeds weekly progress and insights; `sec` is foreground time on study pages in 15 s ticks), `pos: {topicKey: 0-1}` (reader scroll), `goal` (active days per week, default 5), `onboarded`, `lastBackup` (ISO). Added after v0.4: `usage: {t, kind: course|pack|terms|test, model, inT, outT, est?, retry?}[]` (one row per answered AI call, newest 1000; `est` = token counts guessed from text length because the gateway sent no `usage`) and `price: {in, out}` (toman per 1M tokens, default 26,000 / 104,000 for Gemini 2.5 Flash-lite on ArvanCloud). Cost shown in settings = tokens x price: an estimate, never the invoice.
- Cache Storage cache `wiki-course`, synthetic URLs `/__kv/<encoded "prefix/key">`, prefixes `course/`, `pack/`, `terms/`. Where `caches` is unavailable (insecure context) the same keys go to localStorage as `wc:kv:<prefix/key>`.
- Other localStorage keys: `wc:ai` (`{baseUrl, key, model}`), `wc:theme` (`auto|light|dark`), `wc:reader` (`{mode: easy|enhanced, size: 0-4}`). The old `wiki-course:known` is migrated once.
- `Course.opts?: {depth: quick|standard|deep, purpose: general|exam|work|research}` records how a course was built (absent on older courses and samples). Depth caps the topics requested per role (3 / 5 / 8; 5 was the old behaviour) and purpose adds one line to the prompt.
- Backup file: `{app: "wiki-course", version: 2, exportedAt, state, courses[], packs[], terms[]}`. It never contains the AI settings. The usage log is inside `state` (merged by `mergeUsage`, de-duplicated and capped); `price` is a local preference and is never imported from a file (`sanitizeState` ignores it). Restore merges state (`mergeBackup`: a day's counters keep the larger value, `meta` and `pos` take the backup's) and overwrites kv entries. Version 1 files still restore; a version above the app's is rejected with a message, and nothing is changed on any failure.

**Compatibility rules (users' data lives in their browsers, so these are hard rules):**

1. The formats of `topicKey` and `courseKey` must not change without a migration. They are persisted in browsers and in sample file names.
2. `State` fields are additive only. New fields need a default in `EMPTY_STATE` (loading does `{...EMPTY_STATE, ...stored}`).
3. kv payload shapes are additive only.
4. A breaking change to the backup format bumps `version`, and `restoreJson` must keep reading older versions.

## 5. AI integration

- **Contract:** `POST <baseUrl>/chat/completions`, header `Authorization: apikey <key>`, body `{model, messages: [{role: "user", content}]}`, reads `choices[0].message.content`. No streaming, no tools, **no web search**. Model: Gemini 2.5 Flash-lite through the ArvanCloud AI gateway. The gateway URL contains a secret token in its path, so `getJson` puts only the host in error messages.
- **Observed quirks:** the gateway sometimes answers with an empty string, with just an opening code fence, or with half a JSON object, always with `finish_reason: stop` and whatever `max_tokens` says. The model sometimes writes broken JSON and invents titles.
- **`askJson(ai, prompt, keys, status, judge)`:** up to `TRIES = 6` attempts with growing sleeps. `extractLists` parses the whole JSON or salvages every complete item from truncated text. `judge.clean` normalises, `judge.enough` decides when to stop, and otherwise the fullest result wins. If nothing is usable it throws a Persian error message.
- **Prompt rules:** English instructions, Persian outputs; "raw JSON, no code fence"; put the most important keys first (truncation loses the tail); keep outputs small.
- **Trust rules:** never trust the model. Titles are verified on Wikipedia, terms must occur in the article text, scores are clamped to 0–100, lists are capped. Wikipedia and AI text is always rendered as React text. **Never use `dangerouslySetInnerHTML` for it.**
- **Recipe for a new AI-generated artifact** (this is exactly how `Terms` was added):
  1. type in `types/course.ts`;
  2. pure cleaner in `utils/`;
  3. prompt and builder in `lib/build.ts` using `askJson` with a `Judge`;
  4. `load`/`save` in `store.ts` under a new kv prefix;
  5. include it in `backupJson`/`restoreJson`;
  6. asserts in `course.check.ts`.
- **Wikipedia:** the browser sends `Api-User-Agent` (it cannot set `User-Agent`), Node sends `User-Agent`. `getJson` retries 429 and 5xx up to 4 times, honouring `Retry-After` (capped at 20 s).

## 6. UI conventions

- **Language and layout:** UI strings are Persian; digits go through `fa()`. Use logical Tailwind classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Put `dir="auto"` on any Wikipedia or AI text (English articles must lay out left to right) and `dir="ltr"` on URLs and keys. In RTL the "back" arrow is `ArrowRight`.
- **Icons:** `lucide-react` only, sized with the `ic` class (`size-[1.15em]`). **No emoji or pictographic symbols anywhere**, including exports.
- **Colors:** semantic tokens only (`accent-soft`, `surface-2`, `gold` for fills, `info`, `coral`, and `sub-math`/`sub-physics`/`sub-code`/`sub-history`/`sub-biology` for subject colours) (`bg-bg`, `bg-panel`, `text-fg`, `text-muted`, `border-line`, `text-accent`, `text-on-accent`, `prereq`/`next`/`related`, `danger`). Never hard-code hex. In SVG use `fill-*`/`stroke-*` classes or `var(--color-*)` in `style`.
- **Text size:** the scale lives in `index.css` (`text-xs` = 13 px, `text-sm` = 15 px, body 16 px, relaxed line-heights for Persian). Nothing may render smaller than 13 px, including SVG labels at zoom 1. Inputs must be 16 px or larger (iOS Safari zooms smaller ones).
- **Touch and shape:** interactive controls are at least 44 px (`btn` has `min-h-11`, `iconBtn` is `size-11`); cards use `rounded-2xl` and controls `rounded-xl`; status is always an icon plus a word, never colour alone.
- **Other:** animations use `motion-safe:` (and `index.css` has a global reduced-motion guard); icon-only buttons need `aria-label`; toggles use `aria-pressed`.
- Comments explain *why*. A `ponytail:` prefix marks a deliberate shortcut and its ceiling (`grep -rn "ponytail:" src scripts`).

## 7. Verifying a change

1. `npm run check`, then `npm run build`.
2. **From a clean clone:** `git clone <repo> /tmp/x && cd /tmp/x && npm ci && npm run build`. A stray `~/node_modules/@types/node` once hid a missing dependency locally and broke the first Vercel deploy.
3. `npm run preview` and look at it: light and dark, a 390 px wide viewport (no horizontal scroll), a Persian article and an English one, no console errors.
4. **Contrast** (checked 2026-10-02, WCAG ratios): every text token reaches 4.5:1 on `bg`, `panel` and `accent-soft` in both themes (re-checked 2026-10-02 for v0.4.0 after the teal palette). The light `prereq` is now `#7f5c0e` and `info` `#456a82`. The light `danger` is `#ae4341`, slightly darker than the brief's `#b94a48`, because error text on its own 10% tint needs 4.5:1; `prereq` text is an amber because the brand yellow `#e9b949` is only for fills.
5. **Browser tests:** `PW_CHANNEL=chrome npm run test:e2e` (23 tests, Wikipedia and the AI stubbed). Playwright's own Chromium download is unsupported on macOS 13, so use the installed Chrome there. Cover when extending the suite: sample course opens; build a course (needs an AI key); mark known, reload, progress persists; build a pack, flip a card, take the quiz; reader easy and enhanced; backup then restore in a fresh profile; no emoji; no text under 13 px.

## 8. Deployment

Vercel imports the GitHub repo. Framework preset Vite, build `npm run build` (`tsc && vite build`), output `dist`, **no environment variables**. Routing is hash-based, so no rewrites are needed. A failing deploy is almost always a `tsc` error, because type-checking is part of `build`. Each device enters its own AI settings once. The service worker (`public/sw.js`) is cache-first, so `/courses/*.json` can be stale until its `CACHE` name is bumped; bump it when you change a bundled course.

## 9. Known issues and tech debt

1. **`courseKey` collisions.** `C++` and `C#` both become `en-C_`; so do `AT&T` and `AT T`. The second course, pack or terms entry overwrites the first. Fix with a short hash of the exact title, plus a migration (see compatibility rule 1).
2. **Duplicate `fa()`** in `components/ui.ts` and (private) in `lib/build.ts`. Move one copy to `utils/format.ts`.
3. **AI quality.** Scores and reasons are estimates (no web search). Results are sometimes thin: the Quantum mechanics sample has only 4 topics. "ساخت دوباره" rebuilds a course.
4. **Reader limits.** Plain-text extracts drop formulas (shown as a "formula" chip), tables, image captions and list bullets. No scroll restore, no offline. The section skip-list for references (`parseArticle`) only covers English and Persian headings.
5. **No linter or formatter.** Pure logic is checked by one assert script; browser flows by a Playwright smoke suite (`tests/smoke.spec.ts`, `npm run test:e2e`, Wikipedia and the AI stubbed; locally `PW_CHANNEL=chrome npm run test:e2e` reuses installed Chrome). CI (`.github/workflows/ci.yml`) runs `npm ci`, `npm run check`, `npm run build` and the e2e suite on pull requests and pushes to `main`. `npm run check` fetches `tsx` through `npx --yes` each time instead of declaring it.
6. **No accounts, by decision.** There is no server and no sync. Data moves by backup file, by a course share link (course plus study packs, no progress) or by a transfer link (a whole backup). A link is the backup JSON gzipped (`CompressionStream`) into the URL fragment, which browsers never send to a server; `MAX_LINK` (200 KB) refuses larger ones (a course is 2 to 5 KB, all eight samples 16 KB). Anyone holding a transfer link can read the notes in it. **Everything that comes in, from a link or a file, goes through `utils/share.ts` (`sanitizeCourse`, `sanitizePack`, `sanitizeTerms`, `sanitizeState`)**: keys must match their article, links are rebuilt as Wikipedia-only URLs, numbers are clamped, scalars (goal, onboarded, lastBackup) are never imported, decompression is capped at 5 MB. Keep that rule when adding stored data: extend the sanitizer and its asserts.
7. **CORS dependency.** The static design relies on the gateway's `Access-Control-Allow-Origin: *`. If that changes, a small serverless proxy is needed.
8. **Docs.** `README.md` is Persian only. `public/courses/en-Linear_algebra.json` is hand-made (marked by its `note`), not AI output.
9. **Graph layout** is a fixed ring; with more than about 30 nodes labels will overlap.

10. **Builder outline is an estimate.** The real outline needs the AI call, so the builder shows counts and time from the chosen depth; `buildCourse` has no partial-success mode (a failure keeps nothing).
11. **Level** (`levelOf` in `utils/progress.ts`) is a heuristic from the number of prerequisites, labelled "approximate"; it is not an assessment. The builder's "minutes a day" only estimates the number of days and is not stored. Covers come from the keyword classifier in `utils/subject.ts` (`other` is a neutral dot pattern).
12. **Review and missing packs.** A due card whose pack is gone from Cache Storage cannot be shown. The review page says so (progress is kept) instead of claiming everything is done; the header badge still counts it.
13. **Swipe grading** (right = good, left = hard, after flipping; touch and pen only) is a shortcut; the three buttons remain the accessible path. There is no "easy" swipe.
14. **Not built, by decision:** interface language (the UI is Persian only; English is a large translation job), notification settings and a content-language preference (no feature behind them yet). Vazirmatn stays the only font, self-hosted in `public/fonts` (copied from the `@fontsource/vazirmatn` package, which is deliberately not a dependency). Empty states get subject artwork from the same generated motifs as covers; there is no hand-drawn illustration set.
15. **Still not done:** accounts and live sync, analytics, error monitoring, notifications. Done in v0.4.0: PWA install and offline shell, social preview, About, Privacy and 404 pages.
16. **Flashcards flip** is a single-face `flip-in` animation, not a two-face 3D flip: rendering both faces would make the hidden answer count as visible to tests and screen readers.

## 10. Suggested next steps

- Fix `courseKey` collisions (with migration) and dedupe `fa()`.
- Move the asserts to Vitest; add the Playwright smoke suite from section 7.
- Grounded scoring: use a search-capable model or a search API and store the sources in `Course.sources` (the field exists and is empty today).
- Reader: real math (Parsoid/MathML images), scroll restore, offline cache.
- Global text-size setting (the type scale is rem-based, so setting `html` font-size scales everything).
- English UI and English README; optional share-by-link for a course; PDF/print export; optional sync.

## 11. Working with the knowledge graph (graphify)

`graphify-out/` holds a graph of the code and docs, built with graphify (`pip install graphifyy`). `.graphifyignore` leaves out sample data and config JSON.

- `GRAPH_REPORT.md`: communities, most-connected nodes, surprising links. `graph.html`: interactive view (open it in a browser). `graph.json`: the raw graph.
- **Most-connected nodes:** `fa()`, `topicKey()`, `courseKey()`, `App()`, `buildCourse()`, `Reader()`. The two key functions are used everywhere, which is why compatibility rule 1 exists.
- Useful commands (run from the repo root):

```bash
graphify query "how does the enhanced reader choose terms to bold?"
graphify explain "buildTerms()"
graphify path "Reader()" "chat()"          # Reader() -> buildTerms() -> askJson() -> chat()
graphify affected "topicKey()" --depth 1   # blast radius BEFORE changing a hub
graphify update .                          # refresh the code part of the graph (AST only, no LLM, seconds)
```

- After changing code structure, run `graphify update .` and commit `graphify-out/graph.json`, `graph.html` and `GRAPH_REPORT.md`. Do not hand-edit them. Machine-local files in `graphify-out/` are gitignored.
- What `graphify update .` does (checked): it keeps the nodes derived from the docs, adds the headings of Markdown files as nodes, renames the communities after their hub function, and writes a dated backup folder `graphify-out/YYYY-MM-DD/` (gitignored). It never calls an LLM, so edits to `README.md`, `HANDOVER.md`, `AGENTS.md` or `index.html` are only picked up structurally; for the concept-level links run `/graphify . --update` in an agent session.
- The corpus is small (~15k words): the graph is a navigation aid, not a replacement for reading the code. About 4% of edges are `INFERRED` (they come from the docs) and the rest are `EXTRACTED` from the AST.

## 12. Contributing

- Branch `feat/<topic>` or `fix/<topic>`; small PRs. Commit subject in the imperative, up to about 72 characters, with a body that says *why* (`git log` shows the style). AI agents add their co-author trailer.
- **PR checklist:**
  - [ ] `npm run check` and `npm run build` pass, and `npm ci && npm run build` passes in a clean clone
  - [ ] UI changes checked in light and dark, at 390 px wide, RTL, plus an English article if the reader changed
  - [ ] no emoji, no text under 13 px, colors from tokens only
  - [ ] new persisted fields are additive and included in backup/restore
  - [ ] no secrets; the gateway URL contains a token and must not appear in code, logs or screenshots
  - [ ] graph refreshed (`graphify update .`) if the structure changed
- **Versioning:** [Semantic Versioning](https://semver.org/spec/v2.0.0.html), `MAJOR.MINOR.PATCH`, with the single source of truth in `package.json` (`version`, mirrored in `package-lock.json`). While below 1.0.0, a **minor** bump is a user-visible feature or redesign (it may change behaviour) and a **patch** is a fix or internal change with no new feature. **1.0.0** is the first release that promises backup/share-link compatibility under compatibility rule 4 without caveats; after it, a breaking change to stored data or the backup format is a **major** bump. Every release: move `[Unreleased]` entries in `CHANGELOG.md` under a dated version heading, bump `package.json` and the lock file (`npm version <level> --no-git-tag-version`), commit as `Release vX.Y.Z`, and tag `vX.Y.Z` (annotated). Do not bump the version in feature commits.
- **Dependencies:** the only runtime dependencies are `react`, `react-dom` and `lucide-react`. Ask before adding one.
- **Agents:** do not commit or push unless asked; do not touch `main` without authorisation; keep diffs minimal and in the existing style; never print or commit `.env`.

## 13. Glossary

- **Course:** one root article plus up to about 15 scored topics (`Course` in `types/course.ts`, stored by `courseKey`).
- **Topic:** an article inside a course with a `role` (`prereq`, `next` or `related`), a `score` and a `why`.
- **Path (`pathOf`):** prerequisites by score (highest first), then the root article, then next steps. Related topics sit beside the path, not on it.
- **Known:** the learner's own mark for an article. It is shared by all courses (keyed by `topicKey`). A quiz score of 75% or more sets it automatically (`PASS`).
- **Pack:** key points, flashcards and quiz for one article, built on demand. **Terms:** the key terms the enhanced reader bolds.
- **Leitner boxes:** 1–5, gaps 1, 2, 4, 8 and 16 days. Ratings: hard moves down one box (floor 1) and is due tomorrow, good up one, easy up two.
