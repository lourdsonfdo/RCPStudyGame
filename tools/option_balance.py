#!/usr/bin/env python3
"""Measure the "pick the longest answer" giveaway in the midterm banks.

For every question (drill bank + gaps, with tools/midterm/fixes20X.json applied)
it compares the correct option o[0] with the longest distractor. By chance the
correct answer should be the uniquely longest option about 25% of the time.

Usage:
  python3 tools/option_balance.py                 # summary for all courses
  python3 tools/option_balance.py 202 --list 1.3  # list questions whose correct
                                                  # answer is >= 1.3x the longest distractor
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MID = os.path.join(ROOT, 'tools', 'midterm')


def load(course):
    """All questions for a course as (section id, question) with fixes applied."""
    bank = json.load(open(os.path.join(MID, f'bank{course}.json'), encoding='utf-8'))
    out = [(s['id'], q) for s in bank for q in s['q']]
    gaps = os.path.join(MID, f'gaps{course}.json')
    if os.path.exists(gaps):
        out += [(g['section'], g) for g in json.load(open(gaps, encoding='utf-8'))]
    fixes = load_fixes(course)
    return [(sid, dict(q, o=fixes[q['q']]) if q['q'] in fixes else q) for sid, q in out]


def load_fixes(course):
    path = os.path.join(MID, f'fixes{course}.json')
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def ratio(q):
    return len(q['o'][0]) / max(len(o) for o in q['o'][1:])


def uniquely_longest(q):
    lens = [len(o) for o in q['o']]
    return lens[0] == max(lens) and lens.count(lens[0]) == 1


def main():
    courses = [a for a in sys.argv[1:] if a.isdigit() and len(a) == 3] or ['201', '202', '203']
    threshold = float(sys.argv[sys.argv.index('--list') + 1]) if '--list' in sys.argv else None
    for c in courses:
        qs = load(c)
        n = len(qs)
        ul = sum(uniquely_longest(q) for _, q in qs)
        big = sum(ratio(q) >= 1.5 for _, q in qs)
        print(f'RCP {c}: {n} Qs · correct is uniquely longest in {ul} ({100 * ul / n:.0f}%, chance ≈ 25%) '
              f'· ≥1.5× longest distractor: {big} · fixes applied: {len(load_fixes(c))}')
        if threshold:
            for sid, q in sorted(qs, key=lambda x: -ratio(x[1])):
                if ratio(q) < threshold:
                    break
                print(json.dumps({'s': sid, 'r': round(ratio(q), 2), 'q': q['q'], 'o': q['o']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
