# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 68 files · ~111,725 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 557 nodes · 1792 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af102f0b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- ui.ts
- store.ts
- HANDOVER.md (contributor and agent handover)
- CourseView.tsx
- vite.config.ts
- build.ts
- capture-landing.ts
- Sections.tsx
- Reader.tsx
- Settings.tsx
- learn.ts

## God Nodes (most connected - your core abstractions)
1. `fa()` - 48 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 25 edges
5. `today()` - 22 edges
6. `ghost` - 21 edges
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
- `OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite)` --references--> `chat()`  [INFERRED]
  README.md → src/lib/build.ts
- `Course-building pipeline` --references--> `buildCourse()`  [INFERRED]
  README.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (13 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.06
Nodes (48): Hard rules for agents, Persisted-data compatibility rules, ref_node_assert, hasState(), Import(), parseBackup(), State, box (+40 more)

### Community 1 - "ui.ts"
Cohesion: 0.07
Nodes (88): UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, Job, Props, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON (+80 more)

### Community 2 - "store.ts"
Cohesion: 0.05
Nodes (57): index.html app shell, Inline pre-paint theme script, Browser storage and backup/restore, ref_react_dom, App(), NAV, THEMES, AppShell() (+49 more)

### Community 3 - "HANDOVER.md (contributor and agent handover)"
Cohesion: 0.08
Nodes (28): AGENTS.md (rules for AI agents), [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added (+20 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.07
Nodes (45): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, DEPTH_LABEL (+37 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "build.ts"
Cohesion: 0.06
Nodes (58): Added, AI output trust rules, ref_node_fs, url, STAGES, CourseBuilder(), DEPTHS, EXAMPLES (+50 more)

### Community 9 - "capture-landing.ts"
Cohesion: 0.11
Nodes (10): ref_playwright_test, course, KEY, PACK(), shots, state, tk(), today (+2 more)

### Community 11 - "Sections.tsx"
Cohesion: 0.08
Nodes (38): ref_gsap, Gsap, loadGsap(), Scene, hero(), sections(), pinned(), story() (+30 more)

### Community 13 - "Reader.tsx"
Cohesion: 0.07
Nodes (54): Known issues and tech debt, Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), ref_react, HEADING, Job, LangPicker(), Props (+46 more)

### Community 14 - "Settings.tsx"
Cohesion: 0.11
Nodes (20): ConfirmModal(), Props, KIND_LABEL, Msg, Props, THEMES, tokens(), toman() (+12 more)

### Community 17 - "learn.ts"
Cohesion: 0.14
Nodes (17): Flashcards, quizzes and Leitner review, CardItem, DIGITS, GRADES, Props, chipBase, Box, Day (+9 more)

## Knowledge Gaps
- **125 isolated node(s):** `url`, `course`, `KEY`, `today`, `state` (+120 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 161 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `ui.ts` to `course.check.ts`, `store.ts`, `CourseView.tsx`, `build.ts`, `Reader.tsx`, `Settings.tsx`, `learn.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `HANDOVER.md (contributor and agent handover)` connect `HANDOVER.md (contributor and agent handover)` to `build.ts`, `course.check.ts`, `Reader.tsx`, `ui.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `url`, `course`, `KEY` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06313497822931785 - nodes in this community are weakly interconnected._
- **Should `ui.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06702605570530099 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053613053613053616 - nodes in this community are weakly interconnected._
- **Should `HANDOVER.md (contributor and agent handover)` be split into smaller, more focused modules?**
  _Cohesion score 0.07881773399014778 - nodes in this community are weakly interconnected._