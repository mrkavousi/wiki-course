# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- Corpus is ~18,089 words - fits in a single context window. You may not need a graph.

## Summary
- 236 nodes · 716 edges · 8 communities
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 35 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Article Reader & AI Builders
- Study Widgets & UI Conventions
- App Shell, Storage & Settings
- Utils, Self-Check & Data Rules
- Course View, Roadmap & Export
- Types, Graph View & Sample CLI
- Project Docs & Overview
- Build Tooling (Vite)

## God Nodes (most connected - your core abstractions)
1. `fa()` - 24 edges
2. `topicKey()` - 24 edges
3. `courseKey()` - 18 edges
4. `App()` - 17 edges
5. `buildCourse()` - 15 edges
6. `Reader()` - 14 edges
7. `CourseView()` - 13 edges
8. `Library()` - 12 edges
9. `ic` - 11 edges
10. `askJson()` - 11 edges

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

## Communities (8 total, 0 thin omitted)

### Community 0 - "Article Reader & AI Builders"
Cohesion: 0.08
Nodes (49): AI output trust rules, Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, MODES, Props, Reader() (+41 more)

### Community 1 - "Study Widgets & UI Conventions"
Cohesion: 0.11
Nodes (37): Known issues and tech debt, UI conventions (tokens, type scale, icons, RTL), ref_lucide_react, ref_react, CardItem, Flashcards(), Props, Library() (+29 more)

### Community 2 - "App Shell, Storage & Settings"
Cohesion: 0.11
Nodes (31): index.html app shell, Inline pre-paint theme script, Browser storage and backup/restore, ref_react_dom, App(), THEMES, Settings(), UrlBar() (+23 more)

### Community 3 - "Utils, Self-Check & Data Rules"
Cohesion: 0.08
Nodes (28): Hard rules for agents, Persisted-data compatibility rules, Flashcards, quizzes and Leitner review, ref_node_assert, Box, State, box, course (+20 more)

### Community 4 - "Course View, Roadmap & Export"
Cohesion: 0.16
Nodes (23): CourseView(), Props, Props, Roadmap(), TopicDetail(), NodeState, Props, RING (+15 more)

### Community 5 - "Types, Graph View & Sample CLI"
Cohesion: 0.10
Nodes (19): ref_node_fs, url, BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props (+11 more)

### Community 6 - "Project Docs & Overview"
Cohesion: 0.25
Nodes (11): AGENTS.md (rules for AI agents), Verify from a clean clone, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite), Course-building pipeline, Bundled sample courses, Static, browser-only architecture (+3 more)

### Community 7 - "Build Tooling (Vite)"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

## Knowledge Gaps
- **53 isolated node(s):** `url`, `THEMES`, `Props`, `ROLE_COLOR`, `DOT` (+48 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 71 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `topicKey()` connect `Course View, Roadmap & Export` to `Article Reader & AI Builders`, `Study Widgets & UI Conventions`, `App Shell, Storage & Settings`, `Utils, Self-Check & Data Rules`, `Types, Graph View & Sample CLI`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `fa()` connect `Study Widgets & UI Conventions` to `Article Reader & AI Builders`, `App Shell, Storage & Settings`, `Course View, Roadmap & Export`, `Types, Graph View & Sample CLI`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `courseKey()` connect `Study Widgets & UI Conventions` to `Article Reader & AI Builders`, `App Shell, Storage & Settings`, `Utils, Self-Check & Data Rules`, `Course View, Roadmap & Export`, `Types, Graph View & Sample CLI`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `url`, `THEMES`, `Props` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Article Reader & AI Builders` be split into smaller, more focused modules?**
  _Cohesion score 0.0803633822501747 - nodes in this community are weakly interconnected._
- **Should `Study Widgets & UI Conventions` be split into smaller, more focused modules?**
  _Cohesion score 0.10917874396135266 - nodes in this community are weakly interconnected._
- **Should `App Shell, Storage & Settings` be split into smaller, more focused modules?**
  _Cohesion score 0.11260504201680673 - nodes in this community are weakly interconnected._