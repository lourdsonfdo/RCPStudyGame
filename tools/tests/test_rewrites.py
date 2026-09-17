import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import generate_questions as g


def question(answer='30 cmH2O', phase=3):
    return {'id': 'sv-203-0001', 'phase': phase, 'topic': 'sb-equip', 'difficulty': 2,
            'q': 'Cards — Plateau _____ is the limit.', 'choices': [answer, '60 cmH2O', '15 cmH2O', '45 cmH2O'],
            'correct': 0, 'srcItem': '203:s05-9'}


KEY = '203:s05-9|30cmh2o'


class TestRewriteProblems(unittest.TestCase):
    def test_clean_question_passes(self):
        self.assertEqual(g.rewrite_problems('What plateau pressure limit is recommended?', '30 cmH2O'), [])

    def test_must_be_a_question(self):
        self.assertTrue(g.rewrite_problems('Plateau pressure limit.', '30 cmH2O'))

    def test_giveaway_is_rejected(self):
        probs = g.rewrite_problems('Is the plateau limit 30 cmH2O?', '30 cmH2O')
        self.assertTrue(any('gives the answer away' in p for p in probs))

    def test_leftover_blank_is_rejected(self):
        self.assertTrue(g.rewrite_problems('Plateau _____ is the limit?', '30 cmH2O'))


class TestApplyRewrites(unittest.TestCase):
    def test_rewrite_replaces_the_stem(self):
        shipped, rep = g.apply_rewrites([question()], {KEY: {'q': 'What plateau limit applies?', 'answer': '30 cmH2O'}})
        self.assertEqual(shipped[0]['q'], 'What plateau limit applies?')
        self.assertEqual(rep['rewritten'], 1)

    def test_unwritten_question_is_withheld(self):
        shipped, rep = g.apply_rewrites([question()], {})
        self.assertEqual(shipped, [])
        self.assertEqual(rep['missing'], [KEY])

    def test_null_rewrite_drops_the_question(self):
        shipped, rep = g.apply_rewrites([question()], {KEY: None})
        self.assertEqual(shipped, [])
        self.assertEqual(rep['dropped'], 1)

    def test_stale_rewrite_is_withheld_after_a_guide_edit(self):
        # The rewrite was written for 30; the guide now says 28. The key is
        # built from the NEW answer, so a stale entry only matches if someone
        # keyed it wrongly -- simulate that and confirm it is caught.
        store = {'203:s05-9|28cmh2o': {'q': 'What plateau limit applies?', 'answer': '30 cmH2O'}}
        shipped, rep = g.apply_rewrites([question(answer='28 cmH2O')], store)
        self.assertEqual(shipped, [])
        self.assertEqual(rep['stale'], ['203:s05-9|28cmh2o'])

    def test_phase_override_moves_question_and_topic(self):
        store = {KEY: {'q': 'What plateau limit applies?', 'answer': '30 cmH2O', 'phase': 4}}
        shipped, _ = g.apply_rewrites([question(phase=3)], store)
        self.assertEqual(shipped[0]['phase'], 4)
        self.assertEqual(shipped[0]['topic'], 'sb-formula')



class TestDistractors(unittest.TestCase):
    def test_ranges_stay_in_order(self):
        for d in g.perturb('\u2265 10\u201320%'):
            lo, hi = [float(x) for x in g.NUM_IN_VALUE.findall(d)]
            self.assertLess(lo, hi, d)

    def test_precision_matches_the_answer(self):
        for d in g.perturb('99%'):
            self.assertNotIn('.', d, d)
        for d in g.perturb('7.35'):
            self.assertEqual(len(d.split('.')[1]), 2, d)

    def test_percentages_never_exceed_100(self):
        for d in g.perturb('88%'):
            self.assertLessEqual(float(d.rstrip('%')), 100, d)

if __name__ == '__main__':
    unittest.main()
