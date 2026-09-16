# VITALS TITAN Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a five-phase, 75-question super boss ("VITALS TITAN") whose ~450-question bank is generated and verified from the numeric values in the RCP 202 and RCP 203 Tier 3 study guides.

**Architecture:** A Python pipeline extracts value-bearing sentences from the two Tier 3 HTML files into `tools/values.json`, questions are authored from that JSON with full provenance, and `tools/verify-values.py` fails the build if any answer is not literally present in its cited source card. In the game, a new `js/engine/superboss.js` wraps the existing `Battle` engine — it is never modified — adding phase sequencing, a run-scoped no-repeat rule, phase gates and inter-phase healing. A new `superboss` screen renders the run.

**Tech Stack:** Vanilla ES5-style IIFE JavaScript with globals on `window` (no bundler, no npm). Python 3.9 stdlib only (`unittest`, `re`, `json`, `html`) — pytest is NOT installed. Node 24 for headless engine tests. Browser tests appended to the existing hand-rolled `test-engine.html` harness.

**Spec:** `docs/superpowers/specs/2026-09-15-superboss-values-design.md`

---

## File Structure

**Create:**
- `tools/extract_values.py` — Tier 3 HTML → `tools/values.json`
- `tools/verify_values.py` — build gate + coverage report
- `tools/tests/test_extract_values.py` — unittest for the extractor
- `tools/tests/test_verify_values.py` — unittest for the gate
- `tools/tests/fixtures/mini_tier3.html` — small hand-built Tier 3 fixture
- `tools/run-engine-tests.js` — Node runner for engine tests
- `tools/tests/superboss.test.js` — engine test suite (shared by Node + browser)
- `js/engine/superboss.js` — phase sequencing, no-repeat pools, gates, healing, persistence
- `js/screens/superboss.js` — the run screen
- `js/screens/superboss-briefing.js` — pre-run briefing
- `content/rcp2xx-superboss.js` — boss definition
- `content/rcp202-values.js` — phase 1 bank + 202 contributions to phase 4
- `content/rcp203-values.js` — phase 2/3 banks + 203 contributions to phase 4

**Modify:**
- `content/boss-sprites.js` — add the `vitals-titan` sprite pair
- `index.html` — new screen sections + script tags, cache-bust version
- `sw.js` — bump cache name, add new files to the precache list
- `js/screens/home.js` — add the FINAL PROTOCOL tile
- `js/screens/results.js` — per-phase breakdown when the run is a superboss run
- `js/screens/review-answers.js` — show `srcItem` / `srcCite` when present
- `test-engine.html` — load and run the superboss suite

**Never modify:** `js/engine/battle.js`, the 103/104 boss or question files, `js/engine/crisis.js`, `js/screens/survival.js`.

**Paths to the source guides (read-only, outside the repo):**
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 202/RCP_202_Tier3.html`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 203/RCP_203_Tier3.html`

---

## Task 1: Value extractor

**Files:**
- Create: `tools/tests/fixtures/mini_tier3.html`
- Create: `tools/tests/test_extract_values.py`
- Create: `tools/extract_values.py`

- [ ] **Step 1: Create the fixture**

Create `tools/tests/fixtures/mini_tier3.html`:

```html
<!DOCTYPE html><html><body>
<section id="s06"><div class="shead"><span class="snum">06</span><h2>Equipment</h2></div>
<nav class="idx"><a href="#s06-12"><span class="n">12</span>Oxygen Concentrators</a></nav>
<div class="grid">
<article class="card wide" id="s06-12"><h3><span class="inum">12</span>Oxygen Concentrators</h3>
<div class="body"><p>Concentrators deliver <b>90&ndash;95%</b> oxygen at flows up to <b>10 L/min</b>.
Above that flow the purity falls off. There are 5 levels of service.</p></div>
<div class="ball"><strong>Exam anchor</strong>Purity drops below 90% past 10 L/min.</div>
<div class="src"><strong>Source</strong>Lssn 4 Chp 6 &mdash; Assemble &amp; Troubleshoot Equipment, slide 41</div>
</article>
<article class="card wide" id="s06-13"><h3><span class="inum">13</span>Prose Only Item</h3>
<div class="body"><p>This item contains no numbers bound to units at all.</p></div>
<div class="src"><strong>Source</strong>Lssn 4 Chp 6, slide 44</div>
</article>
</div></section>
</body></html>
```

- [ ] **Step 2: Write the failing test**

Create `tools/tests/test_extract_values.py`:

```python
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import extract_values as ev

FIXTURE = os.path.join(os.path.dirname(__file__), 'fixtures', 'mini_tier3.html')


class TestExtractValues(unittest.TestCase):
    def setUp(self):
        self.records = ev.extract_file(FIXTURE, '203')

    def test_only_value_bearing_items_produce_records(self):
        items = {r['item'] for r in self.records}
        self.assertIn('s06-12', items)
        self.assertNotIn('s06-13', items, 'prose-only item must not yield records')

    def test_record_carries_provenance(self):
        rec = self.records[0]
        self.assertEqual(rec['course'], '203')
        self.assertEqual(rec['item'], 's06-12')
        self.assertEqual(rec['item_title'], 'Oxygen Concentrators')
        self.assertEqual(rec['section'], '06')
        self.assertEqual(
            rec['cite'],
            'Lssn 4 Chp 6 — Assemble & Troubleshoot Equipment, slide 41')

    def test_key_is_unique_and_namespaced(self):
        keys = [r['key'] for r in self.records]
        self.assertEqual(len(keys), len(set(keys)))
        self.assertTrue(all(k.startswith('203:s06-12#') for k in keys))

    def test_entities_are_unescaped_in_quote(self):
        quote = self.records[0]['quote']
        self.assertIn('90–95%', quote)
        self.assertNotIn('&ndash;', quote)

    def test_values_are_unit_bound_only(self):
        vals = set()
        for r in self.records:
            vals.update(r['values'])
        self.assertIn('90-95%', vals)
        self.assertIn('10l/min', vals)
        self.assertNotIn('5', vals, 'bare list-count "5 levels" must not be a value')

    def test_citation_numbers_are_not_values(self):
        for r in self.records:
            self.assertNotIn('41', r['values'])
            self.assertNotIn('6', r['values'])


class TestValuePattern(unittest.TestCase):
    """Regression tests for the value regex itself.

    Respiratory values are frequently negative (NIF/MIP) and frequently
    expressed in cm H2O with a Unicode subscript. Both were silently dropped by
    an earlier version of this pattern, which would have produced questions
    whose 'correct' answer was off by a sign.
    """

    def values(self, text):
        return [ev.normalize_value(v) for v in ev.VALUE_RE.findall(text)]

    def test_negative_pressure_keeps_its_sign(self):
        got = self.values('NIF/MIP normal < \u2212\u200b60 cm H\u2082O'.replace('\u200b', ''))
        self.assertIn('<-60cmh2o', got)

    def test_bare_negative_with_unit(self):
        self.assertIn('-100cmh2o', self.values('peak \u2212100 cmH2O'))

    def test_unicode_subscript_unit_is_matched(self):
        self.assertIn('\u226430cmh2o', self.values('plateau \u2264 30 cm H\u2082O'))

    def test_ascii_and_unicode_subscript_normalise_alike(self):
        self.assertEqual(self.values('30 cm H\u2082O'), self.values('30 cmH2O'))

    def test_compound_unit_wins_over_its_prefix(self):
        self.assertIn('70-100ml/cmh2o', self.values('Static compliance 70\u2013100 mL/cm H\u2082O'))

    def test_comparison_keeps_its_unit(self):
        self.assertIn('>20%', self.values('A major burn is defined as >20% TBSA'))

    def test_plain_number_without_unit_is_not_a_value(self):
        self.assertEqual(self.values('There are 5 levels of service.'), [])

    def test_range_without_sign_is_unaffected(self):
        self.assertIn('90-95%', self.values('Concentrators deliver 90\u201395% oxygen'))

    def test_range_dash_after_a_fraction_is_not_a_minus(self):
        got = self.values('nasal cannula at \u00bc\u20132 L/min')
        self.assertIn('2l/min', got)
        self.assertNotIn('-2l/min', got)

    def test_spaced_range_is_not_read_as_a_negative(self):
        got = self.values('14 \u2013 18 breaths/min')
        self.assertIn('14-18breaths/min', got)
        self.assertNotIn('-18breaths/min', got)


if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -m unittest discover -s tools/tests -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'extract_values'`

- [ ] **Step 4: Write the extractor**

Create `tools/extract_values.py`:

```python
"""Extract unit-bound numeric values from RCP Tier 3 study guide HTML.

Output feeds tools/values.json, the ONLY permitted source for VITALS TITAN
question content. Nothing here may be written from memory.
"""
import argparse
import html
import json
import os
import re

GUIDES = {
    '202': '/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 202/RCP_202_Tier3.html',
    '203': '/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 203/RCP_203_Tier3.html',
}

CARD_RE = re.compile(
    r'<article class="card(?: wide)?" id="(s(\d+)-\d+)">(.*?)</article>', re.S)
H3_RE = re.compile(r'<h3>(.*?)</h3>', re.S)
SRC_RE = re.compile(r'<div class="src">(.*?)</div>', re.S)

# Unit alternation is LONGEST-FIRST on purpose: "mL/cm H2O" must win over
# "mL", and "cm H2O" over a bare number. The 202 guide writes the subscript as
# Unicode U+2082 (cm H₂O) and the 203 guide writes ASCII (cmH2O), so both forms
# are accepted here and folded together by normalize_value.
UNITS = (r"(?:mL/cm\s?H[2₂]O|cm\s?H[2₂]O|cmH[2₂]O|mm\s?Hg|mmHg|mL/kg|mL|L/min|"
         r"LPM|mg/kg|mg|mcg|g/dL|mEq/L|mmol/L|kPa|%|°C|°F|Fr\b|psig|psi|kg|lb|"
         r"sec(?:onds)?|min(?:utes)?|hours?|hrs?|days?|weeks?|beats?/min|"
         r"breaths?/min|bpm|/min|joules?|Hz)")

# A leading sign is part of the value, not decoration. NIF/MIP normals are
# NEGATIVE pressures (−60 cm H2O); dropping the sign would turn a correct card
# into a question with a wrong answer, which is the exact failure this whole
# pipeline exists to prevent.
# The lookbehind matters: in "¼–2 L/min" the dash is a RANGE separator whose
# left operand (a vulgar fraction) this pattern cannot match. Without it the
# dash is read as a minus and the upper bound becomes "-2 L/min", which is not
# a real flow. A sign never directly follows a digit or a fraction.
SIGN = r"(?<![\d¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])[−–\-]?"
NUM = r"\d+(?:\.\d+)?"
RANGE = r"%s%s(?:\s*(?:[–—\-]|to)\s*%s%s)?" % (SIGN, NUM, SIGN, NUM)

# Either a comparison (unit optional — ">20% TBSA", "< −40") or a plain value
# that MUST carry a unit (so "5 levels" is not mistaken for a value).
VALUE_RE = re.compile(
    r"(?:[<>≤≥]\s*%s(?:\s*%s)?|%s\s*%s)" % (RANGE, UNITS, RANGE, UNITS), re.I)

# Numbers that belong to a citation, not to a fact.
CITE_RE = re.compile(
    r'\b(?:slides?|chapters?|chp|ch\.|lssn|lesson|tables?|figures?|items?|pages?|p\.)'
    r'\s*\d+(?:\s*[-–,]\s*\d+)*', re.I)

SENT_SPLIT_RE = re.compile(r'(?<=[.;:!?])\s+(?=[A-Z(“"•\d])')


def strip_tags(fragment):
    """HTML fragment -> plain text with entities resolved and space collapsed."""
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', fragment))).strip()


def normalize_value(raw):
    """Canonical form: lowercase, no spaces, ASCII hyphen, ASCII subscript.

    Folds U+2212 MINUS, en/em dashes and the Unicode subscript two so that the
    202 guide's "−60 cm H₂O" and the 203 guide's "-60 cmH2O" produce the same
    key. Range separators and negative signs both normalise to "-"; that is
    fine for a comparison key.
    """
    return (raw.lower()
               .replace(' ', '')
               .replace('−', '-')
               .replace('—', '-')
               .replace('–', '-')
               .replace('₂', '2'))


def sentences(text):
    return [s.strip() for s in SENT_SPLIT_RE.split(text) if s.strip()]


def extract_file(path, course):
    """Return a list of value records for one Tier 3 guide."""
    with open(path, encoding='utf-8') as fh:
        doc = fh.read()

    records = []
    for match in CARD_RE.finditer(doc):
        item_id, section, inner = match.group(1), match.group(2), match.group(3)

        title_match = H3_RE.search(inner)
        title = strip_tags(title_match.group(1)) if title_match else ''
        title = re.sub(r'^\d+\s*', '', title)

        src_match = SRC_RE.search(inner)
        cite = strip_tags(src_match.group(1)) if src_match else ''
        cite = re.sub(r'^Source\s*', '', cite)

        # The source line is provenance, not content.
        body = SRC_RE.sub(' ', inner)
        text = strip_tags(body)

        seq = 0
        for sentence in sentences(text):
            testable = CITE_RE.sub(' ', sentence)
            found = VALUE_RE.findall(testable)
            if not found:
                continue
            values = sorted({normalize_value(v) for v in found})
            seq += 1
            records.append({
                'key': '%s:%s#%d' % (course, item_id, seq),
                'course': course,
                'item': item_id,
                'item_title': title,
                'section': section,
                'quote': sentence,
                'values': values,
                'cite': cite,
            })
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', default=os.path.join(os.path.dirname(__file__), 'values.json'))
    args = parser.parse_args()

    payload = {'guides': GUIDES, 'records': []}
    for course, path in sorted(GUIDES.items()):
        recs = extract_file(path, course)
        payload['records'].extend(recs)
        items = len({r['item'] for r in recs})
        print('RCP %s: %d records across %d value-bearing items' % (course, len(recs), items))

    with open(args.out, 'w', encoding='utf-8') as fh:
        json.dump(payload, fh, indent=1, ensure_ascii=False)
    print('wrote %s (%d records)' % (args.out, len(payload['records'])))


if __name__ == '__main__':
    main()
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -m unittest discover -s tools/tests -v`
Expected: PASS, 14 tests OK (6 extraction + 8 value-pattern regressions)

- [ ] **Step 6: Run the extractor against the real guides**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/extract_values.py`

Expected output shape:
```
RCP 202: >=254 records across >=90 value-bearing items
RCP 203: >=727 records across >=89 value-bearing items
wrote tools/values.json (>=981 records)
```

Those floors are what the original, narrower pattern produced. The corrected pattern recognises
negative values and Unicode-subscript units, so the counts can only go UP. If any count comes in
**below** a floor, STOP — the parser is dropping cards, which is a correctness bug, not a content
shortage.

Then confirm the two specific recoveries:

```bash
python3 -c "
import json
d=json.load(open('tools/values.json'))
vals=[v for r in d['records'] for v in r['values']]
signed=[v for v in vals if v.lstrip('<>=\u2264\u2265').startswith('-')]
cmh2o=[v for v in vals if 'cmh2o' in v]
print('negative values:', len(signed), signed[:5])
print('cmH2O-bound values:', len(cmh2o), cmh2o[:5])
assert signed, 'negative values still dropped'
assert len(cmh2o) > 100, 'cmH2O values still dropped'
print('OK')
"
```
Expected: ~60+ negative values and ~300+ cmH2O-bound values, ending in `OK`.

- [ ] **Step 7: Commit**

```bash
git add tools/extract_values.py tools/tests/test_extract_values.py tools/tests/fixtures/mini_tier3.html tools/values.json
git commit -m "feat(tools): extract unit-bound values from RCP 202/203 Tier 3 guides"
```

---

## Task 2: Verification gate and coverage report

**Files:**
- Create: `tools/tests/test_verify_values.py`
- Create: `tools/verify_values.py`

- [ ] **Step 1: Write the failing test**

Create `tools/tests/test_verify_values.py`:

```python
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import verify_values as vv

FIXTURE = os.path.join(os.path.dirname(__file__), 'fixtures', 'mini_tier3.html')

GOOD = {
    'id': 'sv-203-0001',
    'course': 'rcp2xx',
    'phase': 2,
    'q': 'An oxygen concentrator delivers what FiO2 range at flows up to 10 L/min?',
    'choices': ['70–80%', '85–90%', '90–95%', '96–99%'],
    'correct': 2,
    'srcItem': '203:s06-12',
    'srcQuote': 'Concentrators deliver 90–95% oxygen at flows up to 10 L/min.',
    'srcCite': 'Lssn 4 Chp 6 — Assemble & Troubleshoot Equipment, slide 41',
}


def card_index():
    return vv.build_card_index({'203': FIXTURE})


class TestVerifyValues(unittest.TestCase):
    def setUp(self):
        self.cards = card_index()

    def test_good_question_passes(self):
        self.assertEqual(vv.check_question(GOOD, self.cards), [])

    def test_unknown_item_fails(self):
        bad = dict(GOOD, srcItem='203:s99-99')
        errs = vv.check_question(bad, self.cards)
        self.assertTrue(any('unknown srcItem' in e for e in errs))

    def test_answer_absent_from_card_fails(self):
        bad = dict(GOOD, choices=['70–80%', '85–90%', '42–47%', '96–99%'])
        errs = vv.check_question(bad, self.cards)
        self.assertTrue(any('answer value not found' in e for e in errs))

    def test_quote_not_verbatim_fails(self):
        bad = dict(GOOD, srcQuote='Concentrators deliver about ninety percent oxygen.')
        errs = vv.check_question(bad, self.cards)
        self.assertTrue(any('srcQuote not verbatim' in e for e in errs))

    def test_correct_answer_duplicated_in_distractors_fails(self):
        bad = dict(GOOD, choices=['90–95%', '85–90%', '90–95%', '96–99%'])
        errs = vv.check_question(bad, self.cards)
        self.assertTrue(any('duplicate choice' in e for e in errs))

    def test_distractor_that_is_also_true_fails(self):
        # 10 L/min is in the same quote, so it cannot serve as a wrong answer here.
        bad = dict(GOOD, choices=['70–80%', '10 L/min', '90–95%', '96–99%'])
        errs = vv.check_question(bad, self.cards)
        self.assertTrue(any('distractor is also sourced' in e for e in errs))

    def test_duplicate_ids_reported(self):
        errs = vv.check_bank([GOOD, dict(GOOD)], self.cards)
        self.assertTrue(any('duplicate question id' in e for e in errs))

    def test_coverage_reports_uncovered_items(self):
        cov = vv.coverage([GOOD], self.cards)
        self.assertIn('203:s06-12', cov['covered'])
        self.assertNotIn('203:s06-12', cov['missing'])


if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -m unittest tools.tests.test_verify_values -v` (or `python3 -m unittest discover -s tools/tests -v`)
Expected: FAIL with `ModuleNotFoundError: No module named 'verify_values'`

- [ ] **Step 3: Write the verifier**

Create `tools/verify_values.py`:

```python
"""Build gate for the VITALS TITAN question bank.

Every question must be traceable: its correct answer has to appear literally
inside the Tier 3 card it cites. A question that cannot be traced is a wrong
number waiting to be memorised, so it fails the build.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys

from extract_values import GUIDES, CARD_RE, SRC_RE, strip_tags, normalize_value, VALUE_RE


def build_card_index(guides=None):
    """Map '<course>:<item>' -> {'text':..., 'title':..., 'cite':...}."""
    guides = guides or GUIDES
    index = {}
    for course, path in guides.items():
        with open(path, encoding='utf-8') as fh:
            doc = fh.read()
        for match in CARD_RE.finditer(doc):
            item_id, inner = match.group(1), match.group(3)
            src_match = SRC_RE.search(inner)
            cite = strip_tags(src_match.group(1)) if src_match else ''
            cite = re.sub(r'^Source\s*', '', cite)
            body = SRC_RE.sub(' ', inner)
            index['%s:%s' % (course, item_id)] = {
                'text': strip_tags(body),
                'cite': cite,
            }
    return index


def _squash(text):
    """Comparison form: entity-free, lowercase, whitespace- and dash-normalised.

    Must fold the same characters extract_values.normalize_value folds — the
    202 guide's Unicode subscript two (cm H₂O) and the 203 guide's ASCII
    cmH2O are the same value, and a question naturally authored in ASCII
    must still match a card written with the subscript.
    """
    t = html.unescape(text).lower()
    t = t.replace('—', '-').replace('–', '-').replace('−', '-')
    t = t.replace('₂', '2')
    return re.sub(r'\s+', '', t)


def _contains_value(card_text, value):
    """Substring containment with numeric boundaries.

    Plain `in` is not safe here. Once whitespace is squashed, "5l/min" sits
    inside "45l/min", "60cmh2o" sits inside "-60cmh2o", and "0cmh2o" sits
    inside both. All three are wrong answers that a naive check waves through
    — the precise failure this gate exists to prevent.

    A match counts only when it is not glued to an adjacent digit, is not the
    tail of a decimal, and does not silently drop a leading minus the card has.
    """
    needle = _squash(value)
    if not needle:
        return False

    start = 0
    while True:
        i = card_text.find(needle, start)
        if i == -1:
            return False
        end = i + len(needle)
        before = card_text[i - 1] if i > 0 else ''
        before2 = card_text[i - 2] if i > 1 else ''
        after = card_text[end] if end < len(card_text) else ''
        after2 = card_text[end + 1] if end + 1 < len(card_text) else ''

        lead_ok = not (before.isdigit()
                       or (before == '.' and before2.isdigit())
                       or (before == '-' and not needle.startswith('-')))
        trail_ok = not (after.isdigit() or (after == '.' and after2.isdigit()))
        if lead_ok and trail_ok:
            return True
        start = i + 1


def check_question(q, cards):
    """Return a list of error strings for one question. Empty list = pass."""
    errors = []
    qid = q.get('id', '<no id>')

    card = cards.get(q.get('srcItem'))
    if card is None:
        return ['%s: unknown srcItem %r' % (qid, q.get('srcItem'))]

    card_text = _squash(card['text'])

    quote = q.get('srcQuote', '')
    if not quote or not _contains_value(card_text, quote):
        errors.append('%s: srcQuote not verbatim in %s' % (qid, q['srcItem']))

    choices = q.get('choices', [])
    if len(set(_squash(c) for c in choices)) != len(choices):
        errors.append('%s: duplicate choice text' % qid)

    try:
        answer = choices[q['correct']]
    except (IndexError, KeyError, TypeError):
        return errors + ['%s: correct index out of range' % qid]

    if not _contains_value(card_text, answer):
        errors.append('%s: answer value not found in %s (%r)' % (qid, q['srcItem'], answer))

    # A distractor drawn from the same sentence is not wrong, it is a second
    # true fact — that makes the question unanswerable.
    quote_values = {normalize_value(v) for v in VALUE_RE.findall(quote)}
    for i, choice in enumerate(choices):
        if i == q['correct']:
            continue
        if normalize_value(choice) in quote_values:
            errors.append('%s: distractor is also sourced from the quote (%r)' % (qid, choice))

    if q.get('srcCite') and q['srcCite'] != card['cite']:
        errors.append('%s: srcCite does not match the card (%r != %r)'
                      % (qid, q['srcCite'], card['cite']))

    return errors


def check_bank(bank, cards):
    errors = []
    seen = set()
    for q in bank:
        qid = q.get('id')
        if qid in seen:
            errors.append('duplicate question id %r' % qid)
        seen.add(qid)
        errors.extend(check_question(q, cards))
    return errors


def value_collisions(bank):
    """Questions in different phases that test the same value.

    Not fatal — the engine dedupes on valueKey at draw time — but a large
    number means the bank is padded rather than deep, so it is reported.
    """
    by_value = {}
    for q in bank:
        answer = q['choices'][q['correct']]
        key = '%s|%s' % (q.get('srcItem'), re.sub(r'\s+', '', answer.lower()))
        by_value.setdefault(key, []).append((q.get('phase'), q.get('id')))
    return {k: v for k, v in by_value.items()
            if len({phase for phase, _ in v}) > 1}


def coverage(bank, cards):
    """Which value-bearing items the bank actually reaches."""
    value_items = set()
    for key, card in cards.items():
        if VALUE_RE.search(card['text']):
            value_items.add(key)
    covered = {q['srcItem'] for q in bank if q.get('srcItem') in value_items}
    return {
        'value_items': sorted(value_items),
        'covered': sorted(covered),
        'missing': sorted(value_items - covered),
    }


def load_bank(paths):
    """Read question banks out of the browser content files via Node."""
    script = (
        'globalThis.window = globalThis;'
        'window.ALL_QUESTIONS = [];'
        + ''.join('require(%s);' % json.dumps(os.path.abspath(p)) for p in paths)
        + 'process.stdout.write(JSON.stringify(window.ALL_QUESTIONS));'
    )
    out = subprocess.run(['node', '-e', script], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('banks', nargs='+', help='content/*.js question bank files')
    parser.add_argument('--coverage-out', default=os.path.join(os.path.dirname(__file__), 'coverage.json'))
    args = parser.parse_args()

    cards = build_card_index()
    bank = [q for q in load_bank(args.banks) if q.get('course') == 'rcp2xx']
    errors = check_bank(bank, cards)

    collisions = value_collisions(bank)
    cov = coverage(bank, cards)
    with open(args.coverage_out, 'w', encoding='utf-8') as fh:
        json.dump(cov, fh, indent=1)

    print('bank: %d questions' % len(bank))
    print('coverage: %d/%d value-bearing items (%d missing)'
          % (len(cov['covered']), len(cov['value_items']), len(cov['missing'])))
    if cov['missing']:
        print('missing items written to %s' % args.coverage_out)
    if collisions:
        print('note: %d value(s) tested in more than one phase '
              '(engine dedupes these per run):' % len(collisions))
        for key, entries in sorted(collisions.items())[:10]:
            print('  %s -> %s' % (key, entries))

    if errors:
        print('\nFAILED — %d problem(s):' % len(errors))
        for e in errors:
            print('  ' + e)
        sys.exit(1)
    print('\nOK — every answer traced to its cited card.')


if __name__ == '__main__':
    main()
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -m unittest discover -s tools/tests -v`
Expected: PASS, 32 tests OK (16 from Task 1 + 16 here: 8 gate checks, 1 subscript regression, 7 value-boundary regressions)

- [ ] **Step 5: Commit**

```bash
git add tools/verify_values.py tools/tests/test_verify_values.py
git commit -m "feat(tools): add traceability gate and coverage report for the values bank"
```

---

## Task 3: Engine test runner and phase configuration

`js/engine/superboss.js` must load both in the browser and under Node so the no-repeat rule can be tested headlessly. Existing engine files close over `window`; this one closes over `globalThis` when `window` is absent.

**Files:**
- Create: `tools/run-engine-tests.js`
- Create: `tools/tests/superboss.test.js`
- Create: `js/engine/superboss.js`

- [ ] **Step 1: Write the failing test**

Create `tools/tests/superboss.test.js`:

```js
/* Shared by tools/run-engine-tests.js (Node) and test-engine.html (browser).
   Expects globals: SuperBoss, and a `check(name, cond, detail)` function. */
(function (global) {
  'use strict';

  function makeBank(spec) {
    // spec: { phase: count } -> flat array of fake questions
    const out = [];
    Object.keys(spec).forEach(phase => {
      for (let i = 0; i < spec[phase]; i++) {
        out.push({
          id: `q-p${phase}-${i}`,
          course: 'rcp2xx',
          phase: Number(phase),
          topic: `sb-p${phase}`,
          q: `phase ${phase} question ${i}`,
          choices: ['a', 'b', 'c', 'd'],
          correct: 0,
          srcItem: `202:s01-${i}`,
        });
      }
    });
    return out;
  }

  global.SuperBossTests = function (check) {
    // ── Phase config ────────────────────────────────────────────
    check('5 phases defined', SuperBoss.PHASES.length === 5);
    check('15 questions per phase', SuperBoss.QUESTIONS_PER_PHASE === 15);
    check('75 questions per run',
      SuperBoss.PHASES.length * SuperBoss.QUESTIONS_PER_PHASE === 75);
    check('gate is 12', SuperBoss.PHASE_GATE === 12);
    check('phase 4 is formulas', SuperBoss.PHASES[3].id === 'p4-formulas');
    check('phase 5 is the final', SuperBoss.PHASES[4].id === 'p5-final');

    // ── Run creation ────────────────────────────────────────────
    const bank = makeBank({ 1: 30, 2: 30, 3: 30, 4: 30, 5: 0 });
    const run = SuperBoss.startRun({ bank, playerMaxHp: 100 });
    check('run starts at phase index 0', run.phaseIndex === 0);
    check('first phase drew 15', run.questions.length === 15);
    check('boss has 5 bars', run.bossBars.length === 5);
    check('each bar is 100 hp', run.bossBars.every(b => b === 100));
    check('asked set seeded with phase 1', run.asked.length === 15);
    check('player hp at max', run.playerHp === 100);
  };
})(typeof window !== 'undefined' ? window : globalThis);
```

Create `tools/run-engine-tests.js`:

```js
#!/usr/bin/env node
/* Headless runner for the superboss engine suite.
   Usage: node tools/run-engine-tests.js */
'use strict';

const path = require('path');

globalThis.window = globalThis;

require(path.join(__dirname, '..', 'js', 'engine', 'superboss.js'));
require(path.join(__dirname, 'tests', 'superboss.test.js'));

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(name + (detail ? ' — ' + detail : ''));
  }
}

globalThis.SuperBossTests(check);

failures.forEach(f => console.error('  ✗ ' + f));
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: FAIL — `Cannot find module '.../js/engine/superboss.js'`

- [ ] **Step 3: Write the engine skeleton**

Create `js/engine/superboss.js`:

```js
/* ============================================================
   SUPER BOSS ENGINE — VITALS TITAN
   Five-phase gauntlet over the RCP 202/203 value banks.

   Wraps the shared Battle engine's conventions without modifying it:
   battle.js is used by 22 bosses, the daily challenge and survival mode.

   Exposes a global `SuperBoss`.
   ============================================================ */
(function (global) {
  'use strict';

  const QUESTIONS_PER_PHASE = 15;
  const PHASE_GATE          = 12;   // correct answers needed to advance
  const BAR_HP              = 100;  // boss hp per phase bar
  const INTER_PHASE_HEAL    = 0.30; // fraction of max hp restored between phases

  const PHASES = [
    { id: 'p1-202-core',  n: 1, name: '202 · CORE VALUES',
      blurb: 'Vent settings · ABG · burn · renal · BiPAP' },
    { id: 'p2-203-gas',   n: 2, name: '203 · GAS SUPPLY',
      blurb: 'Cylinders · LOX · regulators · flowmeters · PISS' },
    { id: 'p3-203-equip', n: 3, name: '203 · EQUIPMENT',
      blurb: 'Airways · spirometry · chest tubes · PFT · transcutaneous' },
    { id: 'p4-formulas',  n: 4, name: 'FORMULAS',
      blurb: 'FiO2 · PBW · entrainment · cylinder duration · dead space' },
    { id: 'p5-final',     n: 5, name: 'FINAL PROTOCOL',
      blurb: 'Everything · weighted to what you missed' },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Randomise a question's choices and remap `correct`. Returns a NEW object;
   * the bank entry is untouched. Matters most on a pinned replay — the point
   * of seeing a failed question again is to learn the value, not which letter
   * it sat on last time.
   */
  function shuffleChoices(q) {
    const order = q.choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    return Object.assign({}, q, {
      choices: order.map(i => q.choices[i]),
      correct: order.indexOf(q.correct),
    });
  }

  /**
   * Begin a run.
   * opts: {
   *   bank: question[],
   *   playerMaxHp: number,
   *   pinned: { [phaseId]: questionId[] }   // sets saved from failed phases
   * }
   */
  function startRun({ bank, playerMaxHp, pinned }) {
    const run = {
      bank: bank.slice(),
      pinned: pinned || {},
      phaseIndex: 0,
      bossBars: PHASES.map(() => BAR_HP),
      playerHp: playerMaxHp,
      playerMaxHp,
      asked: [],            // question ids seen this run (phases 1-4 never repeat)
      askedValues: [],      // valueKeys seen this run — the real no-repeat guard
      missed: [],           // question ids answered wrong this run
      phaseResults: [],     // { phase, correct, total, passed }
      questions: [],        // the current phase's drawn questions
      qIndex: 0,
      correctCount: 0,
      answers: [],
      outcome: null,        // 'victory' | 'defeat' | null
    };
    // Reserve every pinned question's value BEFORE the first draw, so an
    // earlier phase cannot consume a value a later pinned phase is holding.
    const byId = new Map(run.bank.map(q => [q.id, q]));
    Object.keys(run.pinned).forEach(phaseId => {
      run.pinned[phaseId].forEach(id => {
        const q = byId.get(id);
        if (q) run.askedValues.push(valueKeyOf(q));
      });
    });

    run.questions = drawPhase(run, 0);
    run.asked = run.questions.map(q => q.id);
    run.askedValues = run.askedValues.concat(run.questions.map(valueKeyOf));
    return run;
  }

  global.SuperBoss = {
    QUESTIONS_PER_PHASE, PHASE_GATE, BAR_HP, INTER_PHASE_HEAL, PHASES,
    startRun, drawPhase,
  };

  // Defined in Task 4.
  function drawPhase(run, phaseIndex) {
    const phase = PHASES[phaseIndex];
    const pool = run.bank.filter(q => q.phase === phase.n);
    return shuffle(pool).slice(0, QUESTIONS_PER_PHASE);
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `12 passed, 0 failed`, exit 0

- [ ] **Step 5: Commit**

```bash
git add js/engine/superboss.js tools/run-engine-tests.js tools/tests/superboss.test.js
git commit -m "feat(engine): superboss phase config and run creation"
```

---

## Task 4: The no-repeat rule

Phases 1–4 must never re-ask a question inside one run. Phase 4 needs the hardest filter because its calculation items are drawn from the same 202 and 203 cards phases 1–3 already used. A pool too small to fill a phase is a **content bug** and must raise, never silently repeat.

**Files:**
- Modify: `tools/tests/superboss.test.js`
- Modify: `js/engine/superboss.js`

- [ ] **Step 1: Write the failing test**

Append inside the `global.SuperBossTests` function in `tools/tests/superboss.test.js`, after the run-creation checks:

```js
    // ── No-repeat across phases 1-4 ──────────────────────────────
    // Every question carries exactly one `phase`, so filtering by id alone
    // makes cross-phase repeats structurally impossible and proves nothing.
    // The repeat that actually matters is by VALUE: a phase-4 calculation
    // question and a phase-1 recall question are different ids that can test
    // the same number. Dedupe on valueKey = srcItem + normalised answer.
    const bank4 = makeBank({ 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 });
    const r4 = SuperBoss.startRun({ bank: bank4, playerMaxHp: 100 });
    let allIds = r4.questions.map(q => q.id);
    let allVals = r4.questions.map(SuperBoss.valueKeyOf);
    for (let p = 1; p <= 3; p++) {
      r4.phaseIndex = p;
      r4.questions = SuperBoss.drawPhase(r4, p);
      r4.asked = r4.asked.concat(r4.questions.map(q => q.id));
      r4.askedValues = r4.askedValues.concat(r4.questions.map(SuperBoss.valueKeyOf));
      allIds = allIds.concat(r4.questions.map(q => q.id));
      allVals = allVals.concat(r4.questions.map(SuperBoss.valueKeyOf));
    }
    check('phases 1-4 drew 60 questions', allIds.length === 60);
    check('phases 1-4 contain zero repeated ids', new Set(allIds).size === 60,
      `${allIds.length - new Set(allIds).size} duplicate id(s)`);
    check('phases 1-4 contain zero repeated values', new Set(allVals).size === 60,
      `${allVals.length - new Set(allVals).size} duplicate value(s)`);

    // valueKey derivation
    const vq = { srcItem: '202:s07-3', choices: ['20 cmH2O', '30 cmH2O'], correct: 1 };
    check('valueKeyOf joins item and normalised answer',
      SuperBoss.valueKeyOf(vq) === '202:s07-3|30cmh2o', SuperBoss.valueKeyOf(vq));

    // A question already asked is excluded even if it matches the phase.
    const bankShared = makeBank({ 4: 20 });
    const rShared = {
      bank: bankShared,
      asked: bankShared.slice(0, 10).map(q => q.id),
      askedValues: [],
      missed: [],
    };
    const drawn = SuperBoss.drawPhase(rShared, 3);
    check('drawPhase excludes already-asked ids',
      drawn.every(q => rShared.asked.indexOf(q.id) === -1));

    // Two questions on the SAME value in different phases: only one may appear.
    const twin = [
      { id: 'twin-recall', phase: 1, srcItem: '202:s07-3',
        choices: ['20 cmH2O', '30 cmH2O'], correct: 1 },
      { id: 'twin-calc',   phase: 4, srcItem: '202:s07-3',
        choices: ['20 cmH2O', '30 cmH2O'], correct: 1 },
    ];
    const rTwin = {
      bank: twin.concat(makeBank({ 4: 20 })),
      asked: ['twin-recall'],
      askedValues: [SuperBoss.valueKeyOf(twin[0])],
      missed: [],
    };
    const twinDraw = SuperBoss.drawPhase(rTwin, 3);
    check('drawPhase excludes a different question testing an already-asked value',
      twinDraw.every(q => q.id !== 'twin-calc'));

    // ── Short pool is loud, not silently repeated ────────────────
    const thin = { bank: makeBank({ 4: 9 }), asked: [], askedValues: [], missed: [] };
    let threw = null;
    try { SuperBoss.drawPhase(thin, 3); } catch (e) { threw = e; }
    check('short pool throws', threw !== null);
    check('short pool names the phase and the shortfall',
      threw && /p4-formulas/.test(threw.message) && /9/.test(threw.message),
      threw ? threw.message : 'no error thrown');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: FAIL — `short pool throws` and `phases 1-4 contain zero repeats` fail (the skeleton `drawPhase` ignores `asked`)

- [ ] **Step 3: Implement the rule**

In `js/engine/superboss.js`, replace the whole `drawPhase` function with:

```js
  /**
   * Identity of the FACT a question tests, as opposed to the question object.
   *
   * Two questions can carry different ids and still ask for the same number —
   * a phase-1 recall question and a phase-4 calculation question built on the
   * same source card. Deduping on id alone would let that pair both appear in
   * one run, which reads as a repeat even though the ids differ.
   */
  function valueKeyOf(q) {
    const answer = (q.choices && q.choices[q.correct]) || '';
    const normalized = String(answer)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[—–]/g, '-');
    return q.srcItem + '|' + normalized;
  }

  /**
   * Draw one phase's questions.
   *
   * Phases 1-4 draw ONLY from questions whose id AND whose tested value have
   * not been seen this run. Phase 5 is handled separately (see
   * drawFinalPhase) because it deliberately revisits misses.
   *
   * Throws when the unseen pool cannot fill the phase: that means the bank is
   * too thin for this phase, which is a content bug and must be visible.
   */
  function drawPhase(run, phaseIndex) {
    const phase = PHASES[phaseIndex];

    // A phase that was failed last attempt replays its own set, reshuffled.
    // These questions are SUPPOSED to repeat, so the unseen filters are
    // deliberately bypassed here.
    const pin = (run.pinned || {})[phase.id];
    if (pin && pin.length) {
      const byId = new Map(run.bank.map(q => [q.id, q]));
      const restored = pin.map(id => byId.get(id)).filter(Boolean);
      if (restored.length >= QUESTIONS_PER_PHASE) {
        return shuffle(restored).slice(0, QUESTIONS_PER_PHASE).map(shuffleChoices);
      }
      // Bank changed under the pin — fall through and draw fresh.
    }

    if (phase.id === 'p5-final') return drawFinalPhase(run);

    const asked = new Set(run.asked || []);
    const askedValues = new Set(run.askedValues || []);
    const pool = run.bank.filter(q =>
      q.phase === phase.n && !asked.has(q.id) && !askedValues.has(valueKeyOf(q)));

    if (pool.length < QUESTIONS_PER_PHASE) {
      throw new Error(
        'SuperBoss: phase ' + phase.id + ' has only ' + pool.length +
        ' unseen questions, needs ' + QUESTIONS_PER_PHASE +
        '. Bank is too thin — fix the content, do not repeat questions.');
    }

    // Within the draw itself, never take two questions on the same value.
    const picked = [];
    const takenValues = new Set();
    shuffle(pool).forEach(q => {
      if (picked.length >= QUESTIONS_PER_PHASE) return;
      const vk = valueKeyOf(q);
      if (takenValues.has(vk)) return;
      takenValues.add(vk);
      picked.push(q);
    });

    if (picked.length < QUESTIONS_PER_PHASE) {
      throw new Error(
        'SuperBoss: phase ' + phase.id + ' has only ' + picked.length +
        ' distinct values available, needs ' + QUESTIONS_PER_PHASE +
        '. Bank has too many duplicate values — fix the content.');
    }
    return picked.map(shuffleChoices);
  }
```

Add `drawFinalPhase` immediately after it (full behaviour lands in Task 5; this stub keeps phases 1–4 honest and the module loadable):

```js
  function drawFinalPhase(run) {
    const asked = new Set(run.asked || []);
    const unseen = run.bank.filter(q => !asked.has(q.id));
    return shuffle(unseen).slice(0, QUESTIONS_PER_PHASE);
  }
```

Export it by replacing the `global.SuperBoss = {...}` assignment with:

```js
  global.SuperBoss = {
    QUESTIONS_PER_PHASE, PHASE_GATE, BAR_HP, INTER_PHASE_HEAL, PHASES,
    startRun, drawPhase, drawFinalPhase, valueKeyOf,
  };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `20 passed, 0 failed`

- [ ] **Step 5: Commit**

```bash
git add js/engine/superboss.js tools/tests/superboss.test.js
git commit -m "feat(engine): phases 1-4 never repeat a question; thin pools raise"
```

---

## Task 5: Phase 5 weighting toward misses

**Files:**
- Modify: `tools/tests/superboss.test.js`
- Modify: `js/engine/superboss.js`

- [ ] **Step 1: Write the failing test**

Append inside `global.SuperBossTests`:

```js
    // ── Phase 5 prefers this run's misses ────────────────────────
    const bank5 = makeBank({ 1: 20, 2: 20, 3: 20, 4: 20 });
    const missedIds = bank5.slice(0, 6).map(q => q.id);
    const r5 = {
      bank: bank5,
      asked: bank5.slice(0, 40).map(q => q.id),
      missed: missedIds,
    };
    const final5 = SuperBoss.drawFinalPhase(r5);
    check('final phase draws 15', final5.length === 15);
    const finalIds = final5.map(q => q.id);
    check('final phase includes every missed question',
      missedIds.every(id => finalIds.indexOf(id) !== -1));
    check('final phase has no internal duplicates',
      new Set(finalIds).size === finalIds.length);

    // With more misses than slots, it takes misses only.
    const manyMissed = bank5.slice(0, 20).map(q => q.id);
    const rMany = { bank: bank5, asked: bank5.map(q => q.id), missed: manyMissed };
    const finalMany = SuperBoss.drawFinalPhase(rMany).map(q => q.id);
    check('final phase is all misses when misses exceed slots',
      finalMany.every(id => manyMissed.indexOf(id) !== -1));

    // With no misses at all, it fills from unseen questions.
    const rClean = { bank: bank5, asked: bank5.slice(0, 40).map(q => q.id), missed: [] };
    const finalClean = SuperBoss.drawFinalPhase(rClean);
    check('final phase fills from unseen when nothing was missed',
      finalClean.length === 15);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: FAIL — `final phase includes every missed question` (the stub ignores `missed`)

- [ ] **Step 3: Implement the weighting**

In `js/engine/superboss.js`, replace `drawFinalPhase` with:

```js
  /**
   * The final phase is the ONLY place a question may come back, and only on
   * purpose: it replays what this run got wrong, then tops up with questions
   * the run has not seen yet.
   */
  function drawFinalPhase(run) {
    const byId = new Map(run.bank.map(q => [q.id, q]));
    const missed = shuffle((run.missed || []).filter(id => byId.has(id)))
      .map(id => byId.get(id));

    if (missed.length >= QUESTIONS_PER_PHASE) {
      return missed.slice(0, QUESTIONS_PER_PHASE).map(shuffleChoices);
    }

    const taken = new Set(missed.map(q => q.id));
    const asked = new Set(run.asked || []);
    const unseen = shuffle(run.bank.filter(q => !asked.has(q.id) && !taken.has(q.id)));

    let picked = missed.concat(unseen.slice(0, QUESTIONS_PER_PHASE - missed.length));

    // Last resort: a run that answered almost everything correctly can exhaust
    // the unseen pool. Top up from already-asked questions rather than
    // shipping a short phase — this is the one sanctioned repeat.
    if (picked.length < QUESTIONS_PER_PHASE) {
      const used = new Set(picked.map(q => q.id));
      const rest = shuffle(run.bank.filter(q => !used.has(q.id)));
      picked = picked.concat(rest.slice(0, QUESTIONS_PER_PHASE - picked.length));
    }
    return picked.map(shuffleChoices);
  }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `25 passed, 0 failed`

- [ ] **Step 5: Commit**

```bash
git add js/engine/superboss.js tools/tests/superboss.test.js
git commit -m "feat(engine): final phase replays this run's missed values"
```

---

## Task 6: Answering, gates, HP and the inter-phase heal

**Files:**
- Modify: `tools/tests/superboss.test.js`
- Modify: `js/engine/superboss.js`

- [ ] **Step 1: Write the failing test**

Append inside `global.SuperBossTests`:

```js
    // ── Answering ────────────────────────────────────────────────
    function freshRun() {
      return SuperBoss.startRun({
        bank: makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 }), playerMaxHp: 100 });
    }

    // Choices are shuffled at draw time, so the correct index must be read
    // from the drawn question — never assumed.
    function rightIdx(run) { return SuperBoss.currentQ(run).correct; }
    function wrongIdx(run) { return (SuperBoss.currentQ(run).correct + 1) % 4; }

    let ra = freshRun();
    const before = ra.bossBars[0];
    let res = SuperBoss.answer(ra, rightIdx(ra));
    check('correct answer is reported correct', res.correct === true);
    check('correct answer damages the boss bar', ra.bossBars[0] < before);
    check('correct increments correctCount', ra.correctCount === 1);
    check('correct does not record a miss', ra.missed.length === 0);
    check('qIndex advances', ra.qIndex === 1);

    const hpBefore = ra.playerHp;
    res = SuperBoss.answer(ra, wrongIdx(ra));   // wrong
    check('wrong answer is reported wrong', res.correct === false);
    check('wrong answer damages the player', ra.playerHp < hpBefore);
    check('wrong answer records the miss', ra.missed.length === 1);
    check('answer history records both', ra.answers.length === 2);

    // ── Gate: 11/15 fails, 12/15 passes ──────────────────────────
    function playPhase(run, correctCount) {
      for (let i = 0; i < SuperBoss.QUESTIONS_PER_PHASE; i++) {
        SuperBoss.answer(run, i < correctCount ? rightIdx(run) : wrongIdx(run));
      }
      return SuperBoss.endPhase(run);
    }

    let rFail = freshRun();
    rFail.playerHp = 1000; rFail.playerMaxHp = 1000;   // isolate the gate from HP death
    let gate = playPhase(rFail, 11);
    check('11/15 fails the gate', gate.passed === false);
    check('failing the gate ends the run', rFail.outcome === 'defeat');

    let rPass = freshRun();
    rPass.playerHp = 1000; rPass.playerMaxHp = 1000;
    gate = playPhase(rPass, 12);
    check('12/15 passes the gate', gate.passed === true);
    check('passing advances the phase', rPass.phaseIndex === 1);
    check('phase result recorded', rPass.phaseResults.length === 1);
    check('counters reset for the new phase', rPass.correctCount === 0 && rPass.qIndex === 0);
    check('new phase drew 15', rPass.questions.length === 15);
    check('asked set grew to 30', rPass.asked.length === 30);
    check('askedValues grew to 30', rPass.askedValues.length === 30);

    // ── Inter-phase heal ─────────────────────────────────────────
    let rHeal = freshRun();
    rHeal.playerHp = 20;
    playPhase(rHeal, 15);
    check('heal restores 30% of max', rHeal.playerHp === 50);

    let rCap = freshRun();
    rCap.playerHp = 95;
    playPhase(rCap, 15);
    check('heal never exceeds max hp', rCap.playerHp === 100);

    // ── Death ends the run ───────────────────────────────────────
    let rDead = freshRun();
    rDead.playerHp = 1;
    SuperBoss.answer(rDead, wrongIdx(rDead));
    check('hp reaching zero ends the run', rDead.outcome === 'defeat');
    check('hp never goes negative', rDead.playerHp === 0);

    // ── Victory ──────────────────────────────────────────────────
    let rWin = freshRun();
    rWin.playerHp = 1000; rWin.playerMaxHp = 1000;
    for (let p = 0; p < 5; p++) playPhase(rWin, 15);
    check('clearing all five phases wins', rWin.outcome === 'victory');
    check('five phase results recorded', rWin.phaseResults.length === 5);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: FAIL — `TypeError: SuperBoss.answer is not a function`

- [ ] **Step 3: Implement answering and gating**

In `js/engine/superboss.js`, add these constants next to the others at the top:

```js
  const HIT_BOSS   = 8;   // damage dealt to the current bar per correct answer
  const HIT_PLAYER = 9;   // damage taken per wrong answer
```

Add these functions before the `global.SuperBoss = {...}` assignment:

```js
  function currentQ(run) {
    return run.questions[run.qIndex] || null;
  }

  function currentPhase(run) {
    return PHASES[run.phaseIndex];
  }

  /**
   * Answer the current question. Returns { correct, question, correctIndex }.
   * Mutates `run`.
   */
  function answer(run, choiceIndex) {
    const q = currentQ(run);
    if (!q || run.outcome) return { correct: false, question: q, correctIndex: q ? q.correct : -1 };

    const correct = choiceIndex === q.correct;

    if (correct) {
      run.correctCount++;
      run.bossBars[run.phaseIndex] = Math.max(0, run.bossBars[run.phaseIndex] - HIT_BOSS);
    } else {
      run.playerHp = Math.max(0, run.playerHp - HIT_PLAYER);
      if (run.missed.indexOf(q.id) === -1) run.missed.push(q.id);
    }

    run.answers.push({
      phase: currentPhase(run).id,
      id: q.id,
      chosen: choiceIndex,
      correct: correct,
      srcItem: q.srcItem,
      srcCite: q.srcCite,
    });
    run.qIndex++;

    if (run.playerHp === 0) run.outcome = 'defeat';
    return { correct: correct, question: q, correctIndex: q.correct };
  }

  /**
   * Close out the current phase. Returns { passed, correct, total, phase }.
   * On a pass, advances to the next phase, heals, and draws. On a fail, the
   * run is over — there is no mid-fight retry.
   */
  function endPhase(run) {
    const phase = currentPhase(run);
    const passed = run.correctCount >= PHASE_GATE && run.outcome !== 'defeat';
    const result = {
      phase: phase.id,
      phaseName: phase.name,
      correct: run.correctCount,
      total: QUESTIONS_PER_PHASE,
      passed: passed,
    };
    run.phaseResults.push(result);

    if (!passed) {
      // Pin this phase's set so the next attempt drills the same 15.
      run.pinned[phase.id] = run.questions.map(q => q.id);
      run.outcome = 'defeat';
      result.pinned = true;
      return result;
    }

    // Cleared it — the pin has done its job.
    delete run.pinned[phase.id];

    if (run.phaseIndex === PHASES.length - 1) {
      run.outcome = 'victory';
      return result;
    }

    run.phaseIndex++;
    run.playerHp = Math.min(
      run.playerMaxHp,
      run.playerHp + Math.round(run.playerMaxHp * INTER_PHASE_HEAL));
    run.questions = drawPhase(run, run.phaseIndex);
    run.asked = run.asked.concat(run.questions.map(q => q.id));
    run.askedValues = run.askedValues.concat(run.questions.map(valueKeyOf));
    run.qIndex = 0;
    run.correctCount = 0;
    return result;
  }

  function phaseComplete(run) {
    return run.qIndex >= run.questions.length;
  }
```

Replace the `global.SuperBoss = {...}` assignment with:

```js
  global.SuperBoss = {
    QUESTIONS_PER_PHASE, PHASE_GATE, BAR_HP, INTER_PHASE_HEAL, PHASES,
    startRun, drawPhase, drawFinalPhase, valueKeyOf,
    currentQ, currentPhase, answer, endPhase, phaseComplete,
  };
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `49 passed, 0 failed`

- [ ] **Step 5: Commit**

```bash
git add js/engine/superboss.js tools/tests/superboss.test.js
git commit -m "feat(engine): answering, 12/15 phase gate, inter-phase heal, win/loss"
```

---

## Task 7: Run persistence

The app saves state when backgrounded (commit `32e99fa`). A 75-question run must survive that.

**Files:**
- Modify: `tools/tests/superboss.test.js`
- Modify: `js/engine/superboss.js`

- [ ] **Step 1: Write the failing test**

Append inside `global.SuperBossTests`:

```js
    // ── Serialisation round-trip ─────────────────────────────────
    let rSer = SuperBoss.startRun({
      bank: makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 }), playerMaxHp: 100 });
    SuperBoss.answer(rSer, SuperBoss.currentQ(rSer).correct);
    SuperBoss.answer(rSer, (SuperBoss.currentQ(rSer).correct + 1) % 4);

    const blob = SuperBoss.serialize(rSer);
    check('serialized form is JSON-safe',
      typeof JSON.parse(JSON.stringify(blob)) === 'object');
    check('serialized form drops the bank', blob.bank === undefined);

    const restored = SuperBoss.deserialize(
      JSON.parse(JSON.stringify(blob)),
      makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 }));
    check('restored qIndex', restored.qIndex === rSer.qIndex);
    check('restored playerHp', restored.playerHp === rSer.playerHp);
    check('restored asked set', restored.asked.length === rSer.asked.length);
    check('restored askedValues', restored.askedValues.length === rSer.askedValues.length);
    check('restored missed set', restored.missed.length === rSer.missed.length);
    check('restored question order',
      restored.questions.map(q => q.id).join() === rSer.questions.map(q => q.id).join());
    check('restored run is answerable',
      SuperBoss.currentQ(restored).id === SuperBoss.currentQ(rSer).id);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: FAIL — `TypeError: SuperBoss.serialize is not a function`

- [ ] **Step 3: Implement serialisation**

Add to `js/engine/superboss.js` before the export:

```js
  /**
   * Shrink a run for localStorage. The bank is content, not state — it is
   * reloaded from the content files and re-joined by id on restore.
   */
  function serialize(run) {
    return {
      v: 1,
      phaseIndex: run.phaseIndex,
      bossBars: run.bossBars.slice(),
      playerHp: run.playerHp,
      playerMaxHp: run.playerMaxHp,
      pinned: JSON.parse(JSON.stringify(run.pinned || {})),
      asked: run.asked.slice(),
      askedValues: run.askedValues.slice(),
      missed: run.missed.slice(),
      phaseResults: run.phaseResults.slice(),
      questionIds: run.questions.map(q => q.id),
      qIndex: run.qIndex,
      correctCount: run.correctCount,
      answers: run.answers.slice(),
      outcome: run.outcome,
    };
  }

  /** Rebuild a run from a serialized blob plus the live question bank. */
  function deserialize(blob, bank) {
    const byId = new Map(bank.map(q => [q.id, q]));
    return {
      bank: bank.slice(),
      pinned: blob.pinned || {},
      phaseIndex: blob.phaseIndex,
      bossBars: blob.bossBars.slice(),
      playerHp: blob.playerHp,
      playerMaxHp: blob.playerMaxHp,
      asked: blob.asked.slice(),
      askedValues: (blob.askedValues || []).slice(),
      missed: blob.missed.slice(),
      phaseResults: blob.phaseResults.slice(),
      questions: blob.questionIds.map(id => byId.get(id)).filter(Boolean),
      qIndex: blob.qIndex,
      correctCount: blob.correctCount,
      answers: blob.answers.slice(),
      outcome: blob.outcome,
    };
  }
```

Add `serialize, deserialize,` to the `global.SuperBoss` export object.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `58 passed, 0 failed`

- [ ] **Step 5: Wire the browser test harness**

In `test-engine.html`, add after the existing `<script src="content/stub.js"></script>` line:

```html
  <script src="js/engine/superboss.js"></script>
  <script src="tools/tests/superboss.test.js"></script>
```

And at the end of the existing inline `<script>` block, immediately before its closing `</script>`, add:

```js
    section('Super boss — VITALS TITAN');
    window.SuperBossTests(check);
```

- [ ] **Step 6: Commit**

```bash
git add js/engine/superboss.js tools/tests/superboss.test.js test-engine.html
git commit -m "feat(engine): persist superboss runs across app backgrounding"
```

---

## Task 7b: Failed-phase pinning

Failing a phase pins its 15 questions so the next attempt at that phase drills the same set —
reshuffled, with the choices reshuffled too, so what gets learned is the value and not the position.
Passing a pinned phase clears the pin. The pin lives in `state.superbossPinned` and survives across
runs.

**Files:**
- Modify: `tools/tests/superboss.test.js`

The engine code for this landed in Tasks 3–7 (`startRun`'s `pinned` option, the pin branch in
`drawPhase`, the pin write/clear in `endPhase`, and `pinned` in serialize/deserialize). This task
proves it.

- [ ] **Step 1: Write the failing test**

Append inside `global.SuperBossTests`:

```js
    // ── Failed-phase pinning ─────────────────────────────────────
    const pinBank = makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 });

    function playPhaseOn(run, correctCount) {
      for (let i = 0; i < SuperBoss.QUESTIONS_PER_PHASE; i++) {
        const q = SuperBoss.currentQ(run);
        SuperBoss.answer(run, i < correctCount ? q.correct : (q.correct + 1) % 4);
      }
      return SuperBoss.endPhase(run);
    }

    // Fail phase 1 -> its set is pinned.
    let rPin = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000 });
    const failedIds = rPin.questions.map(q => q.id);
    const pinResult = playPhaseOn(rPin, 11);
    check('failing a phase pins its set', pinResult.pinned === true);
    check('pin is keyed by phase id', !!rPin.pinned['p1-202-core']);
    check('pin holds exactly 15 ids',
      rPin.pinned['p1-202-core'].length === 15);
    check('pin holds the questions that were failed',
      rPin.pinned['p1-202-core'].slice().sort().join() === failedIds.slice().sort().join());

    // Next attempt replays the same set.
    const rReplay = SuperBoss.startRun({
      bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
    const replayIds = rReplay.questions.map(q => q.id);
    check('pinned phase replays the same 15 questions',
      replayIds.slice().sort().join() === failedIds.slice().sort().join());

    // Order is reshuffled across attempts (allow for chance: try a few draws).
    let sawDifferentOrder = false;
    for (let i = 0; i < 20 && !sawDifferentOrder; i++) {
      const r = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
      if (r.questions.map(q => q.id).join() !== failedIds.join()) sawDifferentOrder = true;
    }
    check('pinned replay reshuffles question order', sawDifferentOrder);

    // Choice order is reshuffled too.
    let sawDifferentChoices = false;
    for (let i = 0; i < 20 && !sawDifferentChoices; i++) {
      const r = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
      const q = r.questions[0];
      const source = pinBank.filter(b => b.id === q.id)[0];
      if (q.choices.join() !== source.choices.join() || q.correct !== source.correct) {
        sawDifferentChoices = true;
      }
    }
    check('pinned replay reshuffles choices', sawDifferentChoices);

    // Passing the pinned phase clears the pin.
    const rClear = SuperBoss.startRun({
      bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
    playPhaseOn(rClear, 15);
    check('passing a pinned phase clears the pin',
      rClear.pinned['p1-202-core'] === undefined);

    // A pin on a LATER phase reserves its values up front, so an earlier
    // phase cannot consume them.
    const latePin = {};
    latePin['p3-203-equip'] = pinBank.filter(q => q.phase === 3).slice(0, 15).map(q => q.id);
    const rLate = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000, pinned: latePin });
    const reserved = latePin['p3-203-equip']
      .map(id => SuperBoss.valueKeyOf(pinBank.filter(b => b.id === id)[0]));
    check('pinned values are reserved before the first draw',
      reserved.every(v => rLate.askedValues.indexOf(v) !== -1));

    // Pins survive serialisation.
    const pinBlob = JSON.parse(JSON.stringify(SuperBoss.serialize(rPin)));
    const rPinRestored = SuperBoss.deserialize(pinBlob, pinBank);
    check('pin round-trips through serialize',
      rPinRestored.pinned['p1-202-core'].length === 15);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: FAIL on the pinning checks if any of the Task 3–7 pin code was missed.

- [ ] **Step 3: Fix any gaps in the engine**

If a check fails, the cause is in `js/engine/superboss.js` — the pin branch at the top of
`drawPhase`, the `run.pinned[phase.id] = ...` write in `endPhase`'s failure path, the
`delete run.pinned[phase.id]` on the pass path, the value reservation loop in `startRun`, or
`pinned` in `serialize`/`deserialize`. Fix the engine, not the test.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `66 passed, 0 failed`

- [ ] **Step 5: Commit**

```bash
git add tools/tests/superboss.test.js js/engine/superboss.js
git commit -m "feat(engine): pin a failed phase's questions for the next attempt"
```

---

## Task 8: Boss definition and sprite

**Files:**
- Create: `content/rcp2xx-superboss.js`
- Modify: `content/boss-sprites.js`

- [ ] **Step 1: Write the boss definition**

Create `content/rcp2xx-superboss.js`:

```js
/* ============================================================
   VITALS TITAN — super boss built from RCP 202/203 Tier 3 values.
   Not part of the 103/104 boss grids; reached from the home screen.
   ============================================================ */
(function () {
  const boss = {
    id: 'vitals-titan',
    name: 'VITALS TITAN',
    emoji: '🗿',
    course: 'rcp2xx',
    description: 'RCP 202 + 203 · every number that matters',
    superboss: true,
    hp: 500,                      // 5 bars x 100, tracked per phase by the engine
    questionTopics: ['sb-202', 'sb-gas', 'sb-equip', 'sb-formula'],
  };

  window.ALL_BOSSES = (window.ALL_BOSSES || [])
    .filter(b => b.id !== 'vitals-titan')
    .concat([boss]);
})();
```

- [ ] **Step 2: Add the sprite**

In `content/boss-sprites.js`, inside the `const sprites = {` object, add this entry after the existing `copd:` entry (a monolith of stacked value-plates; the eye cycles between frames):

```js
    // VITALS TITAN — a monolith of stacked readouts; the core eye pulses
    'vitals-titan': pair(
      `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="0" width="8" height="2" fill="#7a6a58"/>
        <rect x="3" y="2" width="10" height="9" fill="#9a8a74"/>
        <rect x="4" y="3" width="8" height="1" fill="#6a5c4c"/>
        <rect x="4" y="5" width="8" height="1" fill="#6a5c4c"/>
        <rect x="4" y="9" width="8" height="1" fill="#6a5c4c"/>
        <rect x="6" y="6" width="4" height="3" fill="#c0392b"/>
        <rect x="7" y="7" width="2" height="1" fill="#ffd9d0"/>
        <rect x="2" y="11" width="12" height="3" fill="#7a6a58"/>
        <rect x="4" y="14" width="3" height="2" fill="#5a4c3c"/>
        <rect x="9" y="14" width="3" height="2" fill="#5a4c3c"/>
        <rect x="0" y="4" width="2" height="1" fill="#c0392baa"/>
        <rect x="14" y="8" width="2" height="1" fill="#c0392baa"/>
      </svg>`,
      `<svg viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="0" width="8" height="2" fill="#7a6a58"/>
        <rect x="3" y="2" width="10" height="9" fill="#9a8a74"/>
        <rect x="4" y="3" width="8" height="1" fill="#6a5c4c"/>
        <rect x="4" y="5" width="8" height="1" fill="#6a5c4c"/>
        <rect x="4" y="9" width="8" height="1" fill="#6a5c4c"/>
        <rect x="6" y="6" width="4" height="3" fill="#e05545"/>
        <rect x="6" y="7" width="4" height="1" fill="#ffd9d0"/>
        <rect x="2" y="11" width="12" height="3" fill="#7a6a58"/>
        <rect x="4" y="14" width="3" height="2" fill="#5a4c3c"/>
        <rect x="9" y="14" width="3" height="2" fill="#5a4c3c"/>
        <rect x="0" y="8" width="2" height="1" fill="#c0392baa"/>
        <rect x="14" y="4" width="2" height="1" fill="#c0392baa"/>
      </svg>`
    ),
```

- [ ] **Step 3: Verify the sprite loads**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node -e "globalThis.window=globalThis; require('./content/boss-sprites.js'); const s=window.BOSS_SPRITES['vitals-titan']; console.log(s ? 'sprite ok, '+s.length+' chars' : 'MISSING');"`
Expected: `sprite ok, ~1400 chars`

- [ ] **Step 4: Commit**

```bash
git add content/rcp2xx-superboss.js content/boss-sprites.js
git commit -m "feat(content): add VITALS TITAN boss definition and sprite"
```

---

## Task 9: Question bank — authoring procedure

The bank is ~450 questions. It is built in five commits, one per phase, each gated by `tools/verify_values.py`. **Every question comes from `tools/values.json`. None are written from memory.** A value you cannot trace goes on the coverage gap list, not into the bank.

### Phase → source mapping

| Phase | `topic` | Draw from records where |
|---|---|---|
| 1 | `sb-202` | `course == '202'` |
| 2 | `sb-gas` | `course == '203'` and item title/section matches cylinders, gas supply, LOX, regulators, flowmeters, PISS, concentrators, conserving devices |
| 3 | `sb-equip` | `course == '203'`, everything else (airways, spirometry, chest tubes, PFT, transcutaneous, monitoring) |
| 4 | `sb-formula` | either course, where the quote contains a calculation: `=`, `×`, `x `, `÷`, `/`, "ratio", "per kg", "duration", "factor" |

Phase 5 draws no bank of its own — it recycles phases 1–4.

### Authoring rules (apply to every question)

1. `id` is `sv-<course>-<4-digit sequence>`, unique across the whole bank.
2. `q` asks for one value. Never two values in one stem.
3. `choices` has exactly 4 entries. Distractors are plausible neighbouring values, **never another true value from the same `srcQuote`** — the verifier rejects that.
4. `explanation` restates the sourced fact in one sentence.
5. `srcItem`, `srcQuote`, `srcCite` are copied verbatim from the `values.json` record. Never retyped by hand.
6. A record whose value is not actually testable (a date, a table label, a page reference the regex missed) is **skipped and logged**, not forced into a question.

### Bank file shape

Both bank files follow this exact structure:

```js
/* ============================================================
   RCP 202 VALUES — VITALS TITAN bank (phases 1 and 4)
   GENERATED FROM tools/values.json — do not hand-edit values.
   Every entry verified by tools/verify_values.py.
   ============================================================ */
(function () {
  const additions = [
    {
      id: 'sv-202-0001',
      topic: 'sb-202',
      course: 'rcp2xx',
      phase: 1,
      difficulty: 2,
      q: 'Above what plateau pressure does the deck flag barotrauma risk?',
      choices: ['20 cmH2O', '25 cmH2O', '30 cmH2O', '40 cmH2O'],
      correct: 2,
      explanation: 'The deck flags Paw above 30 cmH2O as the barotrauma threshold.',
      srcItem: '202:s07-3',
      srcQuote: 'Watch for Paw >30 cmH2O and PIP >50 cmH2O.',
      srcCite: 'Lssn 4 — Advanced Modes of Mechanical Ventilation, slide 14',
    },
    // ... remaining questions
  ];
  window.ALL_QUESTIONS = (window.ALL_QUESTIONS || []).concat(additions);
})();
```

### Task 9a: Phase 1 bank (202 core values)

**Files:** Create `content/rcp202-values.js`

- [ ] **Step 1: List the phase 1 candidate records**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -c "
import json
d=json.load(open('tools/values.json'))
recs=[r for r in d['records'] if r['course']=='202']
print(len(recs),'candidate records across',len({r['item'] for r in recs}),'items')
for r in recs[:5]: print(' ', r['key'], '|', r['quote'][:90])
"`
Expected: `~254 candidate records across ~90 items`

- [ ] **Step 2: Author the phase 1 questions**

Write `content/rcp202-values.js` containing every traceable phase-1 question, using the file shape above with `topic: 'sb-202'` and `phase: 1`. Target **at least 90** questions (one per value-bearing 202 item, more where an item carries several distinct values). Copy `srcQuote` and `srcCite` straight out of `values.json`.

- [ ] **Step 3: Run the gate**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js`
Expected: `OK — every answer traced to its cited card.` and a bank count ≥ 90. Any listed problem must be fixed before continuing — do not proceed with a red gate.

- [ ] **Step 4: Check the phase pool is deep enough**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node -e "globalThis.window=globalThis; window.ALL_QUESTIONS=[]; require('./content/rcp202-values.js'); const p1=window.ALL_QUESTIONS.filter(q=>q.phase===1); console.log('phase 1 pool:', p1.length, p1.length>=60?'OK':'TOO THIN — need 60+ for replayability');"`
Expected: `phase 1 pool: 90+ OK`

- [ ] **Step 5: Commit**

```bash
git add content/rcp202-values.js
git commit -m "feat(content): VITALS TITAN phase 1 bank — RCP 202 core values"
```

### Task 9b: Phase 2 bank (203 gas supply)

**Files:** Create `content/rcp203-values.js`

- [ ] **Step 1: List the phase 2 candidate records**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -c "
import json, re
d=json.load(open('tools/values.json'))
GAS=re.compile(r'cylinder|oxygen|gas|LOX|liquid|regulator|flowmeter|PISS|DISS|concentrat|conserv|compress|air|nitrogen|helium|purity|psi', re.I)
recs=[r for r in d['records'] if r['course']=='203' and GAS.search(r['item_title'])]
print(len(recs),'gas records across',len({r['item'] for r in recs}),'items')
for r in sorted({r['item_title'] for r in recs}): print(' -', r)
"`
Expected: a list of gas/cylinder/O2-delivery item titles.

- [ ] **Step 2: Author the phase 2 questions**

Create `content/rcp203-values.js` with the same file shape, `topic: 'sb-gas'`, `phase: 2`. Target **at least 90** questions.

- [ ] **Step 3: Run the gate**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js`
Expected: `OK — every answer traced to its cited card.`

- [ ] **Step 4: Commit**

```bash
git add content/rcp203-values.js
git commit -m "feat(content): VITALS TITAN phase 2 bank — RCP 203 gas supply values"
```

### Task 9c: Phase 3 bank (203 equipment and monitoring)

**Files:** Modify `content/rcp203-values.js`

- [ ] **Step 1: List the phase 3 candidate records**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -c "
import json, re
d=json.load(open('tools/values.json'))
GAS=re.compile(r'cylinder|oxygen|gas|LOX|liquid|regulator|flowmeter|PISS|DISS|concentrat|conserv|compress|air|nitrogen|helium|purity|psi', re.I)
recs=[r for r in d['records'] if r['course']=='203' and not GAS.search(r['item_title'])]
print(len(recs),'equipment records across',len({r['item'] for r in recs}),'items')
for r in sorted({r['item_title'] for r in recs}): print(' -', r)
"`

- [ ] **Step 2: Append the phase 3 questions**

Add them to the `additions` array in `content/rcp203-values.js` with `topic: 'sb-equip'`, `phase: 3`. Target **at least 90**.

- [ ] **Step 3: Run the gate**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js`
Expected: `OK — every answer traced to its cited card.`

- [ ] **Step 4: Commit**

```bash
git add content/rcp203-values.js
git commit -m "feat(content): VITALS TITAN phase 3 bank — RCP 203 equipment values"
```

### Task 9d: Phase 4 bank (formulas and calculations)

Phase 4 is the one phase whose content overlaps phases 1–3. The engine dedupes each run on
`valueKey` (`srcItem` + the normalised correct answer), so a phase-4 question that computes a value
already recalled in phase 1 will simply be skipped that run. Prefer phase-4 questions whose answer is
a **worked result** rather than the raw value from the card — those have their own valueKey and
always survive the filter. `tools/verify_values.py` prints how many values are tested in more than
one phase; if that number is large the bank is padded, not deep.

**Files:** Modify `content/rcp202-values.js` and `content/rcp203-values.js`

- [ ] **Step 1: List the calculation records**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -c "
import json, re
d=json.load(open('tools/values.json'))
CALC=re.compile(r'=|×|÷|\bx\b|ratio|per kg|duration|factor|formula|calculat', re.I)
recs=[r for r in d['records'] if CALC.search(r['quote'])]
print(len(recs),'calculation records across',len({r['item'] for r in recs}),'items')
for r in recs[:12]: print(' ', r['course'], r['item'], '|', r['quote'][:100])
"`

- [ ] **Step 2: Author the phase 4 questions**

Add 202-sourced calculation questions to `content/rcp202-values.js` and 203-sourced ones to `content/rcp203-values.js`, all with `topic: 'sb-formula'`, `phase: 4`. Target **at least 60** total. Each should require working the number out, not recalling it:

```js
    {
      id: 'sv-203-0301',
      topic: 'sb-formula',
      course: 'rcp2xx',
      phase: 4,
      difficulty: 3,
      q: 'Using the bedside rule, a patient on 6 L/min nasal cannula is receiving roughly what FiO2?',
      choices: ['32%', '38%', '44%', '50%'],
      correct: 2,
      explanation: 'FiO2 = (LPM × 4) + 20 = (6 × 4) + 20 = 44%.',
      srcItem: '203:s06-21',
      srcQuote: 'FiO2 = (LPM × 4) + 20',
      srcCite: 'Lssn 4 Chp 6 — Assemble & Troubleshoot Equipment, slide 58',
    },
```

- [ ] **Step 3: Run the gate**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js`
Expected: `OK — every answer traced to its cited card.`

Note: a computed answer such as `44%` will only pass the gate if `44%` appears in the cited card. Where the card gives only the formula and not a worked example, cite the card that contains the worked example, or add the question against a card whose text carries the result. If neither exists, the question is not traceable — log it as a gap instead of shipping it.

- [ ] **Step 4: Verify no id collisions and pool depth**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node -e "
globalThis.window=globalThis; window.ALL_QUESTIONS=[];
require('./content/rcp202-values.js'); require('./content/rcp203-values.js');
const all=window.ALL_QUESTIONS.filter(q=>q.course==='rcp2xx');
const ids=all.map(q=>q.id);
console.log('bank:', all.length);
console.log('unique ids:', new Set(ids).size === ids.length ? 'OK' : 'COLLISION');
globalThis.window=globalThis; require('./js/engine/superboss.js');
[1,2,3,4].forEach(p=>{
  const qs=all.filter(q=>q.phase===p);
  const vals=new Set(qs.map(SuperBoss.valueKeyOf));
  console.log('phase '+p+':', qs.length, 'questions,', vals.size, 'distinct values',
    (qs.length>=60 && vals.size>=60)?'OK':'TOO THIN');
});
"`
Expected: bank ≥ 330, unique ids OK, every phase ≥ 60.

- [ ] **Step 5: Commit**

```bash
git add content/rcp202-values.js content/rcp203-values.js
git commit -m "feat(content): VITALS TITAN phase 4 bank — formulas and calculations"
```

### Task 9e: Close the coverage gaps

- [ ] **Step 1: Read the coverage report**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js && python3 -c "
import json
c=json.load(open('tools/coverage.json'))
print('covered', len(c['covered']), 'of', len(c['value_items']))
print('missing:')
for m in c['missing']: print(' -', m)
"`

- [ ] **Step 2: Add a question for each reachable missing item**

For every item in `missing`, either add a question sourced from it, or record it in `docs/superpowers/plans/vitals-titan-gaps.md` with the reason it is not testable (e.g. the only numbers in the card are citations or list-counts).

- [ ] **Step 3: Re-run the gate and confirm the bank size**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js`
Expected: `OK`, coverage at or near 179/179, bank ≥ 400.

- [ ] **Step 4: Commit**

```bash
git add content/rcp202-values.js content/rcp203-values.js tools/coverage.json docs/superpowers/plans/vitals-titan-gaps.md
git commit -m "feat(content): close VITALS TITAN coverage gaps; document untestable items"
```

---

## Task 10: The run screen

**Files:**
- Create: `js/screens/superboss.js`
- Modify: `index.html`

- [ ] **Step 1: Add the screen sections and scripts**

In `index.html`, add these two lines inside `<main id="app">` after the `survival` section:

```html
    <section data-screen="superboss-briefing" class="screen"></section>
    <section data-screen="superboss"          class="screen"></section>
```

Add these content script tags after the `rcp104-scenarios.js` line:

```html
  <script src="content/rcp2xx-superboss.js?v=titan1"  defer></script>
  <script src="content/rcp202-values.js?v=titan1"     defer></script>
  <script src="content/rcp203-values.js?v=titan1"     defer></script>
```

Add the engine script after the `shop.js` line:

```html
  <script src="js/engine/superboss.js?v=titan1"  defer></script>
```

Add the screen scripts after the `review-answers.js` line:

```html
  <script src="js/screens/superboss-briefing.js?v=titan1" defer></script>
  <script src="js/screens/superboss.js?v=titan1"          defer></script>
```

- [ ] **Step 2: Write the run screen**

Create `js/screens/superboss.js`:

```js
/* ============================================================
   SUPERBOSS — VITALS TITAN run screen.
   ctx: { resume: true } to restore a saved run, otherwise starts fresh.
   ============================================================ */
App.registerScreen('superboss', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === 'vitals-titan');
  const bank = (window.ALL_QUESTIONS || []).filter(q => q.course === 'rcp2xx');

  if (!boss || bank.length < SuperBoss.QUESTIONS_PER_PHASE * 4) {
    root.innerHTML = `<div class="hud hud-corners t-red t-sm" style="padding:14px;">
      <span class="br1"></span><span class="br2"></span>
      TITAN OFFLINE — BANK HAS ${bank.length} QUERIES, NEEDS 60+.
      </div>`;
    return;
  }

  let run;
  if (ctx.resume && state.superbossRun) {
    run = SuperBoss.deserialize(state.superbossRun, bank);
  } else {
    try {
      run = SuperBoss.startRun({
        bank,
        playerMaxHp: state.maxHp,
        pinned: state.superbossPinned || {},
      });
    } catch (err) {
      root.innerHTML = `<div class="hud hud-corners t-red t-sm" style="padding:14px;">
        <span class="br1"></span><span class="br2"></span>${err.message}</div>`;
      return;
    }
  }

  function persistRun() {
    state.superbossRun = run.outcome ? null : SuperBoss.serialize(run);
    App.persist();
  }

  function render() {
    const phase = SuperBoss.currentPhase(run);
    const q = SuperBoss.currentQ(run);
    if (!q) return;

    root.innerHTML = `
      <div class="topbar">
        <span class="mode-tag">🗿 VITALS TITAN</span>
        <span class="chapter-tag">PHASE ${phase.n}/5</span>
      </div>

      <div class="hud hud-corners">
        <span class="br1"></span><span class="br2"></span>

        <div class="header-strip" style="margin: -14px -16px 10px;">
          <span><span class="status-dot"></span>${phase.name}</span>
          <span>${run.correctCount}/${SuperBoss.PHASE_GATE} TO ADVANCE</span>
        </div>

        ${(state.superbossPinned || {})[phase.id]
          ? `<div class="pin-note t-sm">▸ RETRY DRILL — same 15 queries you missed, reshuffled</div>`
          : ''}

        <div class="titan-bars">
          ${run.bossBars.map((hp, i) => `
            <div class="titan-bar ${i === run.phaseIndex ? 'active' : ''} ${i < run.phaseIndex ? 'cleared' : ''}">
              <div class="titan-bar-fill" style="width:${hp}%"></div>
            </div>`).join('')}
        </div>

        <div class="boss-portrait">${(window.BOSS_SPRITES || {})['vitals-titan'] || ''}</div>
        <div class="t-sm t-mute t-center">${phase.blurb}</div>

        <div class="hp-row">
          <span class="t-sm">YOU</span>
          <div class="hp-bar"><div class="hp-fill" style="width:${(run.playerHp / run.playerMaxHp) * 100}%"></div></div>
          <span class="t-sm">${run.playerHp}/${run.playerMaxHp}</span>
        </div>

        <div class="q-counter t-sm t-mute">QUERY ${run.qIndex + 1} / ${SuperBoss.QUESTIONS_PER_PHASE}</div>
        <div class="question">${q.q}</div>
        <div class="choices">
          ${q.choices.map((c, i) => `<button class="choice" data-i="${i}">${c}</button>`).join('')}
        </div>
      </div>
    `;

    root.querySelectorAll('.choice').forEach(btn => {
      btn.addEventListener('click', () => onAnswer(Number(btn.dataset.i)));
    });
  }

  function onAnswer(choiceIndex) {
    const q = SuperBoss.currentQ(run);
    const res = SuperBoss.answer(run, choiceIndex);

    // Record into the study-tracking system so weak-topic drilling sees these.
    if (State.recordAnswer) State.recordAnswer(state, q, res.correct);

    root.querySelectorAll('.choice').forEach((btn, i) => {
      if (i === res.correctIndex) btn.classList.add('correct');
      else if (i === choiceIndex) btn.classList.add('wrong');
      btn.disabled = true;
    });

    if (window.FX) FX.hit(res.correct);
    persistRun();

    setTimeout(() => {
      if (run.outcome === 'defeat') return finish();
      if (SuperBoss.phaseComplete(run)) {
        const result = SuperBoss.endPhase(run);
        persistRun();
        if (run.outcome) return finish();
        return showPhaseBreak(result);
      }
      render();
    }, 900);
  }

  function showPhaseBreak(result) {
    const next = SuperBoss.currentPhase(run);
    root.innerHTML = `
      <div class="hud hud-corners t-center" style="padding:24px 16px;">
        <span class="br1"></span><span class="br2"></span>
        <div class="title-eyebrow">▸ PHASE CLEARED ◂</div>
        <div class="title-main">${result.correct}/${result.total}</div>
        <div class="t-sm t-mute" style="margin:12px 0;">
          VITALS RESTORED +${Math.round(run.playerMaxHp * SuperBoss.INTER_PHASE_HEAL)}
        </div>
        <div class="header-strip" style="margin:16px -16px 12px;">
          <span>NEXT // PHASE ${next.n}</span><span class="blink">▮ READY</span>
        </div>
        <div class="title-sub">${next.name}</div>
        <div class="t-sm t-mute" style="margin-bottom:18px;">${next.blurb}</div>
        <button class="btn" data-continue>ENGAGE</button>
      </div>`;
    root.querySelector('[data-continue]').addEventListener('click', render);
  }

  function finish() {
    state.superbossRun = null;
    // Carry pins forward: a phase failed this run is drilled on the next one.
    state.superbossPinned = run.pinned && Object.keys(run.pinned).length ? run.pinned : null;
    if (run.outcome === 'victory' && state.defeatedBosses.indexOf('vitals-titan') === -1) {
      state.defeatedBosses.push('vitals-titan');
    }
    App.persist();
    App.goto('results', {
      superboss: true,
      outcome: run.outcome,
      phaseResults: run.phaseResults,
      answers: run.answers,
      bossName: 'VITALS TITAN',
    }, { clearHistory: true });
  }

  render();
});
```

- [ ] **Step 3: Add the phase-bar styles**

Append to `css/style.css`:

```css
/* ── VITALS TITAN phase bars ─────────────────────────────── */
.titan-bars { display: flex; gap: 4px; margin: 8px 0 12px; }
.titan-bar {
  flex: 1; height: 8px; background: rgba(0,0,0,.18);
  border: 1px solid var(--line); overflow: hidden;
}
.titan-bar-fill { height: 100%; background: var(--danger); transition: width .25s ease; }
.titan-bar.active { box-shadow: 0 0 0 1px var(--accent); }
.titan-bar.cleared .titan-bar-fill { background: var(--line); }
.pin-note {
  margin: 0 0 10px; padding: 6px 8px;
  border-left: 3px solid var(--danger); background: rgba(192,57,43,.08);
}
```

- [ ] **Step 4: Verify it renders**

Start the preview and load the screen. Run through the first three questions of phase 1 and confirm: the phase banner reads `PHASE 1/5`, five bars are visible with only the first active, and answering advances the query counter.

- [ ] **Step 5: Commit**

```bash
git add js/screens/superboss.js css/style.css index.html
git commit -m "feat(ui): VITALS TITAN run screen with phase bars and breaks"
```

---

## Task 11: Briefing screen and home entry

**Files:**
- Create: `js/screens/superboss-briefing.js`
- Modify: `js/screens/home.js`

- [ ] **Step 1: Write the briefing screen**

Create `js/screens/superboss-briefing.js`:

```js
/* ============================================================
   SUPERBOSS BRIEFING — pre-run screen for VITALS TITAN.
   Offers RESUME when a saved run exists.
   ============================================================ */
App.registerScreen('superboss-briefing', ({ root, state }) => {
  const bank = (window.ALL_QUESTIONS || []).filter(q => q.course === 'rcp2xx');
  const hasRun = !!state.superbossRun;
  const saved = state.superbossRun;
  const pinned = state.superbossPinned || {};
  const pinnedPhases = SuperBoss.PHASES.filter(p => pinned[p.id]);

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>BACK</button>
      <span class="mode-tag">🗿 FINAL PROTOCOL</span>
      <span class="chapter-tag">RCP 202+203</span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="title-block">
        <div class="title-eyebrow">▸ APEX HOSTILE ◂</div>
        <div class="title-main">VITALS TITAN</div>
        <div class="title-sub">EVERY NUMBER THAT MATTERS</div>
      </div>

      <div class="boss-portrait">${(window.BOSS_SPRITES || {})['vitals-titan'] || ''}</div>

      <div class="header-strip" style="margin: 12px -16px;">
        <span>ENGAGEMENT RULES</span><span>${bank.length} QUERIES LOADED</span>
      </div>

      <ul class="brief-list t-sm">
        <li><b>5 phases × 15 queries</b> — 75 total</li>
        <li><b>12 of 15</b> correct to advance a phase</li>
        <li>Fail a phase and the run <b>ends</b> — restart from phase 1</li>
        <li>No query repeats until the final phase</li>
        <li>Vitals restore <b>30%</b> between phases</li>
      </ul>

      ${pinnedPhases.length ? `
        <div class="pin-note t-sm">
          ▸ RETRY DRILL ARMED — ${pinnedPhases.map(p => 'PHASE ' + p.n).join(', ')}
          will serve the same queries you missed, reshuffled.
        </div>` : ''}

      <div class="phase-list t-sm">
        ${SuperBoss.PHASES.map(p => `
          <div class="phase-row">
            <span class="phase-n" ${pinned[p.id] ? 'style="background:var(--danger)"' : ''}>${p.n}</span>
            <span><b>${p.name}</b>${pinned[p.id] ? ' <span class="t-mute">· pinned</span>' : ''}
              <br><span class="t-mute">${p.blurb}</span></span>
          </div>`).join('')}
      </div>

      ${hasRun ? `<button class="btn" data-resume>RESUME — PHASE ${saved.phaseIndex + 1}</button>` : ''}
      <button class="btn ${hasRun ? 'btn-ghost' : ''}" data-start>
        ${hasRun ? 'START OVER' : 'ENGAGE'}
      </button>
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.back());
  root.querySelector('[data-start]').addEventListener('click', () => {
    // Clears the in-progress run, NOT the pins — a failed phase stays armed.
    state.superbossRun = null;
    App.persist();
    App.goto('superboss', {});
  });
  const resumeBtn = root.querySelector('[data-resume]');
  if (resumeBtn) resumeBtn.addEventListener('click', () => App.goto('superboss', { resume: true }));
});
```

- [ ] **Step 2: Add the styles**

Append to `css/style.css`:

```css
/* ── VITALS TITAN briefing ───────────────────────────────── */
.brief-list { margin: 10px 0 14px; padding-left: 18px; line-height: 1.7; }
.phase-list { margin-bottom: 16px; }
.phase-row { display: flex; gap: 10px; align-items: flex-start; padding: 6px 0; border-top: 1px solid var(--line); }
.phase-n {
  flex: 0 0 22px; height: 22px; line-height: 22px; text-align: center;
  background: var(--danger); color: #fff; font-weight: 700;
}
```

- [ ] **Step 3: Add the home tile**

In `js/screens/home.js`, add this block immediately after the `data-course="rcp104"` module div (around line 124):

```html
    <div class="module module-titan" data-go="superboss-briefing">
      <div class="module-icon-wrap">🗿</div>
      <div class="module-body">
        <div class="module-tag">▸ FINAL PROTOCOL</div>
        <div class="module-title">VITALS TITAN</div>
        <div class="module-meta">RCP 202+203 · 5 PHASES · 75 QUERIES</div>
      </div>
    </div>
```

In the same file's click handler (around line 183), add a branch before the existing `course-mode` branch:

```js
      } else if (dest === 'superboss-briefing') {
        App.goto('superboss-briefing', {});
```

Append the tile style to `css/style.css`:

```css
.module-titan { border-color: var(--danger); }
.module-titan .module-tag { color: var(--danger); }
```

- [ ] **Step 4: Verify the route**

Load the app, click the FINAL PROTOCOL tile, confirm the briefing renders with the query count and the five phase rows, then click ENGAGE and confirm phase 1 starts.

- [ ] **Step 5: Commit**

```bash
git add js/screens/superboss-briefing.js js/screens/home.js css/style.css
git commit -m "feat(ui): VITALS TITAN briefing screen and home entry tile"
```

---

## Task 12: Results and source-cited review

**Files:**
- Modify: `js/screens/results.js`
- Modify: `js/screens/review-answers.js`

- [ ] **Step 1: Add the per-phase breakdown**

In `js/screens/results.js`, at the top of the registered screen function, add a superboss branch that renders before the normal results markup:

```js
  if (ctx.superboss) {
    const won = ctx.outcome === 'victory';
    root.innerHTML = `
      <div class="hud hud-corners t-center">
        <span class="br1"></span><span class="br2"></span>
        <div class="title-eyebrow">${won ? '▸ TITAN DOWN ◂' : '▸ RUN ENDED ◂'}</div>
        <div class="title-main">${ctx.bossName}</div>

        <div class="phase-list t-sm" style="margin-top:16px;">
          ${ctx.phaseResults.map(r => `
            <div class="phase-row">
              <span class="phase-n" style="background:${r.passed ? 'var(--ok)' : 'var(--danger)'}">
                ${r.passed ? '✓' : '✗'}
              </span>
              <span><b>${r.phaseName}</b><br>
                <span class="t-mute">${r.correct}/${r.total}</span></span>
            </div>`).join('')}
          ${ctx.phaseResults.length < 5 ? `
            <div class="phase-row t-mute">
              <span class="phase-n" style="background:var(--line)">–</span>
              <span>${5 - ctx.phaseResults.length} phase(s) not reached</span>
            </div>` : ''}
        </div>

        ${ctx.phaseResults.some(r => !r.passed) ? `
          <div class="pin-note t-sm" style="text-align:left;">
            ▸ ${ctx.phaseResults.filter(r => !r.passed).map(r => r.phaseName).join(', ')}
            pinned — your next attempt drills the same queries in a new order.
          </div>` : ''}

        <button class="btn" data-review>REVIEW MISSES</button>
        <button class="btn btn-ghost" data-home>RETURN</button>
      </div>`;

    root.querySelector('[data-review]').addEventListener('click',
      () => App.goto('review-answers', { answers: ctx.answers, superboss: true }));
    root.querySelector('[data-home]').addEventListener('click',
      () => App.goto('home', {}, { clearHistory: true }));
    return;
  }
```

- [ ] **Step 2: Show the source citation on each miss**

In `js/screens/review-answers.js`, inside the markup built for each reviewed answer, add this directly after the explanation line:

```js
        ${a.srcItem ? `<div class="src-line t-sm t-mute">
          ${a.srcItem.replace(':', ' · item ')}${a.srcCite ? ' — ' + a.srcCite : ''}
        </div>` : ''}
```

Append the style to `css/style.css`:

```css
.src-line { margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--line); }
```

- [ ] **Step 3: Verify**

Complete a run (or fail one deliberately), confirm the results screen lists each phase with its score and marks unreached phases, then open REVIEW MISSES and confirm each miss shows its Tier 3 item and source line.

- [ ] **Step 4: Commit**

```bash
git add js/screens/results.js js/screens/review-answers.js css/style.css
git commit -m "feat(ui): per-phase results and source-cited miss review for VITALS TITAN"
```

---

## Task 13: Service worker and cache busting

**Files:**
- Modify: `sw.js`
- Modify: `index.html`

- [ ] **Step 1: Read the current cache list**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && cat sw.js`

- [ ] **Step 2: Bump the cache name and add the new files**

In `sw.js`, change the cache constant to a new version string (e.g. `rcpsg-titan1`), and add these paths to the precache array:

```js
  'js/engine/superboss.js',
  'js/screens/superboss.js',
  'js/screens/superboss-briefing.js',
  'content/rcp2xx-superboss.js',
  'content/rcp202-values.js',
  'content/rcp203-values.js',
```

- [ ] **Step 3: Bump every query string in index.html**

Replace all `?v=cream3` with `?v=titan1` so returning players get the new files rather than a stale cache.

Run: `cd /Users/lourdsonfernando/RCPStudyGame && sed -i '' 's/?v=cream3/?v=titan1/g' index.html && grep -c 'v=titan1' index.html`
Expected: a count matching the number of versioned assets (30+), and zero remaining `cream3`:
`grep -c 'cream3' index.html` → `0`

- [ ] **Step 4: Commit**

```bash
git add sw.js index.html
git commit -m "chore: bump PWA cache to titan1 and precache superboss assets"
```

---

## Task 14: Full verification

- [ ] **Step 1: Python suite**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 -m unittest discover -s tools/tests -v`
Expected: all tests OK

- [ ] **Step 2: Engine suite (headless)**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node tools/run-engine-tests.js`
Expected: `66 passed, 0 failed`, exit 0

- [ ] **Step 3: Content gate**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && python3 tools/verify_values.py content/rcp202-values.js content/rcp203-values.js`
Expected: `OK — every answer traced to its cited card.` with coverage reported

- [ ] **Step 4: Simulated full run — the no-repeat guarantee on real content**

Run: `cd /Users/lourdsonfernando/RCPStudyGame && node -e "
globalThis.window=globalThis; window.ALL_QUESTIONS=[];
require('./js/engine/superboss.js');
require('./content/rcp202-values.js'); require('./content/rcp203-values.js');
const bank=window.ALL_QUESTIONS.filter(q=>q.course==='rcp2xx');
let worst=0;
for (let trial=0; trial<200; trial++) {
  const run=SuperBoss.startRun({bank, playerMaxHp:10000});
  const seenIds=[...run.questions.map(q=>q.id)];
  const seenVals=[...run.questions.map(SuperBoss.valueKeyOf)];
  for (let p=0; p<4; p++) {
    for (let i=0;i<15;i++) SuperBoss.answer(run, SuperBoss.currentQ(run).correct);
    SuperBoss.endPhase(run);
    if (run.phaseIndex===4) break;
    seenIds.push(...run.questions.map(q=>q.id));
    seenVals.push(...run.questions.map(SuperBoss.valueKeyOf));
  }
  const dupes = (seenIds.length - new Set(seenIds).size)
              + (seenVals.length - new Set(seenVals).size);
  if (dupes>worst) worst=dupes;
}
console.log('200 simulated runs — worst duplicate id+value count in phases 1-4:', worst);
process.exit(worst===0?0:1);
"`
Expected: `worst duplicate id+value count in phases 1-4: 0`, exit 0

- [ ] **Step 5: Browser run**

Open the app in the preview. Play a complete 75-question run. Confirm:
- each phase banner advances 1→5
- the cleared phase bar greys out
- the heal message appears between phases
- no question text repeats before the final phase
- the results screen lists all five phases
- REVIEW MISSES shows item numbers and source lines

Then start a second run, deliberately score 11/15 in phase 2, and confirm:
- the run ends, and the results screen names phase 2 as pinned
- the briefing shows RETRY DRILL ARMED for phase 2 and marks its row
- on the next attempt, phase 2 serves **the same 15 questions** in a different order, with the
  choices in different positions
- clearing phase 2 on that attempt removes the pin from the briefing

- [ ] **Step 6: Background-resume check**

Mid-run, switch away from the tab, return, and reload the page. Open the briefing and confirm RESUME appears with the correct phase number, and that resuming restores the same question position.

- [ ] **Step 7: Confirm nothing else regressed**

Open `test-engine.html` in the browser and confirm the pre-existing State / Battle / Crisis sections still pass alongside the new super boss section.

- [ ] **Step 8: Final commit and tag**

```bash
git add -A
git commit -m "feat: VITALS TITAN super boss — 5-phase RCP 202/203 values gauntlet"
git tag v1.6-vitals-titan
```

---

## Deferred / out of scope

- Any edit to `js/engine/battle.js`, the 103/104 bosses, crisis, survival, or the daily challenge.
- Non-numeric content from the Tier 3 guides.
- RCP 201 material.
- Deploying to GitHub Pages — do that only when asked.
