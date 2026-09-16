"""Exhaustive fidelity audit of tools/values.json against the Tier 3 guides.

This does NOT check whether the guides are medically correct. It checks that
every extracted value faithfully represents what its source card actually says:
right digits, right sign, right unit, right range, right card.

Every record is checked. Nothing is sampled.
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_values import GUIDES, CARD_RE, SRC_RE, strip_tags, normalize_value, VALUE_RE
from verify_values import _squash, _contains_value


def card_text_index():
    index = {}
    for course, path in GUIDES.items():
        with open(path, encoding='utf-8') as fh:
            doc = fh.read()
        for m in CARD_RE.finditer(doc):
            item_id, inner = m.group(1), m.group(3)
            index['%s:%s' % (course, item_id)] = strip_tags(SRC_RE.sub(' ', inner))
    return index


def main():
    data = json.load(open('tools/values.json', encoding='utf-8'))
    cards = card_text_index()
    records = data['records']

    fail = {k: [] for k in (
        'unknown_card', 'quote_not_in_card', 'value_not_in_quote',
        'value_not_in_card', 'sign_dropped', 'sign_invented',
        'range_order', 'unit_not_adjacent', 'empty_values')}

    total_values = 0
    for r in records:
        key = '%s:%s' % (r['course'], r['item'])
        card = cards.get(key)
        if card is None:
            fail['unknown_card'].append(key)
            continue

        squashed_card = _squash(card)
        squashed_quote = _squash(r['quote'])

        if squashed_quote not in squashed_card:
            fail['quote_not_in_card'].append((r['key'], r['quote'][:70]))

        if not r['values']:
            fail['empty_values'].append(r['key'])

        for v in r['values']:
            total_values += 1

            # The value must be present in the QUOTE it was drawn from,
            # not merely somewhere else on the card.
            if not _contains_value(squashed_quote, v):
                fail['value_not_in_quote'].append((r['key'], v, r['quote'][:70]))
            if not _contains_value(squashed_card, v):
                fail['value_not_in_card'].append((r['key'], v))

            core = v.lstrip('<>≤≥')
            digits = re.match(r'-?((?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?))', core)
            if not digits:
                continue
            first = digits.group(1)

            # Sign fidelity, both directions.
            # A dash directly after a digit or a vulgar fraction separates a
            # range; it is not a minus sign.
            neg_in_src = re.search(
                r'(?<![\d¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])[−–-]\s?' + re.escape(first) + r'(?![\d.])',
                r['quote'])
            pos_in_src = re.search(r'(?<![−–\-\d.])' + re.escape(first) + r'(?![\d.])', r['quote'])
            if core.startswith('-') and not neg_in_src:
                fail['sign_invented'].append((r['key'], v, r['quote'][:70]))
            if not core.startswith('-') and neg_in_src and not pos_in_src:
                fail['sign_dropped'].append((r['key'], v, r['quote'][:70]))

            # Range operands must appear in the source in the same order.
            rng = re.match(r'(-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)-(-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)', core)
            if rng:
                lo, hi = rng.group(1).lstrip('-'), rng.group(2).lstrip('-')
                if not re.search(re.escape(lo) + r'\D{0,6}' + re.escape(hi), r['quote']):
                    fail['range_order'].append((r['key'], v, r['quote'][:70]))

            # The unit must sit next to the number in the source, not elsewhere.
            unit = re.sub(r'^[<>≤≥]?-?[\d.,]+(?:-[-\d.,]+)?', '', core)
            if unit:
                pat = re.escape(first) + r'\s*(?:[–—-]\s*[\d.]+\s*)?' + \
                      re.escape(unit).replace('2', '[2₂]').replace('\\ ', r'\s?')
                if not re.search(pat, _squash(r['quote']).replace(' ', ''), re.I):
                    loose = re.search(re.escape(first) + r'[^\d]{0,12}' + re.escape(unit[:3]),
                                      _squash(r['quote']), re.I)
                    if not loose:
                        fail['unit_not_adjacent'].append((r['key'], v, r['quote'][:70]))

    print('records: %d   values: %d   cards indexed: %d'
          % (len(records), total_values, len(cards)))
    print()
    clean = True
    for name, items in fail.items():
        status = 'OK' if not items else 'FAIL'
        if items:
            clean = False
        print('%-22s %-5s %d' % (name, status, len(items)))
        for it in items[:6]:
            print('        ', it)
    print()
    print('AUDIT CLEAN' if clean else 'AUDIT FOUND PROBLEMS')
    return 0 if clean else 1


if __name__ == '__main__':
    sys.exit(main())
