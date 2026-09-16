# VITALS TITAN — coverage gaps

The generated bank covers **169 of 185** value-bearing item cards.

## Why cards are skipped

Two filters in `tools/generate_questions.py` drop values that cannot become a
readable question:

1. **Flattened table rows.** A card's table renders as one long "sentence" of
   values with almost no prose around them — `7% 38% 55% VERBAL VOCAL VISUAL
   words tone`. Blanking one value there produces a question nobody can answer
   from context, so records with four or more values and almost no sentence
   punctuation are skipped.
2. **Blanks buried deep in a long sentence.** Windowing those yields fragments
   like `... separately) Not separately listed in this deck NI`.

Neither is a traceability failure. Every value on these cards is in
`tools/values.json` and passes `tools/audit_values.py`; they simply have no
sentence around them that reads as a question.

## Not covered

| Item | Card |
|---|---|
| `202:s01-8` | 8 Barriers to Communication and Principles of the Process Communicatio |
| `202:s04-1` | 1 What Pulmonary Rehab Is, Its Goals, and Who Qualifies Pulmonary reha |
| `202:s04-4` | 4 Frequency of Training and of Reassessment Heuer does not print a sin |
| `202:s05-2` | 2 Causes of Increased AND Decreased ICP Intracranial pressure (ICP) is |
| `202:s05-9` | 9 Diabetic Ketoacidosis (DKA) — the ABG and Kussmaul Breathing DKA is |
| `202:s07-15` | 15 Rise, I-Time, and Ramp Rise is the speed at which the inspiratory p |
| `202:s08-14` | 14 Acid-Base Disorder Patterns — The Master Table Every example number |
| `202:s09-19` | 19 Peak flow meters and the asthma action plan zones Peak flow monitor |
| `202:s09-9` | 9 Asthma phenotypes Asthma is heterogeneous , shaped by genotype–envir |
| `202:s10-21` | 21 COPD therapist-driven protocols (TDPs) Four protocols run in COPD. |
| `203:s04-6` | 6 Bench Hemoximeter / CO-Oximeter What it is A hemoximeter (CO-oximete |
| `203:s07-4` | 4 Tracheal Shift, Paradoxical Breathing, and Flail Chest Memory trick: |
| `203:s07-5` | 5 Orthopnea — Definition, Meaning, Quantifying It, and the Workup Orth |
| `203:s07-6` | 6 Breathing Patterns Pattern Description Cause Eupnea Normal rate and |
| `203:s09-2` | 2 Capnography: how to measure; difference between waveforms, sudden in |
| `203:s09-7` | 7 Diuretics and their role Diuretics increase the excretion of solutes |

These are recoverable by hand-writing a question against the card if the
material turns out to be exam-relevant — most are reference tables, which are
better studied as tables than as cloze questions.

## Re-checking

```bash
python3 tools/generate_questions.py
python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js
```

The coverage line in that output is authoritative; `tools/coverage.json` lists
missing items by id.
