#!/usr/bin/env python3
"""Check tools/midterm/fixes20X.json against the original questions.

Flags any fix that changes the correct answer o[0] (needs a human look), drops below
four distinct options, or targets a stem that doesn't exist.
Usage: python3 tools/check_fixes.py 201 [202 203]
"""
import json
import os
import sys

MID = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'midterm')

for c in sys.argv[1:] or ['201', '202', '203']:
    path = os.path.join(MID, f'fixes{c}.json')
    if not os.path.exists(path):
        continue
    fixes = json.load(open(path, encoding='utf-8'))
    orig = {q['q']: q['o'] for s in json.load(open(os.path.join(MID, f'bank{c}.json'), encoding='utf-8')) for q in s['q']}
    gp = os.path.join(MID, f'gaps{c}.json')
    if os.path.exists(gp):
        orig.update({g['q']: g['o'] for g in json.load(open(gp, encoding='utf-8'))})
    changed = 0
    for stem, opts in fixes.items():
        if stem not in orig:
            print(f'{c} UNKNOWN STEM: {stem[:80]}')
        elif len(opts) != 4 or len(set(opts)) != 4:
            print(f'{c} BAD OPTIONS: {stem[:80]}')
        elif opts[0] != orig[stem][0]:
            changed += 1
            print(f'{c} CORRECT ANSWER REWORDED: {stem[:70]}\n    was: {orig[stem][0]}\n    now: {opts[0]}')
    print(f'{c}: {len(fixes)} fixes, {changed} with a reworded correct answer')
