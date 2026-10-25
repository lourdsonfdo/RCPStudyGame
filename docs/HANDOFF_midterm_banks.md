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
- [x] Browser: a full 202 battle (Acid Oracle, 9/10 pass), a 201 study session, the survival picker with all 5 courses + a 203 run,
      and the phone layout (375 px, no horizontal scroll) all work.
- [x] **Committed locally as `3368fb5`. NOT pushed.** Push only with the user's OK (it publishes the live site).
- [ ] **NEXT: Codex gap-fill.** Codex hit its ChatGPT usage limit on 2026-10-25 (resets 3:06 PM) after ~50K tokens/job, with no output written.
      The scratch dir is in /private/tmp and may be cleared, so regenerate the inputs if they're missing (cards export snippet: decks/rcp.json →
      strip HTML, split on `<hr id=answer>`, group by `d[4:7]`). Prompt template = `prompt.txt` there (placeholder __C__).
      Run ONE course at a time (201 is smallest, 321 cards) to stay under the limit:
      `cd <scratch>/gap && codex exec --sandbox workspace-write --skip-git-repo-check -C . -o answer201.md - < prompt201.txt`
- [ ] Verify each gaps20X.json (structure; spot-check each answer against its card's `back`; drop anything not on the card),
      copy to tools/midterm/, `python3 tools/build_midterm.py`, bump the sw.js CACHE, run the tests, commit
- [ ] Optional: Codex review of `git show 3368fb5`

## Gotchas
- Every content change needs a `CACHE` bump in `sw.js`, or returning players never get the update.
- VITALS TITAN uses course `rcp2xx`. The new courses are `rcp201`/`rcp202`/`rcp203`, so they don't collide.
- A fact can repeat across sections (e.g. neonatal pH in 201 s07 and s10); the builder only rejects duplicates within a section.
- New course cards reuse the existing academy images. There is no bespoke art yet.
