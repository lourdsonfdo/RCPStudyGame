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


if __name__ == '__main__':
    unittest.main()
