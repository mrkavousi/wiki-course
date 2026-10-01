# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 44 files · ~33,220 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 368 nodes · 1252 edges · 10 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `03656054`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- CourseBuilder.tsx
- course.check.ts
- ref_react
- CourseView.tsx
- store.ts
- Library.tsx
- vite.config.ts
- fa
- smoke.spec.ts

## God Nodes (most connected - your core abstractions)
1. `fa()` - 39 edges
2. `topicKey()` - 32 edges
3. `CourseView()` - 20 edges
4. `Reader()` - 20 edges
5. `courseKey()` - 20 edges
6. `today()` - 19 edges
7. `ic` - 18 edges
8. `courseStats()` - 18 edges
9. `App()` - 17 edges
10. `courseHref()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Flashcards, quizzes and Leitner review` --references--> `buildPack()`  [INFERRED]
  README.md → src/lib/build.ts
- `Known issues and tech debt` --references--> `parseArticle()`  [INFERRED]
  HANDOVER.md → src/utils/reader.ts
- `Known issues and tech debt` --references--> `fa()`  [EXTRACTED]
  HANDOVER.md → src/components/ui.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (10 total, 0 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.08
Nodes (45): AGENTS.md (rules for AI agents), Hard rules for agents, AI output trust rules, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt (+37 more)

### Community 1 - "CourseBuilder.tsx"
Cohesion: 0.12
Nodes (19): CourseBuilder(), DEPTHS, EXAMPLES, Job, Pre, Props, PURPOSES, STAGES (+11 more)

### Community 2 - "course.check.ts"
Cohesion: 0.05
Nodes (47): Article reader (easy and enhanced modes), ref_node_assert, HEADING, Job, MODES, Props, scroller(), outline (+39 more)

### Community 3 - "ref_react"
Cohesion: 0.16
Nodes (12): index.html app shell, Inline pre-paint theme script, ref_react, ref_react_dom, AppShell(), ITEMS, link(), NavId (+4 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.06
Nodes (52): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, DEPTH_LABEL (+44 more)

### Community 5 - "store.ts"
Cohesion: 0.09
Nodes (56): Recipe: add a new AI-generated artifact, Browser storage and backup/restore, App(), NAV, THEMES, CourseView(), Discover(), Home() (+48 more)

### Community 6 - "Library.tsx"
Cohesion: 0.09
Nodes (45): UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, ConfirmModal(), Props, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON (+37 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "fa"
Cohesion: 0.11
Nodes (29): Flashcards, quizzes and Leitner review, CardItem, DIGITS, Flashcards(), GRADES, Props, split(), actions() (+21 more)

### Community 10 - "smoke.spec.ts"
Cohesion: 0.22
Nodes (3): ref_playwright_test, page(), PACK

## Knowledge Gaps
- **95 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+90 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 121 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `fa` to `build.ts`, `CourseBuilder.tsx`, `course.check.ts`, `ref_react`, `CourseView.tsx`, `store.ts`, `Library.tsx`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `page()` connect `smoke.spec.ts` to `course.check.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `topicKey()` connect `CourseView.tsx` to `build.ts`, `course.check.ts`, `store.ts`, `Library.tsx`, `fa`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _95 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08325624421831637 - nodes in this community are weakly interconnected._
- **Should `CourseBuilder.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12105263157894737 - nodes in this community are weakly interconnected._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05152394775036284 - nodes in this community are weakly interconnected._