# RCP Study Game — Design Spec

**Date:** 2026-05-18
**Author:** Lourd + Claude
**Status:** Approved for planning

---

## 1. Purpose

A mobile-web study game to help Lourd prepare for the RCP 103 (Pulmonary Disease & Pathophysiology) and RCP 104 (Respiratory Pharmacology) final exams. The game must be **fun and addictive**, **visually engaging in an 8-bit style**, and provide two distinct gameplay modes accessible for either course.

Source content lives in Lourd's Obsidian "Study Brain" vault at `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/`.

---

## 2. Platform & Tech Stack

- **Platform:** Mobile web (mobile-first responsive). Works in Safari/Chrome on phone; also playable on desktop.
- **Stack:** Vanilla HTML + CSS + JavaScript. No build tools, no framework, no server.
- **Distribution:** Open `index.html` directly, or self-host with `python3 -m http.server`. Fully offline-capable after first load (fonts cached).
- **Persistence:** `localStorage` for all game state.
- **Visual style:** 8-bit retro — `Press Start 2P` font (Google Fonts), dark navy palette, neon HP bars, emoji-as-sprites with CSS glow filters, CSS keyframe animations.

---

## 3. Game Modes

Both modes are available for both courses (4 total combos).

### 3.1 Boss Battle Mode

Each topic = a themed "boss" with HP. The player has HP too. Questions are dealt as combat — correct answers damage the boss, wrong answers damage the player.

**Battle screen:**
- Player HP bar (green) — starts at 80 (+1 per level, cap 90)
- Boss HP bar (red) — 100
- Boss sprite (emoji + glow + bob animation) and name
- Question panel (multiple choice, 4 options, single correct)
- Inventory icons (up to 3 equipped items)
- Timer (optional, 30s per question — fails as "wrong" if expired)

**Combat math:**
- Correct answer → boss takes 10 HP (+ crit on streak of 3+, deals 15)
- Wrong answer → player takes 15 HP
- Shield Rune absorbs one wrong-answer hit
- Revive Charm auto-triggers if player HP reaches 0 (sets HP to 1, charm consumed)

**Win condition:** Boss HP = 0 before player HP = 0.
**Loss condition:** Player HP = 0 with no Revive Charm.

### 3.2 Patient Crisis Mode

Story-driven branching clinical scenarios. The player is an RT making interventions for a patient in distress.

**Structure per scenario:**
- Intro screen: chief complaint + vitals
- Patient HP bar (shown instead of player HP), starts at 60
- 3–5 decision points, each presenting 3 options
- Each choice modifies Patient HP by ±5 to ±25 based on clinical correctness
- Decisions can branch (some choices lead to different subsequent decisions)

**Outcomes:**
- Patient HP > 50 at the end → **Stabilized** → +100 XP, +50 gold
- Patient HP 1–50 → **Survived but rocky** → +50 XP
- Patient HP = 0 → **Coded** → +10 XP (consolation, still learn)

---

## 4. Pre-Battle Prep Camp

Before entering a boss fight, the player visits the Prep Camp:

- **🏋️ Train** — answer flashcard questions from the boss's topic. Each correct answer: +5 XP, +10 gold. No HP risk. Can practice indefinitely.
- **🪙 Shop** — spend gold on items
- **🎒 Equip** — choose up to 3 items to bring into the fight
- **⚔️ Enter Boss Fight** — start the battle

### Shop inventory

| Item | Effect | Price |
|------|--------|-------|
| 🧪 Health Potion | Restore 25 HP (used during battle, takes a turn) | 50g |
| 🔮 Hint Scroll | Remove 2 wrong answers (50/50) on one question | 75g |
| 🛡️ Shield Rune | Absorb 1 wrong-answer hit (no HP loss) | 100g |
| 💖 Revive Charm | Auto-revive once at 1 HP if player would die | 200g |
| ⚡ Double XP Tome | 2× XP earned in next fight | 150g |

Items persist in inventory across sessions until used.

---

## 5. Progression System

### 5.1 XP & Levels

| Lvl | Title | XP needed (total) | Max HP |
|----|-------|---|---|
| 1 | Student RT | 0 | 80 |
| 2 | New Grad | 250 | 81 |
| 3 | Intern RT | 600 | 82 |
| 4 | Staff RT I | 1,100 | 83 |
| 5 | Staff RT II | 1,800 | 84 |
| 6 | Senior RT | 2,800 | 85 |
| 7 | Charge RT | 4,200 | 86 |
| 8 | Lead Clinician | 6,000 | 87 |
| 9 | RT Educator | 8,500 | 88 |
| 10 | RT Director 👑 | 12,000 | 90 |

Level-up triggers a fanfare screen (pixel confetti + sound stub).

### 5.2 XP rewards

- Training correct: +5 XP
- Boss-battle correct: +10 XP
- Boss defeated: +50 XP bonus
- Patient stabilized: +100 XP
- Daily challenge complete: +75 XP bonus
- Streak bonus: +5 XP × streak day (capped at +50)

### 5.3 Gold rewards

- Training correct: +10g
- Boss-battle correct: +5g
- Boss defeated: +100g
- Daily challenge complete: +50g

### 5.4 Boss unlock progression

- First 3 bosses per course unlocked from the start
- Each subsequent boss unlocks after defeating any prior boss (any course)
- Encourages spreading study across topics rather than cramming one

### 5.5 Daily Challenge

- Once per calendar day (resets at local midnight)
- Random course + random boss + 10 questions
- **No items allowed** — pure skill
- Reward: +75 XP, +50 gold, streak +1
- Miss a day → streak resets to 0
- At 7-day streak: earn a one-time-per-week "streak shield" that auto-protects against one skipped day

---

## 6. Boss Roster

### 6.1 RCP 103 — Disease & Pathophysiology (10 bosses)

| Boss | Theme | Source topic |
|------|-------|--------------|
| 🌫️ The Blue Bloater | COPD | Chronic bronchitis, emphysema, GOLD stages, cor pulmonale |
| 💨 The Hyperresponsive | Asthma | Zones, triggers, biphasic response, severity grades |
| 🩸 The Acid-Base Specter | ABGs | Interpretation, anion gap, compensation, MUDPILES |
| 🫁 Tension Wraith | Pleural disorders | PTX, effusion, flail chest, chest tubes |
| 🦠 The Consolidation King | Pneumonia/TB | CAP/HAP/VAP, TB, fungal lung disease |
| 💧 Hyaline Hydra | ARDS | Berlin criteria, P/F ratio, lung-protective vent |
| 🪨 The Honeycomb Husk | ILD | Pneumoconioses, IPF, fibrosis |
| 😴 Apnea Phantom | Sleep Apnea | OSA/CSA, CPAP/BiPAP, AHI |
| ⚡ The Paralytic | Neuro-Resp | GBS, botulism, MIP/NIF, phrenic nerve |
| 💔 The Drowning Heart | Pulm Edema/PVD | Cardiogenic vs noncardiogenic, PE, cor pulmonale |

### 6.2 RCP 104 — Pharmacology (12 bosses, by chapter)

| Boss | Chapter |
|------|---------|
| 🧪 Corticosteroid Boss | Ch 11 |
| 💊 Non-Steroidal Anti-Asthma Boss | Ch 12 |
| 🧫 Anti-Infective Boss (Pentamidine/Ribavirin/CF) | Ch 13 |
| 🦠 Antimicrobial Boss (TB/VAP/MRSA) | Ch 14 |
| 🤧 Cold & Cough Boss | Ch 15 |
| 🚬 α1-AT / Nitric Oxide Boss | Ch 16 |
| 🦴 Neuromuscular Blocker Boss | Ch 18 |
| 💧 Diuretic Boss | Ch 19 |
| 🧠 CNS Drugs Boss (Opioids/Benzos/Naloxone) | Ch 20 |
| ❤️ Vasopressor & Antiarrhythmic Boss | Ch 21 |
| 🩸 Antihypertensive Boss | Ch 22 |
| 🌙 Sleep Pharm Boss | Ch 23 |

---

## 7. Patient Crisis Scenarios

**Initial count:** 6 scenarios per course (12 total), covering major topics. Each scenario contains 3–5 branching decision points.

### Example scenario structure (RCP 103 — "ER Bay 4: 62yo Chronic Smoker")

```
INTRO    SOB, productive cough, RR 32, SpO2 84% on RA, lethargic
         Patient HP: 60

DECISION 1: First action?
  ├─ Place on 100% NRB              wipes hypoxic drive    HP −25
  ├─ Titrate O2 to SpO2 88–92% ✓                            HP +10
  └─ Intubate immediately            premature              HP −10

DECISION 2: ABG: pH 7.22, PaCO2 88, HCO3 38, PaO2 58
  ├─ Acute respiratory acidosis only        partial         HP +5
  ├─ Acute-on-chronic respiratory acidosis ✓               HP +15
  └─ Pure metabolic alkalosis                wrong          HP −15

DECISION 3: Next intervention?
  ├─ BiPAP 12/5 ✓                                           HP +20
  ├─ Bronchodilator only            undertreated            HP −5
  └─ Sedate and intubate now        too aggressive          HP −10

OUTCOME:
  HP > 50 → Stabilized        +100 XP, +50g
  HP 1–50 → Survived          +50 XP
  HP = 0  → Coded             +10 XP
```

All decisions show an **explanation** after selection so the player learns *why* a choice was right or wrong.

---

## 8. Question Pool

- ~20 questions per boss
- 4 multiple-choice options per question
- One correct answer
- Each question has a short **explanation** shown after answering (key teaching point)
- Each question tagged with: `topic`, `chapter` (if 104), `difficulty` (1–3)
- Approximate v1 totals: 220 questions for RCP 103, 240 for RCP 104, ~12 branching scenarios

Content is generated from the Obsidian study notes by an Opus subagent that reads the relevant vault files.

---

## 9. Screen Flow

```
Home
├── [Daily Challenge]               (badge if not yet done today)
├── [Continue last session]         (if any)
├── Pick Course
│   ├── RCP 103
│   └── RCP 104
└── Pick Mode
    ├── ⚡ Boss Battle
    │   ├── Boss Select  (grid; locked bosses greyed out)
    │   ├── Prep Camp
    │   │   ├── 🏋️ Train  → flashcard loop → earn gold/XP
    │   │   ├── 🪙 Shop   → buy items
    │   │   ├── 🎒 Equip  → select up to 3 items
    │   │   └── ⚔️ Enter Boss Fight
    │   ├── Battle screen
    │   └── Victory / Defeat screen  (XP/gold earned, level-up if applicable)
    │
    └── 🏥 Patient Crisis
        ├── Scenario Select
        ├── Intro
        ├── Decisions (3–5 branches)
        └── Outcome screen

Settings (gear icon, top right)
├── Reset progress
└── About / credits
```

---

## 10. Data Architecture

### State (localStorage key: `rcpsg_state`)

```js
{
  xp: 1247,
  level: 4,
  gold: 320,
  maxHp: 83,
  inventory: { healthPotion: 2, hintScroll: 1, shieldRune: 0, reviveCharm: 1, doubleXpTome: 0 },
  defeatedBosses: ['copd', 'asthma'],           // boss ids
  completedScenarios: ['er-bay-4'],             // scenario ids
  streak: { count: 6, lastPlayed: '2026-05-17', shieldUsed: false },
  dailyChallenge: { date: '2026-05-18', completed: false, bossId: 'ards', course: 'rcp103' },
  settings: { sfxOn: true, timerOn: true },
}
```

### Content modules (read-only, shipped with the app)

```js
// content/rcp103-bosses.js
const RCP103_BOSSES = [
  {
    id: 'copd',
    name: 'The Blue Bloater',
    emoji: '🌫️',
    course: 'rcp103',
    description: 'Chronic bronchitis & emphysema',
    hp: 100,
    unlockedByDefault: true,
    questionTopics: ['copd', 'cor-pulmonale'],
  },
  // ...
];

// content/questions.js
const QUESTIONS = [
  {
    id: 'q001',
    topic: 'copd',
    course: 'rcp103',
    difficulty: 1,
    q: 'The hallmark PFT finding in COPD is...',
    choices: ['FEV1/FVC > 0.70', 'FEV1/FVC < 0.70 post-bronchodilator', 'Normal FEV1', 'Increased DLCO'],
    correct: 1,
    explanation: 'Post-bronchodilator FEV1/FVC < 0.70 is the diagnostic criterion per GOLD.',
  },
  // ...
];

// content/rcp103-scenarios.js
const RCP103_SCENARIOS = [
  {
    id: 'er-bay-4',
    title: 'ER Bay 4: 62yo Chronic Smoker',
    course: 'rcp103',
    intro: 'A 62-year-old with 40 pack-year smoking history presents with SOB...',
    vitals: { rr: 32, spo2: 84, hr: 110, bp: '142/88' },
    startingHp: 60,
    decisions: [
      {
        id: 'd1',
        prompt: 'First action?',
        options: [
          { text: 'Place on 100% NRB',         hpDelta: -25, explain: 'Wipes hypoxic drive — dangerous in chronic CO2 retainers.', next: 'd2' },
          { text: 'Titrate O2 to SpO2 88–92%', hpDelta: +10, explain: 'Correct — keep SpO2 88–92% to preserve hypoxic drive.', next: 'd2' },
          { text: 'Intubate immediately',      hpDelta: -10, explain: 'Premature; trial BiPAP first.', next: 'd2' },
        ],
      },
      // ...
    ],
  },
];
```

---

## 11. File Structure

```
RCPStudyGame/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js                      ← screen router, global state hub
│   ├── engine/
│   │   ├── state.js                ← localStorage save/load, XP/level math
│   │   ├── battle.js               ← boss fight engine (HP, damage, items)
│   │   ├── crisis.js               ← patient scenario branching engine
│   │   └── shop.js                 ← shop/inventory logic
│   └── screens/
│       ├── home.js
│       ├── boss-select.js
│       ├── prep-camp.js
│       ├── battle.js
│       ├── crisis.js
│       ├── scenario-select.js
│       └── results.js
└── content/
    ├── rcp103-bosses.js
    ├── rcp103-scenarios.js
    ├── rcp104-bosses.js
    ├── rcp104-scenarios.js
    └── questions.js
```

Content modules are isolated from engine code so question/scenario generation can run as a parallel agent task.

---

## 12. Visual Style Detail

- **Background:** `#0a0a1a` deep navy, optional pixel-grid overlay on battle/arena screens
- **Font:** Press Start 2P, sizes 6–12px
- **Primary palette:**
  - Player HP / correct: `#22cc44` → `#44ff66`
  - Boss HP / wrong: `#cc2222` → `#ff6644`
  - Question accent: `#3355ff` electric blue with `box-shadow: 0 0 12px #3355ff44` glow
  - XP / gold: `#ffd700` with subtle text glow
  - Streak: `#ff9900`
- **Sprite treatment:** large emoji rendered at 64–72px, wrapped in CSS `filter: drop-shadow(0 0 16px <color>)` for neon glow, and `animation: bob` keyframe for idle motion
- **Effects:**
  - Wrong answer → screen-shake (`@keyframes shake`)
  - Correct answer → boss flashes red, HP bar drains
  - Level up → fullscreen pixel confetti overlay + title card
  - Streak → flame icon scales up each day

SFX (8-bit chip beeps for correct/wrong/level-up) is deferred to v2.

---

## 13. Scope — In and Out

### In scope for v1
- All 22 bosses (10 RCP 103 + 12 RCP 104) with ~20 questions each
- 12 Patient Crisis scenarios (6 per course)
- Full progression system (XP, levels, gold, inventory, daily challenge, streak)
- Mobile-responsive UI, offline-capable, localStorage save
- Vanilla HTML/CSS/JS — no external runtime deps beyond Google Fonts CDN

### Deferred to v2+
- 8-bit SFX
- Custom SVG/PNG sprite art (v1 uses emoji + CSS)
- Multiplayer / leaderboards
- Cloud-sync progress
- iOS PWA install + add-to-home-screen icon
- Boss-specific battle mechanics beyond shared question/HP loop (e.g., ARDS boss "ventilator timer")
- Spaced-repetition scheduling for missed questions

---

## 14. Open questions to resolve during implementation

- Exact damage/HP numbers may need tuning after a playtest (target: a confident player wins a boss in ~10 questions with ~1 mistake)
- Number of questions drawn per boss fight (start: 10 random from the topic's pool of 20)
- Whether to lock the Daily Challenge boss to ones the player has unlocked, or allow any (decision: allow any — encourages exposure to upcoming topics)
- Timer per question on/off by default (decision: ON, 30 seconds, toggleable in settings)
