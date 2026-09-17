# VITALS TITAN — coverage gaps and flagged guide content

The bank ships **363 questions** covering **130 of 185** value-bearing
item cards.

## Possible errors in the guides

Found while writing question stems. These are not extraction errors — the
extractor reads the guide faithfully — they are places where the guide's own
text looks wrong. The questions built on them were dropped.

| Card | What the guide says | Why it looks wrong |
|---|---|---|
| `203:s05-6` (Weaning Parameters) | "Decks: 66–300 **on RA** = V/Q mismatch; > 300 **on RA** = shunt" | On room air the alveolar PO₂ is only ~100 torr, so the A–a gradient cannot reach 300. Card `203:s08-6` gives the same rule as "> 300 torr **on 100% O₂** = severe shunting", which is physiologically sound. The "on RA" wording is almost certainly the error. |
| `203:s08-6` (Shunt Calculation) | "66–300 mm Hg = V/Q mismatch; > 300 mm Hg = shunting" | States no FiO₂ at all, so on its own it contradicts `203:s05-6`. Correct if read as on 100% O₂. |

## Why cards are skipped

A value only ships when it can become a clear question:

1. **The sentence around it won't trim cleanly** — flattened table rows,
   source apparatus, stranded brackets, or fewer than eight words of context.
2. **The rewrite was dropped (122 values).** Each shipped stem is a
   hand-written question. Values were dropped rather than rewritten when they
   were case-study details (a single patient's pH), inputs to a worked
   example rather than its result, near-duplicates of a question on another
   card, commentary about the sources, or a giveaway (the Rule of Nines
   asking for 9%).
3. **No plausible distractors.** Distractors keep the answer's unit and
   precision and may not be true values on the same card; a few answers
   leave fewer than three candidates.

Every value on these cards is still in `tools/values.json` and passes
`tools/audit_values.py`.

## Not covered

| Item | Card |
|---|---|
| `202:s01-3` | 3 The 3 V's of Communication 7% 38% 55% VERBAL VOCAL VISUAL |
| `202:s01-5` | 5 Miscommunication and the Five C's Communication occurring |
| `202:s01-8` | 8 Barriers to Communication and Principles of the Process Co |
| `202:s02-1` | 1 Body Surface Area (BSA) — Rule of Nines 9 18 9 9 18 18 Hea |
| `202:s04-1` | 1 What Pulmonary Rehab Is, Its Goals, and Who Qualifies Pulm |
| `202:s04-4` | 4 Frequency of Training and of Reassessment Heuer does not p |
| `202:s05-2` | 2 Causes of Increased AND Decreased ICP Intracranial pressur |
| `202:s05-9` | 9 Diabetic Ketoacidosis (DKA) — the ABG and Kussmaul Breathi |
| `202:s07-15` | 15 Rise, I-Time, and Ramp Rise is the speed at which the ins |
| `202:s07-18` | 18 Monitoring — What Defines Success, and When to Quit What |
| `202:s07-4` | 4 IPAP — What It Is and What It Controls IPAP (Inspiratory P |
| `202:s08-13` | 13 Systematic ABG Interpretation Steps 1 · clinical assessme |
| `202:s08-14` | 14 Acid-Base Disorder Patterns — The Master Table Every exam |
| `202:s08-17` | 17 Quick Calculations — CHRONIC PaCO₂ Changes and Renal Comp |
| `202:s08-2` | 2 Normal SaO₂ Value Not covered in the available slide decks |
| `202:s08-21` | 21 Mechanisms That Reduce PaCO₂ (Causes of Acute Alveolar Hy |
| `202:s08-22` | 22 Chronic Ventilatory Failure — Why the Patient Chooses CO₂ |
| `202:s08-23` | 23 The Trap — Acute Hyperventilation on Chronic Ventilatory |
| `202:s08-25` | 25 Common Errors That Affect ABG Accuracy Learn the directio |
| `202:s08-27` | 27 Special Considerations — When the ABG Lies CO POISONING: |
| `202:s08-4` | 4 PaCO₂ — The RESPIRATORY Component PaCO₂ (normal 35 – 45 mm |
| `202:s08-5` | 5 HCO₃⁻ — The METABOLIC Component HCO₃⁻ (normal 22 – 28 mEq/ |
| `202:s09-14` | 14 Chronic severity classification (Intermittent / Mild, Mod |
| `202:s09-19` | 19 Peak flow meters and the asthma action plan zones Peak fl |
| `202:s09-20` | 20 Indications for mechanical ventilation / intubation of th |
| `202:s09-9` | 9 Asthma phenotypes Asthma is heterogeneous , shaped by geno |
| `202:s10-18` | 18 COPD exacerbation — definition and severity GOLD defines |
| `202:s10-21` | 21 COPD therapist-driven protocols (TDPs) Four protocols run |
| `202:s10-23` | 23 Worked case — putting the numbers together A 78-year-old |
| `202:s10-4` | 4 GOLD stages — severity of airflow limitation post-bronchod |
| `202:s11-4` | 4 Mallampati Classification The Mallampati Classification is |
| `202:s11-7` | 7 ETT Features That Reduce VAP Because the ETT bypasses norm |
| `202:s12-1` | 1 The Clean Distinction — Ventilation is CO₂, Oxygenation is |
| `202:s12-3` | 3 Normal Blood Gas Values The reference numbers everything e |
| `202:s12-8` | 8 Dead Space vs. Shunt — The One-Line Discriminator Dead spa |
| `203:s01-6` | 6 Proper Handling of Biohazardous Materials Yes — Heuer Ch 7 |
| `203:s03-6` | 6 Cromolyn Sodium Class Mast cell stabilizer — a nonsteroida |
| `203:s04-1` | 1 Levy-Jennings Chart — Mean, ±2 SD, and Trend vs. Shift mea |
| `203:s04-6` | 6 Bench Hemoximeter / CO-Oximeter What it is A hemoximeter ( |
| `203:s04-8` | 8 QC on Mechanical Ventilators and on Gas Analyzers Heuer Ch |
| `203:s05-8` | 8 Static and Dynamic Compliance — Formulas, Normal Ranges, a |
| `203:s06-2` | 2 Airway Devices Compared Device What it is When to use Key |
| `203:s06-4` | 4 ETT Sizes by Patient and the Pediatric Formulas Adults. He |
| `203:s06-7` | 7 Treating Pleural Effusions — Acute and Chronic Always trea |
| `203:s07-2` | 2 How a CXR Relates to Palpation, Percussion, and Breath Sou |
| `203:s07-4` | 4 Tracheal Shift, Paradoxical Breathing, and Flail Chest Mem |
| `203:s07-5` | 5 Orthopnea — Definition, Meaning, Quantifying It, and the W |
| `203:s07-6` | 6 Breathing Patterns Pattern Description Cause Eupnea Normal |
| `203:s08-5` | 5 Single-Breath N2 Washout — What It Measures and the Four P |
| `203:s09-2` | 2 Capnography: how to measure; difference between waveforms, |
| `203:s09-3` | 3 PaCO2 and PETCO2 relationships PETCO2 correlates well with |
| `203:s09-7` | 7 Diuretics and their role Diuretics increase the excretion |
| `203:s09-9` | 9 Home Apnea Monitoring (conditions requiring its use) Apnea |
| `203:s10-4` | 4 Croup vs. Epiglottitis Both are important causes of upper- |
| `203:s10-8` | 8 How Hypoxia Appears in an Infant Infants show hypoxia thro |

## Re-checking

```bash
python3 tools/generate_questions.py
python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js
```

The generator reports how many stems are rewritten, dropped, stale (the guide
value changed under a rewrite) or not yet written.
