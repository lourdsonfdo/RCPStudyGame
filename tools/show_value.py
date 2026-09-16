"""Print an extracted record next to the full text of the card it came from.

For auditing by eye: `python3 tools/show_value.py 203:s06-12#1`
or a whole card: `python3 tools/show_value.py 203:s06-12`
or a filter:     `python3 tools/show_value.py --filter negative|comma|unitless|warn|gap [N]`
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_values import GUIDES, CARD_RE, SRC_RE, strip_tags

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'values.json')


def card_index():
    index = {}
    for course, path in GUIDES.items():
        doc = open(path, encoding='utf-8').read()
        for m in CARD_RE.finditer(doc):
            index['%s:%s' % (course, m.group(1))] = strip_tags(SRC_RE.sub(' ', m.group(3)))
    return index


def show(records, cards):
    for r in records:
        key = '%s:%s' % (r['course'], r['item'])
        print('=' * 78)
        print('%s   [%s]   %s' % (r['key'], ','.join(r['flags']) or 'clean', r['item_title']))
        print('SOURCE : %s' % r['cite'])
        print('VALUES : %s' % ', '.join(r['values']))
        print('QUOTE  : %s' % r['quote'])
        print('-' * 78)
        print('FULL CARD TEXT:')
        print(cards.get(key, '(card not found)'))
        print()


def main():
    data = json.load(open(DATA, encoding='utf-8'))
    records = data['records']
    cards = card_index()
    args = sys.argv[1:]

    if not args:
        print(__doc__)
        return 1

    if args[0] == '--filter':
        which = args[1]
        limit = int(args[2]) if len(args) > 2 else 20
        tests = {
            'negative': lambda r: any(v.lstrip('<>≤≥').startswith('-') for v in r['values']),
            'comma': lambda r: any(',' in v for v in r['values']),
            'unitless': lambda r: any(re.fullmatch(r'[<>≤≥]?-?[\d.:,-]+', v) for v in r['values']),
            'warn': lambda r: 'warn' in r['flags'],
            'gap': lambda r: 'gap' in r['flags'],
        }
        if which not in tests:
            print('filters: %s' % ', '.join(sorted(tests)))
            return 1
        picked = [r for r in records if tests[which](r)]
        print('%d records match %r; showing %d\n' % (len(picked), which, min(limit, len(picked))))
        show(picked[:limit], cards)
        return 0

    target = args[0]
    picked = [r for r in records if r['key'] == target or
              '%s:%s' % (r['course'], r['item']) == target]
    if not picked:
        print('no record matches %r' % target)
        return 1
    show(picked, cards)
    return 0


if __name__ == '__main__':
    sys.exit(main())
