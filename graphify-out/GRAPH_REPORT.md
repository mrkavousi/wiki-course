# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 42 files · ~30,551 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 352 nodes · 1214 edges · 8 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5e39190`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- Library.tsx
- App.tsx
- course.check.ts
- CourseView.tsx
- store.ts
- vite.config.ts
- CourseBuilder.tsx

## God Nodes (most connected - your core abstractions)
1. `fa()` - 39 edges
2. `topicKey()` - 32 edges
3. `Reader()` - 20 edges
4. `courseKey()` - 20 edges
5. `today()` - 19 edges
6. `CourseView()` - 18 edges
7. `ic` - 18 edges
8. `courseStats()` - 18 edges
9. `App()` - 17 edges
10. `Insights()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Flashcards, quizzes and Leitner review` --references--> `rate()`  [INFERRED]
  README.md → src/utils/learn.ts
- `Known issues and tech debt` --references--> `fa()`  [EXTRACTED]
  HANDOVER.md → src/components/ui.ts
- `Recipe: add a new AI-generated artifact` --references--> `loadTerms()`  [INFERRED]
  HANDOVER.md → src/data/store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (8 total, 0 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.06
Nodes (58): AGENTS.md (rules for AI agents), AI output trust rules, Verify from a clean clone, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), Known issues and tech debt, OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Article reader (easy and enhanced modes) (+50 more)

### Community 1 - "Library.tsx"
Cohesion: 0.08
Nodes (59): UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, ConfirmModal(), Props, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON (+51 more)

### Community 2 - "App.tsx"
Cohesion: 0.13
Nodes (34): index.html app shell, Inline pre-paint theme script, ref_react_dom, App(), NAV, THEMES, CourseBuilder(), Discover() (+26 more)

### Community 3 - "course.check.ts"
Cohesion: 0.07
Nodes (30): ref_node_assert, Cover(), Props, TINT, box, course, cs, ctx (+22 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.07
Nodes (48): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, CourseView() (+40 more)

### Community 5 - "store.ts"
Cohesion: 0.06
Nodes (56): Hard rules for agents, Persisted-data compatibility rules, Recipe: add a new AI-generated artifact, Browser storage and backup/restore, Bundled sample courses, ref_node_fs, ref_react, url (+48 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "CourseBuilder.tsx"
Cohesion: 0.13
Nodes (14): DEPTHS, EXAMPLES, Job, Pre, Props, PURPOSES, STAGES, steps() (+6 more)

## Knowledge Gaps
- **91 isolated node(s):** `url`, `THEMES`, `NAV`, `Props`, `ITEMS` (+86 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 111 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `fa()` connect `Library.tsx` to `build.ts`, `App.tsx`, `CourseView.tsx`, `store.ts`, `CourseBuilder.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `topicKey()` connect `CourseView.tsx` to `build.ts`, `Library.tsx`, `App.tsx`, `store.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `courseKey()` connect `App.tsx` to `build.ts`, `Library.tsx`, `course.check.ts`, `CourseView.tsx`, `store.ts`, `CourseBuilder.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _91 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06400409626216078 - nodes in this community are weakly interconnected._
- **Should `Library.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08059467918622848 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13229018492176386 - nodes in this community are weakly interconnected._