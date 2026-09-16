"""Generate VITALS TITAN questions from tools/values.json.

Every question is a CLOZE built from the source sentence with one value
blanked out. That makes the stem faithful by construction -- it is the guide's
own wording, not a paraphrase -- and it makes the whole bank reproducible: edit
a guide, re-run the extractor, re-run this, and the questions follow.

Distractors are numeric perturbations of the answer carrying the SAME unit.
Any distractor that happens to be a true value on the same card is discarded,
because two true answers make a question unanswerable. tools/verify_values.py
is the gate that enforces this after generation.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_values import build_card_index, _squash, _contains_value

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

GAS = re.compile(r'cylinder|oxygen|gas|LOX|liquid|regulator|flowmeter|PISS|DISS|'
                 r'concentrat|conserv|compress|air|nitrogen|helium|purity|psi|'
                 r'bulk|manifold|blender|therapy device', re.I)
# A bare '=' is not a calculation -- "Intimate space = 1 inch" is a definition.
# Phase 4 needs a real operator or an explicit calculation word.
CALC = re.compile(r'[×÷]|\bformula\b|\bcalculat|\bduration\b|\bfactor\b|'
                  r'per kg|\bstep [1-9]\b', re.I)

NUM_IN_VALUE = re.compile(r'\d+(?:,\d{3})*(?:\.\d+)?')


def phase_for(rec):
    if CALC.search(rec['quote']):
        return 4, 'sb-formula'
    if rec['course'] == '202':
        return 1, 'sb-202'
    if GAS.search(rec['item_title']):
        return 2, 'sb-gas'
    return 3, 'sb-equip'


def original_pattern(value):
    """Match a normalised value against the guide's ORIGINAL notation.

    The stem has to be the guide's own sentence, with its capitalisation and
    spacing intact, so the span must be located in the raw quote rather than in
    the normalised form. That means tolerating what normalisation folded away:
    en/em dashes and the true minus for '-', the Unicode subscript for '2', and
    the spaces that normalisation removed.
    """
    parts = []
    chars = list(value)
    for i, ch in enumerate(chars):
        if ch == '-':
            parts.append(r'[-\u2013\u2014\u2212]')
        elif ch == '2':
            parts.append(r'[2\u2082]')
        else:
            parts.append(re.escape(ch))
        if i + 1 < len(chars) and not (ch.isdigit() and chars[i + 1].isdigit()):
            parts.append(r'\s*')
    return re.compile(''.join(parts), re.I)


def find_in_quote(quote, value):
    """Locate the literal span of `value` inside the ORIGINAL quote."""
    pattern = original_pattern(value)
    m = pattern.search(quote)
    if not m:
        return None
    return quote, m.span()


def make_stem(quote, value, title):
    """The source sentence, as written, with this value replaced by a blank."""
    found = find_in_quote(quote, value)
    if not found:
        return None, None
    text, (a, b) = found
    surface = text[a:b]                       # the value as the guide writes it
    stem = text[:a] + '_____' + text[b:]
    stem = re.sub(r'\s+', ' ', stem).strip()
    stem = re.sub(r'\s+([.,;:])', r'\1', stem)
    # The first sentence of a card repeats its number and title, which we are
    # already prepending. Drop the echo rather than printing it twice.
    stem = re.sub(r'^\d+\s+' + re.escape(title) + r'\s*', '', stem).strip()
    i = stem.index('_____')
    # A blank buried deep in a long "sentence" is almost always a flattened
    # table row, and windowing it yields fragments like
    # "... separately) Not separately listed in this deck NI" -- traceable but
    # unreadable. Drop those rather than trim them.
    if i > 190:
        return None, None
    if len(stem) > 300:
        cut = stem.rfind(' ', 0, 300)          # trim at a word boundary
        stem = stem[:cut if cut > 200 else 300].rstrip(' ,;:') + ' ...'
    return '%s — %s' % (title, stem), surface


def perturb(value):
    """Numeric variants of `value` that keep its unit and shape."""
    nums = NUM_IN_VALUE.findall(value)
    if not nums:
        return []
    out = []

    def rebuild(factors):
        result = value
        for original, factor in zip(nums, factors):
            raw = float(original.replace(',', ''))
            new = raw * factor
            if raw == int(raw) and new == int(new):
                text = str(int(new))
                if ',' in original:
                    text = '{:,}'.format(int(new))
            else:
                text = ('%.2f' % new).rstrip('0').rstrip('.')
            result = result.replace(original, text, 1)
        return result

    is_percent = '%' in value
    for factors in ([2] * len(nums), [0.5] * len(nums), [1.5] * len(nums),
                    [3] * len(nums), [0.25] * len(nums), [0.75] * len(nums),
                    [10] * len(nums), [0.1] * len(nums)):
        candidate = rebuild(factors)
        if candidate == value or candidate in out:
            continue
        # A percentage over 100 is not a plausible wrong answer, it is a
        # giveaway -- "SaO2 190%" tells the player which option to discard.
        if is_percent and any(float(n.replace(',', '')) > 100
                              for n in NUM_IN_VALUE.findall(candidate)):
            continue
        out.append(candidate)
    return out


# The guides mark cards where the sources disagree, and cards whose material
# is absent from the lecture decks. A question built on either is still
# traceable, but the player deserves to know before they memorise it.
WARN_NOTE = ('\u26a0 Sources disagree on this card \u2014 verify this number in the guide '
             'before trusting it.')
GAP_NOTE = ('\u24d8 Not covered by the lecture decks \u2014 background from the textbook, '
            'not necessarily testable.')


def caution(rec):
    """The warning a flagged card earns, or '' when the card is clean.

    Kept out of `explanation` so the review screen can render it as its own
    line: a caution buried at the end of a quotation is a caution nobody reads.
    """
    notes = []
    if 'warn' in rec['flags']:
        notes.append(WARN_NOTE)
    if 'gap' in rec['flags']:
        notes.append(GAP_NOTE)
    return ' '.join(notes)


def build(records, cards, limit_per_record=3):
    bank = []
    seq = {'202': 0, '203': 0}
    seen_keys = set()

    for rec in records:
        card_key = '%s:%s' % (rec['course'], rec['item'])
        card = cards.get(card_key)
        if card is None:
            continue
        card_text = _squash(card['text'])
        phase, topic = phase_for(rec)

        # A flattened table row reads as a wall of values with almost no
        # sentence around them ("7% 38% 55% VERBAL VOCAL VISUAL words tone").
        # Blanking one produces a question nobody can answer from context.
        interior = rec['quote'][:-1]
        if len(rec['values']) >= 4 and len(re.findall(r'[.;]\s', interior)) < 2:
            continue

        for value in rec['values'][:limit_per_record]:
            vkey = '%s|%s' % (card_key, value)
            if vkey in seen_keys:
                continue

            stem, surface = make_stem(rec['quote'], value, rec['item_title'])
            if not stem:
                continue
            # A stem needs enough surrounding sentence to identify what is being
            # asked. "2.41 would give _____ )." is traceable but unanswerable.
            body = stem.split('\u2014', 1)[-1].replace('_____', '').strip()
            if len(body) < 45 or body.startswith((')', ',', ';', ':')):
                continue

            # A distractor that is ALSO true on this card makes the question
            # unanswerable, so it is discarded rather than shipped.
            distractors = [d for d in perturb(surface)
                           if not _contains_value(card_text, d)][:3]
            if len(distractors) < 3:
                continue

            seen_keys.add(vkey)
            seq[rec['course']] += 1
            choices = [surface] + distractors
            bank.append({
                'id': 'sv-%s-%04d' % (rec['course'], seq[rec['course']]),
                'topic': topic,
                'course': 'rcp2xx',
                'phase': phase,
                'difficulty': 3 if phase == 4 else 2,
                'q': stem,
                'choices': choices,
                'correct': 0,
                'explanation': rec['quote'][:280],
                'caution': caution(rec),
                'srcItem': card_key,
                'srcQuote': rec['quote'],
                'srcCite': rec['cite'],
                'flags': rec['flags'],
            })
    return bank


def emit(bank, course, path, header):
    rows = [q for q in bank if q['srcItem'].startswith(course + ':')]
    lines = ['/* ============================================================',
             '   %s' % header,
             '   GENERATED by tools/generate_questions.py from tools/values.json.',
             '   Do not hand-edit: re-run the generator instead.',
             '   Every entry is verified by tools/verify_values.py.',
             '   ============================================================ */',
             '(function () {',
             '  const additions = [']
    for q in rows:
        lines.append('    ' + json.dumps(q, ensure_ascii=False) + ',')
    lines += ['  ];',
              '  window.ALL_QUESTIONS = (window.ALL_QUESTIONS || []).concat(additions);',
              '})();', '']
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(lines))
    return len(rows)


def main():
    data = json.load(open(os.path.join(HERE, 'values.json'), encoding='utf-8'))
    cards = build_card_index()
    bank = build(data['records'], cards)

    n202 = emit(bank, '202', os.path.join(ROOT, 'content', 'rcp202-values.js'),
                'RCP 202 VALUES — VITALS TITAN bank')
    n203 = emit(bank, '203', os.path.join(ROOT, 'content', 'rcp203-values.js'),
                'RCP 203 VALUES — VITALS TITAN bank')

    import collections
    by_phase = collections.Counter(q['phase'] for q in bank)
    print('generated %d questions (202: %d, 203: %d)' % (len(bank), n202, n203))
    for p in sorted(by_phase):
        print('   phase %d: %d' % (p, by_phase[p]))
    flagged = sum(1 for q in bank if q['flags'])
    print('   on contested/absent cards: %d' % flagged)


if __name__ == '__main__':
    main()
