# VITALS TITAN — coverage gaps

Generated bank covers **183 of 185** value-bearing item cards.

## Not covered

| Item | Why |
|---|---|
| `202:s09-9` | Every value on this card sits in a sentence fragment too short to make an answerable stem. The generator's quality filter drops stems under 45 characters of context — traceable but unanswerable questions like "2.41 would give _____ )." |
| `202:s10-21` | Same reason. |

Both are recoverable by hand-writing a question against the card if the material
turns out to be exam-relevant. Neither is a traceability failure: the values
extracted from them are in `tools/values.json` and pass the audit. They simply
have no sentence around them that reads as a question.

## Re-checking

```bash
python3 tools/generate_questions.py
python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js
```

The coverage line in that output is authoritative; `tools/coverage.json` lists
any missing items by id.
