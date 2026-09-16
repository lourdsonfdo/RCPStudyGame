"""Extract unit-bound numeric values from RCP Tier 3 study guide HTML.

Output feeds tools/values.json, the ONLY permitted source for VITALS TITAN
question content. Nothing here may be written from memory.
"""
import argparse
import html
import json
import os
import re

GUIDES = {
    '202': '/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 202/RCP_202_Tier3.html',
    '203': '/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 203/RCP_203_Tier3.html',
}

CARD_RE = re.compile(
    r'<article class="card(?: wide)?" id="(s(\d+)-\d+)">(.*?)</article>', re.S)
H3_RE = re.compile(r'<h3>(.*?)</h3>', re.S)
SRC_RE = re.compile(r'<div class="src">(.*?)</div>', re.S)

# Unit alternation is LONGEST-FIRST within each family, because Python's `|`
# takes the first branch that matches: with "mL" ahead of "mL/dL", the value
# "20 mL/dL" silently truncates to "20 mL" and the audit cannot see it, since
# the truncated unit is still adjacent to the number.
#
# The 202 guide writes the subscript as Unicode U+2082 (cm H2O) and the 203
# guide writes ASCII, so both forms appear here and normalize_value folds them.
UNITS = (
    # compound pressure / compliance / resistance
    r"(?:cm\s?H[2₂]O/L/s(?:ec)?|mL/cm\s?H[2₂]O|L/cm\s?H[2₂]O|"
    r"cm\s?H[2₂]O|cmH[2₂]O|"
    # pressure
    r"mm\s?Hg|mmHg|torr|kPa|psig|psi|atm|bar\b|"
    # volume / flow
    r"mL/kg/min|mL/beat|mL/kg|mL/dL|mL/min|mL|L/min|L/sec|L/s\b|LPM|cc\b|L\b|"
    # dose / concentration
    r"mg/kg|mg/dL|mg|mcg|µg|μg|ng/mL|pg/mL|g/dL|g\b|"
    r"mEq/L|mEq|mmol/L|mmol|mOsm|ppm|kcal|"
    # rate
    r"beats?/min|breaths?/min|bpm|/min|"
    # time
    r"sec(?:onds)?|min(?:utes)?|hours?|hrs?|h\b|days?|weeks?|wk\b|"
    r"months?|mo\b|years?|yr\b|"
    # size / misc
    r"µm|μm|micron(?:s)?|Fr\b|French|ft\b|feet|foot|inch(?:es)?|"
    r"°C|°F|%|joules?|J\b|Hz|dB)"
)

# A leading sign is part of the value, not decoration. NIF/MIP normals are
# NEGATIVE pressures (−60 cm H2O); dropping the sign would turn a correct card
# into a question with a wrong answer, which is the exact failure this whole
# pipeline exists to prevent.
# The lookbehind matters: in "¼–2 L/min" the dash is a RANGE separator whose
# left operand (a vulgar fraction) this pattern cannot match. Without it the
# dash is read as a minus and the upper bound becomes "-2 L/min", which is not
# a real flow. A sign never directly follows a digit or a fraction.
SIGN = r"(?<![\d¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])[−–\-]?"
# Comma grouping must be part of the number, not a place to split it. Without
# this, "1,000 ft" extracts as "000 ft" and "9,000 mL/min" as "000 mL/min" --
# values that are simply wrong. 18 comma-grouped numbers appear in the guides.
NUM = r"(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)"
RANGE = r"%s%s(?:\s*(?:[–—\-]|to)\s*%s%s)?" % (SIGN, NUM, SIGN, NUM)

# Either a comparison (unit optional — ">20% TBSA", "< −40") or a plain value
# that MUST carry a unit (so "5 levels" is not mistaken for a value).
VALUE_RE = re.compile(
    r"(?:[<>≤≥]\s*%s(?:\s*%s)?|%s\s*%s)" % (RANGE, UNITS, RANGE, UNITS), re.I)

# Numbers that belong to a citation, not to a fact.
CITE_RE = re.compile(
    r'\b(?:slides?|chapters?|chp|ch\.|lssn|lesson|tables?|figures?|items?|pages?|p\.)'
    r'\s*\d+(?:\s*[-–,]\s*\d+)*', re.I)

SENT_SPLIT_RE = re.compile(r'(?<=[.;:!?])\s+(?=[A-Z(“"•\d])')


def strip_tags(fragment):
    """HTML fragment -> plain text with entities resolved and space collapsed."""
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', fragment))).strip()


def normalize_value(raw):
    """Canonical form: lowercase, no spaces, ASCII hyphen, ASCII subscript.

    Folds U+2212 MINUS, en/em dashes and the Unicode subscript two so that the
    202 guide's "−60 cm H₂O" and the 203 guide's "-60 cmH2O" produce the same
    key. Range separators and negative signs both normalise to "-"; that is
    fine for a comparison key.
    """
    return (raw.lower()
               .replace(' ', '')
               .replace('−', '-')
               .replace('—', '-')
               .replace('–', '-')
               .replace('₂', '2'))


def sentences(text):
    return [s.strip() for s in SENT_SPLIT_RE.split(text) if s.strip()]


def extract_file(path, course):
    """Return a list of value records for one Tier 3 guide."""
    with open(path, encoding='utf-8') as fh:
        doc = fh.read()

    records = []
    for match in CARD_RE.finditer(doc):
        item_id, section, inner = match.group(1), match.group(2), match.group(3)

        title_match = H3_RE.search(inner)
        title = strip_tags(title_match.group(1)) if title_match else ''
        title = re.sub(r'^\d+\s*', '', title)

        src_match = SRC_RE.search(inner)
        cite = strip_tags(src_match.group(1)) if src_match else ''
        cite = re.sub(r'^Source\s*', '', cite)

        # The source line is provenance, not content.
        body = SRC_RE.sub(' ', inner)
        text = strip_tags(body)

        seq = 0
        for sentence in sentences(text):
            testable = CITE_RE.sub(' ', sentence)
            found = VALUE_RE.findall(testable)
            if not found:
                continue
            values = sorted({normalize_value(v) for v in found})
            seq += 1
            records.append({
                'key': '%s:%s#%d' % (course, item_id, seq),
                'course': course,
                'item': item_id,
                'item_title': title,
                'section': section,
                'quote': sentence,
                'values': values,
                'cite': cite,
            })
    return records


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', default=os.path.join(os.path.dirname(__file__), 'values.json'))
    args = parser.parse_args()

    payload = {'guides': GUIDES, 'records': []}
    for course, path in sorted(GUIDES.items()):
        recs = extract_file(path, course)
        payload['records'].extend(recs)
        items = len({r['item'] for r in recs})
        print('RCP %s: %d records across %d value-bearing items' % (course, len(recs), items))

    with open(args.out, 'w', encoding='utf-8') as fh:
        json.dump(payload, fh, indent=1, ensure_ascii=False)
    print('wrote %s (%d records)' % (args.out, len(payload['records'])))


if __name__ == '__main__':
    main()
