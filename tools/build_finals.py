#!/usr/bin/env python3
"""Build the Final-exam and TMC board courses from the Recall app's question banks.

Sources (snapshots live in tools/finals/, refreshed with --sync from ~/recall):
  bank202f.json = ~/recall/drills/rcp202-final.json  (RCP 202 Final, 18 guide sections)
  bank203f.json = ~/recall/drills/rcp203-final.json  (RCP 203 Final, 7 themed sections)
  banktmc.json  = window.__BANK__.questions/chapters from ~/recall/guides/tmc-trainer.html
                  (420 TMC questions, 17 NBRC chapters)

Outputs:
  content/rcp202-final.js  course rcp202f
  content/rcp203-final.js  course rcp203f
  content/tmc-boards.js    course rcptmc

Every section becomes one boss. The correct answer is always choice 0 in the
sources; the game shuffles choices at render time, so `correct` stays 0.
Question text is copied verbatim: nothing is reworded here.

Usage:
  python3 tools/build_finals.py          # rebuild from the snapshots
  python3 tools/build_finals.py --sync   # re-copy the snapshots from ~/recall first
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANKS = os.path.join(ROOT, 'tools', 'finals')
RECALL = os.path.expanduser('~/recall')

# (boss name, emoji) per section id. A section missing here fails the build.
BOSSES = {
    '202f': {
        's01': ('The Weaning Warden', '🎚️'),
        's02': ('Frost Regent', '❄️'),
        's03': ('The Echo Envoy', '🗣️'),
        's04': ('Ember Tyrant', '🔥'),
        's05': ('The Circuit Lich', '🩸'),
        's06': ('Filtrate Baron', '🫘'),
        's07': ('The Feeding Hydra', '🍽️'),
        's08': ('Stairclimb Sentinel', '🚶'),
        's09': ('The Flail Juggernaut', '💥'),
        's10': ('Scope Stalker', '🔬'),
        's11': ('The Graft Guardian', '🫁'),
        's12': ('Atlas of Airways', '🗺️'),
        's13': ('Code Blue Reaper', '💔'),
        's14': ('The Ventilator Overlord', '⚙️'),
        's15': ('High-Flow Harpy', '😷'),
        's16': ('Consolidation King', '🦠'),
        's17': ('The Whiteout Wraith', '🌫️'),
        's18': ('The Apothecary Asp', '💊'),
    },
    '203f': {
        'g01': ('The Auscultation Oracle', '🩺'),
        'g02': ('The Dose Alchemist', '🧮'),
        'g03': ('Loop Leviathan', '🔁'),
        'g04': ('The Airway Architect', '🧰'),
        'g05': ('Heliox Phoenix', '🎈'),
        'g06': ('The Wedge Sphinx', '📈'),
        'g07': ('Apnea Nightmare', '🌙'),
    },
    'tmc': {
        'c01': ('The Chart Keeper', '📂'),
        'c02': ('The Bedside Inquisitor', '👁️'),
        'c03': ('The Probe Master', '🧪'),
        'c04': ('The Results Judge', '⚖️'),
        'c05': ('The Order Oracle', '🔮'),
        'c06': ('Gremlin of the Gear', '🔧'),
        'c07': ('The Sterile Sentinel', '🧼'),
        'c09': ('The Patency Guardian', '🚪'),
        'c10': ('The Mucus Marauder', '💨'),
        'c11': ('The Gas Exchange General', '🫁'),
        'c12': ('The Nebula Chemist', '💊'),
        'c13': ('The Plan Shifter', '📝'),
        'c14': ('The Protocol Sage', '📚'),
        'c15': ('The Crisis Courier', '🚑'),
        'c16': ('The Right Hand', '🤝'),
    },
}

# TMC chapters too small to carry a boss on their own are merged into a neighbor
# from the same NBRC area: {chapter: (boss section id, title used when merged)}.
TMC_MERGE = {
    7: ('c07', 'Infection Prevention and Quality Control'),
    8: ('c07', 'Infection Prevention and Quality Control'),
    16: ('c16', 'Assist the Provider; Patient and Family Education'),
    17: ('c16', 'Assist the Provider; Patient and Family Education'),
}

COURSES = {
    '202f': {'cid': 'rcp202f', 'prefix': 'f202', 'out': 'rcp202-final.js', 'label': 'RCP 202 FINAL'},
    '203f': {'cid': 'rcp203f', 'prefix': 'f203', 'out': 'rcp203-final.js', 'label': 'RCP 203 FINAL'},
    'tmc': {'cid': 'rcptmc', 'prefix': 'tmc', 'out': 'tmc-boards.js', 'label': 'TMC BOARD PREP'},
}


def tmc_bank_from_recall():
    """Recall's guides/tmc-trainer.html. Since 2026-11-17 it is the 2027 RTE trainer, whose bank is a
    <script id="bank" type="application/json"> block; the game keeps the 420 book-sourced breadth items
    (origin "heuer", each still tagged with its Heuer chapter). The older 2020 page used window.__BANK__."""
    html = open(os.path.join(RECALL, 'guides', 'tmc-trainer.html'), encoding='utf-8').read()
    if 'window.__BANK__ = ' in html:
        start = html.index('window.__BANK__ = ') + len('window.__BANK__ = ')
        data, _ = json.JSONDecoder().raw_decode(html[start:])
        return {'chapters': data['chapters'], 'questions': data['questions']}
    m = re.search(r'<script id="bank" type="application/json">(.*?)</script>', html, re.S)
    if not m:
        sys.exit('tmc-trainer.html: no question bank found')
    data = json.loads(m.group(1))
    qs = [{'ch': int(q['id'][1:3]), 'sec': q['sec'], 'lvl': q.get('lvl27', ''), 'topic': q['topic'],
           'stem': q['stem'], 'opts': q['opts'], 'key': q['key'], 'why': q['why'], 'id': q['id']}
          for q in data['breadth'] if q.get('origin') == 'heuer']   # ids are C<chapter>-Q<n>; sec is the 2027 RTE section
    if len(qs) != 420:
        sys.exit(f'tmc-trainer.html: expected 420 book-sourced breadth items, found {len(qs)}')
    chapters = json.load(open(os.path.join(BANKS, 'tmc-chapters.json'), encoding='utf-8'))
    return {'chapters': chapters, 'questions': qs}


def sync():
    os.makedirs(BANKS, exist_ok=True)
    for key, name in (('202f', 'rcp202-final.json'), ('203f', 'rcp203-final.json')):
        drill = json.load(open(os.path.join(RECALL, 'drills', name), encoding='utf-8'))
        dump(os.path.join(BANKS, f'bank{key}.json'), drill['sections'])
    dump(os.path.join(BANKS, 'banktmc.json'), tmc_bank_from_recall())


def dump(path, obj):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write('\n')


def load_sections(key):
    """Return [{'id', 'title', 'q': [{'q', 'o', 'e', 'src'}]}] for a course."""
    path = os.path.join(BANKS, f'bank{key}.json')
    raw = json.load(open(path, encoding='utf-8'))
    if key != 'tmc':
        return [{'id': s['id'], 'title': s['title'], 'q': s['q']} for s in raw]
    sections, order = {}, []
    for ch in raw['chapters']:
        sid, title = TMC_MERGE.get(ch['ch'], (f"c{ch['ch']:02d}", ch['title']))
        if sid not in sections:
            sections[sid] = {'id': sid, 'title': title, 'q': []}
            order.append(sid)
    chapter_section = {ch['ch']: TMC_MERGE.get(ch['ch'], (f"c{ch['ch']:02d}",))[0] for ch in raw['chapters']}
    for q in raw['questions']:
        if q['key'] != 0:
            sys.exit(f"tmc {q['id']}: key is {q['key']}, expected the correct answer first")
        sections[chapter_section[q['ch']]]['q'].append({
            'q': q['stem'], 'o': q['opts'], 'e': q['why'],
            'src': f"NBRC {q['sec']} · {q['topic']} · {q['id']}",
        })
    return [sections[sid] for sid in order]


TAG = re.compile(r'<[A-Za-z/!]')  # question screens insert text as HTML


def check(key, sections):
    errors = []
    for sec in sections:
        seen = set()
        if sec['id'] not in BOSSES[key]:
            errors.append(f"{key} {sec['id']}: no boss name defined")
        if len(sec['q']) < 10:
            errors.append(f"{key} {sec['id']}: only {len(sec['q'])} questions")
        for i, q in enumerate(sec['q'], 1):
            where = f"{key} {sec['id']} q{i}"
            if len(q['o']) != 4 or len(set(q['o'])) != 4:
                errors.append(f"{where}: needs 4 distinct options")
            if not q['q'].strip() or not q['e'].strip():
                errors.append(f"{where}: empty stem or explanation")
            if q['q'] in seen:
                errors.append(f"{where}: duplicate stem")
            seen.add(q['q'])
            for text in [q['q'], q['e']] + q['o']:
                if TAG.search(text):
                    errors.append(f"{where}: text would be read as an HTML tag: {text[:60]}")
    for sid in BOSSES[key]:
        if sid not in {s['id'] for s in sections}:
            errors.append(f"{key} {sid}: boss defined but the bank has no such section")
    return errors


def build(key):
    info = COURSES[key]
    sections = load_sections(key)
    errors = check(key, sections)
    if errors:
        sys.exit('\n'.join(errors))
    cid, prefix = info['cid'], info['prefix']
    bosses, questions = [], []
    for sec in sections:
        topic = f"{prefix}-{sec['id']}"
        name, emoji = BOSSES[key][sec['id']]
        bosses.append({
            'id': topic, 'name': name, 'emoji': emoji, 'course': cid,
            'description': sec['title'], 'sectionTitle': sec['title'],
            'hp': 100, 'unlockedByDefault': True, 'questionTopics': [topic],
        })
        for i, q in enumerate(sec['q'], 1):
            questions.append({
                'id': f'q-{topic}-{i:03d}', 'topic': topic, 'course': cid,
                'pool': 'both', 'difficulty': 2,
                'q': q['q'], 'choices': q['o'], 'correct': 0,
                'explanation': q['e'], 'srcItem': q.get('src', ''),
            })
    rows = lambda items: ',\n'.join('    ' + json.dumps(x, ensure_ascii=False) for x in items)
    js = f"""/* ============================================================
   {info['label']} — {len(bosses)} section bosses, {len(questions)} questions
   GENERATED by tools/build_finals.py from tools/finals/bank{key}.json
   (a snapshot of the Recall app's bank). Do not hand-edit: re-run the builder.
   ============================================================ */
(function () {{
  const bosses = [
{rows(bosses)}
  ];
  const questions = [
{rows(questions)}
  ];
  window.ALL_BOSSES = (window.ALL_BOSSES || []).filter(b => b.course !== '{cid}').concat(bosses);
  window.ALL_QUESTIONS = (window.ALL_QUESTIONS || []).filter(q => q.course !== '{cid}').concat(questions);
}})();
"""
    with open(os.path.join(ROOT, 'content', info['out']), 'w', encoding='utf-8') as f:
        f.write(js)
    return len(bosses), len(questions)


if __name__ == '__main__':
    if '--sync' in sys.argv:
        sync()
    for key in COURSES:
        bosses, questions = build(key)
        print(f"{COURSES[key]['cid']}: {bosses} bosses, {questions} questions")
