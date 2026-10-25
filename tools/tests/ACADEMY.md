# Academy verification

No package installation is needed for the pure logic or existing engine tests:

```sh
node tools/run-engine-tests.js
node tools/tests/academy.test.js
```

The browser suites use Playwright with isolated profiles. Supply an installed `playwright-core` module through `PLAYWRIGHT_MODULE` and a Chrome executable through `CHROME_PATH` (or use Playwright's default browser). Serve the repo at `/RCPStudyGame/` on localhost; the service worker intentionally uses the production GitHub Pages path.

```sh
TEST_BASE_URL=http://127.0.0.1:8873/RCPStudyGame/ node tools/tests/academy-browser.cjs
TEST_BASE_URL=http://127.0.0.1:8873/RCPStudyGame/ node tools/tests/academy-offline.cjs
```

`academy-browser.cjs` checks desktop, 768px, 390px and 320px layouts, practice completion, missed-question review, Library and Simulation navigation, large text and reduced motion. Screenshots go to `PREVIEW_DIR` or a temporary `rcp-academy-previews` directory.

`academy-offline.cjs` checks every main destination, real cached artwork, offline study, state persistence, saved-battle resumption without consuming items again, and confirmation before replacing a saved battle with the daily challenge.

All data is seeded in isolated browser contexts. The suites do not access or change the player's browser profile.
