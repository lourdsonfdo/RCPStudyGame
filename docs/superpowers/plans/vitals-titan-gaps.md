# VITALS TITAN — coverage gaps

The generated bank covers **143 of 185** value-bearing item cards.

## Why cards are skipped

`tools/generate_questions.py` only ships a question it can state cleanly. A
value is dropped when the sentence around it will not trim into a readable
question:

1. **Flattened table rows** — a card's table renders as one long "sentence" of
   values with no prose, so blanking one gives nothing to answer from.
2. **Source apparatus** — the clause cites a deck, a chapter or a slide rather
   than stating a fact.
3. **Fragments** — the trim leaves a dangling clause, a stranded bracket or
   fewer than eight words of context.
4. **All-caps runs** — three or more shouty words in a row is a table header.

None of this is a traceability failure. Every value on these cards is still in
`tools/values.json` and passes `tools/audit_values.py`; they simply have no
sentence around them that reads as a question.

## The trade-off

Tightening the stems cut the bank from 1,064 to 497 questions and coverage
from 169 to 143 cards. That was deliberate: a long stem carrying the
guide's citations and trailing clauses is slower to read and harder to answer
than the fact deserves. Phase depth is still 141 / 56 / 269 / 31 against the 15
a draw needs — phase 4 is the thin one, because real arithmetic is rarer than
recall.

Loosening `looks_broken` in the generator trades cleanliness back for volume.

## Not covered

| Item | Card |
|---|---|
| `202:s01-3` | 3 The 3 V's of Communication 7% 38% 55% VERBAL VOCAL VISUAL word |
| `202:s01-5` | 5 Miscommunication and the Five C's Communication occurring does |
| `202:s01-8` | 8 Barriers to Communication and Principles of the Process Commun |
| `202:s04-1` | 1 What Pulmonary Rehab Is, Its Goals, and Who Qualifies Pulmonar |
| `202:s04-4` | 4 Frequency of Training and of Reassessment Heuer does not print |
| `202:s05-2` | 2 Causes of Increased AND Decreased ICP Intracranial pressure (I |
| `202:s05-9` | 9 Diabetic Ketoacidosis (DKA) — the ABG and Kussmaul Breathing D |
| `202:s07-15` | 15 Rise, I-Time, and Ramp Rise is the speed at which the inspira |
| `202:s07-18` | 18 Monitoring — What Defines Success, and When to Quit What defi |
| `202:s07-4` | 4 IPAP — What It Is and What It Controls IPAP (Inspiratory Posit |
| `202:s08-14` | 14 Acid-Base Disorder Patterns — The Master Table Every example |
| `202:s08-17` | 17 Quick Calculations — CHRONIC PaCO₂ Changes and Renal Compensa |
| `202:s08-21` | 21 Mechanisms That Reduce PaCO₂ (Causes of Acute Alveolar Hyperv |
| `202:s08-22` | 22 Chronic Ventilatory Failure — Why the Patient Chooses CO₂ Ret |
| `202:s08-25` | 25 Common Errors That Affect ABG Accuracy Learn the direction ea |
| `202:s08-27` | 27 Special Considerations — When the ABG Lies CO POISONING: do N |
| `202:s08-4` | 4 PaCO₂ — The RESPIRATORY Component PaCO₂ (normal 35 – 45 mm Hg) |
| `202:s08-5` | 5 HCO₃⁻ — The METABOLIC Component HCO₃⁻ (normal 22 – 28 mEq/L ar |
| `202:s09-14` | 14 Chronic severity classification (Intermittent / Mild, Moderat |
| `202:s09-19` | 19 Peak flow meters and the asthma action plan zones Peak flow m |
| `202:s09-20` | 20 Indications for mechanical ventilation / intubation of the as |
| `202:s09-9` | 9 Asthma phenotypes Asthma is heterogeneous , shaped by genotype |
| `202:s10-21` | 21 COPD therapist-driven protocols (TDPs) Four protocols run in |
| `202:s11-4` | 4 Mallampati Classification The Mallampati Classification is a b |
| `202:s11-7` | 7 ETT Features That Reduce VAP Because the ETT bypasses normal a |
| `202:s12-1` | 1 The Clean Distinction — Ventilation is CO₂, Oxygenation is O₂ |
| `202:s12-8` | 8 Dead Space vs. Shunt — The One-Line Discriminator Dead space i |
| `203:s01-6` | 6 Proper Handling of Biohazardous Materials Yes — Heuer Ch 7 cov |
| `203:s04-6` | 6 Bench Hemoximeter / CO-Oximeter What it is A hemoximeter (CO-o |
| `203:s05-8` | 8 Static and Dynamic Compliance — Formulas, Normal Ranges, and R |
| `203:s06-2` | 2 Airway Devices Compared Device What it is When to use Key caut |
| `203:s06-7` | 7 Treating Pleural Effusions — Acute and Chronic Always treat th |
| `203:s07-2` | 2 How a CXR Relates to Palpation, Percussion, and Breath Sounds |
| `203:s07-4` | 4 Tracheal Shift, Paradoxical Breathing, and Flail Chest Memory |
| `203:s07-5` | 5 Orthopnea — Definition, Meaning, Quantifying It, and the Worku |
| `203:s07-6` | 6 Breathing Patterns Pattern Description Cause Eupnea Normal rat |
| `203:s08-5` | 5 Single-Breath N2 Washout — What It Measures and the Four Phase |
| `203:s09-2` | 2 Capnography: how to measure; difference between waveforms, sud |
| `203:s09-3` | 3 PaCO2 and PETCO2 relationships PETCO2 correlates well with PaC |
| `203:s09-7` | 7 Diuretics and their role Diuretics increase the excretion of s |
| `203:s09-9` | 9 Home Apnea Monitoring (conditions requiring its use) Apnea mon |
| `203:s10-4` | 4 Croup vs. Epiglottitis Both are important causes of upper-airw |

## Re-checking

```bash
python3 tools/generate_questions.py
python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js
```
