# Super Boss — RCP 202/203 Values Gauntlet

**Date:** 2026-09-15
**Status:** Design and spec approved
**Repo:** `/Users/lourdsonfernando/RCPStudyGame` (v1.5, head `cf44aa9`)

## Goal

A single end-game boss whose question bank is built **primarily from the numeric values** in the
RCP 202 and RCP 203 Tier 3 study guides. Numbers only: normal ranges, thresholds, cutoffs, doses,
formulas, flows, pressures, percentages, durations. Not prose pearls, not named-criteria lists.

## Source inventory (measured, not estimated)

Parsed from the two Tier 3 HTML files in the vault:

- `Study Brain/RCP 202/RCP_202_Tier3.html` (413 KB)
- `Study Brain/RCP 203/RCP_203_Tier3.html` (607 KB)

| | RCP 202 | RCP 203 | Total |
|---|---|---|---|
| Item cards | 155 | 91 | 246 |
| Items carrying unit-bound values | 90 | 89 | **179** |
| Value-bearing sentences | 254 | 727 | **981** |
| (item, value) pairs | 528 | 1,486 | **2,014** |
| Distinct value strings | 345 | 849 | 1,005 (189 shared) |

"Unit-bound" = a number welded to a unit or comparison (`>30 cmH2O`, `45 kg`, `90–95%`, `<6 lb`,
`3–5 days`). Excludes list-counts ("the 5 levels") and citations ("slide 14", "Table 60–1").

**RCP 203 is ~3x denser than 202.** Its gas/equipment chapters are number-saturated; 202's
communication and burn sections are largely prose. Phase allocation reflects this.

Expected yield after dedup and dropping non-testable numbers: **~450–600 distinct testable values**.
Target bank: **~450 questions**. For scale, the entire existing game is 480+ questions / 22 bosses.

## Content pipeline

The governing constraint (standing rule 0/1): every value must be traceable to the guide. The bank
is **generated from the source and verified against it**, never written from memory.

### `tools/extract-values.py`

Parses both Tier 3 HTMLs into `tools/values.json`. One record per value-bearing sentence:

```json
{
  "key": "203:s06-12#3",
  "course": "203",
  "item": "s06-12",
  "item_title": "Oxygen Concentrators",
  "section": "06",
  "quote": "Concentrators deliver 90–95% oxygen at flows up to 10 L/min.",
  "values": ["90-95%", "10L/min"],
  "cite": "Lssn 4 Chp 6 — Assemble & Troubleshoot Equipment, slide 41"
}
```

Item cards match `<article class="card( wide)?" id="sNN-M">`. The `.src` div supplies `cite`.
Item ids are unique — 155 in 202, 91 in 203, zero duplicates — so one card is exactly one item and
no cross-card merging is needed.

### Authoring

Questions are written **only** from `values.json`. Each question object carries provenance:

```js
{
  id: 'sv-203-0142',
  topic: 'sb-gas',
  course: 'rcp2xx',
  phase: 2,
  difficulty: 2,
  q: 'An oxygen concentrator delivers what FiO2 range at flows up to 10 L/min?',
  choices: ['70–80%', '85–90%', '90–95%', '96–99%'],
  correct: 2,
  explanation: 'Concentrators deliver 90–95% O2 at ≤10 L/min.',
  srcItem: '203:s06-12',
  srcQuote: 'Concentrators deliver 90–95% oxygen at flows up to 10 L/min.',
  srcCite: 'Lssn 4 Chp 6 — Assemble & Troubleshoot Equipment, slide 41',
}
```

### `tools/verify-values.py` — build gate

For every question in the bank:

1. `srcItem` resolves to a real card in the named Tier 3 file.
2. The correct choice's value string appears **literally** inside that card's text.
3. `srcQuote` appears verbatim in that card.
4. No duplicate `id`. No question whose correct answer also appears among its distractors.
5. Distractor sanity: distractors must not themselves be the correct value for the same quote.

Any failure fails the build. Output also includes a **coverage report** — of the 179 value-bearing
items, which are covered / partially covered / missing — so gaps go on a list rather than into the
deliverable.

## The boss

**VITALS TITAN** (`id: 'vitals-titan'`), `course: 'rcp2xx'`. A single boss, not part of the
103/104 grids.

**5 phases x 15 questions = 75 per run**, drawn from the ~450 bank.

| Phase | Topic | Draws from |
|---|---|---|
| 1 | 202 values | vent settings, ABG, burn/Parkland, renal, BiPAP |
| 2 | 203 gas supply | cylinders & factors, LOX, regulators, flowmeters, PISS |
| 3 | 203 equipment & monitoring | airways, spirometry, chest tubes, PFT, transcutaneous |
| 4 | Formulas & calculations | FiO2 = (LPM x 4) + 20, PBW, entrainment ratios, cylinder duration, dead space |
| 5 | Final | mixed from phases 1–4, weighted toward values missed **this run** |

### No-repeat rule

A run maintains an `asked` Set of question ids **and an `askedValues` Set of value keys**, where a
value key is `srcItem` plus the normalised correct answer. **Phases 1–4 never repeat a question or a
value** — each phase draws only from candidates absent from both sets, and never takes two questions
on the same value inside a single draw.

Deduping on id alone would be theatre: every question carries exactly one `phase`, so two phases can
never share an id anyway. The repeat a player would actually notice is a phase-4 calculation
question asking for a number a phase-1 recall question already asked. That is a value collision, not
an id collision, so the value key is the real guard. Phase 4 is affected most, since its calculation
items are built on the same 202 and 203 cards phases 1–3 draw from.

Phase 5 is the only phase that may re-ask, and only deliberately: it prefers questions from this
run's `missed` set, topping up with unseen questions if `missed` is under 15.

If a phase's unseen candidate pool drops below 15 — by id or by distinct value — the run raises and
names the shortfall rather than silently repeating. That is a content-coverage bug and should be
loud. `tools/verify_values.py` also reports how many values are tested in more than one phase, so a
padded bank is visible at build time.

### Gating and HP

- **Gate: 12/15 correct to advance.** Failing a phase ends the run; restart from phase 1. No
  mid-fight retry.
- Boss HP: 5 bars of 100, one per phase.
- Player HP carries across phases, restoring **30% between phases**. Without the partial heal,
  75 questions on one bar is unwinnable rather than hard.

## Code shape

**`js/engine/superboss.js`** — new module. It *wraps* `Battle` rather than modifying it;
`js/engine/battle.js` is shared by 22 bosses, the daily challenge, and survival mode, and stays
untouched. Owns: phase sequencing, the `asked`/`missed` sets, per-phase pool filtering, gate
evaluation, inter-phase heal, run persistence.

**`js/screens/superboss.js`** + a new `<section data-screen="superboss">` — reuses battle's question
rendering with a phase banner and a 5-segment boss HP bar.

**Content files:**
- `content/rcp2xx-superboss.js` — boss definition
- `content/rcp202-values.js` — phase 1 bank (+ phase 4 contributions)
- `content/rcp203-values.js` — phase 2/3 banks (+ phase 4 contributions)
- sprite entry added to `content/boss-sprites.js`

**Entry point:** home gets a third module — a red "FINAL PROTOCOL" tile that skips `course-mode` and
routes straight to a briefing screen, then the run.

**Persistence:** run state saves on backgrounding, matching the behavior added in `32e99fa`.

**Results:** per-phase breakdown. The wrong-answer review shows each miss's Tier 3 item number and
source citation line so it can be traced back to the guide.

## Testing

- `tools/verify-values.py` runs green on the full bank (build gate).
- Coverage report shows every one of the 179 value-bearing items accounted for: covered, partial, or
  explicitly listed as missing.
- Engine unit checks: phases 1–4 produce zero duplicate ids across a simulated run; phase 5 prefers
  missed ids; a phase with a short pool raises rather than repeats; gate math at 11/15 and 12/15.
- Manual: full 75-question run in the browser preview, plus a deliberate phase-2 failure to confirm
  the run ends and restarts at phase 1.

## Out of scope

- Any change to `battle.js`, the 103/104 bosses, survival, crisis, or the daily challenge.
- Non-numeric content from the Tier 3 guides.
- The RCP 201 guides and Anki decks.
