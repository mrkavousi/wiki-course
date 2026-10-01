# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 50 files · ~52,433 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 432 nodes · 1449 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `54766c32`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- App.tsx
- CourseBuilder.tsx
- Changelog
- CourseView.tsx
- Library.tsx
- course.check.ts
- vite.config.ts
- fa
- store.ts

## God Nodes (most connected - your core abstractions)
1. `fa()` - 41 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 22 edges
5. `Reader()` - 20 edges
6. `courseHref()` - 19 edges
7. `today()` - 19 edges
8. `CourseView()` - 18 edges
9. `courseStats()` - 18 edges
10. `App()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Added` --references--> `ExportMenu()`  [INFERRED]
  CHANGELOG.md → src/components/CourseView/ExportMenu.tsx
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Added` --references--> `searchArticles()`  [INFERRED]
  CHANGELOG.md → src/lib/build.ts
- `Flashcards, quizzes and Leitner review` --references--> `buildPack()`  [INFERRED]
  README.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (11 total, 1 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.06
Nodes (60): AI output trust rules, Recipe: add a new AI-generated artifact, OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Article reader (easy and enhanced modes), Course-building pipeline, Bundled sample courses, Static, browser-only architecture, Vercel deployment (GitHub import, no env vars) (+52 more)

### Community 1 - "App.tsx"
Cohesion: 0.07
Nodes (41): ref_lucide_react, ref_react, ref_react_dom, NAV, THEMES, AppShell(), ITEMS, link() (+33 more)

### Community 2 - "CourseBuilder.tsx"
Cohesion: 0.09
Nodes (32): CourseBuilder(), DEPTHS, EXAMPLES, Found, guessLang(), Pre, Props, PURPOSES (+24 more)

### Community 3 - "Changelog"
Cohesion: 0.11
Nodes (17): [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added, Added (+9 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.06
Nodes (50): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, DEPTH_LABEL (+42 more)

### Community 5 - "Library.tsx"
Cohesion: 0.12
Nodes (35): Job, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Discover(), Props, ONBOARDING (+27 more)

### Community 6 - "course.check.ts"
Cohesion: 0.05
Nodes (37): AGENTS.md (rules for AI agents), Hard rules for agents, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt, UI conventions (tokens, type scale, icons, RTL) (+29 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "fa"
Cohesion: 0.10
Nodes (43): Flashcards, quizzes and Leitner review, CourseView(), CardItem, DIGITS, Flashcards(), GRADES, Props, Home() (+35 more)

### Community 9 - "store.ts"
Cohesion: 0.08
Nodes (49): index.html app shell, Inline pre-paint theme script, Browser storage and backup/restore, App(), hasState(), Import(), Settings(), src_data_samples (+41 more)

## Knowledge Gaps
- **113 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HANDOVER.md (contributor and agent handover)` connect `course.check.ts` to `build.ts`, `Changelog`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `fa()` connect `fa` to `build.ts`, `App.tsx`, `CourseBuilder.tsx`, `CourseView.tsx`, `Library.tsx`, `course.check.ts`, `store.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06386946386946386 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07474600870827286 - nodes in this community are weakly interconnected._
- **Should `CourseBuilder.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08708708708708708 - nodes in this community are weakly interconnected._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._