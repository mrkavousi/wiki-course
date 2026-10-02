# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 50 files · ~54,047 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 436 nodes · 1466 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `112ea978`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- Library.tsx
- CourseBuilder.tsx
- Changelog
- CourseView.tsx
- store.ts
- course.check.ts
- vite.config.ts
- fa
- smoke.spec.ts

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
- `Added` --references--> `fetchLangLinks()`  [INFERRED]
  CHANGELOG.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (11 total, 1 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.06
Nodes (69): AGENTS.md (rules for AI agents), Hard rules for agents, AI output trust rules, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt (+61 more)

### Community 1 - "Library.tsx"
Cohesion: 0.07
Nodes (54): ref_lucide_react, Props, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Cover(), Props (+46 more)

### Community 2 - "CourseBuilder.tsx"
Cohesion: 0.09
Nodes (26): Bundled sample courses, ref_node_fs, url, CourseBuilder(), DEPTHS, EXAMPLES, Found, guessLang() (+18 more)

### Community 3 - "Changelog"
Cohesion: 0.11
Nodes (17): [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added, Added (+9 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.07
Nodes (45): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, CourseView() (+37 more)

### Community 5 - "store.ts"
Cohesion: 0.05
Nodes (58): index.html app shell, Inline pre-paint theme script, Browser storage and backup/restore, Flashcards, quizzes and Leitner review, ref_react, ref_react_dom, App(), NAV (+50 more)

### Community 6 - "course.check.ts"
Cohesion: 0.06
Nodes (58): ref_node_assert, parseBackup(), Box, Card, Course, Day, Grade, Pack (+50 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "fa"
Cohesion: 0.13
Nodes (38): Discover(), CardItem, DIGITS, Flashcards(), GRADES, Props, Home(), ONBOARDING (+30 more)

### Community 9 - "smoke.spec.ts"
Cohesion: 0.22
Nodes (3): ref_playwright_test, page(), PACK

## Knowledge Gaps
- **113 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 141 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HANDOVER.md (contributor and agent handover)` connect `build.ts` to `Changelog`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `fa()` connect `fa` to `build.ts`, `Library.tsx`, `CourseBuilder.tsx`, `CourseView.tsx`, `store.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06034801925212884 - nodes in this community are weakly interconnected._
- **Should `Library.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06965174129353234 - nodes in this community are weakly interconnected._
- **Should `CourseBuilder.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08994708994708994 - nodes in this community are weakly interconnected._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._