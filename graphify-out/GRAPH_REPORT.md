# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 50 files · ~53,416 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 435 nodes · 1459 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ddf645e2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- Library.tsx
- CourseBuilder.tsx
- HANDOVER.md (contributor and agent handover)
- CourseView.tsx
- App.tsx
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
- `OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite)` --references--> `chat()`  [INFERRED]
  README.md → src/lib/build.ts
- `Course-building pipeline` --references--> `buildCourse()`  [INFERRED]
  README.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (11 total, 1 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.07
Nodes (56): Added, AI output trust rules, Known issues and tech debt, Article reader (easy and enhanced modes), HEADING, Job, LangPicker(), MODES (+48 more)

### Community 1 - "Library.tsx"
Cohesion: 0.08
Nodes (48): ref_lucide_react, ConfirmModal(), Props, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Cover() (+40 more)

### Community 2 - "CourseBuilder.tsx"
Cohesion: 0.14
Nodes (17): CourseBuilder(), DEPTHS, EXAMPLES, Found, guessLang(), Job, Pre, Props (+9 more)

### Community 3 - "HANDOVER.md (contributor and agent handover)"
Cohesion: 0.08
Nodes (28): AGENTS.md (rules for AI agents), [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added (+20 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.06
Nodes (59): ref_node_fs, url, BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props (+51 more)

### Community 5 - "App.tsx"
Cohesion: 0.09
Nodes (27): index.html app shell, Inline pre-paint theme script, ref_react_dom, App(), NAV, THEMES, AppShell(), ITEMS (+19 more)

### Community 6 - "course.check.ts"
Cohesion: 0.06
Nodes (27): ref_node_assert, ref_playwright_test, box, course, cs, ctx, extract, good (+19 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "fa"
Cohesion: 0.08
Nodes (62): Flashcards, quizzes and Leitner review, ref_react, Discover(), CardItem, DIGITS, Flashcards(), GRADES, Props (+54 more)

### Community 9 - "store.ts"
Cohesion: 0.09
Nodes (43): Hard rules for agents, Persisted-data compatibility rules, Recipe: add a new AI-generated artifact, Browser storage and backup/restore, Settings(), src_data_samples, applyBackup(), BACKUP_VERSION (+35 more)

## Knowledge Gaps
- **113 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HANDOVER.md (contributor and agent handover)` connect `HANDOVER.md (contributor and agent handover)` to `build.ts`, `store.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `fa()` connect `fa` to `build.ts`, `Library.tsx`, `CourseBuilder.tsx`, `HANDOVER.md (contributor and agent handover)`, `CourseView.tsx`, `App.tsx`, `store.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07049180327868852 - nodes in this community are weakly interconnected._
- **Should `Library.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07667900581702802 - nodes in this community are weakly interconnected._
- **Should `CourseBuilder.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `HANDOVER.md (contributor and agent handover)` be split into smaller, more focused modules?**
  _Cohesion score 0.07881773399014778 - nodes in this community are weakly interconnected._