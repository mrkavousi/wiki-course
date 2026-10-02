# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 63 files · ~106,370 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 523 nodes · 1678 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a848fde9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- types/course.ts
- store.ts
- Changelog
- CourseView.tsx
- Library.tsx
- App.tsx
- vite.config.ts
- capture-landing.ts
- Sections.tsx
- build.ts
- Settings.tsx

## God Nodes (most connected - your core abstractions)
1. `fa()` - 44 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 23 edges
5. `today()` - 22 edges
6. `courseHref()` - 21 edges
7. `Reader()` - 19 edges
8. `ghost` - 19 edges
9. `App()` - 18 edges
10. `CourseView()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Added` --references--> `ExportMenu()`  [INFERRED]
  CHANGELOG.md → src/components/CourseView/ExportMenu.tsx
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Browser storage and backup/restore` --references--> `useStore()`  [INFERRED]
  README.md → src/data/store.ts
- `Added` --references--> `searchArticles()`  [INFERRED]
  CHANGELOG.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (13 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.06
Nodes (51): Hard rules for agents, AI output trust rules, Persisted-data compatibility rules, ref_node_assert, parseBackup(), Card, box, course (+43 more)

### Community 1 - "types/course.ts"
Cohesion: 0.08
Nodes (37): Flashcards, quizzes and Leitner review, Props, CardItem, DIGITS, GRADES, Props, LETTERS, level() (+29 more)

### Community 2 - "store.ts"
Cohesion: 0.07
Nodes (43): Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, LangPicker(), MODES, Props, Reader() (+35 more)

### Community 3 - "Changelog"
Cohesion: 0.12
Nodes (16): [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added, Added (+8 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.10
Nodes (31): CourseView(), DEPTH_LABEL, Props, ExportMenu(), Props, curve(), LINK, Props (+23 more)

### Community 5 - "Library.tsx"
Cohesion: 0.08
Nodes (71): UI conventions (tokens, type scale, icons, RTL), CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Cover(), Props, TINT (+63 more)

### Community 6 - "App.tsx"
Cohesion: 0.05
Nodes (53): Changed, index.html app shell, Inline pre-paint theme script, ref_lucide_react, ref_react, ref_react_dom, App(), NAV (+45 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 9 - "capture-landing.ts"
Cohesion: 0.11
Nodes (10): ref_playwright_test, course, KEY, PACK(), shots, state, tk(), today (+2 more)

### Community 11 - "Sections.tsx"
Cohesion: 0.08
Nodes (38): ref_gsap, Gsap, loadGsap(), Scene, hero(), sections(), pinned(), story() (+30 more)

### Community 13 - "build.ts"
Cohesion: 0.06
Nodes (57): AGENTS.md (rules for AI agents), Verify from a clean clone, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt, OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Course-building pipeline, Bundled sample courses (+49 more)

### Community 14 - "Settings.tsx"
Cohesion: 0.09
Nodes (28): Browser storage and backup/restore, ConfirmModal(), KIND_LABEL, Msg, Props, Settings(), THEMES, tokens() (+20 more)

## Knowledge Gaps
- **123 isolated node(s):** `url`, `course`, `KEY`, `today`, `state` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 158 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `HANDOVER.md (contributor and agent handover)` connect `build.ts` to `course.check.ts`, `store.ts`, `Changelog`, `Library.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `fa()` connect `Library.tsx` to `types/course.ts`, `store.ts`, `CourseView.tsx`, `App.tsx`, `build.ts`, `Settings.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `url`, `course`, `KEY` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06170598911070781 - nodes in this community are weakly interconnected._
- **Should `types/course.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07716701902748414 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.070578231292517 - nodes in this community are weakly interconnected._
- **Should `Changelog` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._