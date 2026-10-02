# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 65 files · ~108,431 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 535 nodes · 1715 edges · 18 communities (17 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `28dad401`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- Library.tsx
- store.ts
- Changelog
- CourseGraph.tsx
- CourseView.tsx
- App.tsx
- vite.config.ts
- CourseBuilder.tsx
- capture-landing.ts
- Sections.tsx
- ReaderSettings.tsx
- build.ts
- types/course.ts
- AppShell.tsx
- main.tsx
- useStore

## God Nodes (most connected - your core abstractions)
1. `fa()` - 48 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 24 edges
5. `today()` - 22 edges
6. `courseHref()` - 21 edges
7. `ghost` - 20 edges
8. `Reader()` - 19 edges
9. `App()` - 18 edges
10. `CourseView()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Added` --references--> `ExportMenu()`  [INFERRED]
  CHANGELOG.md → src/components/CourseView/ExportMenu.tsx
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Recipe: add a new AI-generated artifact` --references--> `saveTerms()`  [INFERRED]
  HANDOVER.md → src/data/store.ts
- `Browser storage and backup/restore` --references--> `useStore()`  [INFERRED]
  README.md → src/data/store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (18 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.06
Nodes (55): Hard rules for agents, Persisted-data compatibility rules, ref_node_assert, hasState(), Import(), courseShareLink(), parseBackup(), Card (+47 more)

### Community 1 - "Library.tsx"
Cohesion: 0.08
Nodes (52): UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, ref_react, Props, ConfirmModal(), Props, CourseCardSkeleton(), Props (+44 more)

### Community 2 - "store.ts"
Cohesion: 0.15
Nodes (19): Browser storage and backup/restore, Settings(), src_data_samples, applyBackup(), BACKUP_VERSION, backupJson(), courseCache, dec() (+11 more)

### Community 3 - "Changelog"
Cohesion: 0.14
Nodes (13): [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added, Added (+5 more)

### Community 4 - "CourseGraph.tsx"
Cohesion: 0.07
Nodes (29): BubbleProps, clampK(), DOT, LEGEND, Props, ROLE_COLOR, ExportMenu(), Props (+21 more)

### Community 5 - "CourseView.tsx"
Cohesion: 0.11
Nodes (54): App(), CourseCard(), CourseGraph(), CourseView(), DEPTH_LABEL, Props, Discover(), Home() (+46 more)

### Community 6 - "App.tsx"
Cohesion: 0.16
Nodes (13): NAV, THEMES, src_components_coursebuilder_coursebuilder_job, About(), FACTS, Footer(), NotFound(), Privacy() (+5 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "CourseBuilder.tsx"
Cohesion: 0.09
Nodes (26): Added, Changed, Fixed, [Unreleased], BuildDialog(), Job, STAGES, CourseBuilder() (+18 more)

### Community 9 - "capture-landing.ts"
Cohesion: 0.11
Nodes (10): ref_playwright_test, course, KEY, PACK(), shots, state, tk(), today (+2 more)

### Community 11 - "Sections.tsx"
Cohesion: 0.08
Nodes (38): ref_gsap, Gsap, loadGsap(), Scene, hero(), sections(), pinned(), story() (+30 more)

### Community 12 - "ReaderSettings.tsx"
Cohesion: 0.17
Nodes (11): Props, ReaderSettings(), seg(), SWATCH, READER_BGS, READER_FONTS, READER_SIZES, ReaderBg (+3 more)

### Community 13 - "build.ts"
Cohesion: 0.05
Nodes (73): AGENTS.md (rules for AI agents), AI output trust rules, Verify from a clean clone, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt, Recipe: add a new AI-generated artifact, OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite) (+65 more)

### Community 14 - "types/course.ts"
Cohesion: 0.08
Nodes (34): CardItem, DIGITS, Flashcards(), GRADES, Props, KIND_LABEL, Msg, Props (+26 more)

### Community 15 - "AppShell.tsx"
Cohesion: 0.32
Nodes (7): AppShell(), ITEMS, link(), NavId, Props, useOnline(), ThemePref

### Community 16 - "main.tsx"
Cohesion: 0.33
Nodes (5): index.html app shell, Inline pre-paint theme script, ref_react_dom, applyTheme(), src_index

### Community 17 - "useStore"
Cohesion: 0.40
Nodes (5): Flashcards, quizzes and Leitner review, courseRef(), pageOf(), useStore(), rate()

## Knowledge Gaps
- **124 isolated node(s):** `url`, `course`, `KEY`, `today`, `state` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 160 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Changelog` connect `Changelog` to `CourseBuilder.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `fa()` connect `CourseView.tsx` to `course.check.ts`, `Library.tsx`, `store.ts`, `CourseGraph.tsx`, `CourseBuilder.tsx`, `ReaderSettings.tsx`, `build.ts`, `types/course.ts`, `AppShell.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `HANDOVER.md (contributor and agent handover)` connect `build.ts` to `course.check.ts`, `Library.tsx`, `Changelog`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `url`, `course`, `KEY` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05711263881544157 - nodes in this community are weakly interconnected._
- **Should `Library.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0773405698778833 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14761904761904762 - nodes in this community are weakly interconnected._