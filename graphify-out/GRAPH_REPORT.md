# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 51 files · ~54,621 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 441 nodes · 1486 edges · 12 communities (11 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `53f8dec0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- CourseView.tsx
- build.ts
- HANDOVER.md (contributor and agent handover)
- topicKey
- App.tsx
- store.ts
- vite.config.ts
- types/course.ts
- smoke.spec.ts
- CourseGraph.tsx

## God Nodes (most connected - your core abstractions)
1. `fa()` - 41 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 23 edges
5. `Reader()` - 19 edges
6. `courseHref()` - 19 edges
7. `today()` - 19 edges
8. `CourseView()` - 18 edges
9. `ghost` - 18 edges
10. `courseStats()` - 18 edges

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

## Communities (12 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.05
Nodes (52): Known issues and tech debt, Article reader (easy and enhanced modes), ref_node_assert, HEADING, Job, MODES, Props, Reader() (+44 more)

### Community 1 - "CourseView.tsx"
Cohesion: 0.07
Nodes (60): UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, ref_react, Props, ConfirmModal(), Props, CourseCard(), CourseCardSkeleton() (+52 more)

### Community 2 - "build.ts"
Cohesion: 0.06
Nodes (56): Added, AI output trust rules, Job, STAGES, CourseBuilder(), DEPTHS, EXAMPLES, Found (+48 more)

### Community 3 - "HANDOVER.md (contributor and agent handover)"
Cohesion: 0.07
Nodes (31): AGENTS.md (rules for AI agents), [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added (+23 more)

### Community 4 - "topicKey"
Cohesion: 0.11
Nodes (28): CourseView(), ExportMenu(), Props, curve(), LINK, Props, Roadmap(), NodeState (+20 more)

### Community 5 - "App.tsx"
Cohesion: 0.09
Nodes (37): index.html app shell, Inline pre-paint theme script, ref_react_dom, App(), NAV, THEMES, AppShell(), ITEMS (+29 more)

### Community 6 - "store.ts"
Cohesion: 0.08
Nodes (50): Hard rules for agents, Persisted-data compatibility rules, Recipe: add a new AI-generated artifact, Browser storage and backup/restore, Settings(), src_data_samples, applyBackup(), BACKUP_VERSION (+42 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "types/course.ts"
Cohesion: 0.09
Nodes (47): Flashcards, quizzes and Leitner review, src_components_coursebuilder_coursebuilder_job, CardItem, DIGITS, Flashcards(), GRADES, Props, Home() (+39 more)

### Community 9 - "smoke.spec.ts"
Cohesion: 0.22
Nodes (3): ref_playwright_test, page(), PACK

### Community 11 - "CourseGraph.tsx"
Cohesion: 0.20
Nodes (8): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, Role

## Knowledge Gaps
- **112 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 140 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HANDOVER.md (contributor and agent handover)` connect `HANDOVER.md (contributor and agent handover)` to `course.check.ts`, `CourseView.tsx`, `build.ts`, `store.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `fa()` connect `types/course.ts` to `course.check.ts`, `CourseView.tsx`, `build.ts`, `topicKey`, `App.tsx`, `store.ts`, `CourseGraph.tsx`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05021173623714459 - nodes in this community are weakly interconnected._
- **Should `CourseView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0715950715950716 - nodes in this community are weakly interconnected._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06384180790960452 - nodes in this community are weakly interconnected._
- **Should `HANDOVER.md (contributor and agent handover)` be split into smaller, more focused modules?**
  _Cohesion score 0.06818181818181818 - nodes in this community are weakly interconnected._