#!/usr/bin/env python3
"""Build content/rcp20X-midterm.js from the midterm drill banks in tools/midterm/.

bank20X.json = the Recall app's midterm drill (~/recall/drills/rcp20X.json, `sections`).
gaps20X.json (optional) = extra questions for Recall flashcard facts the drill misses,
  [{"section": "s05", "q", "o", "e", "src": "card:<id>"}], appended to that section.
fixes20X.json (optional) = {"<stem>": [correct, d1, d2, d3]} replacement options that even out
  option lengths (see tools/option_balance.py). o[0] stays the correct answer.

Each bank is a list of study-guide sections:
  [{"id": "s01", "title": ..., "covers": ..., "q": [{"q", "o", "e", "src"}]}]
with o[0] always the correct answer. Every section becomes one boss; the
game shuffles choices at render time, so `correct` stays 0.

Usage: python3 tools/build_midterm.py   (rebuilds all courses whose bank exists)
"""
import json
import os
import random
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


def load_scenarios(course, bank):
    """Patient Crisis cases from tools/midterm/scenarios20X.json, in the engine's shape.

    Each decision's best option must cite (`src`) the exact stem of a bank question that
    states the same fact, so every "right answer" traces back to the verified study guide.
    Decision ids and `next` links are generated here: options lead to the next decision,
    and the last decision's options end the case.
    """
    path = os.path.join(BANKS, f'scenarios{course}.json')
    if not os.path.exists(path):
        return []
    stems = {q['q'] for sec in bank for q in sec['q']}
    errors, out = [], []
    for sc in json.load(open(path, encoding='utf-8')):
        where = f"{course} scenario {sc['id']}"
        for text in [sc['title'], sc['intro']] + [d['prompt'] for d in sc['decisions']] + \
                [f"{o['text']} {o['explain']}" for d in sc['decisions'] for o in d['options']]:
            if '<' in text or '>' in text:
                errors.append(f'{where}: raw < or > (the crisis screen renders HTML): {text[:60]}')
        decisions = []
        # The crisis screen shows options in order. Spread the best answer evenly over
        # positions A/B/C within each case, in a seeded order that is stable across builds.
        rng = random.Random(sc['id'])
        offset = rng.randrange(3)  # so leftover slots in 4- or 5-decision cases don't always favor A and B
        slots = [(k + offset) % 3 for k in range(len(sc['decisions']))]
        rng.shuffle(slots)
        for i, d in enumerate(sc['decisions'], 1):
            best = max(o['hpDelta'] for o in d['options'])
            winners = [o for o in d['options'] if o['hpDelta'] == best]
            if len(d['options']) != 3 or len(winners) != 1 or best <= 0:
                errors.append(f'{where} d{i}: needs 3 options and one clearly best (positive) choice')
            for o in winners:
                if o.get('src') not in stems:
                    errors.append(f"{where} d{i}: best option cites a stem not in bank{course}: {o.get('src')!r}")
            nxt = f'd{i + 1}' if i < len(sc['decisions']) else None
            options = [o for o in d['options'] if o['hpDelta'] != best]
            rng.shuffle(options)
            options.insert(slots[i - 1], winners[0])
            decisions.append({'id': f'd{i}', 'prompt': d['prompt'], 'options': [
                {'text': o['text'], 'hpDelta': o['hpDelta'], 'explain': o['explain'], 'next': nxt}
                for o in options]})
        out.append({'id': sc['id'], 'title': sc['title'], 'course': f'rcp{course}', 'intro': sc['intro'],
                    'vitals': sc['vitals'], 'startingHp': sc.get('startingHp', 60), 'decisions': decisions})
    if errors:
        sys.exit('\n'.join(errors))
    return out


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
    # Rewritten options (keyed by stem) that even out lengths so the longest option isn't a giveaway
    fixes_path = os.path.join(BANKS, f'fixes{course}.json')
    if os.path.exists(fixes_path):
        fixes = json.load(open(fixes_path, encoding='utf-8'))
        stems = {q['q'] for sec in bank for q in sec['q']}
        unknown = [s for s in fixes if s not in stems]
        if unknown:
            sys.exit(f'{course} fixes for unknown stems: {unknown[:3]}')
        for sec in bank:
            for q in sec['q']:
                if q['q'] in fixes:
                    q['o'] = fixes[q['q']]
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

    scenarios = load_scenarios(course, bank)

    rows = lambda items: ',\n'.join('    ' + json.dumps(x, ensure_ascii=False) for x in items)
    js = f"""/* ============================================================
   RCP {course} MIDTERM — {len(bosses)} section bosses, {len(questions)} questions, {len(scenarios)} crisis scenarios
   GENERATED by tools/build_midterm.py from tools/midterm/bank{course}.json (+ gaps, fixes, scenarios).
   Do not hand-edit: edit the bank and re-run the builder.
   ============================================================ */
(function () {{
  const bosses = [
{rows(bosses)}
  ];
  const questions = [
{rows(questions)}
  ];
  const scenarios = [
{rows(scenarios)}
  ];
  window.ALL_BOSSES = (window.ALL_BOSSES || []).filter(b => b.course !== '{cid}').concat(bosses);
  window.ALL_QUESTIONS = (window.ALL_QUESTIONS || []).filter(q => q.course !== '{cid}').concat(questions);
  window.ALL_SCENARIOS = (window.ALL_SCENARIOS || []).filter(s => s.course !== '{cid}').concat(scenarios);
}})();
"""
    out = os.path.join(ROOT, 'content', f'{cid}-midterm.js')
    open(out, 'w', encoding='utf-8').write(js)
    return len(bosses), len(questions), len(scenarios)


if __name__ == '__main__':
    for course in BOSSES:
        result = build(course)
        print(f'rcp{course}:', 'no bank yet' if result is None
              else f'{result[0]} bosses, {result[1]} questions, {result[2]} scenarios')
