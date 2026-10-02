# Changelog

All notable changes to Wiki Course. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html), see "Versioning" in [HANDOVER.md](HANDOVER.md) section 12.

Versions 0.1.0 to 0.3.0 were assigned afterwards from the commit history and tagged on the last commit of each: `v0.1.0` = `575ecdc`, `v0.2.0` = `ad90344`, `v0.3.0` = `b50bdf3`. From `v0.4.0` on, tags are made at release time.

## [Unreleased]

### Added
- Reader: copy and share. Every chapter card has "copy" and "share" buttons, and selecting text in an article shows a small bar (copy, send as text, make a picture). The share dialog builds a 1080x1920 story picture on a canvas (no new dependency) with the Wiki Course logo and name at the bottom and the article credit (CC BY-SA 4.0) below it, five colour looks (teal, paper, night, violet, warm) and four frames (plain, line, card, corners), an editable title and text, and offers the phone's share sheet with the picture (choose Instagram there; Instagram has no web API to post a story directly), download, copy picture, copy text and send text. The last look is remembered (`wc:share`). Text stays inside Instagram's safe area and is shrunk or cut with an ellipsis when too long; the dialog warns about it.
- Reader: every chapter (each heading and its text) is shown as a card of its own, set apart from the page background with a border, a soft shadow, a gradient accent edge and a numbered badge that matches the contents list; sub-sections are lighter nested cards. The reader settings have a "نمای فصل‌ها" switch (card or plain, card by default), kept with the other reader preferences.
- Reader focus mode: a "تمرکز" button (or the F key) hides the sidebar, top and bottom bars, banners, contents, source line and action bars, leaving only the text and a thin progress bar at the top of the screen. A floating "خروج از تمرکز" button, Esc or leaving the page ends it; the source and licence line is back as soon as it ends. Implemented with `data-focus` on `<html>` and `data-chrome` on the shell parts, so the scroll position and progress carry on unchanged.
- Reader: reading progress. A thin bar under the top bar (also on phones) and, on desktop, "N٪ خوانده شده" above the contents. The bar is a `progressbar` and follows the same scroll listener that saves the reading position.
- Reader: contents as cards, one per section. On desktop they sit in a sticky column on the right with the section being read highlighted; on phones they stay in the collapsible list inside the article.
- Reader settings: one "تنظیمات" button (popover on desktop, bottom sheet on phones) holds reading mode, text size, font (Vazirmatn, system, Naskh as installed on the device), text background (app default, light, paper, dark) and the other-languages list. Font and background are stored with the other reader preferences (`wc:reader`), so backups are unchanged.
- Landing page at `#/` (and `#/welcome`): a scroll-driven story of the product built from real screenshots of the app (`public/landing/`, made by `scripts/capture-landing.ts`): hero, the problem, what it is, a pinned four-step "how it works", feature stories, a pinned app showcase, FAQ and a closing call to action. Animations use GSAP + ScrollTrigger in their own lazy chunk (`src/animations/`), so the app bundle is unchanged; phones get a simpler layout without pinning, and `prefers-reduced-motion` turns every scene off.
- The dashboard moved to `#/app`. Visitors who already used the app (onboarded, or any course/saved topic/activity day) are sent from `#/` straight to `#/app`; the sidebar and drawer have a small "معرفی Wiki Course" link back to the landing page.
- Landing copy reviewed: one friendly second-person voice, no sentence-final periods, no "login" wording (the app has no accounts), the mid-page button opens the sample course it names, and phrases are kept together with non-breaking spaces plus `text-balance`/`text-pretty`.
- SEO and AI-search metadata: canonical, Open Graph and Twitter tags, JSON-LD (`WebSite`, `Organization`, `SoftwareApplication`, `FAQPage`), a readable summary in the raw HTML, `robots.txt`, `sitemap.xml` and `llms.txt`.
- Settings: "AI usage and costs" section. Every answered AI call is logged on the device (kind, model, input/output tokens from the gateway's `usage`, retries marked); totals for today, 7 days and all time, a breakdown by task, the last calls, and an editable price per 1M tokens (default 26,000 toman in / 104,000 out) turn tokens into an estimated cost. The log travels with backups (merged on restore); the price does not.
- Previous/next topic buttons in the reader (desktop footer and phone bar) and at the end of a topic's "about" tab. They are the neighbours on the course path, so reading can go either way (a page off the path, such as a related topic, offers the first step not known yet as "next"). The pair are equal-width ghost buttons; one alone fills the row.
- Topics without a study pack get a floating "build flashcards and quiz" button at the bottom left (above the tab bar on phones); it shows the build status while running. The flashcard and quiz tabs are unchanged.
- Reader: a language button lists the article's versions in other Wikipedia languages (`fetchLangLinks`, Wikipedia's own language links, searchable, fa and English first) and opens the chosen one in the reader. No machine translation, so the "text is exactly Wikipedia's" promise still holds.
- Course builder: type words instead of a link and Wikipedia is searched (`searchArticles` in `src/lib/build.ts`); results show a thumbnail and description, a fa/English toggle follows the script typed, and picking one opens the usual preview. From the home input, words continue on `#/new?q=`.
- Phones: a hamburger drawer (every destination, including Insights, About and Privacy) next to the bottom bar.
- Build progress opens as a modal over a blurred page, with a progress bar and the four stages; Esc or "continue in background" closes it while the build goes on.
- Course roadmap: animated connectors between the steps (solid for learned, flowing for the next step, faint dashes for the rest) and from the main article to related topics.
- Graph: a "show all" button that re-fits the view.
- `ExportMenu` (`src/components/CourseView/`): export, share, AI prompts and course upkeep (archive, rebuild) in grouped sections.

### Changed
- Reader top bar is now just back, title and settings; on phones it sticks below the app header (before, it slid under it) and headings scroll to just below both bars.
- Builder input: the paste button becomes a red clear (X) button while there is text, and the placeholder is the short "عنوان مقاله یا لینک مقاله".
- Builder search results open as an overlay directly under the input (previously a list further down the page that the phone keyboard covered); the list is sized to the space left above the keyboard and tab bar, and Esc closes it.
- Reader toolbar: removed the "open in Wikipedia" icon beside the language button (the source link under the article title remains).
- The topic button is now "ایجاد دوره‌ی این مطلب" and the build progress dialog opens right there. The dialog is its own component (`BuildDialog`) used on every page; "continue in background" hands over to the shell banner, and only failed course builds (not reader-link errors) open it as an error.
- Course builder shows only two examples under the input (no history chips).
- Library: language, status, domain and sort moved into an "advanced filter" panel (button with an active-filter count); search, favourites and the view switch stay outside.
- Review shows how many cards come due on each of the next three days.
- Discover: next steps from your courses come first; ready-made courses follow, as a swipeable rail on phones.
- Phones: course tags fit one row (library link, language, depth and source are hidden there); the course action row (continue, save, view, export) is one line with icon-only secondary buttons; the footer is hidden below the desktop breakpoint.
- Graph: two-finger pinch zoom on touch screens and +/- zoom buttons.
- After a study pack is built the panel switches to the flashcards tab and the quiz tab glows, wiggles and shows a dot for a few seconds (until it is opened).
- Home on phones: compact hero, swipeable card rails (`.rail`) for courses, suggestions and the quick-start guide; the weekly chart and the "review done" card are hidden.
- Graph layout: nodes sit on concentric rings inside one wedge per role (higher score nearer the centre), then overlaps are relaxed away and the view zooms to fit; edge percentage labels are hidden above 16 topics.
- Export and prompts menu is a popover that stays inside the viewport (and scrolls) on desktop and a bottom sheet on phones; it no longer pushes the page down.
- Course header meta (status, level, depth, time, source) and topic tags are `chip`s; topic actions are a primary row ("read", "I know this") plus a three-cell toolbar (save, Wikipedia, topic course). The flashcard and quiz shortcuts were dropped because the tabs cover them.

### Fixed
- Unreadable "answer" tag on flashcards (and wrong tones on other chips): a `bg-*`/`text-*` override on `chip` collided with its own defaults and lost. `chip` is now split into `chipBase` (layout) and `chip` (muted tone); overriding sites use `chipBase`. Answer tag contrast is 5.5:1 in light and 9.2:1 in dark.
- Horizontal overflow on the home and insights pages (grid tracks without `min-w-0`) and a document-level scrollbar on desktop (`sr-only` elements escaping the inner scroller).

## [0.4.0] - 2026-10-02

Visual redesign, installable offline app, and the static pages a real product needs. No change to stored data or the backup format (still version 2).

### Added
- Installable PWA: `manifest.webmanifest`, 192/512 and maskable icons, `apple-touch-icon`, and a service worker (`public/sw.js`) that caches the app shell and build assets for offline use. It is registered in production builds only.
- Social preview: `og.png` (1200x630) and `og:*` / `twitter:card` / `theme-color` tags.
- Pages: About (`#/about`), Privacy (`#/privacy`), a 404 page for unknown `#/...` routes, and a footer on static pages.
- Home hero with a gradient headline, larger builder card and staggered card entry.
- Per-subject colours (math, physics, code, history, biology) for course covers; new tokens `surface-2`, `coral` and `sub-*`; `chip` class; `hero-bg`, `text-grad`, `glass`, `shimmer`, `stagger`, `pop`, `flip-in` utilities.
- Quiz result screen with an animated score ring; flashcards render as a stacked deck with a flip-in animation and coloured grade buttons.
- Graph edges animate from prerequisite to goal and hovered topics glow.

### Changed
- Brand colour moved from green to teal (`#2dd4bf` dark, `#0f766e` light); darker dark-theme surfaces; larger type steps (`text-4xl`, `text-5xl`); rounder cards (`rounded-2xl`) and controls (`rounded-xl`); primary buttons use a gradient.
- App shell: glass header and bottom bar, gradient logo mark, accent bar on the active nav item.
- Course cards show subject and level as chips and drop the language badge.
- Skeletons shimmer instead of pulsing.
- Vazirmatn is self-hosted (`public/fonts`, split by script with `unicode-range`) instead of loaded from Google Fonts.
- Light-theme `coral`, `sub-biology`, `prereq` and `info` darkened so each reaches 4.5:1 on `accent-soft`.

### Fixed
- Hero glow no longer clips to a hard-edged box.

## [0.3.0] - 2026-10-02

Product redesign: app shell, dashboard, builder, library, insights.

### Added
- Guided learning product: single "next step" on Home, course builder with depth and purpose, library, discover and insights pages.
- Playwright smoke suite and GitHub Actions CI.
- Topics as their own phone screen, course level, swipe grading and arrow-key search.
- Serverless device transfer: course share links and whole-backup transfer links.
- Settings as a page; artwork for empty states.

### Changed
- Layered depth and hover motion; an accessibility-text bug in thumbnails fixed at its root; softer empty state and clearer copy.
- Reader offers the next topic; the review page no longer claims "all done" when a card's pack is missing.

## [0.2.0] - 2026-10-01

### Added
- Article reader with easy and enhanced (AI key terms) modes.

### Changed
- Emoji replaced by `lucide-react` icons; type scale fixed for Persian; stronger landing UX and Persian copy.

## [0.1.0] - 2026-10-01

### Added
- First release: Wikipedia link to learning roadmap (prerequisites, next steps, related), flashcards with Leitner review, quizzes, backup and restore, bundled sample courses, static site on Vercel.

[Unreleased]: https://github.com/mrkavousi/wiki-course/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/mrkavousi/wiki-course/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/mrkavousi/wiki-course/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/mrkavousi/wiki-course/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/mrkavousi/wiki-course/releases/tag/v0.1.0
