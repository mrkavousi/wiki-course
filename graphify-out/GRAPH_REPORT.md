# Graph Report - wiki-course  (2026-10-02)

## Corpus Check
- 94 files · ~156,063 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .woff2 10, (none) 3, .example 1)

## Summary
- 681 nodes · 2224 edges · 26 communities (25 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8b79eb39`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- course.check.ts
- Library.tsx
- store.ts
- Changelog
- types/course.ts
- shared.ts
- ShareStudio.tsx
- vite.config.ts
- CourseBuilder.tsx
- capture-landing.ts
- ref_lucide_react
- build.ts
- Reader.tsx
- Settings.tsx
- CourseView.tsx
- Home.tsx
- learn.ts
- build-course.ts
- HANDOVER.md (contributor and agent handover)
- ui.ts
- fa
- Toast.tsx
- TemplateControls.tsx
- reader.ts
- fetchLangLinks

## God Nodes (most connected - your core abstractions)
1. `fa()` - 48 edges
2. `topicKey()` - 32 edges
3. `courseKey()` - 27 edges
4. `ic` - 26 edges
5. `ghost` - 22 edges
6. `today()` - 22 edges
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
- `Browser storage and backup/restore` --references--> `useStore()`  [INFERRED]
  README.md → src/data/store.ts
- `OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite)` --references--> `chat()`  [INFERRED]
  README.md → src/lib/build.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Builders that call the AI gateway from the browser** — src_lib_build_buildcourse, src_lib_build_buildpack, src_lib_build_buildterms, readme_ai_gateway [INFERRED 0.95]

## Communities (26 total, 1 thin omitted)

### Community 0 - "course.check.ts"
Cohesion: 0.06
Nodes (52): ref_node_assert, hasState(), Import(), Phase, applyBackup(), courseShareLink(), parseBackup(), Parsed (+44 more)

### Community 1 - "Library.tsx"
Cohesion: 0.11
Nodes (27): ConfirmModal(), Props, STATUS_ICON, Cover(), Props, TINT, Props, Sort (+19 more)

### Community 2 - "store.ts"
Cohesion: 0.06
Nodes (49): index.html app shell, Inline pre-paint theme script, ref_react, App(), NAV, THEMES, AppShell(), ITEMS (+41 more)

### Community 3 - "Changelog"
Cohesion: 0.14
Nodes (13): [0.1.0] - 2026-10-01, [0.2.0] - 2026-10-01, [0.3.0] - 2026-10-02, [0.4.0] - 2026-10-02, Added, Added, Added, Added (+5 more)

### Community 4 - "types/course.ts"
Cohesion: 0.08
Nodes (26): BubbleProps, clampK(), CourseGraph(), DOT, LEGEND, Props, ROLE_COLOR, curve() (+18 more)

### Community 5 - "shared.ts"
Cohesion: 0.06
Nodes (83): Props, TemplateRenderer, drawTemplate(), ensureFonts(), gen, images, loadImage(), alpha() (+75 more)

### Community 6 - "ShareStudio.tsx"
Cohesion: 0.20
Nodes (17): Prefs, ShareStudio(), TemplatePreview(), TemplateSelector(), local, DEFAULT_FORMAT, formatOf(), asFile() (+9 more)

### Community 7 - "vite.config.ts"
Cohesion: 0.50
Nodes (3): ref_tailwindcss_vite, ref_vite, ref_vitejs_plugin_react

### Community 8 - "CourseBuilder.tsx"
Cohesion: 0.11
Nodes (24): Job, Props, STAGES, CourseBuilder(), DEPTHS, EXAMPLES, Found, guessLang() (+16 more)

### Community 9 - "capture-landing.ts"
Cohesion: 0.10
Nodes (10): ref_playwright_test, course, KEY, PACK(), shots, state, tk(), today (+2 more)

### Community 11 - "ref_lucide_react"
Cohesion: 0.08
Nodes (40): ref_gsap, ref_lucide_react, Gsap, loadGsap(), Scene, hero(), sections(), pinned() (+32 more)

### Community 12 - "build.ts"
Cohesion: 0.16
Nodes (25): AI output trust rules, articleText(), askJson(), buildCourse(), buildPack(), chat(), coursePrompt(), fa() (+17 more)

### Community 13 - "Reader.tsx"
Cohesion: 0.11
Nodes (24): Known issues and tech debt, Recipe: add a new AI-generated artifact, Article reader (easy and enhanced modes), HEADING, Job, LangPicker(), Props, Reader() (+16 more)

### Community 14 - "Settings.tsx"
Cohesion: 0.12
Nodes (22): Browser storage and backup/restore, KIND_LABEL, Msg, Props, Settings(), THEMES, tokens(), toman() (+14 more)

### Community 15 - "CourseView.tsx"
Cohesion: 0.15
Nodes (22): ref_react_dom, CourseView(), DEPTH_LABEL, Props, ExportMenu(), Props, Review(), fmtMinutes() (+14 more)

### Community 16 - "Home.tsx"
Cohesion: 0.22
Nodes (23): CourseCard(), CourseCardSkeleton(), Discover(), Props, Home(), ONBOARDING, Props, Insights() (+15 more)

### Community 17 - "learn.ts"
Cohesion: 0.14
Nodes (19): Flashcards, quizzes and Leitner review, CardItem, DIGITS, Flashcards(), GRADES, Props, EmptyState(), card (+11 more)

### Community 18 - "build-course.ts"
Cohesion: 0.33
Nodes (5): Bundled sample courses, ref_node_fs, url, SAMPLES, CourseRef

### Community 19 - "HANDOVER.md (contributor and agent handover)"
Cohesion: 0.24
Nodes (13): AGENTS.md (rules for AI agents), Hard rules for agents, Verify from a clean clone, Persisted-data compatibility rules, HANDOVER.md (contributor and agent handover), Knowledge-graph workflow (graphify), UI conventions (tokens, type scale, icons, RTL), OpenAI-compatible AI gateway (ArvanCloud to Gemini 2.5 Flash-lite) (+5 more)

### Community 20 - "ui.ts"
Cohesion: 0.13
Nodes (19): Props, LETTERS, level(), Props, Quiz(), Job, Props, ROLE (+11 more)

### Community 21 - "fa"
Cohesion: 0.28
Nodes (12): split(), actions(), ActivityChart(), BarProps, dayName, Heatmap(), level(), ProgressBar() (+4 more)

### Community 22 - "Toast.tsx"
Cohesion: 0.22
Nodes (9): ShareDialog, Pos, SelectionBar(), Ctx, ToastProvider(), useToast(), cleanQuote(), ShareInput (+1 more)

### Community 23 - "TemplateControls.tsx"
Cohesion: 0.25
Nodes (7): ACCENTS, CoverMode, Fields, Props, seg(), TemplateControls(), FORMATS

### Community 24 - "reader.ts"
Cohesion: 0.28
Nodes (8): cleanTerms(), esc(), FORMULA, outline(), Section, Seg, SKIP, termRegex()

### Community 25 - "fetchLangLinks"
Cohesion: 0.29
Nodes (7): Added, Changed, Fixed, [Unreleased], BuildDialog(), fetchLangLinks(), searchArticles()

## Knowledge Gaps
- **142 isolated node(s):** `url`, `course`, `KEY`, `today`, `state` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 183 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Changelog` connect `Changelog` to `fetchLangLinks`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `HANDOVER.md (contributor and agent handover)` connect `HANDOVER.md (contributor and agent handover)` to `Changelog`, `build.ts`, `Reader.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `fa()` connect `fa` to `course.check.ts`, `Library.tsx`, `store.ts`, `types/course.ts`, `CourseBuilder.tsx`, `build.ts`, `Reader.tsx`, `Settings.tsx`, `CourseView.tsx`, `Home.tsx`, `learn.ts`, `HANDOVER.md (contributor and agent handover)`, `ui.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **What connects `url`, `course`, `KEY` to the rest of the system?**
  _142 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `course.check.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05747126436781609 - nodes in this community are weakly interconnected._
- **Should `Library.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10695187165775401 - nodes in this community are weakly interconnected._
- **Should `store.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06170598911070781 - nodes in this community are weakly interconnected._