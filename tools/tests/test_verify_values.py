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


class TestValueBoundaries(unittest.TestCase):
    """A wrong answer must not pass because it is a substring of a right one.

    Squashing whitespace makes '5l/min' a substring of '45l/min' and
    '60cmh2o' a substring of '-60cmh2o'. Both are wrong answers, and a gate
    that accepts them is worse than no gate, because it certifies them.
    """

    def setUp(self):
        self.card = vv._squash(
            'Deliver oxygen at 45 L/min. Plateau \u2212 60 cmH2O. '
            'Range 90\u201395%. Dose 0.5 mg. pH 7.25.')

    def test_exact_value_is_found(self):
        self.assertTrue(vv._contains_value(self.card, '45 L/min'))

    def test_tail_substring_of_a_larger_number_is_rejected(self):
        self.assertFalse(vv._contains_value(self.card, '5 L/min'))

    def test_dropping_a_leading_minus_is_rejected(self):
        self.assertTrue(vv._contains_value(self.card, '-60 cmH2O'))
        self.assertFalse(vv._contains_value(self.card, '60 cmH2O'))

    def test_zero_is_not_found_inside_a_larger_value(self):
        self.assertFalse(vv._contains_value(self.card, '0 cmH2O'))

    def test_range_terminated_by_a_full_stop_is_found(self):
        self.assertTrue(vv._contains_value(self.card, '90-95%'))

    def test_range_operand_alone_is_accepted(self):
        # '90-95%' genuinely states 95% as its upper bound, so a question
        # asking for the bound rather than the span is properly sourced.
        # Only digit-glued substrings and dropped signs are unsafe.
        self.assertTrue(vv._contains_value(self.card, '95%'))
        self.assertFalse(vv._contains_value(self.card, '5%'))

    def test_em_dash_punctuation_is_not_a_minus(self):
        card = vv._squash('Renal compensation is slow \u2014 3 to 5 days minimum.')
        self.assertTrue(vv._contains_value(card, '3 to 5 days'))

    def test_chemical_charge_is_not_a_minus(self):
        card = vv._squash('pH 7.40 / PaCO2 40 mm Hg / HCO3\u2212 24 mEq/L.')
        self.assertTrue(vv._contains_value(card, '24 mEq/L'))

    def test_subscript_does_not_glue_to_the_next_value(self):
        card = vv._squash('SIMV 10, VT 450, FiO\u2082 30%, PS 8, PEEP +5.')
        self.assertTrue(vv._contains_value(card, '30%'))

    def test_adjacent_percentages_do_not_block_each_other(self):
        card = vv._squash("The 3 V's: 7% 38% 55% verbal vocal visual")
        self.assertTrue(vv._contains_value(card, '38%'))
        self.assertTrue(vv._contains_value(card, '7%'))

    def test_decimal_is_matched_whole(self):
        self.assertTrue(vv._contains_value(self.card, '0.5 mg'))
        self.assertFalse(vv._contains_value(self.card, '5 mg'))


    def test_digit_inside_a_name_is_not_found(self):
        card = vv._squash('Verify the prescribed O2% using an O2 analyzer.')
        self.assertFalse(vv._contains_value(card, '2%'))

    def test_dosing_interval_after_q_is_found(self):
        card = vv._squash('epinephrine 1 mg IV q3-5 min.')
        self.assertTrue(vv._contains_value(card, '3-5 min'))

    def test_dash_after_a_word_is_a_range_not_a_minus(self):
        card = vv._squash('Newborn\u20131 year 3.0\u20134.0')
        self.assertTrue(vv._contains_value(card, '1 year'))
        self.assertFalse(vv._contains_value(card, '-1 year'))

    def test_dash_after_a_space_is_still_a_minus(self):
        card = vv._squash('Subglottic port runs at \u201320 to \u201325 mm Hg')
        self.assertTrue(vv._contains_value(card, '-20 to -25 mm Hg'))
        self.assertFalse(vv._contains_value(card, '20 to 25 mm Hg'))

if __name__ == '__main__':
    unittest.main()
