# Changelog

All notable changes to Wiki Course. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html), see "Versioning" in [HANDOVER.md](HANDOVER.md) section 12.

Versions 0.1.0 to 0.3.0 were assigned afterwards from the commit history and tagged on the last commit of each: `v0.1.0` = `575ecdc`, `v0.2.0` = `ad90344`, `v0.3.0` = `b50bdf3`. From `v0.4.0` on, tags are made at release time.

## [Unreleased]

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
