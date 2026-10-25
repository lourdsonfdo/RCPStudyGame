#!/usr/bin/env python3
"""Build content/rcp20X-midterm.js from the midterm drill banks in tools/midterm/.

bank20X.json = the Recall app's midterm drill (~/recall/drills/rcp20X.json, `sections`).
gaps20X.json (optional) = extra questions for Recall flashcard facts the drill misses,
  [{"section": "s05", "q", "o", "e", "src": "card:<id>"}], appended to that section.

Each bank is a list of study-guide sections:
  [{"id": "s01", "title": ..., "covers": ..., "q": [{"q", "o", "e", "src"}]}]
with o[0] always the correct answer. Every section becomes one boss; the
game shuffles choices at render time, so `correct` stays 0.

Usage: python3 tools/build_midterm.py   (rebuilds all courses whose bank exists)
"""
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BANKS = os.path.join(ROOT, 'tools', 'midterm')

# (name, emoji) per section id. A section missing here fails the build.
BOSSES = {
    '201': {
        's01': ('The Alveolar Seed', '🌱'),
        's02': ('Ductus Phantom', '🫀'),
        's03': ('The Contraction Colossus', '⏱️'),
        's04': ('First Breath Warden', '👶'),
        's05': ('The APGAR Arbiter', '📋'),
        's06': ('Cold Stress Wraith', '🌡️'),
        's07': ('The Surfactant Starver', '🫧'),
        's08': ('The Persistent Shadow', '🦠'),
        's09': ('Code Pink Tyrant', '🚨'),
        's10': ('The Croup Crow', '🐦'),
    },
    '202': {
        's01': ('The Silent Treatment', '🗣️'),
        's02': ('Inferno Lung', '🔥'),
        's03': ('The Oxygenator', '🩸'),
        's04': ('Treadmill Titan', '🚶'),
        's05': ('Nephron Knight', '🫘'),
        's06': ('The Mode Shifter', '⚙️'),
        's07': ('Mask of Pressure', '😷'),
        's08': ('The Acid Oracle', '🧪'),
        's09': ('Wheeze Wyrm', '🐉'),
        's10': ('The Barrel Brute', '🛢️'),
        's11': ('The Cuff Keeper', '🩺'),
        's12': ('The Twin Gases', '♊'),
        's14': ('The Distractor', '🃏'),
    },
    '203': {
        's01': ('Lord of Contagion', '🧫'),
        's02': ('Cylinder Golem', '🛢️'),
        's03': ('Aerosol Djinn', '🌬️'),
        's04': ('Calibration Clockwork', '⚙️'),
        's05': ('Ventilator Leviathan', '🫁'),
        's06': ('The Tube Serpent', '🐍'),
        's07': ('Rhythm Revenant', '📈'),
        's08': ('The Shunt Sorcerer', '📊'),
        's09': ('Waveform Warden', '〰️'),
        's10': ('Pocket Airway Imp', '🧸'),
        's12': ('The Word Trickster', '🃏'),
    },
}


def check(course, bank):
    errors = []
    for sec in bank:
        seen = set()  # a fact may repeat across sections, never within one
        if sec['id'] not in BOSSES[course]:
            errors.append(f"{course} {sec['id']}: no boss name defined")
        if len(sec['q']) < 10:
            errors.append(f"{course} {sec['id']}: only {len(sec['q'])} questions (battle needs 10)")
        for i, q in enumerate(sec['q'], 1):
            where = f"{course} {sec['id']} q{i}"
            if len(q['o']) != 4 or len(set(q['o'])) != 4:
                errors.append(f"{where}: needs 4 distinct options")
            if not q['q'].strip() or not q['e'].strip():
                errors.append(f"{where}: empty stem or explanation")
            if q['q'] in seen:
                errors.append(f"{where}: duplicate stem")
            seen.add(q['q'])
    return errors


def build(course):
    path = os.path.join(BANKS, f'bank{course}.json')
    if not os.path.exists(path):
        return None
    bank = json.load(open(path, encoding='utf-8'))
    # Codex-written questions for flashcard facts the drill didn't test (verified before merge)
    gaps_path = os.path.join(BANKS, f'gaps{course}.json')
    if os.path.exists(gaps_path):
        sections = {sec['id']: sec for sec in bank}
        for g in json.load(open(gaps_path, encoding='utf-8')):
            if g['section'] not in sections:
                sys.exit(f"{course} gap {g['q'][:60]!r}: unknown section {g['section']}")
            sections[g['section']]['q'].append(g)
    errors = check(course, bank)
    if errors:
        sys.exit('\n'.join(errors))

    cid = 'rcp' + course
    bosses, questions = [], []
    for sec in bank:
        topic = f"m{course}-{sec['id']}"
        name, emoji = BOSSES[course][sec['id']]
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
   RCP {course} MIDTERM — {len(bosses)} section bosses, {len(questions)} questions
   GENERATED by tools/build_midterm.py from tools/midterm/bank{course}.json.
   Do not hand-edit: edit the bank and re-run the builder.
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
    out = os.path.join(ROOT, 'content', f'{cid}-midterm.js')
    open(out, 'w', encoding='utf-8').write(js)
    return len(bosses), len(questions)


if __name__ == '__main__':
    for course in BOSSES:
        result = build(course)
        print(f'rcp{course}:', 'no bank yet' if result is None else f'{result[0]} bosses, {result[1]} questions')
