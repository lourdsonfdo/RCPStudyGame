# Respiratory Academy Implementation Plan

**Goal:** Ship the approved teaching-academy home screen, responsive on phones and desktop, using real learning progress and existing game modes.

**Architecture:** Keep the static app, existing state key and router. Scope a new stylesheet to the academy home. Add a pure recommendation helper, optional eight-question training sessions and review of tracked misses. Existing unlimited training and battle rules remain available.

**Tech stack:** Vanilla JavaScript, CSS, optimized WebP art, existing service worker, Node assertions and Playwright/Chrome.

## Implementation checklist
- [x] Inspect saved state, routing, service worker, repository status and remote. Work on `feat/respiratory-academy`; preserve unrelated untracked mockups.
- [x] Prepare `img/academy-room.webp`, mobile art and course artwork from generated assets. Keep production images small and self-hosted.
- [x] Implement `js/engine/academy.js` with tested recommendations, deduplicated review pool and valid saved-battle detection. Run `node tools/tests/academy.test.js`.
- [x] Replace `js/screens/home.js` with academy header, room/station navigation, recommended session, saved battle, actual XP/streak/gold, course paths, daily challenge, review, Survival and Titan. Use native buttons/dialog for course selection.
- [x] Add `css/theme-academy.css`, scoped to home. At desktop show room and study panel side by side; below 760px stack room, study panel and course cards. Provide 44px controls, visible focus, reduced motion and a pause toggle.
- [x] Extend `js/screens/training.js` only for explicit `studyCount` / `review` contexts. Preserve existing unlimited drills. Handle empty review pools, cap sessions and show earned results with home return.
- [x] Link new assets in `index.html`, preserve browser zoom, and update cache version/precache in `sw.js` so upgrades and offline reload work.
- [x] Run `node tools/run-engine-tests.js`, helper tests, syntax checks and `git diff --check`.
- [x] Use isolated Chrome to test fresh and returning state, desktop, 390px and 320px phones, text zoom, every home route, finite sessions, resume, reduced motion and offline reload. Capture screenshots under `/Users/lourdsonfernando/RCPStudyGame-previews/`.
- [ ] Review the exact diff, commit only task files and publish to the existing GitHub Pages main branch if tests pass and remote authorization permits. Verify remote revision and served production files; report any deployment blocker accurately.

## Acceptance criteria
No fabricated progress or broken links. All current modes remain reachable. Choosing a study activity does not consume battle items or erase a saved battle. No horizontal overflow on supported phone sizes. New home assets cache successfully. Production deployment is only reported complete after remote verification.

## Verification record — 2026-10-25

- 73 existing engine tests and 7 academy helper tests passed.
- Browser layout and study-flow suite passed at 320px, 390px, 768px and desktop, plus large text and reduced motion.
- Offline/resume suite verifies 63 cached assets, all home destinations, persistent progress, and no repeated item consumption on resume.
- Production release verification remains pending until the push is served by GitHub Pages.
