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
  The TMC bank still has the cue (64%).
