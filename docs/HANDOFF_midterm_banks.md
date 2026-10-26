# HANDOFF — Midterm study guides → RCP Study Game (RCP 201 / 202 / 203)

> **2026-10-26: ALL SHIPPED.** Codex published the graphics release `ddb08f2` together with the option-length fixes,
> 18 crisis scenarios and spaced repetition. index.html uses `?v=academy3` and sw.js uses `rcp-study-v19-academy-ui`.
> Verified live as a returning player: one reload → 1,948 Q, 18 scenarios, State.reviewSummary present, longest-answer rate 26%.

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
- [x] **Pushed 2026-10-25 (`88df029..1de15ab`) with the user's OK.** The live site serves all 3 courses with SW cache v15-midterms,
      checked in the browser (34 bosses / 1,532 Q, no console errors). The gap-fill ships as a second update and needs its own push OK.
- [x] **RCP 201 gap-fill done by Claude (2026-10-25):** `tools/midterm/gaps201.json`, 111 questions (201 now 491 Q).
      Method: `python3 tools/gap_prefilter.py 201` → 137 likely-uncovered cards → wrote questions only for real facts,
      skipping the "⚠️ NOT IN THE SLIDES" meta cards. Dropped 7 that overlapped the drill. Each `src` = `card:<Recall id>`,
      and every answer's numbers and key terms were checked against that card's text. Outside-the-slides facts say so in `e`.
      Epiglottis conflict (drill "larger, floppy and U-shaped" vs card Ch05 "larger and less flexible"):
      **the user decided to use the drill's description.** RULE for all courses: when a card contradicts the drill, the drill wins.
      Pushed live 2026-10-25 (SW v16-gaps201).
- [x] **RCP 202 gap-fill done by Claude (2026-10-25):** `tools/midterm/gaps202.json`, 157 questions (202 now 665 Q).
      Read all 184 pre-filtered cards. Skipped meta "not in your sources" cards and topics the drill already covers
      (Henderson-Hasselbalch, dynamic compliance, Otis, double effect, Mehrabian, levalbuterol, pneumotaxic, PRVC, MLT).
      Dropped 1 duplicate (6MWT emergency equipment). Female PBW constant 45 matches the drill's own IBW examples.
      SW CACHE = rcp-study-v17-gaps202. Committed; **push needs the user's OK.**
- [x] 202 pushed live (v17). Later added 11 more 202 questions from fact cards first passed over
      (ECMO stroke/ICH, oxygenator, cannulas, rehab components, active listening, V60 total leak, partial-compensation gases) → 202 = 676.
- [x] **RCP 203 gap-fill done by Claude (2026-10-25):** `tools/midterm/gaps203.json`, 137 questions (203 now 781 Q).
      Skipped the self-contradicting G-cylinder factor (2.14 vs 2.41) and topics the drill already tests (RSBI, classic shunt,
      chest-tube suction, adult ETT size, MEP, chin strap, VC→PC). Dropped 5 duplicates and fixed 1 wrong card id during verify.
      SW CACHE = rcp-study-v18-gaps203. **Pushed live 2026-10-25** (`53e6b60`). Verified on the live site as a returning
      player: the first load is still served from the old cache, and **one reload** shows 491 / 676 / 781 with the old cache removed.
- **Gap-fill is now complete for all three courses.** Totals: 201 = 491 · 202 = 676 · 203 = 781 (1,948).
      Re-run if Recall's cards change: `python3 tools/gap_prefilter.py <course>` and diff against `gaps<course>.json` srcs.
- [x] (done above) RCP 203 gap-fill (169 cards) — same method, Claude or Codex.
      `python3 tools/gap_prefilter.py 203 > /tmp/uncov203.txt`, write `tools/midterm/gaps203.json`, rebuild, bump CACHE to v18.
      Watch for: cards that restate a drill fact in different words, cards whose answer contradicts the drill
      (the drill wins, so skip them), and don't pipe the script into `| head` (it raises a harmless BrokenPipe).
      The verify step is the inline Python in this session's history: it checks card ids resolve in `~/recall/decks/rcp.json`
      (`.cards[].k`), that the answer's terms appear on the card, and difflib-similar stems in the bank (> 0.62).
- [ ] (Superseded by the line above) Codex gap-fill: Codex hit its ChatGPT usage limit on 2026-10-25 (resets 3:06 PM) after ~50K tokens/job, with no output written.
      The scratch dir is in /private/tmp and may be cleared, so regenerate the inputs if they're missing (cards export snippet: decks/rcp.json →
      strip HTML, split on `<hr id=answer>`, group by `d[4:7]`). Prompt template = `prompt.txt` there (placeholder __C__).
      Run ONE course at a time (201 is smallest, 321 cards) to stay under the limit:
      `cd <scratch>/gap && codex exec --sandbox workspace-write --skip-git-repo-check -C . -o answer201.md - < prompt201.txt`
- [ ] Verify each gaps20X.json (structure; spot-check each answer against its card's `back`; drop anything not on the card),
      copy to tools/midterm/, `python3 tools/build_midterm.py`, bump the sw.js CACHE, run the tests, commit
- [ ] Optional: Codex review of `git show 3368fb5`

## Option-length balance (2026-10-25)
- Problem: the correct answer was the uniquely longest option in 42% / 49% / 49% of 201 / 202 / 203 questions (chance ≈ 25%),
  so "pick the longest" worked as a test-taking trick.
- Fix: `tools/midterm/fixes20X.json` = {stem: [correct, d1, d2, d3]}, applied by the builder. Mostly the wrong options were rewritten
  to be parallel and similar in length, staying wrong. 565 questions were rewritten (122 / 216 / 227).
- Result: 23% / 26% / 28% (26% overall). Correct answer is the uniquely SHORTEST only 10–12%, so there is no reverse cue.
- Tools: `python3 tools/option_balance.py [course] [--list 1.3]` measures; `python3 tools/check_fixes.py` flags any fix that
  rewords a correct answer. Exactly 3 were reworded, none in meaning: PPHN spelled out, "Elevated (above normal)",
  and dynamic compliance trimmed to "None is published — it is a comparative value".
- Shipping: committed content + tools only. **NOT pushed.** Codex's uncommitted UI work already bumps sw.js to
  `rcp-study-v19-academy-ui`, which will deliver these rebuilt content files. Don't bump sw.js separately and race Codex.
  If the content must ship before Codex is done, bump the CACHE in sw.js and coordinate.

## Patient Crisis scenarios (2026-10-25)
- 18 cases, 6 per course, in `tools/midterm/scenarios20X.json`. The builder emits them into `content/rcp20X-midterm.js` as
  `window.ALL_SCENARIOS`, so index.html and sw.js need no changes, and the course briefing shows Patient Crisis automatically.
  201: apneic newborn, 28-wk RDS, meconium/pneumothorax, epiglottitis, croup, pediatric VF.
  202: house fire (CO/cyanide/TBSA/escharotomy), COPD on BiPAP, ARDS on ECMO, TBI/ICP, rehab O₂ titration, communication.
  203: high-pressure alarm, weaning/extubation, TB/airborne, transport O₂ math, code + capnography, VAP bundle.
- Rules the builder enforces: 3 options per decision, exactly one best (positive hpDelta), and that option's `src` must be the exact
  stem of a bank/gap question stating the same fact. No raw < or > (the crisis screen inserts text as HTML).
  The builder writes the decision ids and `next` links, and places the best answer at A/B/C in an even, seeded order.
- Verified: in a Node simulation with the real js/engine/crisis.js, all 18 best paths end "stabilized" and all 18 worst paths fail.
  Positions A/B/C = 24/31/28 of 83; the best answer is the uniquely longest 28% (chance 33%). One full play-through in the browser
  (house fire → PATIENT STABILIZED, +100 XP).
- `tools/facts.py <course> '<regex>'` prints verified facts (stem → answer | explanation) for writing new cases.
- Committed, NOT pushed. Ships with Codex's sw.js cache bump, like the option fixes.

## Spaced repetition (2026-10-25)
- `js/engine/state.js`: Leitner boxes in `questionStats[sig]` (`box`, `due`). A miss → box 0, due now; each correct review →
  next box, due in 1 / 3 / 7 / 14 days; correct from box 4 → mastered (box 5, never due). Any miss resets to box 0.
  Never-missed questions are never scheduled. Old saves (no `box`) count as due if ever missed or below 60% accuracy,
  and convert on their next answer, so nobody's progress is lost. The old flat 14-day rule is gone.
- Same API for callers (battle, training, home, survival, superboss): `recordAnswer`, `isWeakQuestion` (= due now),
  `biasedQuestionPool`, `Academy.reviewQuestions` (now sorted lowest box first, then most recent miss).
  New: `State.reviewSummary(state)` → `{due, scheduled, mastered, nextDue}`, ready for Codex to show on home
  (e.g. "6 due · next review tomorrow").
- Tests: `node tools/tests/review.test.js` (10 new) + academy (7) + engine (73), all passing. Browser check: a miss
  appeared in Review, a correct review rescheduled it about 24 h out.
- ⚠ SHIPPING: `index.html` loads `js/engine/state.js?v=midterm1` and `academy.js?v=midterm1`. **Bump those `?v=` tags**
  along with the sw.js cache, or browsers keep the cached old copies (seen locally). index.html is in Codex's open work,
  so it needs to make this change. Committed, NOT pushed.

## Gotchas
- Every content change needs a `CACHE` bump in `sw.js`, or returning players never get the update.
- VITALS TITAN uses course `rcp2xx`. The new courses are `rcp201`/`rcp202`/`rcp203`, so they don't collide.
- A fact can repeat across sections (e.g. neonatal pH in 201 s07 and s10); the builder only rejects duplicates within a section.
- New course cards reuse the existing academy images. There is no bespoke art yet.
