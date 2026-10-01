# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 48 files · ~48,672 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 404 nodes · 1392 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b50bdf34`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- store.ts
- Reader.tsx
- HANDOVER.md (contributor and agent handover)
- CourseView.tsx
- Library.tsx
- course.check.ts
- vite.config.ts
- learn.ts
- share.ts

## God Nodes (most connected - your core abstractions)
1. `fa()` - 41 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `CourseView()` - 21 edges
5. `Reader()` - 20 edges
6. `ic` - 20 edges
7. `courseHref()` - 19 edges
8. `today()` - 19 edges
9. `courseStats()` - 18 edges
10. `App()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite)` --references--> `chat()`  [INFERRED]
  README.md → src/lib/build.ts
- `Course-building pipeline` --references--> `buildCourse()`  [INFERRED]
  README.md → src/lib/build.ts
- `Flashcards, quizzes and Leitner review` --references--> `buildPack()`  [INFERRED]
  README.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (11 total, 1 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.08
Nodes (43): AI output trust rules, ref_node_fs, url, CourseBuilder(), DEPTHS, EXAMPLES, Job, Pre (+35 more)

### Community 1 - "store.ts"
Cohesion: 0.06
Nodes (56): index.html app shell, Inline pre-paint theme script, Browser storage and backup/restore, ref_lucide_react, ref_react, ref_react_dom, App(), NAV (+48 more)

### Community 2 - "Reader.tsx"
Cohesion: 0.13
Nodes (25): Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, MODES, Props, Reader(), scroller() (+17 more)

### Community 3 - "HANDOVER.md (contributor and agent handover)"
Cohesion: 0.17
Nodes (17): AGENTS.md (rules for AI agents), Hard rules for agents, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt, UI conventions (tokens, type scale, icons, RTL) (+9 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.06
Nodes (53): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, CourseView() (+45 more)

### Community 5 - "Library.tsx"
Cohesion: 0.09
Nodes (64): ConfirmModal(), Props, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Discover(), Props (+56 more)

### Community 6 - "course.check.ts"
Cohesion: 0.05
Nodes (35): ref_node_assert, ref_playwright_test, Cover(), Props, TINT, box, course, cs (+27 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "learn.ts"
Cohesion: 0.10
Nodes (23): Flashcards, quizzes and Leitner review, CardItem, DIGITS, Flashcards(), GRADES, Props, LETTERS, level() (+15 more)

### Community 9 - "share.ts"
Cohesion: 0.18
Nodes (22): hasState(), Import(), Phase, ErrorState(), useToast(), applyBackup(), parseBackup(), Parsed (+14 more)

## Knowledge Gaps
- **100 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 129 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `Library.tsx` to `build.ts`, `store.ts`, `Reader.tsx`, `HANDOVER.md (contributor and agent handover)`, `CourseView.tsx`, `learn.ts`, `share.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `topicKey()` connect `CourseView.tsx` to `build.ts`, `store.ts`, `Reader.tsx`, `HANDOVER.md (contributor and agent handover)`, `Library.tsx`, `learn.ts`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08405797101449275 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0574400723654455 - nodes in this community are weakly interconnected._
- **Should `Reader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12807881773399016 - nodes in this community are weakly interconnected._
- **Should `CourseView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06433566433566433 - nodes in this community are weakly interconnected._