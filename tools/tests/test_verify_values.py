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


FIXTURE_202 = os.path.join(os.path.dirname(__file__), 'fixtures', 'mini_tier3_202.html')

# The 202 guide writes cm H2O with a Unicode subscript two (cm H₂O); question
# authors will naturally type the ASCII form (cmH2O) instead. A genuinely
# correct, correctly-sourced question must still pass — if the gate's own
# text-comparison folds subscripts differently than extract_values.normalize_value
# does, it rejects good questions from the 202 guide as if they were wrong.
GOOD_202 = {
    'id': 'sv-202-0001',
    'course': 'rcp2xx',
    'phase': 2,
    'q': 'What is the normal NIF/MIP in adults?',
    'choices': ['-20 cmH2O', '-40 cmH2O', '-60 cmH2O', '-80 cmH2O'],
    'correct': 2,
    'srcItem': '202:s09-05',
    'srcQuote': 'Normal NIF/MIP is less than -60 cm H2O in adults.',
    'srcCite': 'Lssn 2 Chp 9 — Weaning Parameters, slide 12',
}


class TestVerifyValuesUnicodeSubscript(unittest.TestCase):
    """Regression: ASCII cmH2O in a question must match Unicode cm H₂O in its card."""

    def setUp(self):
        self.cards = vv.build_card_index({'202': FIXTURE_202})

    def test_ascii_cmh2o_question_matches_unicode_subscript_card(self):
        self.assertEqual(vv.check_question(GOOD_202, self.cards), [])


if __name__ == '__main__':
    unittest.main()
