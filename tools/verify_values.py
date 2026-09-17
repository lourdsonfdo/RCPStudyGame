"""Build gate for the VITALS TITAN question bank.

Every question must be traceable: its correct answer has to appear literally
inside the Tier 3 card it cites. A question that cannot be traced is a wrong
number waiting to be memorised, so it fails the build.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys

from extract_values import GUIDES, CARD_RE, SRC_RE, strip_tags, normalize_value, VALUE_RE


def build_card_index(guides=None):
    """Map '<course>:<item>' -> {'text':..., 'title':..., 'cite':...}."""
    guides = guides or GUIDES
    index = {}
    for course, path in guides.items():
        with open(path, encoding='utf-8') as fh:
            doc = fh.read()
        for match in CARD_RE.finditer(doc):
            item_id, inner = match.group(1), match.group(3)
            src_match = SRC_RE.search(inner)
            cite = strip_tags(src_match.group(1)) if src_match else ''
            cite = re.sub(r'^Source\s*', '', cite)
            body = SRC_RE.sub(' ', inner)
            index['%s:%s' % (course, item_id)] = {
                'text': strip_tags(body),
                'cite': cite,
            }
    return index


FRACTIONS = '¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞'


def _squash(text):
    """Comparison form: entity-free, lowercase, dash- and subscript-normalised.

    The guides use similar-looking dashes for four different jobs, and folding
    them together destroys the distinction that decides whether a number is
    negative. Measured across both guides:

      U+2212 attached to a token   a chemical charge     HCO3-          -> dropped
      U+2212 otherwise             a true negative       "- 60 cm H2O"  -> minus
      U+2014 between digits        a range (4 cases)     "90-95%"       -> range
      U+2014 otherwise             punctuation (22)      "slow - 3 days"-> dropped
      U+2013 after a digit         a range (904 cases)   "80-100 torr"  -> range
      U+2013 otherwise             a negative (1 card)   "-20 to -25"   -> minus

    Whitespace collapses to a SINGLE SPACE, never removed: removing it glues an
    analyte's subscript to the value after it, so "FiO2 30%" becomes "fio230%"
    and 30% reads as the tail of a larger number.
    """
    t = html.unescape(text).lower()
    t = t.replace('₂', '2')
    t = re.sub(r'\s+', ' ', t).strip()

    # A minus welded to the token before it is a charge (HCO3-, Cl-), not a sign.
    t = re.sub(r'(?<=[a-z0-9])−', '', t)
    t = t.replace('−', '-')

    # Em dash is a range only when it sits between two numbers.
    t = re.sub(r'(?<=\d)\s?—\s?(?=\d)', '–', t)
    t = t.replace('—', ' ')

    # En dash is a range when a number, a fraction or a word runs straight into
    # it ("80–100", "newborn–1 year"); it is a sign only after a space or at
    # the start ("at –20 to –25 mm Hg"). Reading "newborn–1 year" as a minus
    # once produced the value "−1 year" on both sides of the audit.
    t = re.sub(r'(?<![' + FRACTIONS + r'\w])(?<![' + FRACTIONS + r'\d] )–(?=\s?\d)',
               '-', t)

    t = re.sub(r'\s+', ' ', t).strip()
    # Stripping tags leaves a space before punctuation ('10 L/min .'),
    # which a quote written without it would never match.
    t = re.sub(r'\s+([.,;:])', r'\1', t)
    return re.sub(r'-\s+(?=\d)', '-', t)


def _value_pattern(value):
    """Regex matching `value` in squashed card text, with numeric boundaries.

    Spacing inside a value is flexible ("55-80mmhg" matches "55 - 80 mm Hg")
    but never between two digits, so "45" can never be read as "4 5". A hyphen
    in the value matches either a hyphen or an en dash, since a range may be
    written with either.

    The boundaries are the safety property. Plain containment accepts "5 L/min"
    inside "45 L/min" and "60 cmH2O" inside "-60 cmH2O" -- wrong answers a
    naive gate would certify as sourced. Guards apply only to ends that are
    actually numeric: a value ending in a unit ("38%") is already terminated,
    so a digit after it begins the next value.

    A range operand on its own ("95%" from "90-95%") IS accepted: it is a real
    value the card states, just the bound rather than the span.
    """
    chars = [ch for ch in _squash(value) if not ch.isspace()]
    if not chars:
        return None

    parts = []
    for i, ch in enumerate(chars):
        # A hyphen between two numbers is a range and may be written as an en
        # dash. A hyphen that OPENS a number (at the start, or after < > \u2264 \u2265)
        # is a minus sign and must match a real minus only -- otherwise
        # "-1 year" would match the range in "newborn\u20131 year".
        is_sign = ch == '-' and (i == 0 or chars[i - 1] in '<>\u2264\u2265')
        if ch == '-' and not is_sign:
            parts.append('[-\u2013]')
        else:
            parts.append(re.escape(ch))
        if i + 1 < len(chars) and not (ch.isdigit() and chars[i + 1].isdigit()):
            parts.append(r'\s*')

    lead = ''
    if chars[0].isdigit() or chars[0] in '-.':
        lead = r'(?<!\d)(?<!\d\.)'
        if chars[0] != '-':
            lead += r'(?<!-)'      # never let a value shed a minus the card has
    if chars[0].isdigit():
        # A digit welded to a letter is part of a name ("o2%" is not "2%"),
        # except after q, which is dosing notation for "every".
        lead += r'(?<![a-pr-z])'
    trail = r'(?!\d)(?!\.\d)' if (chars[-1].isdigit() or chars[-1] == '.') else ''

    return re.compile(lead + ''.join(parts) + trail)


def _contains_value(card_text, value):
    """True when `value` occurs in already-squashed `card_text` as a whole value."""
    pattern = _value_pattern(value)
    return bool(pattern and pattern.search(card_text))


def check_question(q, cards):
    """Return a list of error strings for one question. Empty list = pass."""
    errors = []
    qid = q.get('id', '<no id>')

    card = cards.get(q.get('srcItem'))
    if card is None:
        return ['%s: unknown srcItem %r' % (qid, q.get('srcItem'))]

    card_text = _squash(card['text'])

    quote = q.get('srcQuote', '')
    # A quote is a whole sentence, not a value: plain containment is right
    # here. _contains_value forbids whitespace between digits so that '45'
    # cannot match '4 5', which is correct for one value and wrong for a
    # sentence like '9 18 9 9 18 18'.
    if not quote or _squash(quote) not in card_text:
        errors.append('%s: srcQuote not verbatim in %s' % (qid, q['srcItem']))

    choices = q.get('choices', [])
    if len(set(_squash(c) for c in choices)) != len(choices):
        errors.append('%s: duplicate choice text' % qid)

    try:
        answer = choices[q['correct']]
    except (IndexError, KeyError, TypeError):
        return errors + ['%s: correct index out of range' % qid]

    if not _contains_value(card_text, answer):
        errors.append('%s: answer value not found in %s (%r)' % (qid, q['srcItem'], answer))

    # A distractor drawn from the same sentence is not wrong, it is a second
    # true fact — that makes the question unanswerable.
    quote_values = {normalize_value(v) for v in VALUE_RE.findall(quote)}
    for i, choice in enumerate(choices):
        if i == q['correct']:
            continue
        if normalize_value(choice) in quote_values:
            errors.append('%s: distractor is also sourced from the quote (%r)' % (qid, choice))

    if q.get('srcCite') and q['srcCite'] != card['cite']:
        errors.append('%s: srcCite does not match the card (%r != %r)'
                      % (qid, q['srcCite'], card['cite']))

    return errors


def check_bank(bank, cards):
    errors = []
    seen = set()
    for q in bank:
        qid = q.get('id')
        if qid in seen:
            errors.append('duplicate question id %r' % qid)
        seen.add(qid)
        errors.extend(check_question(q, cards))
    return errors


def value_collisions(bank):
    """Questions in different phases that test the same value.

    Not fatal — the engine dedupes on valueKey at draw time — but a large
    number means the bank is padded rather than deep, so it is reported.
    """
    by_value = {}
    for q in bank:
        answer = q['choices'][q['correct']]
        key = '%s|%s' % (q.get('srcItem'), re.sub(r'\s+', '', answer.lower()))
        by_value.setdefault(key, []).append((q.get('phase'), q.get('id')))
    return {k: v for k, v in by_value.items()
            if len({phase for phase, _ in v}) > 1}


def coverage(bank, cards):
    """Which value-bearing items the bank actually reaches."""
    value_items = set()
    for key, card in cards.items():
        if VALUE_RE.search(card['text']):
            value_items.add(key)
    covered = {q['srcItem'] for q in bank if q.get('srcItem') in value_items}
    return {
        'value_items': sorted(value_items),
        'covered': sorted(covered),
        'missing': sorted(value_items - covered),
    }


def load_bank(paths):
    """Read question banks out of the browser content files via Node."""
    script = (
        'globalThis.window = globalThis;'
        'window.ALL_QUESTIONS = [];'
        + ''.join('require(%s);' % json.dumps(os.path.abspath(p)) for p in paths)
        + 'process.stdout.write(JSON.stringify(window.ALL_QUESTIONS));'
    )
    out = subprocess.run(['node', '-e', script], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('banks', nargs='+', help='content/*.js question bank files')
    parser.add_argument('--coverage-out', default=os.path.join(os.path.dirname(__file__), 'coverage.json'))
    args = parser.parse_args()

    cards = build_card_index()
    bank = [q for q in load_bank(args.banks) if q.get('course') == 'rcp2xx']
    errors = check_bank(bank, cards)

    collisions = value_collisions(bank)
    cov = coverage(bank, cards)
    with open(args.coverage_out, 'w', encoding='utf-8') as fh:
        json.dump(cov, fh, indent=1)

    print('bank: %d questions' % len(bank))
    print('coverage: %d/%d value-bearing items (%d missing)'
          % (len(cov['covered']), len(cov['value_items']), len(cov['missing'])))
    if cov['missing']:
        print('missing items written to %s' % args.coverage_out)
    if collisions:
        print('note: %d value(s) tested in more than one phase '
              '(engine dedupes these per run):' % len(collisions))
        for key, entries in sorted(collisions.items())[:10]:
            print('  %s -> %s' % (key, entries))

    if errors:
        print('\nFAILED — %d problem(s):' % len(errors))
        for e in errors:
            print('  ' + e)
        sys.exit(1)
    print('\nOK — every answer traced to its cited card.')


if __name__ == '__main__':
    main()
