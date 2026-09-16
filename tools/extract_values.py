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

UNITS = (r"(?:mm\s?Hg|cm\s?H2O|cmH2O|mL/kg|mL|L/min|LPM|mg/kg|mg|mcg|g/dL|"
         r"mEq/L|mmol/L|kPa|%|°C|°F|Fr\b|psig|psi|kg|lb|sec(?:onds)?|"
         r"min(?:utes)?|hours?|hrs?|days?|weeks?|beats?/min|breaths?/min|bpm|"
         r"/min|joules?|Hz)")
NUM = r"\d+(?:\.\d+)?"
VALUE_RE = re.compile(
    r"(?:[<>≤≥]\s*%s|%s\s*(?:[–\-]\s*%s\s*)?%s)" % (NUM, NUM, NUM, UNITS), re.I)

# Numbers that belong to a citation, not to a fact.
CITE_RE = re.compile(
    r'\b(?:slides?|chapters?|chp|ch\.|lssn|lesson|tables?|figures?|items?|pages?|p\.)'
    r'\s*\d+(?:\s*[-–,]\s*\d+)*', re.I)

SENT_SPLIT_RE = re.compile(r'(?<=[.;:!?])\s+(?=[A-Z(“"•\d])')


def strip_tags(fragment):
    """HTML fragment -> plain text with entities resolved and space collapsed."""
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', fragment))).strip()


def normalize_value(raw):
    """Canonical form for comparison: lowercase, no spaces, ASCII hyphen."""
    return (raw.lower()
               .replace(' ', '')
               .replace('—', '-')
               .replace('–', '-'))


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
