# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 52 files · ~57,004 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 461 nodes · 1545 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `440362e8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- CourseView.tsx
- build.ts
- ic
- ExportMenu.tsx
- App.tsx
- store.ts
- vite.config.ts
- types/course.ts
- smoke.spec.ts
- CourseGraph.tsx
- Import.tsx
- CourseBuilder.tsx

## God Nodes (most connected - your core abstractions)
1. `fa()` - 44 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 23 edges
5. `today()` - 22 edges
6. `Reader()` - 19 edges
7. `courseHref()` - 19 edges
8. `App()` - 18 edges
9. `CourseView()` - 18 edges
10. `ghost` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Recipe: add a new AI-generated artifact` --references--> `saveTerms()`  [INFERRED]
  HANDOVER.md → src/data/store.ts
- `Added` --references--> `fetchLangLinks()`  [INFERRED]
  CHANGELOG.md → src/lib/build.ts
- `AI output trust rules` --references--> `cleanPack()`  [INFERRED]
  HANDOVER.md → src/utils/course.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (14 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.07
Nodes (46): ref_node_assert, courseShareLink(), parseBackup(), Card, box, course, cs, ctx (+38 more)

### Community 1 - "CourseView.tsx"
Cohesion: 0.08
Nodes (44): ConfirmModal(), Props, Props, STATUS_ICON, DEPTH_LABEL, Props, Cover(), Props (+36 more)

### Community 2 - "build.ts"
Cohesion: 0.06
Nodes (64): AI output trust rules, Recipe: add a new AI-generated artifact, OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Article reader (easy and enhanced modes), Course-building pipeline, Static, browser-only architecture, Flashcards, quizzes and Leitner review, Vercel deployment (GitHub import, no env vars) (+56 more)

### Community 3 - "ic"
Cohesion: 0.09
Nodes (24): AGENTS.md (rules for AI agents), Hard rules for agents, [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added (+16 more)

### Community 4 - "ExportMenu.tsx"
Cohesion: 0.10
Nodes (26): Added, ExportMenu(), Props, curve(), LINK, Props, Roadmap(), NodeState (+18 more)

### Community 5 - "App.tsx"
Cohesion: 0.09
Nodes (55): App(), NAV, THEMES, Job, src_components_coursebuilder_coursebuilder_job, CourseCard(), CourseCardSkeleton(), CourseView() (+47 more)

### Community 6 - "store.ts"
Cohesion: 0.10
Nodes (27): Browser storage and backup/restore, Bundled sample courses, ref_node_fs, url, Settings(), src_data_samples, applyBackup(), BACKUP_VERSION (+19 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "types/course.ts"
Cohesion: 0.07
Nodes (46): Known issues and tech debt, DIGITS, GRADES, Props, actions(), ActivityChart(), BarProps, dayName (+38 more)

### Community 9 - "smoke.spec.ts"
Cohesion: 0.22
Nodes (3): ref_playwright_test, page(), PACK

### Community 11 - "CourseGraph.tsx"
Cohesion: 0.20
Nodes (8): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, Role

### Community 12 - "Import.tsx"
Cohesion: 0.10
Nodes (24): index.html app shell, Inline pre-paint theme script, ref_lucide_react, ref_react, ref_react_dom, AppShell(), ITEMS, link() (+16 more)

### Community 13 - "CourseBuilder.tsx"
Cohesion: 0.11
Nodes (23): Changed, BuildDialog(), Props, STAGES, CourseBuilder(), DEPTHS, EXAMPLES, Found (+15 more)

## Knowledge Gaps
- **118 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 147 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `types/course.ts` to `CourseView.tsx`, `build.ts`, `ic`, `ExportMenu.tsx`, `App.tsx`, `store.ts`, `CourseGraph.tsx`, `Import.tsx`, `CourseBuilder.tsx`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `HANDOVER.md (contributor and agent handover)` connect `ic` to `types/course.ts`, `build.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06531204644412192 - nodes in this community are weakly interconnected._
- **Should `CourseView.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07542087542087542 - nodes in this community are weakly interconnected._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05924978687127025 - nodes in this community are weakly interconnected._
- **Should `ic` be split into smaller, more focused modules?**
  _Cohesion score 0.09333333333333334 - nodes in this community are weakly interconnected._