#!/usr/bin/env python3
"""List the Recall flashcards a midterm drill bank probably does NOT already test.

A card counts as covered when most of its numbers and longer words already appear
somewhere in the bank's stems, options and explanations. It's a coarse filter: read
what it prints, then write questions only for facts that really are missing.

Usage: python3 tools/gap_prefilter.py 202 [threshold=0.85] > /tmp/uncov202.txt
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CARDS = os.path.expanduser('~/recall/decks/rcp.json')
STOP = set('the and for with that this from are was were into than then their there which what when '
           'your have has not but can may also each other more most less only been being per its they '
           'them over under about after before between during within without very such some any all '
           'one two'.split())


def plain(s):
    s = s.split('<hr id=answer>')[-1]
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = re.sub(r'<li[^>]*>', '\n• ', s)
    return re.sub(r'\n\s*\n+', '\n', html.unescape(re.sub(r'<[^>]+>', '', s))).strip()


def norm(s):
    return s.lower().replace('–', '-').replace('—', '-')


def main(course, threshold=0.85):
    bank = json.load(open(os.path.join(ROOT, 'tools', 'midterm', f'bank{course}.json'), encoding='utf-8'))
    corpus = norm(' '.join(q['q'] + ' ' + ' '.join(q['o']) + ' ' + q['e'] for s in bank for q in s['q']))
    cards = [c for c in json.load(open(CARDS, encoding='utf-8'))['cards'] if c['d'].startswith(f'RCP {course}')]
    out = []
    for c in cards:
        back = re.sub(r'\[[^\]]*\]', '', norm(plain(c['a'])))  # drop slide citations
        nums = set(re.findall(r'\d+(?:\.\d+)?', back))
        words = {w for w in re.findall(r'[a-z][a-z\-]{4,}', back) if w not in STOP}
        score = ((sum(n in corpus for n in nums) / len(nums)) if nums else 1) * 0.6 \
            + ((sum(w in corpus for w in words) / len(words)) if words else 1) * 0.4
        if score < threshold:
            out.append((score, c))
    print(f'# {len(out)} of {len(cards)} RCP {course} cards look uncovered (threshold {threshold})')
    for score, c in sorted(out, key=lambda x: x[0]):
        front = html.unescape(re.sub(r'<[^>]+>', '', c['q'])).strip()
        back = re.sub(r'\s*\n\s*', ' / ', plain(c['a']))
        print(f"## {c['k']} [{c['d']}] {score:.2f} | {front} => {back}")


if __name__ == '__main__':
    main(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 0.85)
