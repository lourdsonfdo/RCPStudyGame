# HANDOFF — Final study guides + TMC bank → RCP Study Game

## What this is
Three courses added 2026-11-16, copied verbatim from the Recall app (`~/recall/`):

| Course id | Name on screen | Source in Recall | Bosses | Questions |
|---|---|---|---|---|
| `rcp202f` | RCP 202 FINAL · Critical Care Final | `drills/rcp202-final.json` | 18 (one per guide section) | 887 |
| `rcp203f` | RCP 203 FINAL · Board Prep Final | `drills/rcp203-final.json` | 7 (the drill's themed sections) | 702 |
| `rcptmc`  | TMC BOARDS · TMC Board Exam | `guides/tmc-trainer.html` (`window.__BANK__`) | 15 (NBRC chapters; 7+8 and 16+17 merged) | 420 |

Game total is now 97 bosses / 4,807 questions. The midterm courses are unchanged.

## Rebuild when Recall changes
```
python3 tools/build_finals.py --sync      # re-copies tools/finals/bank*.json from ~/recall, rebuilds content/
node tools/tests/finals-content.test.cjs  # every question identical to Recall, right boss, wiring present
```
Then bump `CACHE` in `sw.js` and the `?v=` tags of the three content files in `index.html`.
A new section in a Recall drill needs a boss name in `BOSSES` (tools/build_finals.py) or the build stops.

## Wiring
- `Academy.COURSES` (js/engine/academy.js) lists the courses; `tag` is the top-bar label (`Academy.tag(id)`),
  `arena` borrows another course's battle backdrop when the course has none of its own.
- Survival best-score key is `'best' + id without "rcp"` (`best202f`, `best203f`, `besttmc`).
- Boss ids: `f202-sNN`, `f203-gNN`, `tmc-cNN`. Question ids: `q-<boss id>-NNN`.

## Not done / known limits
- The 20 CSE simulations in the TMC trainer are not in the game (different format from Patient Crisis).
- No Patient Crisis cases for the three new courses.
- Answer-length cue: fixed in Recall for 202F/203F on 2026-11-16/17 (board-style distractor rewrite, Codex-audited;
  correct option uniquely longest now 21% / 24%) and synced here (CACHE rcp-study-v30-finals-board-style).
  TMC bank fixed 2026-11-17 in ~/rcp-tmc-trainer (241/420 rewritten, Codex-audited against the Heuer text;
  answer clearly longest 56% -> 3%), copied to Recall and synced here (CACHE rcp-study-v31-tmc-board-style).

## 2026-11-17 — Recall's trainer is now the 2027 RTE trainer
Recall `guides/tmc-trainer.html` was replaced by the RTE trainer (~/rcp-tmc-trainer/index.html). Its bank is a
`<script id="bank" type="application/json">` block (breadth + cj). `tmc_bank_from_recall()` now reads that and keeps the
420 book-sourced breadth items (origin "heuer"; chapter from the id `C<ch>-Q<n>`; chapter titles from
`tools/finals/tmc-chapters.json`). The questions are unchanged; 9 source tags now show the 2027 RTE section.
The 42 new 2027-topic items and the 191 clinical-judgment items are NOT in the game (no boss mapping yet).
CACHE `rcp-study-v32-rte-source`, `tmc-boards.js?v=finals3`. The reader still accepts the old window.__BANK__ page.
