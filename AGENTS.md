# AGENTS.md

Rules for AI coding agents working in this repo. The full picture is in [HANDOVER.md](HANDOVER.md) (architecture, data model, conventions, known issues); read it first.

## Orient before you grep
- Code map: `graphify-out/GRAPH_REPORT.md`. Query the graph instead of reading every file:
  `graphify query "<question>"`, `graphify explain "buildTerms()"`, `graphify path "Reader()" "chat()"`, `graphify affected "topicKey()" --depth 1`.
- Run `graphify affected "<symbol>"` **before** editing a widely used function (`topicKey`, `courseKey`, `buildCourse`, `pathOf`).
- After changing code structure: `graphify update .` (AST only, no LLM) and keep the refreshed `graphify-out/graph.json`, `graph.html` and `GRAPH_REPORT.md` with your change. Never hand-edit them.

## Commands
```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # assertions for pure logic: must pass
npm run build      # tsc && vite build: what Vercel runs
npm run test:e2e   # Playwright smoke suite (PW_CHANNEL=chrome to reuse installed Chrome)
```
Before you say "done": `npm run check`, `npm run build`, and look at the UI (`npm run preview`) in light and dark at 390 px wide.

## Hard rules
1. **No secrets.** Never commit, print or paste `.env`, API keys, or the AI gateway URL (it contains a token). Browser settings live in localStorage only.
2. **Persisted data is additive.** Do not change the `topicKey` / `courseKey` formats; add `State` fields only with a default in `EMPTY_STATE`; update backup/restore for any new stored data. See HANDOVER section 4.
3. **UI:** Persian strings, logical Tailwind classes (`ms-`, `pe-`, `start-`), `dir="auto"` on Wikipedia/AI text. Icons from `lucide-react` only: **no emoji**. Colors from tokens only. Nothing smaller than 13 px.
4. **Never trust model output.** Go through `askJson` and the cleaners; render AI and Wikipedia text as React text, never as HTML.
5. **Dependencies:** runtime `react`, `react-dom`, `lucide-react` only; dev-only `@playwright/test` for the e2e suite. Ask before adding one.
6. **Git:** do not commit or push unless asked. Keep diffs minimal and in the existing style (single quotes, 2 spaces, comments say *why*).
7. **Verify from a clean clone** (`npm ci && npm run build`) when you touch dependencies or `tsconfig.json`; a stray global `@types/node` once hid a missing dependency.
