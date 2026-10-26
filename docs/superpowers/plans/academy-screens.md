# Academy Screens — Design Extension

Apply the approved Respiratory Academy visual style to all 15 secondary screens. Reuse existing optimized local WebP artwork; preserve course content, saved progress, battle rules, inventory, and existing boss sprites.

- [x] Scope shared styling to `.acsc` on secondary screen roots; retain the home layout and full mobile course illustrations.
- [x] Add course illustration banners to course, boss, scenario, and Titan selection. Add illustrated mode cards, compact study scenery, and academy backdrops to combat and result stages.
- [x] Match navy/teal panels, restrained gold, serif headings, and legible system body text. Preserve explicit correct/wrong answer feedback.
- [x] Pass course artwork and the saved motion preference through the router; screen-local rerenders retain root styling. Honor reduced motion, text scaling, and keyboard focus.
- [x] Keep floating text controls clear of navigation and support phone/tablet/desktop widths.
- [x] Load and precache the shared stylesheet, revision modified scripts, and bump cache to v19 while preserving CDN-fresh installation.
- [x] Validate secondary screens, interactions, saved state and offline play.
- [ ] Publish and verify GitHub Pages.

Implementation: `css/theme-academy-screens.css`, `js/app.js`, `js/screens/*.js`, `index.html`, `sw.js`. No new runtime dependencies or image downloads.

Verification: `node tools/run-engine-tests.js`, `node tools/tests/academy.test.js`, and browser checks `academy-screens.cjs`, `academy-browser.cjs`, `academy-offline.cjs`. Browser scripts accept `PLAYWRIGHT_MODULE`, `CHROME_PATH`, and `TEST_BASE_URL`. The secondary-screen check additionally accepts `WIDTHS` and `PREVIEW_DIR`; use `?xl` in TEST_BASE_URL to exercise largest global text. Physical iPhone/Safari requires separate device verification.

Validation (2026-10-26): 73 engine, 7 academy, 10 spaced-review and 57 Python tests passed. Existing academy browser/offline suites passed with 67 precached assets. All 15 secondary screens passed at 320/390/768/1440px; 320px also passed with largest global text. Graphics loading, saved/reduced motion, answer colors, rerenders and unobstructed Back controls passed. Browser checks used isolated Chrome contexts; no physical iPhone/Safari check.
