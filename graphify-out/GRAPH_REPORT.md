# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 46 files · ~36,002 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 394 nodes · 1372 edges · 10 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9d370b78`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- store.ts
- course.check.ts
- HANDOVER.md (contributor and agent handover)
- CourseView.tsx
- App.tsx
- Library.tsx
- vite.config.ts
- types/course.ts
- smoke.spec.ts

## God Nodes (most connected - your core abstractions)
1. `fa()` - 41 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `CourseView()` - 21 edges
5. `Reader()` - 20 edges
6. `ic` - 19 edges
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

## Communities (10 total, 0 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.07
Nodes (51): AI output trust rules, Bundled sample courses, ref_node_fs, url, CourseBuilder(), DEPTHS, EXAMPLES, Pre (+43 more)

### Community 1 - "store.ts"
Cohesion: 0.09
Nodes (43): Browser storage and backup/restore, hasState(), Import(), Settings(), src_data_samples, applyBackup(), BACKUP_VERSION, backupJson() (+35 more)

### Community 2 - "course.check.ts"
Cohesion: 0.06
Nodes (50): Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), ref_node_assert, HEADING, Job, MODES, Props, Reader() (+42 more)

### Community 3 - "HANDOVER.md (contributor and agent handover)"
Cohesion: 0.22
Nodes (14): AGENTS.md (rules for AI agents), Hard rules for agents, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt, UI conventions (tokens, type scale, icons, RTL) (+6 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.07
Nodes (43): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, CourseView() (+35 more)

### Community 5 - "App.tsx"
Cohesion: 0.14
Nodes (37): index.html app shell, Inline pre-paint theme script, App(), NAV, THEMES, Job, CourseCard(), Discover() (+29 more)

### Community 6 - "Library.tsx"
Cohesion: 0.06
Nodes (52): ref_lucide_react, ref_react, ref_react_dom, AppShell(), ITEMS, link(), NavId, Props (+44 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "types/course.ts"
Cohesion: 0.09
Nodes (38): Flashcards, quizzes and Leitner review, CardItem, DIGITS, Flashcards(), GRADES, Props, actions(), ActivityChart() (+30 more)

### Community 10 - "smoke.spec.ts"
Cohesion: 0.22
Nodes (3): ref_playwright_test, page(), PACK

## Knowledge Gaps
- **98 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 125 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `types/course.ts` to `build.ts`, `store.ts`, `course.check.ts`, `HANDOVER.md (contributor and agent handover)`, `CourseView.tsx`, `App.tsx`, `Library.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `page()` connect `smoke.spec.ts` to `course.check.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `topicKey()` connect `CourseView.tsx` to `build.ts`, `store.ts`, `course.check.ts`, `HANDOVER.md (contributor and agent handover)`, `App.tsx`, `Library.tsx`, `types/course.ts`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06883116883116883 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0851063829787234 - nodes in this community are weakly interconnected._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05584415584415584 - nodes in this community are weakly interconnected._