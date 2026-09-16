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


def _squash(text):
    """Comparison form: entity-free, lowercase, whitespace- and dash-normalised.

    Must fold the same characters extract_values.normalize_value folds — the
    202 guide's Unicode subscript two (cm H₂O) and the 203 guide's ASCII
    cmH2O are the same value, and a question naturally authored in ASCII
    must still match a card written with the subscript.
    """
    t = html.unescape(text).lower()
    t = t.replace('—', '-').replace('–', '-').replace('−', '-')
    t = t.replace('₂', '2')
    return re.sub(r'\s+', '', t)


def _contains_value(card_text, value):
    """Substring containment with numeric boundaries.

    Plain `in` is not safe here. Once whitespace is squashed, "5l/min" sits
    inside "45l/min", "60cmh2o" sits inside "-60cmh2o", and "0cmh2o" sits
    inside both. All three are wrong answers that a naive check waves through
    — the precise failure this gate exists to prevent.

    A match counts only when it is not glued to an adjacent digit, is not the
    tail of a decimal, and does not silently drop a leading minus the card has.
    """
    needle = _squash(value)
    if not needle:
        return False

    start = 0
    while True:
        i = card_text.find(needle, start)
        if i == -1:
            return False
        end = i + len(needle)
        before = card_text[i - 1] if i > 0 else ''
        before2 = card_text[i - 2] if i > 1 else ''
        after = card_text[end] if end < len(card_text) else ''
        after2 = card_text[end + 1] if end + 1 < len(card_text) else ''

        lead_ok = not (before.isdigit()
                       or (before == '.' and before2.isdigit())
                       or (before == '-' and not needle.startswith('-')))
        trail_ok = not (after.isdigit() or (after == '.' and after2.isdigit()))
        if lead_ok and trail_ok:
            return True
        start = i + 1


def check_question(q, cards):
    """Return a list of error strings for one question. Empty list = pass."""
    errors = []
    qid = q.get('id', '<no id>')

    card = cards.get(q.get('srcItem'))
    if card is None:
        return ['%s: unknown srcItem %r' % (qid, q.get('srcItem'))]

    card_text = _squash(card['text'])

    quote = q.get('srcQuote', '')
    if not quote or not _contains_value(card_text, quote):
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
