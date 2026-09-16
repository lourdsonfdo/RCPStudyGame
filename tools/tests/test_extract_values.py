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
        got = self.values('NIF/MIP normal < −​60 cm H₂O'.replace('​', ''))
        self.assertIn('<-60cmh2o', got)

    def test_bare_negative_with_unit(self):
        self.assertIn('-100cmh2o', self.values('peak −100 cmH2O'))

    def test_unicode_subscript_unit_is_matched(self):
        self.assertIn('≤30cmh2o', self.values('plateau ≤ 30 cm H₂O'))

    def test_ascii_and_unicode_subscript_normalise_alike(self):
        self.assertEqual(self.values('30 cm H₂O'), self.values('30 cmH2O'))

    def test_compound_unit_wins_over_its_prefix(self):
        self.assertIn('70-100ml/cmh2o', self.values('Static compliance 70–100 mL/cm H₂O'))

    def test_comparison_keeps_its_unit(self):
        self.assertIn('>20%', self.values('A major burn is defined as >20% TBSA'))

    def test_plain_number_without_unit_is_not_a_value(self):
        self.assertEqual(self.values('There are 5 levels of service.'), [])

    def test_range_without_sign_is_unaffected(self):
        self.assertIn('90-95%', self.values('Concentrators deliver 90–95% oxygen'))

    def test_range_dash_after_a_fraction_is_not_a_minus(self):
        # "¼–2 L/min": the dash separates a range whose left operand is a
        # fraction this pattern cannot match. It must not become "-2 L/min".
        got = self.values('nasal cannula at ¼–2 L/min')
        self.assertIn('2l/min', got)
        self.assertNotIn('-2l/min', got)

    def test_spaced_range_is_not_read_as_a_negative(self):
        got = self.values('14 – 18 breaths/min')
        self.assertIn('14-18breaths/min', got)
        self.assertNotIn('-18breaths/min', got)


if __name__ == '__main__':
    unittest.main()
