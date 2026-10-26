#!/usr/bin/env python3
"""Print midterm facts (stem -> correct answer | explanation) matching a regex.

Used to ground scenario decisions in already-verified questions.
Usage: python3 tools/facts.py 201 'PPV|compression|epinephrine'
"""
import re
import sys

sys.path.insert(0, __file__.rsplit('/', 1)[0])
from option_balance import load  # noqa: E402

course, pattern = sys.argv[1], re.compile(sys.argv[2], re.I)
for sid, q in load(course):
    if pattern.search(q['q'] + ' ' + q['o'][0] + ' ' + q.get('e', '')):
        print(f"[{sid}] {q['q']} -> {q['o'][0]} | {q.get('e', '')[:170]}")
