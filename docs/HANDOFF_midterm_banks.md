# HANDOFF — Midterm study guides → RCP Study Game (RCP 201 / 202 / 203)

Updated at every milestone so Claude or Codex can resume cold. Newest status first.

## Goal
Add all midterm-study-guide content for RCP 201, 202, 203 to the game as three new courses,
one boss per study-guide section, questions usable in both Study (training) and Battle.

## Sources (the user pointed at the Recall app: `~/recall/`)
- Base banks = Recall midterm drills `~/recall/drills/rcp20{1,2,3}.json` (`.sections`), copied to `tools/midterm/bank20X.json`.
  201: 380 Q / 10 sections · 202: 508 Q / 13 sections (s01–s12, s14) · 203: 644 Q / 11 sections (s01–s10, s12). o[0] = correct.
- Gap source = Recall flashcards `~/recall/decks/rcp.json` (`.cards`, decks "RCP 201::Midterm", "RCP 202::Tier 3::…", "RCP 203::Tier 3::…";
  321 / 980 / 1232 cards).
- Scratch: `/private/tmp/claude-501/-Users-lourdsonfernando/a4ff4bcf-923a-44ae-b6b3-16f7e1e00284/scratchpad/rcp/gap/`
  holds cards20X.json (plain text), bank20X.json, prompt20X.txt, and Codex outputs gaps20X.json, answer20X.md, log20X.txt.

## Status
- [x] Builder `tools/build_midterm.py` → `content/rcp20{1,2,3}-midterm.js` (34 bosses, 1,532 Q). Boss names live in the script.
      Merges `tools/midterm/gaps20X.json` if present.
- [x] Wired: `Academy.COURSES` registry (js/engine/academy.js) drives the home cards, station dialog, course-mode
      (new Study Library button; Patient Crisis hidden when no scenarios), and survival. state.recordSurvival key = 'best'+number.
      index.html script tags ?v=midterm1; sw.js precaches the 3 files, CACHE = rcp-study-v15-midterms.
- [x] `node tools/run-engine-tests.js` → 73 passed. Home + 201 boss grid checked in the browser (port 3456, `.claude/launch.json` "mockups").
- [~] Codex gap-fill: 3 parallel `codex exec` jobs (prompt20X.txt). Re-run one with:
      `cd <scratch>/gap && codex exec --sandbox workspace-write --skip-git-repo-check -C . -o answer201.md - < prompt201.txt`
- [ ] Verify gaps (structure + spot-check each against its card's `back`), copy to tools/midterm/, rebuild
- [ ] Browser: play one battle + one study session on a new course; check survival picker
- [ ] Codex review of the code diff
- [ ] Commit; ask the user before pushing (always `git log origin/main..HEAD` first, since other sessions commit here)

## Gotchas
- Every content change needs a `CACHE` bump in `sw.js`, or returning players never get the update.
- VITALS TITAN uses course `rcp2xx`. The new courses are `rcp201`/`rcp202`/`rcp203`, so they don't collide.
- A fact can repeat across sections (e.g. neonatal pH in 201 s07 and s10); the builder only rejects duplicates within a section.
- New course cards reuse the existing academy images. There is no bespoke art yet.
