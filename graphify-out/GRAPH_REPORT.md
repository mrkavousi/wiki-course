# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 42 files · ~30,110 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 352 nodes · 1205 edges · 9 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c6b42138`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- build.ts
- Home.tsx
- store.ts
- course.check.ts
- CourseView.tsx
- types/course.ts
- Settings.tsx
- vite.config.ts
- CourseBuilder.tsx

## God Nodes (most connected - your core abstractions)
1. `fa()` - 39 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 20 edges
4. `today()` - 19 edges
5. `CourseView()` - 18 edges
6. `ic` - 18 edges
7. `courseStats()` - 18 edges
8. `App()` - 17 edges
9. `Reader()` - 16 edges
10. `Insights()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Inline pre-paint theme script` --semantically_similar_to--> `applyTheme()`  [INFERRED] [semantically similar]
  index.html → src/data/store.ts
- `Browser storage and backup/restore` --references--> `kv`  [INFERRED]
  README.md → src/data/store.ts
- `Browser storage and backup/restore` --references--> `useStore()`  [INFERRED]
  README.md → src/data/store.ts
- `OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite)` --references--> `chat()`  [INFERRED]
  README.md → src/lib/build.ts
- `Course-building pipeline` --references--> `buildCourse()`  [INFERRED]
  README.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (9 total, 0 thin omitted)

### Community 0 - "build.ts"
Cohesion: 0.07
Nodes (54): AI output trust rules, Known issues and tech debt, Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, MODES, Props (+46 more)

### Community 1 - "Home.tsx"
Cohesion: 0.10
Nodes (45): UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, CourseCard(), CourseCardSkeleton(), Props, STATUS_ICON, Props, Flashcards() (+37 more)

### Community 2 - "store.ts"
Cohesion: 0.07
Nodes (60): index.html app shell, Inline pre-paint theme script, ref_react, ref_react_dom, App(), NAV, THEMES, AppShell() (+52 more)

### Community 3 - "course.check.ts"
Cohesion: 0.07
Nodes (30): ref_node_assert, Cover(), Props, TINT, box, course, cs, ctx (+22 more)

### Community 4 - "CourseView.tsx"
Cohesion: 0.10
Nodes (38): CourseView(), DEPTH_LABEL, Props, Props, Roadmap(), useToast(), TopicDetail(), NodeState (+30 more)

### Community 5 - "types/course.ts"
Cohesion: 0.07
Nodes (31): ref_node_fs, url, BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props (+23 more)

### Community 6 - "Settings.tsx"
Cohesion: 0.10
Nodes (27): AGENTS.md (rules for AI agents), Hard rules for agents, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Course-building pipeline (+19 more)

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

- **Why does `fa()` connect `Home.tsx` to `build.ts`, `store.ts`, `CourseView.tsx`, `types/course.ts`, `Settings.tsx`, `CourseBuilder.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `topicKey()` connect `CourseView.tsx` to `build.ts`, `Home.tsx`, `store.ts`, `types/course.ts`, `Settings.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `courseKey()` connect `store.ts` to `build.ts`, `Home.tsx`, `course.check.ts`, `CourseView.tsx`, `types/course.ts`, `Settings.tsx`, `CourseBuilder.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `NAV` to the rest of the system?**
  _91 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `build.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07247223845704266 - nodes in this community are weakly interconnected._
- **Should `Home.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10454545454545454 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07374890254609306 - nodes in this community are weakly interconnected._