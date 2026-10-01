# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 44 files · ~32,883 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 364 nodes · 1238 edges · 11 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b1602cf8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- Home.tsx
- Reader.tsx
- course.check.ts
- CourseView.tsx
- store.ts
- Library.tsx
- vite.config.ts
- types/course.ts
- ui.ts
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
- `Recipe: add a new AI-generated artifact` --references--> `saveTerms()`  [INFERRED]
  HANDOVER.md → src/data/store.ts
- `Flashcards, quizzes and Leitner review` --references--> `buildPack()`  [INFERRED]
  README.md → src/lib/build.ts
- `Known issues and tech debt` --references--> `fa()`  [EXTRACTED]
  HANDOVER.md → src/components/ui.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (11 total, 0 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.06
Nodes (59): AGENTS.md (rules for AI agents), Hard rules for agents, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Course-building pipeline (+51 more)

### Community 1 - "Home.tsx"
Cohesion: 0.13
Nodes (41): ref_lucide_react, Discover(), Props, Home(), ONBOARDING, Props, Insights(), split() (+33 more)

### Community 2 - "Reader.tsx"
Cohesion: 0.10
Nodes (29): Known issues and tech debt, Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, MODES, Props, Reader() (+21 more)

### Community 3 - "course.check.ts"
Cohesion: 0.07
Nodes (32): AI output trust rules, ref_node_assert, Card, box, course, cs, ctx, extract (+24 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.09
Nodes (33): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, CourseView() (+25 more)

### Community 5 - "store.ts"
Cohesion: 0.08
Nodes (41): index.html app shell, Inline pre-paint theme script, Browser storage and backup/restore, ref_react, ref_react_dom, App(), NAV, THEMES (+33 more)

### Community 6 - "Library.tsx"
Cohesion: 0.12
Nodes (26): CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Cover(), Props, TINT, Props (+18 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "types/course.ts"
Cohesion: 0.09
Nodes (30): Flashcards, quizzes and Leitner review, CardItem, DIGITS, Flashcards(), GRADES, Props, LETTERS, level() (+22 more)

### Community 9 - "ui.ts"
Cohesion: 0.22
Nodes (12): UI conventions (tokens, type scale, icons, RTL), ConfirmModal(), Props, Props, Settings(), btn, ghost, ic (+4 more)

### Community 10 - "smoke.spec.ts"
Cohesion: 0.22
Nodes (3): ref_playwright_test, page(), PACK

## Knowledge Gaps
- **93 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 117 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `Home.tsx` to `build.ts`, `Reader.tsx`, `CourseView.tsx`, `store.ts`, `Library.tsx`, `types/course.ts`, `ui.ts`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `page()` connect `smoke.spec.ts` to `course.check.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `topicKey()` connect `CourseView.tsx` to `build.ts`, `Home.tsx`, `Reader.tsx`, `course.check.ts`, `store.ts`, `Library.tsx`, `types/course.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.060814383923849816 - nodes in this community are weakly interconnected._
- **Should `Home.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13350340136054423 - nodes in this community are weakly interconnected._
- **Should `Reader.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10037878787878787 - nodes in this community are weakly interconnected._