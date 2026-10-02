# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 94 files · ~123,538 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 679 nodes · 2223 edges · 26 communities (25 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b77c04b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- ui.ts
- store.ts
- Changelog
- CourseView.tsx
- shared.ts
- ShareStudio.tsx
- vite.config.ts
- CourseBuilder.tsx
- capture-landing.ts
- Sections.tsx
- build.ts
- Reader.tsx
- Settings.tsx
- utils/course.ts
- App.tsx
- ReaderSettings.tsx
- Wiki Course (learning-path app)
- askJson
- Import.tsx
- courseKey
- AppShell.tsx
- usage.ts
- main.tsx
- fetchLangLinks

## God Nodes (most connected - your core abstractions)
1. `fa()` - 48 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 26 edges
5. `ghost` - 22 edges
6. `today()` - 22 edges
7. `courseHref()` - 21 edges
8. `Reader()` - 20 edges
9. `primary` - 19 edges
10. `App()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Added` --references--> `ExportMenu()`  [INFERRED]
  CHANGELOG.md → src/components/CourseView/ExportMenu.tsx
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Browser storage and backup/restore` --references--> `useStore()`  [INFERRED]
  README.md → src/data/store.ts
- `Added` --references--> `searchArticles()`  [INFERRED]
  CHANGELOG.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (26 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.06
Nodes (30): ref_node_assert, box, course, cs, ctx, extract, good, imported (+22 more)

### Community 1 - "ui.ts"
Cohesion: 0.05
Nodes (107): UI conventions (tokens, type scale, icons, RTL), Flashcards, quizzes and Leitner review, ref_lucide_react, Job, Props, ConfirmModal(), Props, CourseCard() (+99 more)

### Community 2 - "store.ts"
Cohesion: 0.16
Nodes (17): App(), src_data_samples, BACKUP_VERSION, courseCache, courseRef(), dec(), DEFAULT_AI, findCourse() (+9 more)

### Community 3 - "Changelog"
Cohesion: 0.11
Nodes (17): [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added, Added (+9 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.07
Nodes (40): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, CourseView() (+32 more)

### Community 5 - "shared.ts"
Cohesion: 0.08
Nodes (68): alpha(), contrast(), hex(), luminance(), mix(), onColor(), readable(), rgb() (+60 more)

### Community 6 - "ShareStudio.tsx"
Cohesion: 0.07
Nodes (47): ref_react, ShareDialog, Pos, SelectionBar(), Prefs, ShareStudio(), ACCENTS, CoverMode (+39 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "CourseBuilder.tsx"
Cohesion: 0.13
Nodes (21): STAGES, CourseBuilder(), DEPTHS, EXAMPLES, Found, guessLang(), Pre, Props (+13 more)

### Community 9 - "capture-landing.ts"
Cohesion: 0.11
Nodes (10): ref_playwright_test, course, KEY, PACK(), shots, state, tk(), today (+2 more)

### Community 11 - "Sections.tsx"
Cohesion: 0.08
Nodes (38): ref_gsap, Gsap, loadGsap(), Scene, hero(), sections(), pinned(), story() (+30 more)

### Community 12 - "build.ts"
Cohesion: 0.18
Nodes (19): articleText(), buildCourse(), chat(), coursePrompt(), fetchArticle(), getJson(), inBatches(), Judge (+11 more)

### Community 13 - "Reader.tsx"
Cohesion: 0.10
Nodes (29): Known issues and tech debt, Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, Props, Reader(), scroller() (+21 more)

### Community 14 - "Settings.tsx"
Cohesion: 0.15
Nodes (17): Browser storage and backup/restore, KIND_LABEL, Msg, Props, Settings(), THEMES, tokens(), toman() (+9 more)

### Community 15 - "utils/course.ts"
Cohesion: 0.18
Nodes (12): Card, Question, Terms, cleanPack(), extractJson(), RawItem, ROLE_LABEL, ROLES (+4 more)

### Community 16 - "App.tsx"
Cohesion: 0.21
Nodes (10): NAV, THEMES, src_components_coursebuilder_coursebuilder_job, About(), FACTS, Footer(), NotFound(), Privacy() (+2 more)

### Community 17 - "ReaderSettings.tsx"
Cohesion: 0.17
Nodes (11): Props, ReaderSettings(), seg(), SWATCH, READER_BGS, READER_FONTS, READER_SIZES, ReaderBg (+3 more)

### Community 18 - "Wiki Course (learning-path app)"
Cohesion: 0.22
Nodes (10): OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Course-building pipeline, Bundled sample courses, Static, browser-only architecture, Vercel deployment (GitHub import, no env vars), Wiki Course (learning-path app), ref_node_fs, url (+2 more)

### Community 19 - "askJson"
Cohesion: 0.33
Nodes (10): AGENTS.md (rules for AI agents), Hard rules for agents, AI output trust rules, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), askJson() (+2 more)

### Community 20 - "Import.tsx"
Cohesion: 0.27
Nodes (9): hasState(), Import(), Phase, ErrorState(), badge, applyBackup(), Parsed, fromB64Url() (+1 more)

### Community 21 - "courseKey"
Cohesion: 0.44
Nodes (10): parseBackup(), courseKey(), arr(), num(), rec(), sanitizeCourse(), sanitizePack(), sanitizePage() (+2 more)

### Community 22 - "AppShell.tsx"
Cohesion: 0.28
Nodes (8): AppShell(), ITEMS, link(), NavId, Props, useOnline(), iconBtn, ThemePref

### Community 23 - "usage.ts"
Cohesion: 0.32
Nodes (7): UsageKind, add(), costOf(), EMPTY, Price, summarize(), Totals

### Community 24 - "main.tsx"
Cohesion: 0.33
Nodes (5): index.html app shell, Inline pre-paint theme script, ref_react_dom, applyTheme(), src_index

### Community 25 - "fetchLangLinks"
Cohesion: 0.67
Nodes (3): Added, LangPicker(), fetchLangLinks()

## Knowledge Gaps
- **141 isolated node(s):** `url`, `course`, `KEY`, `today`, `state` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 181 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HANDOVER.md (contributor and agent handover)` connect `askJson` to `ui.ts`, `Wiki Course (learning-path app)`, `Changelog`, `Reader.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `fa()` connect `ui.ts` to `CourseView.tsx`, `CourseBuilder.tsx`, `Reader.tsx`, `Settings.tsx`, `ReaderSettings.tsx`, `Import.tsx`, `AppShell.tsx`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `url`, `course`, `KEY` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `ui.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05377906976744186 - nodes in this community are weakly interconnected._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `CourseView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07346938775510205 - nodes in this community are weakly interconnected._