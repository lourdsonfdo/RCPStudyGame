# RCP Study Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-web 8-bit study game with Boss Battle and Patient Crisis modes for RCP 103 (pulmonary disease) and RCP 104 (pharmacology) finals.

**Architecture:** Single-page vanilla HTML/CSS/JS application. Screens are toggled `<section>` panels managed by an `app.js` router. Engine logic (state, battle, crisis, shop) is split into focused modules under `js/engine/`. All persistence via `localStorage`. Content data files are isolated from engine code so they can be generated in parallel by agents.

**Tech Stack:** Vanilla HTML5, CSS3 (with Press Start 2P from Google Fonts), ES6 modules-by-script-include (no bundler), `localStorage` for state.

**Spec:** `docs/superpowers/specs/2026-05-18-rcp-study-game-design.md`

**Project root:** `/Users/lourdsonfernando/RCPStudyGame/`

**Parallelization notes:** Tasks 1–4 are sequential foundation. Tasks 5 (stub content), 6–24 (screens/engines) can be done in a sequence by one or two agents. Tasks 25–28 (full content generation) are independent and ideal for parallel Opus subagents — they only modify their own files.

---

## File Structure

```
RCPStudyGame/
├── index.html                       # Task 1
├── css/
│   └── style.css                    # Task 2
├── js/
│   ├── app.js                       # Task 4
│   ├── engine/
│   │   ├── state.js                 # Task 3
│   │   ├── battle.js                # Task 9
│   │   ├── crisis.js                # Task 16
│   │   └── shop.js                  # Task 14
│   └── screens/
│       ├── home.js                  # Task 6
│       ├── course-mode.js           # Task 7
│       ├── boss-select.js           # Task 8
│       ├── prep-camp.js             # Task 12
│       ├── training.js              # Task 13
│       ├── battle.js                # Task 10
│       ├── results.js               # Task 11
│       ├── scenario-select.js       # Task 17
│       ├── crisis.js                # Task 18
│       ├── outcome.js               # Task 19
│       ├── settings.js              # Task 21
│       └── level-up.js              # Task 22
├── content/
│   ├── stub.js                      # Task 5  (replaced by 25-28 later)
│   ├── rcp103-bosses.js             # Task 25/26
│   ├── rcp104-bosses.js             # Task 25/26
│   ├── rcp103-scenarios.js          # Task 27
│   ├── rcp104-scenarios.js          # Task 28
│   └── questions.js                 # Task 25/26
├── test-engine.html                 # Task 3
└── docs/
    ├── specs/2026-05-18-rcp-study-game-design.md   (existing)
    └── plans/2026-05-18-rcp-study-game.md          (this file)
```

---

## Task 1: Project Skeleton — index.html

**Files:**
- Create: `index.html`
- Verify: project root exists at `/Users/lourdsonfernando/RCPStudyGame/`

- [ ] **Step 1: Create the directory tree**

```bash
cd /Users/lourdsonfernando/RCPStudyGame
mkdir -p css js/engine js/screens content
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <meta name="theme-color" content="#0a0a1a">
  <title>RCP Study Game</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <main id="app">
    <!-- Each screen is a <section> with a data-screen id. app.js toggles .active. -->
    <section data-screen="home"           class="screen active"></section>
    <section data-screen="course-mode"    class="screen"></section>
    <section data-screen="boss-select"    class="screen"></section>
    <section data-screen="prep-camp"      class="screen"></section>
    <section data-screen="training"       class="screen"></section>
    <section data-screen="battle"         class="screen"></section>
    <section data-screen="results"        class="screen"></section>
    <section data-screen="scenario-select" class="screen"></section>
    <section data-screen="crisis"         class="screen"></section>
    <section data-screen="outcome"        class="screen"></section>
    <section data-screen="settings"       class="screen"></section>
    <section data-screen="level-up"       class="screen overlay"></section>
  </main>

  <!-- Engine -->
  <script src="js/engine/state.js"></script>
  <script src="js/engine/battle.js" defer></script>
  <script src="js/engine/crisis.js" defer></script>
  <script src="js/engine/shop.js"   defer></script>

  <!-- Content (stub initially; replaced by full content later) -->
  <script src="content/stub.js"           defer></script>
  <script src="content/questions.js"      defer></script>
  <script src="content/rcp103-bosses.js"  defer></script>
  <script src="content/rcp104-bosses.js"  defer></script>
  <script src="content/rcp103-scenarios.js" defer></script>
  <script src="content/rcp104-scenarios.js" defer></script>

  <!-- Screens -->
  <script src="js/screens/home.js"            defer></script>
  <script src="js/screens/course-mode.js"     defer></script>
  <script src="js/screens/boss-select.js"     defer></script>
  <script src="js/screens/prep-camp.js"       defer></script>
  <script src="js/screens/training.js"        defer></script>
  <script src="js/screens/battle.js"          defer></script>
  <script src="js/screens/results.js"         defer></script>
  <script src="js/screens/scenario-select.js" defer></script>
  <script src="js/screens/crisis.js"          defer></script>
  <script src="js/screens/outcome.js"         defer></script>
  <script src="js/screens/settings.js"        defer></script>
  <script src="js/screens/level-up.js"        defer></script>

  <!-- App router (boots last) -->
  <script src="js/app.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: Verify file created**

```bash
ls -la /Users/lourdsonfernando/RCPStudyGame/index.html
ls /Users/lourdsonfernando/RCPStudyGame/{css,js/engine,js/screens,content}
```

Expected: `index.html` exists, all directories exist.

- [ ] **Step 4: Commit**

```bash
cd /Users/lourdsonfernando/RCPStudyGame
git init -q
echo ".DS_Store" > .gitignore
git add .
git commit -q -m "feat: project skeleton + index.html shell"
```

---

## Task 2: Base CSS — Palette, Typography, Utility Classes

**Files:**
- Create: `css/style.css`

- [ ] **Step 1: Create `css/style.css` with the full base stylesheet**

```css
/* ============================================================
   RCP STUDY GAME — Base styles
   ============================================================ */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0a0a1a;
  --panel:     #131326;
  --panel-2:   #0e0e22;
  --border:    #2a2a4a;
  --border-2:  #3a3a5a;

  --text:      #eeeeee;
  --text-dim:  #aaaaaa;
  --text-mute: #666666;
  --text-dark: #555555;

  --green:     #44ff66;
  --green-2:   #22aa44;
  --red:       #ff4444;
  --red-2:     #cc2222;
  --blue:      #3355ff;
  --blue-2:    #5577ff;
  --gold:      #ffd700;
  --orange:    #ff9900;
  --yellow:    #ffee44;
  --purple:    #aa55ff;

  --pixel-grid: rgba(40,40,80,.25);

  --font-pixel: 'Press Start 2P', 'Courier New', monospace;
}

html, body {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-pixel);
  -webkit-font-smoothing: none;
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
}

#app {
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
}

/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */
.screen { display: none; flex-direction: column; gap: 10px; flex: 1; }
.screen.active { display: flex; }
.screen.overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(10,10,26,.94);
  align-items: center; justify-content: center;
  padding: 24px;
}
.screen.overlay.active { display: flex; }

/* ============================================================
   PANELS
   ============================================================ */
.panel {
  background: var(--panel);
  border: 2px solid var(--border);
  padding: 12px;
}
.panel-glow-blue { border-color: var(--blue); box-shadow: 0 0 12px rgba(51,85,255,.27); }

/* ============================================================
   TEXT UTILITIES
   ============================================================ */
.t-xs   { font-size: 6px; }
.t-sm   { font-size: 7px; }
.t-md   { font-size: 8px; }
.t-lg   { font-size: 10px; line-height: 1.7; }
.t-xl   { font-size: 12px; }
.t-xxl  { font-size: 16px; }
.t-dim  { color: var(--text-dim); }
.t-mute { color: var(--text-mute); }
.t-dark { color: var(--text-dark); }
.t-gold { color: var(--gold); text-shadow: 0 0 6px rgba(255,215,0,.4); }
.t-green{ color: var(--green); }
.t-red  { color: var(--red); }
.t-blue { color: var(--blue-2); }
.t-orange { color: var(--orange); }
.t-center { text-align: center; }
.t-right  { text-align: right; }
.t-line   { line-height: 1.8; }
.spacer   { flex: 1; }

/* ============================================================
   TOP BAR
   ============================================================ */
.topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 10px;
  background: var(--panel);
  border: 2px solid var(--border);
}
.topbar .mode-tag    { color: var(--orange); text-shadow: 0 0 6px var(--orange); font-size: 7px; }
.topbar .course-tag  { background: #22cc44; color: #000; padding: 3px 7px; font-size: 7px; }
.topbar .chapter-tag { color: var(--text-dark); font-size: 7px; }
.topbar .back-btn    { background: none; border: none; color: var(--text-dim); font: inherit; font-size: 8px; cursor: pointer; padding: 6px; }
.topbar .back-btn:active { transform: scale(.95); }

/* ============================================================
   BUTTONS
   ============================================================ */
.btn {
  font-family: var(--font-pixel);
  font-size: 9px;
  padding: 14px 14px;
  background: var(--panel);
  border: 2px solid var(--border-2);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  display: flex; align-items: center; gap: 10px;
  transition: border-color .1s, background .1s, transform .05s;
  -webkit-tap-highlight-color: transparent;
}
.btn:hover  { border-color: var(--blue-2); background: #1a1a3a; }
.btn:active { transform: scale(.97); }
.btn-primary { background: #1a3a1a; border-color: var(--green-2); color: var(--green); }
.btn-primary:hover { border-color: var(--green); background: #1a4a1a; }
.btn-danger  { border-color: var(--red-2); color: var(--red); }
.btn-block   { width: 100%; justify-content: center; text-align: center; }
.btn:disabled, .btn.locked { opacity: .4; cursor: not-allowed; pointer-events: none; }

/* ============================================================
   HP BARS
   ============================================================ */
.hp-row { display: flex; align-items: center; gap: 8px; font-size: 6px; }
.hp-row .hp-name { width: 52px; flex-shrink: 0; color: var(--text-dim); }
.hp-track {
  flex: 1; height: 14px;
  background: #222240; border: 1px solid #444;
  overflow: hidden; position: relative;
}
.hp-fill { height: 100%; transition: width .4s ease-out; }
.hp-fill.player { background: linear-gradient(90deg, var(--green-2), var(--green)); }
.hp-fill.boss   { background: linear-gradient(90deg, var(--red-2),   var(--red)); }
.hp-fill.patient{ background: linear-gradient(90deg, #cc8800, var(--yellow)); }
.hp-row .hp-val { width: 30px; text-align: right; font-size: 6px; color: var(--text-mute); }

/* ============================================================
   ARENA (used in battle + scenario intro)
   ============================================================ */
.arena {
  background: var(--panel-2);
  border: 2px solid var(--border);
  min-height: 160px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; padding: 16px;
  position: relative; overflow: hidden;
}
.arena::before {
  content: ''; position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--pixel-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--pixel-grid) 1px, transparent 1px);
  background-size: 16px 16px;
}
.arena > * { position: relative; }

.boss-emoji {
  font-size: 72px; line-height: 1;
  filter: drop-shadow(0 0 16px var(--red)) drop-shadow(0 0 4px #ff8888);
  animation: bob 1.8s ease-in-out infinite;
}
.boss-emoji.calm { filter: drop-shadow(0 0 12px var(--blue-2)); animation: bob 2.4s ease-in-out infinite; }
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50%      { transform: translateY(-8px) rotate(2deg); }
}
.boss-name { font-size: 9px; color: #ff6666; text-shadow: 0 0 10px var(--red); text-align: center; }
.boss-name.calm { color: var(--blue-2); text-shadow: 0 0 8px var(--blue); }
.boss-sub  { font-size: 6px; color: var(--text-dark); text-align: center; }

/* ============================================================
   QUESTION + ANSWERS
   ============================================================ */
.q-box {
  background: #111128; border: 2px solid var(--blue);
  padding: 14px; box-shadow: 0 0 12px rgba(51,85,255,.27);
}
.q-label { font-size: 6px; color: var(--blue); margin-bottom: 8px; }
.q-text  { font-size: 10px; line-height: 1.8; color: var(--text); }

.answers { display: flex; flex-direction: column; gap: 6px; }
.ans-btn {
  background: var(--panel);
  border: 2px solid var(--border-2);
  color: #bbb;
  font-family: var(--font-pixel);
  font-size: 8px;
  padding: 13px 12px;
  text-align: left;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px;
  -webkit-tap-highlight-color: transparent;
  transition: border-color .1s, background .1s;
}
.ans-btn:active { transform: scale(.97); }
.ans-btn:hover  { border-color: var(--blue-2); background: #1a1a3a; }
.ans-btn.correct { border-color: var(--green); background: #0d2010; color: var(--green); }
.ans-btn.wrong   { border-color: var(--red);   background: #200d0d; color: var(--red); }
.ans-btn.disabled-vis { opacity: .35; pointer-events: none; }
.ans-key { color: var(--blue-2); min-width: 14px; }
.ans-btn.correct .ans-key { color: var(--green); }
.ans-btn.wrong   .ans-key { color: var(--red); }

.explanation {
  margin-top: 8px;
  padding: 10px;
  background: #0f0f22; border: 1px dashed var(--border-2);
  font-size: 7px; line-height: 1.7; color: var(--text-dim);
}

/* ============================================================
   XP / STATUS FOOTER
   ============================================================ */
.xp-block {
  background: var(--panel);
  border: 2px solid var(--border);
  padding: 10px 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.xp-header { display: flex; justify-content: space-between; font-size: 7px; }
.lvl-txt    { color: var(--gold); text-shadow: 0 0 6px rgba(255,215,0,.4); }
.streak-txt { color: var(--orange); }
.xp-track   { height: 10px; background: #222240; border: 1px solid #444; }
.xp-fill    { height: 100%; background: linear-gradient(90deg, var(--green-2), var(--green)); transition: width .5s; }
.xp-sub     { font-size: 6px; color: var(--text-dark); text-align: right; }
.gold-txt   { color: var(--gold); }

/* ============================================================
   GRIDS (boss-select, scenario-select)
   ============================================================ */
.grid-2 {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.tile {
  background: var(--panel);
  border: 2px solid var(--border);
  padding: 10px;
  display: flex; flex-direction: column; align-items: center;
  gap: 4px; cursor: pointer; min-height: 110px;
  transition: border-color .1s, background .1s;
}
.tile:hover  { border-color: var(--blue-2); background: #1a1a3a; }
.tile:active { transform: scale(.97); }
.tile.locked { opacity: .35; pointer-events: none; }
.tile.defeated { border-color: var(--green-2); }
.tile-emoji  { font-size: 36px; line-height: 1; margin: 4px 0; }
.tile-name   { font-size: 7px; text-align: center; line-height: 1.4; }
.tile-sub    { font-size: 6px; color: var(--text-dark); text-align: center; }
.tile-badge  { font-size: 6px; color: var(--green); text-align: center; }

/* ============================================================
   ITEMS / INVENTORY
   ============================================================ */
.item-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px;
  background: var(--panel);
  border: 2px solid var(--border);
}
.item-emoji { font-size: 28px; line-height: 1; }
.item-body  { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.item-name  { font-size: 8px; color: var(--text); }
.item-desc  { font-size: 6px; color: var(--text-mute); line-height: 1.5; }
.item-meta  { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.item-count { font-size: 7px; color: var(--text-dim); }
.item-btn {
  font-family: var(--font-pixel); font-size: 7px;
  padding: 6px 10px; background: var(--panel); border: 2px solid var(--border-2);
  color: var(--text); cursor: pointer;
}
.item-btn:hover { border-color: var(--blue-2); }
.item-btn.equipped { border-color: var(--green); color: var(--green); }
.item-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ============================================================
   ANIMATIONS
   ============================================================ */
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
.shake { animation: shake .4s ease-in-out; }

@keyframes flash-red { 0%,100%{background:transparent} 50%{background:rgba(255,68,68,.18)} }
.flash-red { animation: flash-red .4s ease-in-out; }

@keyframes fanfare {
  0%   { transform: scale(0)   rotate(-180deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(15deg);   opacity: 1; }
  100% { transform: scale(1)   rotate(0deg);    opacity: 1; }
}
.fanfare { animation: fanfare .8s cubic-bezier(.34,1.56,.64,1) forwards; }

@keyframes confetti-fall {
  0%   { transform: translateY(-100vh) rotate(0); opacity: 1; }
  100% { transform: translateY(100vh)  rotate(720deg); opacity: 0; }
}

/* ============================================================
   APPROACH LABEL (development helper — remove for production)
   ============================================================ */
.dev-tag {
  text-align: center; font-size: 7px; color: #555;
  border: 1px dashed #333; padding: 6px; letter-spacing: 1px;
}

/* ============================================================
   TOAST / SMALL ALERTS
   ============================================================ */
.toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #1a1a3a; border: 2px solid var(--blue); padding: 10px 14px;
  font-size: 8px; color: var(--text); z-index: 200;
  animation: toast-in .3s ease-out;
}
@keyframes toast-in { from { transform: translate(-50%,12px); opacity: 0; } to { transform: translate(-50%,0); opacity: 1; } }
```

- [ ] **Step 2: Quick smoke test — open in browser**

```bash
cd /Users/lourdsonfernando/RCPStudyGame && open index.html
```

Expected: page loads with dark navy background, no console errors. (All screens are empty for now.)

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -q -m "feat: base CSS — palette, typography, utility classes"
```

---

## Task 3: state.js — Persistence, XP/Level/Gold Math

**Files:**
- Create: `js/engine/state.js`
- Create: `test-engine.html`

- [ ] **Step 1: Create `js/engine/state.js`**

```js
/* ============================================================
   STATE ENGINE — persistence + progression math
   Exposes a global `State` object (no module system).
   ============================================================ */
(function (global) {
  'use strict';

  const STATE_KEY = 'rcpsg_state';

  const DEFAULT_STATE = {
    xp: 0,
    level: 1,
    gold: 0,
    maxHp: 80,
    inventory: {
      healthPotion: 0,
      hintScroll:   0,
      shieldRune:   0,
      reviveCharm:  0,
      doubleXpTome: 0,
    },
    equipped: [],                 // up to 3 item keys taken into the next fight
    defeatedBosses:    [],        // boss ids
    completedScenarios:[],        // scenario ids
    streak: { count: 0, lastPlayed: null, shieldUsed: false },
    dailyChallenge: { date: null, completed: false, bossId: null, course: null },
    settings: { sfxOn: true, timerOn: true },
  };

  // Cumulative XP needed for each level (index 0 = level 1)
  const LEVEL_XP = [0, 250, 600, 1100, 1800, 2800, 4200, 6000, 8500, 12000];
  const LEVEL_TITLES = [
    'Student RT', 'New Grad', 'Intern RT', 'Staff RT I', 'Staff RT II',
    'Senior RT', 'Charge RT', 'Lead Clinician', 'RT Educator', 'RT Director',
  ];

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return deepClone(DEFAULT_STATE);
    try {
      const parsed = JSON.parse(raw);
      // Shallow merge defaults so newly-added keys appear
      return { ...deepClone(DEFAULT_STATE), ...parsed,
        inventory: { ...DEFAULT_STATE.inventory, ...(parsed.inventory || {}) },
        streak:    { ...DEFAULT_STATE.streak,    ...(parsed.streak    || {}) },
        dailyChallenge: { ...DEFAULT_STATE.dailyChallenge, ...(parsed.dailyChallenge || {}) },
        settings:  { ...DEFAULT_STATE.settings,  ...(parsed.settings  || {}) },
      };
    } catch { return deepClone(DEFAULT_STATE); }
  }

  function save(state) { localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
  function reset()     { localStorage.removeItem(STATE_KEY); }

  function levelFromXp(xp) {
    for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP[i]) return i + 1;
    }
    return 1;
  }
  function titleForLevel(level) { return LEVEL_TITLES[level - 1] || 'RT Director'; }
  function maxHpForLevel(level) {
    if (level >= 10) return 90;
    return 80 + (level - 1);  // 80 at lvl 1 → 89 at lvl 9 → 90 at lvl 10
  }
  function xpForNextLevel(level) {
    return LEVEL_XP[level] ?? LEVEL_XP[LEVEL_XP.length - 1];
  }
  function xpProgressInCurrentLevel(state) {
    const floor = LEVEL_XP[state.level - 1] ?? 0;
    const next  = xpForNextLevel(state.level);
    if (state.level >= 10) return { current: state.xp - floor, span: 1, ratio: 1 };
    return { current: state.xp - floor, span: next - floor, ratio: (state.xp - floor) / (next - floor) };
  }

  /**
   * Mutates state in place. Returns { leveledUp, newLevel, oldLevel }.
   * Applies double-xp tome multiplier if active.
   */
  function addXp(state, amount, { doubleActive = false } = {}) {
    const oldLevel = state.level;
    const gained = doubleActive ? amount * 2 : amount;
    state.xp += gained;
    const newLevel = levelFromXp(state.xp);
    state.level = newLevel;
    state.maxHp = maxHpForLevel(newLevel);
    return { leveledUp: newLevel > oldLevel, newLevel, oldLevel, gained };
  }

  function addGold(state, amount) { state.gold += amount; }

  /* ────────────────────────────  STREAK  ──────────────────────────── */
  function isoToday(d = new Date()) { return d.toISOString().slice(0, 10); }
  function daysBetween(aIso, bIso) {
    const a = new Date(aIso + 'T00:00:00Z').getTime();
    const b = new Date(bIso + 'T00:00:00Z').getTime();
    return Math.round((b - a) / 86400000);
  }
  function tickStreakForDailyComplete(state) {
    const today = isoToday();
    const last  = state.streak.lastPlayed;
    if (last === today) return state.streak.count;  // already counted today
    if (!last)                       state.streak.count = 1;
    else if (daysBetween(last, today) === 1) state.streak.count += 1;
    else if (daysBetween(last, today) === 2 && state.streak.count >= 7 && !state.streak.shieldUsed) {
      state.streak.shieldUsed = true; // burn shield, keep streak
    }
    else state.streak.count = 1;
    state.streak.lastPlayed = today;
    return state.streak.count;
  }
  function streakBonusXp(state) { return Math.min(state.streak.count * 5, 50); }

  /* ────────────────────────  DAILY CHALLENGE  ─────────────────────── */
  /**
   * Picks today's challenge (deterministic by date). Returns the boss descriptor.
   * `bossCandidates` is an array of { id, name, course } objects.
   */
  function ensureDailyChallenge(state, bossCandidates) {
    const today = isoToday();
    if (state.dailyChallenge.date === today) return state.dailyChallenge;
    // Deterministic pick from date string hash
    let h = 0;
    for (let i = 0; i < today.length; i++) h = (h * 31 + today.charCodeAt(i)) | 0;
    const pick = bossCandidates[Math.abs(h) % bossCandidates.length];
    state.dailyChallenge = {
      date: today, completed: false, bossId: pick.id, course: pick.course,
    };
    return state.dailyChallenge;
  }
  function isDailyAvailable(state) {
    return state.dailyChallenge.date === isoToday() && !state.dailyChallenge.completed;
  }

  /* ──────────────────────────  INVENTORY  ─────────────────────────── */
  function addItem(state, key, n = 1) {
    if (!(key in state.inventory)) return;
    state.inventory[key] = (state.inventory[key] || 0) + n;
  }
  function consumeItem(state, key) {
    if ((state.inventory[key] || 0) <= 0) return false;
    state.inventory[key] -= 1;
    return true;
  }
  function setEquipped(state, keys) {
    state.equipped = keys.slice(0, 3).filter(k => (state.inventory[k] || 0) > 0);
  }
  function clearEquipped(state) { state.equipped = []; }

  /* ──────────────────────────  EXPORTS  ───────────────────────────── */
  global.State = {
    LEVEL_XP, LEVEL_TITLES,
    DEFAULT_STATE,
    load, save, reset,
    levelFromXp, titleForLevel, maxHpForLevel,
    xpForNextLevel, xpProgressInCurrentLevel,
    addXp, addGold,
    tickStreakForDailyComplete, streakBonusXp,
    ensureDailyChallenge, isDailyAvailable,
    addItem, consumeItem, setEquipped, clearEquipped,
    isoToday, daysBetween,
  };
})(window);
```

- [ ] **Step 2: Create `test-engine.html` to run assertions**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>RCPSG — Engine Tests</title>
  <style>
    body { font-family: monospace; background:#0a0a1a; color:#eee; padding:20px; }
    .pass { color:#44ff66; }
    .fail { color:#ff4444; font-weight:bold; }
    h2 { margin-top: 18px; color:#5577ff; }
  </style>
</head>
<body>
  <h1>RCPSG Engine Tests</h1>
  <div id="out"></div>

  <script src="js/engine/state.js"></script>
  <script>
    const out = document.getElementById('out');
    let passed = 0, failed = 0;
    function check(name, cond, detail = '') {
      const ok = !!cond;
      if (ok) passed++; else failed++;
      out.innerHTML += `<div class="${ok ? 'pass' : 'fail'}">${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}</div>`;
    }
    function section(name) { out.innerHTML += `<h2>${name}</h2>`; }

    // ─── State load/save ────────────────────────────────────────
    section('State load/save');
    State.reset();
    let s = State.load();
    check('default xp = 0', s.xp === 0);
    check('default level = 1', s.level === 1);
    check('default maxHp = 80', s.maxHp === 80);
    check('default gold = 0', s.gold === 0);
    s.xp = 999; State.save(s);
    const s2 = State.load();
    check('persisted xp', s2.xp === 999);

    // ─── Level math ─────────────────────────────────────────────
    section('Level math');
    check('lvl 1 at xp 0',     State.levelFromXp(0)   === 1);
    check('lvl 1 at xp 249',   State.levelFromXp(249) === 1);
    check('lvl 2 at xp 250',   State.levelFromXp(250) === 2);
    check('lvl 5 at xp 1800',  State.levelFromXp(1800)=== 5);
    check('lvl 10 at xp 12000',State.levelFromXp(12000)===10);
    check('lvl 10 at xp 99999',State.levelFromXp(99999)===10);
    check('title lvl 1 Student RT', State.titleForLevel(1) === 'Student RT');
    check('title lvl 10 RT Director', State.titleForLevel(10) === 'RT Director');
    check('maxHp lvl 1 = 80',  State.maxHpForLevel(1) === 80);
    check('maxHp lvl 10 = 90', State.maxHpForLevel(10) === 90);

    // ─── addXp ──────────────────────────────────────────────────
    section('addXp');
    State.reset(); s = State.load();
    let r = State.addXp(s, 100);
    check('no level up at 100xp', !r.leveledUp);
    check('xp = 100', s.xp === 100);
    r = State.addXp(s, 200);
    check('level up at 300xp', r.leveledUp && s.level === 2);
    check('maxHp now 81', s.maxHp === 81);
    r = State.addXp(s, 100, { doubleActive: true });
    check('double xp doubles', r.gained === 200 && s.xp === 500);

    // ─── Streak ────────────────────────────────────────────────
    section('Streak');
    State.reset(); s = State.load();
    State.tickStreakForDailyComplete(s);
    check('streak = 1 after first', s.streak.count === 1);
    // Simulate yesterday played, then today
    s.streak.lastPlayed = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    s.streak.count = 5;
    State.tickStreakForDailyComplete(s);
    check('streak = 6 (consecutive)', s.streak.count === 6);
    check('streak bonus xp = 30', State.streakBonusXp(s) === 30);
    // Gap of 2 with no shield → reset
    s.streak.lastPlayed = new Date(Date.now() - 2*86400000).toISOString().slice(0,10);
    s.streak.count = 5; s.streak.shieldUsed = false;
    State.tickStreakForDailyComplete(s);
    check('streak resets after 2-day gap (no shield)', s.streak.count === 1);
    // Gap of 2 with streak >= 7 and shield available → keep streak
    s.streak.lastPlayed = new Date(Date.now() - 2*86400000).toISOString().slice(0,10);
    s.streak.count = 10; s.streak.shieldUsed = false;
    State.tickStreakForDailyComplete(s);
    check('streak shield protects', s.streak.count === 10 && s.streak.shieldUsed === true);

    // ─── Inventory ────────────────────────────────────────────
    section('Inventory');
    State.reset(); s = State.load();
    State.addItem(s, 'healthPotion', 2);
    check('add 2 potions', s.inventory.healthPotion === 2);
    check('consume succeeds', State.consumeItem(s, 'healthPotion') === true);
    check('count decrements', s.inventory.healthPotion === 1);
    State.consumeItem(s, 'healthPotion');
    check('consume below 0 returns false', State.consumeItem(s, 'healthPotion') === false);

    // ─── Equipped ────────────────────────────────────────────
    section('Equipped');
    State.reset(); s = State.load();
    State.addItem(s, 'healthPotion', 2);
    State.addItem(s, 'shieldRune', 1);
    State.setEquipped(s, ['healthPotion', 'shieldRune', 'reviveCharm']);
    check('equipped filters out items with 0 count', s.equipped.length === 2);
    check('equipped contains potion', s.equipped.includes('healthPotion'));

    // ─── Daily challenge ────────────────────────────────────
    section('Daily challenge');
    State.reset(); s = State.load();
    const candidates = [
      { id: 'copd', name: 'Blue Bloater', course: 'rcp103' },
      { id: 'asthma', name: 'Hyperresponsive', course: 'rcp103' },
    ];
    State.ensureDailyChallenge(s, candidates);
    check('daily set today', s.dailyChallenge.date === State.isoToday());
    check('daily has bossId', !!s.dailyChallenge.bossId);
    check('daily available', State.isDailyAvailable(s));
    s.dailyChallenge.completed = true;
    check('daily not available when completed', !State.isDailyAvailable(s));

    // ─── Summary ────────────────────────────────────────────
    out.innerHTML += `<h2>${failed === 0 ? '✓ ALL PASSED' : '✗ ' + failed + ' FAILED'} (${passed} passed)</h2>`;
  </script>
</body>
</html>
```

- [ ] **Step 3: Run tests — open `test-engine.html` in browser**

```bash
open /Users/lourdsonfernando/RCPStudyGame/test-engine.html
```

Expected: Page shows green ✓ for every assertion and a green "ALL PASSED" summary at the bottom.

- [ ] **Step 4: Commit**

```bash
git add js/engine/state.js test-engine.html
git commit -q -m "feat: state.js engine — persistence, XP/level/gold/streak/inventory"
```

---

## Task 4: app.js — Screen Router and Global State Hub

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create `js/app.js`**

```js
/* ============================================================
   APP — screen router and global state hub
   Exposes `App` global.
   ============================================================ */
(function (global) {
  'use strict';

  let state = null;                  // current game state (loaded from localStorage)
  let currentScreen = 'home';
  const screenInits = {};            // map: screenId → render fn(ctx)
  let routeCtx = {};                 // arbitrary data passed between screens

  function $screen(id) { return document.querySelector(`[data-screen="${id}"]`); }

  function goto(screenId, ctx = {}) {
    routeCtx = { ...ctx };
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = $screen(screenId);
    if (!el) { console.error('Unknown screen:', screenId); return; }
    el.classList.add('active');
    currentScreen = screenId;
    window.scrollTo(0, 0);

    const init = screenInits[screenId];
    if (init) init({ root: el, state, ctx: routeCtx });
    else el.innerHTML = `<div class="panel t-center t-mute">Screen <b>${screenId}</b> not implemented.</div>`;
  }

  function registerScreen(id, init) { screenInits[id] = init; }

  function refresh() { goto(currentScreen, routeCtx); }

  function getState() { return state; }
  function persist()  { State.save(state); }

  function toast(msg, ms = 1800) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  // ────────────────────────────  BOOT  ──────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    state = State.load();

    // Seed daily challenge if content is available
    if (global.ALL_BOSSES && global.ALL_BOSSES.length) {
      State.ensureDailyChallenge(state, global.ALL_BOSSES.map(b => ({ id: b.id, name: b.name, course: b.course })));
      State.save(state);
    }
    goto('home');
  });

  // ────────────────────────────  EXPORT  ────────────────────────────
  global.App = { goto, registerScreen, refresh, getState, persist, toast };
})(window);
```

- [ ] **Step 2: Open `index.html` in browser to verify boot**

```bash
open /Users/lourdsonfernando/RCPStudyGame/index.html
```

Expected: Home screen panel shows "Screen home not implemented." in the dim placeholder text. No console errors.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -q -m "feat: app.js — screen router + global state hub"
```

---

## Task 5: Stub Content for Development

This task creates minimal content (a few bosses, ~3 questions each, 1 scenario) so the screens have data to render. Full content generation happens in Tasks 25–28 by parallel agents.

**Files:**
- Create: `content/stub.js` — small dev-mode dataset
- Create: `content/questions.js` (empty stub)
- Create: `content/rcp103-bosses.js` (empty stub)
- Create: `content/rcp104-bosses.js` (empty stub)
- Create: `content/rcp103-scenarios.js` (empty stub)
- Create: `content/rcp104-scenarios.js` (empty stub)

- [ ] **Step 1: Create empty stub files for the production content slots**

```bash
cd /Users/lourdsonfernando/RCPStudyGame
for f in content/questions.js content/rcp103-bosses.js content/rcp104-bosses.js content/rcp103-scenarios.js content/rcp104-scenarios.js; do
  echo "/* generated in tasks 25-28 */" > "$f"
done
```

- [ ] **Step 2: Create `content/stub.js`** — dev-mode dataset that populates global arrays if production files are empty

```js
/* ============================================================
   STUB CONTENT — dev seed so screens render before full content
   is generated. Defines:
     window.ALL_BOSSES, window.ALL_QUESTIONS, window.ALL_SCENARIOS
   Production content tasks (25-28) will OVERWRITE these globals
   by re-assigning them in rcp103/104-*.js files loaded after this.
   ============================================================ */
(function () {
  if (window.ALL_BOSSES) return;  // production content already loaded

  window.ALL_BOSSES = [
    // RCP 103
    { id: 'copd',   name: 'The Blue Bloater',     emoji: '🌫️', course: 'rcp103', description: 'Chronic bronchitis & emphysema', hp: 100, unlockedByDefault: true,  questionTopics: ['copd'] },
    { id: 'asthma', name: 'The Hyperresponsive',  emoji: '💨', course: 'rcp103', description: 'Asthma — zones, biphasic, severity', hp: 100, unlockedByDefault: true, questionTopics: ['asthma'] },
    { id: 'abg',    name: 'The Acid-Base Specter',emoji: '🩸', course: 'rcp103', description: 'ABG interpretation, anion gap', hp: 100, unlockedByDefault: true, questionTopics: ['abg'] },
    { id: 'ards',   name: 'Hyaline Hydra',        emoji: '💧', course: 'rcp103', description: 'ARDS — Berlin criteria, P/F ratio', hp: 100, unlockedByDefault: false, questionTopics: ['ards'] },
    // RCP 104
    { id: 'corticosteroids', name: 'Corticosteroid Boss', emoji: '🧪', course: 'rcp104', description: 'Chapter 11 — Anti-inflammatory', hp: 100, unlockedByDefault: true, questionTopics: ['corticosteroids'] },
    { id: 'diuretics',       name: 'Diuretic Boss',       emoji: '💧', course: 'rcp104', description: 'Chapter 19 — Diuretics', hp: 100, unlockedByDefault: true, questionTopics: ['diuretics'] },
  ];

  window.ALL_QUESTIONS = [
    // COPD (3)
    { id:'q-copd-1', topic:'copd', course:'rcp103', difficulty:1,
      q:'The hallmark PFT finding in COPD is...',
      choices:['FEV1/FVC > 0.70','Post-bronchodilator FEV1/FVC < 0.70','Normal FEV1','Increased DLCO'], correct:1,
      explanation:'Post-bronchodilator FEV1/FVC < 0.70 is the GOLD diagnostic criterion for COPD.' },
    { id:'q-copd-2', topic:'copd', course:'rcp103', difficulty:1,
      q:'In chronic CO2 retainers with COPD, what drives ventilation?',
      choices:['Central chemoreceptors','Peripheral hypoxic drive','Vagal tone','Stretch receptors'], correct:1,
      explanation:'Central chemoreceptors become desensitized in chronic CO2 retention; peripheral chemoreceptors (hypoxic drive) take over.' },
    { id:'q-copd-3', topic:'copd', course:'rcp103', difficulty:2,
      q:'What target SpO2 range is appropriate for a COPD exacerbation?',
      choices:['95–100%','88–92%','>99%','70–80%'], correct:1,
      explanation:'88–92% preserves hypoxic drive; >92% risks wiping it out and causing CO2 retention.' },

    // Asthma (3)
    { id:'q-asthma-1', topic:'asthma', course:'rcp103', difficulty:1,
      q:'A normal or rising PaCO2 during an acute severe asthma attack indicates:',
      choices:['Adequate ventilation','Imminent respiratory failure','Mild exacerbation','Bronchodilator response'], correct:1,
      explanation:'A rising PaCO2 means the patient can no longer hyperventilate to compensate — they are fatiguing and crashing.' },
    { id:'q-asthma-2', topic:'asthma', course:'rcp103', difficulty:2,
      q:'A "silent chest" in asthma means:',
      choices:['Patient is sleeping','Asthma resolved','No air movement — life-threatening','Mild attack'], correct:2,
      explanation:'Silent chest = no wheeze because no air is moving. Intubation is imminent.' },
    { id:'q-asthma-3', topic:'asthma', course:'rcp103', difficulty:1,
      q:'In the Asthma Action Plan, the RED zone PEFR is:',
      choices:['80–100% personal best','50–79%','< 50%','> 100%'], correct:2,
      explanation:'RED zone = PEFR < 50% personal best — emergency. Use rescue inhaler + oral steroids + call 911.' },

    // ABG (3)
    { id:'q-abg-1', topic:'abg', course:'rcp103', difficulty:1,
      q:'ABG: pH 7.16, PaCO2 79, HCO3 26. Interpret:',
      choices:['Acute respiratory acidosis','Chronic resp acidosis','Metabolic alkalosis','Metabolic acidosis'], correct:0,
      explanation:'Low pH + high PaCO2 + normal HCO3 = acute (uncompensated) respiratory acidosis.' },
    { id:'q-abg-2', topic:'abg', course:'rcp103', difficulty:2,
      q:'Anion gap formula:',
      choices:['Na – Cl','Na – (Cl + HCO3)','Cl – HCO3','HCO3 – Na'], correct:1,
      explanation:'Anion Gap = Na+ – (Cl– + HCO3–). Normal range 8–12 mEq/L.' },
    { id:'q-abg-3', topic:'abg', course:'rcp103', difficulty:2,
      q:'"MUDPILES" describes causes of:',
      choices:['Normal anion gap metabolic acidosis','Elevated anion gap metabolic acidosis','Metabolic alkalosis','Respiratory acidosis'], correct:1,
      explanation:'MUDPILES = Methanol, Uremia, DKA, Propylene glycol, Iron/INH, Lactic, Ethylene glycol, Salicylates.' },

    // ARDS (2)
    { id:'q-ards-1', topic:'ards', course:'rcp103', difficulty:2,
      q:'Mild ARDS P/F ratio range:',
      choices:['>400','300–400','200–300','100–200'], correct:2,
      explanation:'Berlin: Mild 200–300, Moderate 100–200, Severe ≤100 (with PEEP ≥ 5).' },
    { id:'q-ards-2', topic:'ards', course:'rcp103', difficulty:1,
      q:'Lung-protective ventilation tidal volume in ARDS is:',
      choices:['10–12 mL/kg actual weight','8 mL/kg actual weight','4–6 mL/kg ideal body weight','15 mL/kg'], correct:2,
      explanation:'ARDSnet protocol: 4–6 mL/kg of IDEAL/predicted body weight (not actual).' },

    // Corticosteroids (3)
    { id:'q-cort-1', topic:'corticosteroids', course:'rcp104', difficulty:1,
      q:"Pulmicort's generic name is?",
      choices:['Fluticasone','Budesonide','Beclomethasone','Mometasone'], correct:1,
      explanation:'Pulmicort = budesonide (inhaled corticosteroid).' },
    { id:'q-cort-2', topic:'corticosteroids', course:'rcp104', difficulty:2,
      q:'Glucocorticoid endogenous production follows what rhythm?',
      choices:['Lunar','Circadian (peak AM)','Random','Weekly'], correct:1,
      explanation:'Glucocorticoids follow a circadian rhythm with peak cortisol release in the early morning.' },
    { id:'q-cort-3', topic:'corticosteroids', course:'rcp104', difficulty:1,
      q:'Most common local side effect of inhaled corticosteroids:',
      choices:['Hypertension','Oral candidiasis','Hyperglycemia','Osteoporosis'], correct:1,
      explanation:'Oral candidiasis (thrush) and dysphonia — rinse mouth after use.' },

    // Diuretics (3)
    { id:'q-diur-1', topic:'diuretics', course:'rcp104', difficulty:1,
      q:'Most potent class of diuretic:',
      choices:['Thiazide','Loop','Potassium-sparing','Osmotic'], correct:1,
      explanation:'Loop diuretics (e.g., furosemide) are the most potent — act on thick ascending limb.' },
    { id:'q-diur-2', topic:'diuretics', course:'rcp104', difficulty:2,
      q:'Mannitol is what kind of diuretic, used for what?',
      choices:['Thiazide; HTN','Loop; HF','Osmotic; cerebral edema','K-sparing; CHF'], correct:2,
      explanation:'Mannitol is an OSMOTIC diuretic used for cerebral edema and increased ICP.' },
    { id:'q-diur-3', topic:'diuretics', course:'rcp104', difficulty:2,
      q:'Approximately what % of cardiac output flows through the renal system?',
      choices:['5%','10%','25%','50%'], correct:2,
      explanation:'About 25% of CO flows through the kidneys (renal blood flow ~1200 mL/min).' },
  ];

  window.ALL_SCENARIOS = [
    {
      id: 'er-bay-4', title: 'ER Bay 4: 62yo Chronic Smoker', course: 'rcp103',
      intro: 'A 62-year-old with 40 pack-year smoking history presents with worsening SOB and productive cough.',
      vitals: { rr: 32, spo2: 84, hr: 110, bp: '142/88' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'First action?',
          options: [
            { text: 'Place on 100% NRB',           hpDelta: -25, explain: 'Wipes hypoxic drive in chronic CO2 retainers — dangerous.', next: 'd2' },
            { text: 'Titrate O2 to SpO2 88–92%',   hpDelta: +10, explain: 'Correct — preserves hypoxic drive.', next: 'd2' },
            { text: 'Intubate immediately',        hpDelta: -10, explain: 'Premature; trial BiPAP first.',     next: 'd2' },
          ]},
        { id: 'd2', prompt: 'ABG: pH 7.22, PaCO2 88, HCO3 38, PaO2 58 — interpret:',
          options: [
            { text: 'Acute respiratory acidosis',          hpDelta: +5,  explain: 'Partial — HCO3 is elevated, suggesting chronic component.', next: 'd3' },
            { text: 'Acute-on-chronic respiratory acidosis', hpDelta: +15, explain: 'Correct — chronic CO2 retainer (high HCO3) with acute exacerbation.', next: 'd3' },
            { text: 'Pure metabolic alkalosis',            hpDelta: -15, explain: 'Wrong — pH is acidemic.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Next intervention?',
          options: [
            { text: 'BiPAP 12/5',                hpDelta: +20, explain: 'First-line for hypercapnic respiratory failure in COPD.', next: null },
            { text: 'Bronchodilator only',       hpDelta: -5,  explain: 'Undertreated — patient needs ventilatory support.',     next: null },
            { text: 'Sedate and intubate now',   hpDelta: -10, explain: 'Too aggressive; try BiPAP first.',                     next: null },
          ]},
      ],
    },
    {
      id: 'icu-101', title: 'ICU 101: Post-Op ARDS', course: 'rcp103',
      intro: '54yo s/p emergent bowel surgery for sepsis. Day 2 ICU: PaO2/FiO2 = 150 on FiO2 0.8. Bilateral infiltrates on CXR.',
      vitals: { rr: 28, spo2: 89, hr: 118, bp: '108/62' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Diagnose severity:',
          options: [
            { text: 'Mild ARDS',     hpDelta: -5, explain: 'P/F 150 = moderate.', next: 'd2' },
            { text: 'Moderate ARDS', hpDelta: +15, explain: 'Correct — P/F 100–200 with PEEP ≥ 5.', next: 'd2' },
            { text: 'Pneumonia, not ARDS', hpDelta: -15, explain: 'Bilateral infiltrates + sepsis + P/F < 300 = ARDS.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'Ventilator strategy?',
          options: [
            { text: 'VT 4–6 mL/kg IBW, PEEP per table', hpDelta: +20, explain: 'ARDSnet lung-protective ventilation.', next: 'd3' },
            { text: 'VT 10 mL/kg actual weight',       hpDelta: -20, explain: 'Causes ventilator-induced lung injury.', next: 'd3' },
            { text: 'High-frequency oscillation',      hpDelta: -10, explain: 'Not first-line; HFOV trials showed no mortality benefit.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient remains hypoxemic. P/F now 110. Next?',
          options: [
            { text: 'Prone positioning',          hpDelta: +20, explain: 'Indicated for P/F < 150 in moderate-severe ARDS.', next: null },
            { text: 'Increase VT to 8 mL/kg',     hpDelta: -15, explain: 'Violates lung-protective strategy.', next: null },
            { text: 'Stop PEEP',                  hpDelta: -20, explain: 'PEEP is critical for oxygenation in ARDS.', next: null },
          ]},
      ],
    },
  ];
})();
```

- [ ] **Step 3: Verify in browser**

```bash
open /Users/lourdsonfernando/RCPStudyGame/index.html
```

In browser console, type:
```js
ALL_BOSSES.length;       // 6
ALL_QUESTIONS.length;    // 17
ALL_SCENARIOS.length;    // 2
```

Expected: those exact numbers in the console.

- [ ] **Step 4: Commit**

```bash
git add content/
git commit -q -m "feat: stub content — bosses, questions, scenarios for dev"
```

---

## Task 6: Home Screen

**Files:**
- Create: `js/screens/home.js`

- [ ] **Step 1: Create `js/screens/home.js`**

```js
/* ============================================================
   HOME SCREEN
   ============================================================ */
App.registerScreen('home', ({ root, state }) => {
  const prog = State.xpProgressInCurrentLevel(state);
  const title = State.titleForLevel(state.level);
  const xpNext = State.xpForNextLevel(state.level);
  const dailyOn = State.isDailyAvailable(state);
  const dailyBoss = state.dailyChallenge.bossId
    ? (window.ALL_BOSSES || []).find(b => b.id === state.dailyChallenge.bossId)
    : null;

  root.innerHTML = `
    <div class="t-center t-lg t-gold" style="margin:20px 0 8px;">⚕️ RCP STUDY GAME</div>
    <div class="t-center t-xs t-mute" style="margin-bottom:18px;">FINAL EXAM PREP · POCKET EDITION</div>

    <div class="panel">
      <div class="xp-header">
        <span class="lvl-txt">★ LVL ${state.level} · ${title.toUpperCase()}</span>
        <span class="streak-txt">🔥 ×${state.streak.count}</span>
      </div>
      <div style="height:6px;"></div>
      <div class="xp-track"><div class="xp-fill" style="width:${(prog.ratio * 100).toFixed(0)}%"></div></div>
      <div class="xp-sub">${state.xp} / ${xpNext} XP · ${state.gold}g</div>
    </div>

    ${dailyOn && dailyBoss ? `
    <button class="btn btn-block btn-primary" data-go="daily">
      <span>📅 DAILY CHALLENGE</span>
      <span class="spacer"></span>
      <span class="t-xs t-dim">${dailyBoss.emoji} ${dailyBoss.name}</span>
    </button>
    ` : `
    <div class="panel t-center t-mute t-sm">📅 Daily challenge complete ✓</div>
    `}

    <button class="btn btn-block" data-go="course-mode" data-course="rcp103">
      <span>🫁 RCP 103 · DISEASE & PATHO</span>
    </button>
    <button class="btn btn-block" data-go="course-mode" data-course="rcp104">
      <span>💊 RCP 104 · PHARMACOLOGY</span>
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block" data-go="settings"><span>⚙️ SETTINGS</span></button>
  `;

  root.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.dataset.go;
      if (dest === 'daily') {
        // Daily challenge: route to battle directly with the assigned boss
        App.goto('battle', { course: state.dailyChallenge.course, bossId: state.dailyChallenge.bossId, isDaily: true });
      } else if (dest === 'course-mode') {
        App.goto('course-mode', { course: btn.dataset.course });
      } else {
        App.goto(dest);
      }
    });
  });
});
```

- [ ] **Step 2: Verify in browser**

```bash
open /Users/lourdsonfernando/RCPStudyGame/index.html
```

Expected: Home screen shows title, level/XP bar, daily challenge button, two course buttons, settings button. No console errors. Clicking a button moves to a screen with "not implemented" placeholder.

- [ ] **Step 3: Commit**

```bash
git add js/screens/home.js
git commit -q -m "feat: home screen — title, XP/level summary, daily, course pick"
```

---

## Task 7: Course & Mode Select Screen

**Files:**
- Create: `js/screens/course-mode.js`

- [ ] **Step 1: Create `js/screens/course-mode.js`**

```js
/* ============================================================
   COURSE-MODE SELECT — after picking a course, pick a mode.
   ctx: { course: 'rcp103' | 'rcp104' }
   ============================================================ */
App.registerScreen('course-mode', ({ root, state, ctx }) => {
  const course = ctx.course || 'rcp103';
  const courseLabel = course === 'rcp103' ? 'RCP 103 · DISEASE & PATHO' : 'RCP 104 · PHARMACOLOGY';

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-dim">${courseLabel}</span>
      <span></span>
    </div>

    <div class="t-center t-lg" style="margin:30px 0 6px;">PICK A MODE</div>
    <div class="t-center t-xs t-mute" style="margin-bottom:18px;">Choose your training</div>

    <button class="btn btn-block btn-primary" data-mode="battle">
      <span style="font-size:24px;">⚡</span>
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:4px;">
        <span>BOSS BATTLE</span>
        <span class="t-xs t-dim">Topic bosses · HP combat · items</span>
      </div>
    </button>

    <button class="btn btn-block" data-mode="crisis">
      <span style="font-size:24px;">🏥</span>
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:4px;">
        <span>PATIENT CRISIS</span>
        <span class="t-xs t-dim">Clinical scenarios · branching decisions</span>
      </div>
    </button>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));

  root.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mode;
      if (m === 'battle') App.goto('boss-select', { course });
      else App.goto('scenario-select', { course });
    });
  });
});
```

- [ ] **Step 2: Verify in browser**

Open `index.html`, click RCP 103. Expected: see "PICK A MODE" with two large buttons. Back button returns home. Selecting BATTLE goes to boss-select (placeholder), CRISIS goes to scenario-select (placeholder).

- [ ] **Step 3: Commit**

```bash
git add js/screens/course-mode.js
git commit -q -m "feat: course-mode select screen"
```

---

## Task 8: Boss Select Screen

**Files:**
- Create: `js/screens/boss-select.js`

- [ ] **Step 1: Create `js/screens/boss-select.js`**

```js
/* ============================================================
   BOSS-SELECT — grid of bosses for the chosen course
   ctx: { course: 'rcp103' | 'rcp104' }
   ============================================================ */
App.registerScreen('boss-select', ({ root, state, ctx }) => {
  const course = ctx.course;
  const all = (window.ALL_BOSSES || []).filter(b => b.course === course);

  // Unlock rule: unlockedByDefault OR player has defeated ANY boss
  const anyDefeated = state.defeatedBosses.length > 0;
  function isUnlocked(b) { return b.unlockedByDefault || anyDefeated; }

  const courseLabel = course === 'rcp103' ? 'RCP 103 · DISEASE' : 'RCP 104 · PHARMACOLOGY';

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">⚡ BOSS SELECT</span>
      <span class="t-sm t-dim">${courseLabel}</span>
    </div>

    <div class="t-xs t-mute t-center" style="margin: 8px 0;">
      Defeated: ${state.defeatedBosses.filter(id => all.some(b => b.id === id)).length} / ${all.length}
    </div>

    <div class="grid-2">
      ${all.map(b => {
        const unlocked = isUnlocked(b);
        const defeated = state.defeatedBosses.includes(b.id);
        return `
          <div class="tile ${unlocked ? '' : 'locked'} ${defeated ? 'defeated' : ''}" data-boss-id="${b.id}">
            <div class="tile-emoji">${unlocked ? b.emoji : '🔒'}</div>
            <div class="tile-name">${unlocked ? b.name : '???'}</div>
            <div class="tile-sub">${unlocked ? (b.description || '') : 'LOCKED'}</div>
            ${defeated ? '<div class="tile-badge">✓ DEFEATED</div>' : ''}
          </div>`;
      }).join('')}
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('course-mode', { course }));

  root.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('locked')) { App.toast('Defeat another boss to unlock'); return; }
      const bossId = tile.dataset.bossId;
      App.goto('prep-camp', { course, bossId });
    });
  });
});
```

- [ ] **Step 2: Verify in browser**

Navigate: Home → RCP 103 → BOSS BATTLE. Expected: see 4 RCP 103 boss tiles (3 unlocked, 1 locked w/ 🔒). Tapping unlocked tile → prep-camp placeholder. Tapping locked → toast "Defeat another boss to unlock".

- [ ] **Step 3: Commit**

```bash
git add js/screens/boss-select.js
git commit -q -m "feat: boss-select screen with locked/defeated states"
```

---

## Task 9: battle.js — Boss Battle Engine

**Files:**
- Create: `js/engine/battle.js`

- [ ] **Step 1: Create `js/engine/battle.js`**

```js
/* ============================================================
   BATTLE ENGINE — boss fight session state machine
   Exposes `Battle` global.
   ============================================================ */
(function (global) {
  'use strict';

  const QUESTIONS_PER_FIGHT = 10;
  const NORMAL_HIT = 10;
  const CRIT_HIT   = 15;
  const PLAYER_DMG = 15;

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Build a fresh battle session.
   * opts:
   *   boss: { id, name, emoji, hp, questionTopics, course }
   *   playerMaxHp: number
   *   equipped: array of item keys
   *   isDaily: boolean (disables items)
   *   questionPool: array of question objects (already filtered to topic)
   */
  function start({ boss, playerMaxHp, equipped, isDaily, questionPool }) {
    const items = isDaily ? [] : (equipped || []).slice();
    const questions = shuffle(questionPool).slice(0, QUESTIONS_PER_FIGHT);

    return {
      boss: { ...boss },
      bossHp: boss.hp,
      bossMaxHp: boss.hp,
      playerHp: playerMaxHp,
      playerMaxHp,
      items,
      itemsConsumed: [],
      questions,
      qIndex: 0,
      streak: 0,
      correctCount: 0,
      hintUsedThisQ: false,
      shieldQueued: false,    // shield rune absorbs the NEXT wrong answer
      reviveAvailable: items.includes('reviveCharm'),
      doubleXpActive: items.includes('doubleXpTome'),
      isDaily: !!isDaily,
      outcome: null,          // 'victory' | 'defeat' | null
      xpEarned: 0,
      goldEarned: 0,
    };
  }

  function currentQ(b) { return b.questions[b.qIndex] || null; }
  function progress(b) { return { idx: b.qIndex, total: b.questions.length }; }

  /**
   * Resolves an answer. Returns event object:
   *   { correct: bool, bossHpDelta, playerHpDelta, crit, shielded, gameOver }
   */
  function answer(b, choiceIdx) {
    const q = currentQ(b);
    if (!q || b.outcome) return { invalid: true };

    const isCorrect = choiceIdx === q.correct;
    let bossHpDelta = 0;
    let playerHpDelta = 0;
    let crit = false;
    let shielded = false;

    if (isCorrect) {
      b.streak += 1;
      b.correctCount += 1;
      crit = b.streak >= 3;
      const dmg = crit ? CRIT_HIT : NORMAL_HIT;
      bossHpDelta = -dmg;
      b.bossHp = Math.max(0, b.bossHp - dmg);
    } else {
      b.streak = 0;
      if (b.shieldQueued) {
        shielded = true;
        b.shieldQueued = false;
      } else {
        playerHpDelta = -PLAYER_DMG;
        b.playerHp = Math.max(0, b.playerHp - PLAYER_DMG);
      }
    }

    // advance
    b.qIndex += 1;
    b.hintUsedThisQ = false;

    // outcome
    let gameOver = false;
    if (b.bossHp <= 0) {
      b.outcome = 'victory'; gameOver = true;
    } else if (b.playerHp <= 0) {
      if (b.reviveAvailable) {
        b.playerHp = 1;
        b.reviveAvailable = false;
        b.itemsConsumed.push('reviveCharm');
      } else {
        b.outcome = 'defeat'; gameOver = true;
      }
    } else if (b.qIndex >= b.questions.length) {
      // ran out of questions before killing boss
      b.outcome = b.bossHp <= 0 ? 'victory' : 'defeat';
      gameOver = true;
    }

    return { correct: isCorrect, bossHpDelta, playerHpDelta, crit, shielded, gameOver, explanation: q.explanation };
  }

  /**
   * Uses an item. Returns { used, effect }.
   * key: 'healthPotion' | 'hintScroll' | 'shieldRune'  (revive + double XP auto-apply)
   */
  function useItem(b, key) {
    const i = b.items.indexOf(key);
    if (i < 0) return { used: false };
    b.items.splice(i, 1);
    b.itemsConsumed.push(key);

    if (key === 'healthPotion') {
      const heal = Math.min(25, b.playerMaxHp - b.playerHp);
      b.playerHp += heal;
      return { used: true, effect: 'heal', amount: heal };
    }
    if (key === 'hintScroll') {
      b.hintUsedThisQ = true;
      const q = currentQ(b);
      if (!q) return { used: true, effect: 'hint', removed: [] };
      // remove 2 random wrong choices (not the correct one)
      const wrongs = [0,1,2,3].filter(i => i !== q.correct);
      const removed = shuffle(wrongs).slice(0, 2);
      return { used: true, effect: 'hint', removed };
    }
    if (key === 'shieldRune') {
      b.shieldQueued = true;
      return { used: true, effect: 'shield' };
    }
    return { used: false };
  }

  /**
   * Compute end-of-battle rewards. Call after b.outcome is set.
   * playerLevel is used by addXp to figure out level-ups; here we just compute amounts.
   */
  function computeRewards(b) {
    let xp = b.correctCount * 10;
    let gold = b.correctCount * 5;
    if (b.outcome === 'victory') {
      xp += 50;
      gold += 100;
    }
    if (b.doubleXpActive) xp *= 2;
    if (b.isDaily && b.outcome === 'victory') {
      xp += 75;
      gold += 50;
    }
    b.xpEarned = xp;
    b.goldEarned = gold;
    return { xp, gold };
  }

  global.Battle = { start, currentQ, progress, answer, useItem, computeRewards };
})(window);
```

- [ ] **Step 2: Add a battle section to `test-engine.html`** — append before the summary `<h2>`:

Open `test-engine.html`. Find the line `// ─── Summary ─` and INSERT this block above it:

```js
    // ─── Battle ────────────────────────────────────────────
    section('Battle');
    const fakeQs = [
      { id:'a', topic:'x', course:'rcp103', q:'A?', choices:['1','2','3','4'], correct:0, explanation:'' },
      { id:'b', topic:'x', course:'rcp103', q:'B?', choices:['1','2','3','4'], correct:1, explanation:'' },
      { id:'c', topic:'x', course:'rcp103', q:'C?', choices:['1','2','3','4'], correct:2, explanation:'' },
      { id:'d', topic:'x', course:'rcp103', q:'D?', choices:['1','2','3','4'], correct:3, explanation:'' },
      { id:'e', topic:'x', course:'rcp103', q:'E?', choices:['1','2','3','4'], correct:0, explanation:'' },
      { id:'f', topic:'x', course:'rcp103', q:'F?', choices:['1','2','3','4'], correct:1, explanation:'' },
      { id:'g', topic:'x', course:'rcp103', q:'G?', choices:['1','2','3','4'], correct:2, explanation:'' },
      { id:'h', topic:'x', course:'rcp103', q:'H?', choices:['1','2','3','4'], correct:3, explanation:'' },
      { id:'i', topic:'x', course:'rcp103', q:'I?', choices:['1','2','3','4'], correct:0, explanation:'' },
      { id:'j', topic:'x', course:'rcp103', q:'J?', choices:['1','2','3','4'], correct:1, explanation:'' },
    ];
    const fakeBoss = { id:'x', name:'Test', emoji:'👾', hp:100, course:'rcp103', questionTopics:['x'] };
    // Force unshuffled order by stubbing Math.random
    const _r = Math.random; Math.random = () => 0.5;

    let bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: [], isDaily: false, questionPool: fakeQs });
    check('boss start hp 100', bt.bossHp === 100);
    check('player start hp 80', bt.playerHp === 80);
    check('10 questions queued', bt.questions.length === 10);

    // Correct answer on q0 (q.correct depends on the shuffled order; just answer per the q)
    let q = Battle.currentQ(bt);
    let res = Battle.answer(bt, q.correct);
    check('correct answer reduces boss hp by 10', res.correct && bt.bossHp === 90);

    // Wrong answer: pick (correct + 1) % 4
    q = Battle.currentQ(bt);
    res = Battle.answer(bt, (q.correct + 1) % 4);
    check('wrong answer reduces player hp by 15', !res.correct && bt.playerHp === 65);

    // Shield rune absorbs next wrong
    bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: ['shieldRune'], isDaily: false, questionPool: fakeQs });
    Battle.useItem(bt, 'shieldRune');
    q = Battle.currentQ(bt);
    res = Battle.answer(bt, (q.correct + 1) % 4);
    check('shield absorbs wrong, hp unchanged', !res.correct && res.shielded && bt.playerHp === 80);

    // Health potion heals up to 25
    bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: ['healthPotion'], isDaily: false, questionPool: fakeQs });
    bt.playerHp = 50;
    const eff = Battle.useItem(bt, 'healthPotion');
    check('potion heals 25', eff.effect === 'heal' && bt.playerHp === 75);

    // Crit on streak of 3
    bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: [], isDaily: false, questionPool: fakeQs });
    for (let k = 0; k < 3; k++) { q = Battle.currentQ(bt); Battle.answer(bt, q.correct); }
    check('3 correct → boss hp 100 - 10 -10 -15 = 65', bt.bossHp === 65);

    // Daily disables items
    bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: ['healthPotion','shieldRune'], isDaily: true, questionPool: fakeQs });
    check('daily strips items', bt.items.length === 0);

    // Rewards computation
    bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: [], isDaily: false, questionPool: fakeQs });
    bt.correctCount = 8; bt.outcome = 'victory';
    const rew = Battle.computeRewards(bt);
    check('victory rewards: 8*10 +50 = 130 xp', rew.xp === 130);
    check('victory rewards: 8*5 +100 = 140 gold', rew.gold === 140);

    // Double XP doubles
    bt = Battle.start({ boss: fakeBoss, playerMaxHp: 80, equipped: ['doubleXpTome'], isDaily: false, questionPool: fakeQs });
    bt.correctCount = 5; bt.outcome = 'victory';
    const rew2 = Battle.computeRewards(bt);
    check('double xp tome doubles', rew2.xp === (5*10 + 50) * 2);

    Math.random = _r;
```

- [ ] **Step 3: Run `test-engine.html` in browser**

```bash
open /Users/lourdsonfernando/RCPStudyGame/test-engine.html
```

Expected: green ✓ for all assertions (state + battle sections), green ALL PASSED summary.

- [ ] **Step 4: Commit**

```bash
git add js/engine/battle.js test-engine.html
git commit -q -m "feat: battle.js engine — HP combat, items, crits, rewards"
```

---

## Task 10: Battle Screen

**Files:**
- Create: `js/screens/battle.js`

- [ ] **Step 1: Create `js/screens/battle.js`**

```js
/* ============================================================
   BATTLE SCREEN — drives a Battle session and renders combat
   ctx: { course, bossId, isDaily? }
   ============================================================ */
App.registerScreen('battle', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const questionPool = (window.ALL_QUESTIONS || []).filter(
    q => boss.questionTopics.includes(q.topic) && q.course === boss.course
  );
  if (questionPool.length < 5) {
    root.innerHTML = `<div class="panel t-red t-sm">Not enough questions for this boss yet (${questionPool.length}). Content generation pending.</div>
      <button class="btn btn-block" data-back>← BACK</button>`;
    root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));
    return;
  }

  // Initialize session (stored on closure)
  const session = Battle.start({
    boss, playerMaxHp: state.maxHp,
    equipped: state.equipped, isDaily: !!ctx.isDaily,
    questionPool,
  });

  // Remove equipped items from inventory now (they're "in use")
  if (!ctx.isDaily) {
    session.items.forEach(k => State.consumeItem(state, k));
    State.clearEquipped(state);
    State.save(state);
  }

  let hintRemoved = [];

  function render() {
    const q = Battle.currentQ(session);
    const prog = Battle.progress(session);
    const bossPct  = (session.bossHp   / session.bossMaxHp)   * 100;
    const playerPct= (session.playerHp / session.playerMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="mode-tag">⚡ BOSS BATTLE${session.isDaily ? ' · DAILY' : ''}</span>
        <span class="course-tag">${boss.course.toUpperCase()}</span>
        <span class="chapter-tag">Q ${Math.min(prog.idx+1, prog.total)}/${prog.total}</span>
      </div>

      <div class="panel" style="display:flex;flex-direction:column;gap:8px;">
        <div class="hp-row">
          <span class="hp-name">PLAYER</span>
          <div class="hp-track"><div class="hp-fill player" style="width:${playerPct}%"></div></div>
          <span class="hp-val">${session.playerHp}</span>
        </div>
        <div class="hp-row">
          <span class="hp-name">BOSS</span>
          <div class="hp-track"><div class="hp-fill boss" style="width:${bossPct}%"></div></div>
          <span class="hp-val">${session.bossHp}</span>
        </div>
      </div>

      <div class="arena" id="arena">
        <div class="boss-emoji">${boss.emoji}</div>
        <div class="boss-name">${boss.name}</div>
        <div class="boss-sub">${boss.description || ''}</div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ Q ${prog.idx+1} / ${prog.total}${session.streak >= 2 ? ' · 🔥 STREAK ' + session.streak : ''}</div>
        <div class="q-text">${q.q}</div>
      </div>

      <div class="answers" id="answers">
        ${q.choices.map((c, i) => `
          <button class="ans-btn ${hintRemoved.includes(i) ? 'disabled-vis' : ''}" data-i="${i}">
            <span class="ans-key">${'ABCD'[i]}</span>${c}
          </button>
        `).join('')}
      </div>

      ${session.items.length ? `
      <div class="panel" style="display:flex; gap:6px; flex-wrap:wrap;">
        <div class="t-xs t-mute" style="width:100%;">ITEMS</div>
        ${session.items.map(k => `
          <button class="item-btn" data-use="${k}">${ITEM_EMOJI[k]} ${ITEM_LABEL[k]}</button>
        `).join('')}
      </div>` : ''}
    `;

    // Click answers
    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled-vis')) return;
        const i = +btn.dataset.i;
        handleAnswer(i, btn);
      });
    });

    // Item buttons
    root.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => useItem(btn.dataset.use));
    });
  }

  function handleAnswer(idx, btn) {
    const q = Battle.currentQ(session);
    const correctIdx = q.correct;
    const res = Battle.answer(session, idx);
    hintRemoved = [];

    // Visual feedback
    btn.classList.add(res.correct ? 'correct' : 'wrong');
    if (!res.correct) {
      const correctBtn = root.querySelectorAll('.ans-btn')[correctIdx];
      if (correctBtn) correctBtn.classList.add('correct');
      const arena = root.querySelector('#arena');
      if (arena) arena.classList.add('shake');
    } else {
      const arena = root.querySelector('#arena');
      if (arena) arena.classList.add('flash-red');
    }

    // Brief explanation overlay
    const expl = document.createElement('div');
    expl.className = 'explanation';
    expl.textContent = res.explanation;
    const qbox = root.querySelector('.q-box');
    if (qbox) qbox.appendChild(expl);

    root.querySelectorAll('.ans-btn').forEach(b => b.classList.add('disabled-vis'));

    setTimeout(() => {
      if (res.gameOver) endBattle();
      else render();
    }, 1400);
  }

  function useItem(key) {
    const eff = Battle.useItem(session, key);
    if (!eff.used) return;
    if (eff.effect === 'hint') hintRemoved = eff.removed || [];
    if (eff.effect === 'heal') App.toast('💚 +' + eff.amount + ' HP');
    if (eff.effect === 'shield') App.toast('🛡 Shield ready');
    render();
  }

  function endBattle() {
    Battle.computeRewards(session);

    // Award rewards
    const lvlInfo = State.addXp(state, session.xpEarned, { doubleActive: session.doubleXpActive });
    State.addGold(state, session.goldEarned);
    if (session.outcome === 'victory' && !state.defeatedBosses.includes(boss.id)) {
      state.defeatedBosses.push(boss.id);
    }
    if (session.isDaily && session.outcome === 'victory') {
      state.dailyChallenge.completed = true;
      State.tickStreakForDailyComplete(state);
    }
    State.save(state);

    App.goto('results', { session, lvlInfo, course: boss.course, bossId: boss.id, isDaily: session.isDaily });
  }

  render();
});

const ITEM_LABEL = { healthPotion:'Potion', hintScroll:'Hint', shieldRune:'Shield' };
const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡' };
```

- [ ] **Step 2: Verify in browser**

Navigate: Home → RCP 103 → BOSS BATTLE → COPD boss → "ENTER FIGHT" (but prep-camp isn't built — instead, run in console: `App.goto('battle', { course:'rcp103', bossId:'copd' })`).

Expected:
- Battle screen shows top bar, HP bars (player 80, boss 100), boss sprite (cloud emoji), question, 4 answers.
- Clicking the correct answer: boss HP drops by 10, button turns green.
- Clicking wrong: player HP drops by 15, screen shakes, correct answer highlighted green, wrong red.
- After 1.4s, advances to next question.
- After boss HP reaches 0 OR player HP reaches 0 OR 10 questions played → goes to `results` placeholder.

- [ ] **Step 3: Commit**

```bash
git add js/screens/battle.js
git commit -q -m "feat: battle screen — HP bars, questions, items, animations"
```

---

## Task 11: Results Screen (Victory / Defeat)

**Files:**
- Create: `js/screens/results.js`

- [ ] **Step 1: Create `js/screens/results.js`**

```js
/* ============================================================
   RESULTS SCREEN — victory or defeat summary
   ctx: { session, lvlInfo, course, bossId, isDaily }
   ============================================================ */
App.registerScreen('results', ({ root, state, ctx }) => {
  const s = ctx.session;
  const won = s.outcome === 'victory';

  root.innerHTML = `
    <div class="topbar">
      <span></span>
      <span class="t-sm ${won ? 't-green' : 't-red'}">${won ? '★ VICTORY' : '✗ DEFEAT'}</span>
      <span></span>
    </div>

    <div class="arena" style="min-height: 220px;">
      <div class="boss-emoji ${won ? '' : 'calm'}" style="${won ? 'filter: drop-shadow(0 0 16px var(--green));' : ''}">${won ? '🏆' : '💀'}</div>
      <div class="boss-name ${won ? '' : 'calm'}" style="${won ? 'color: var(--green); text-shadow: 0 0 10px var(--green);' : ''}">${won ? 'BOSS DEFEATED!' : 'YOU FELL'}</div>
      <div class="boss-sub">${s.boss.name}</div>
    </div>

    <div class="panel" style="display:flex; flex-direction:column; gap:8px;">
      <div class="t-sm t-dim">REWARDS</div>
      <div class="t-md">📈 XP earned: <span class="t-gold">+${s.xpEarned}</span></div>
      <div class="t-md">🪙 Gold earned: <span class="t-gold">+${s.goldEarned}</span></div>
      <div class="t-md">🎯 Correct: <span class="t-green">${s.correctCount} / ${s.questions.length}</span></div>
      ${ctx.lvlInfo.leveledUp ? `<div class="t-md t-gold">⭐ LEVEL UP! → LVL ${ctx.lvlInfo.newLevel} ${State.titleForLevel(ctx.lvlInfo.newLevel).toUpperCase()}</div>` : ''}
    </div>

    <button class="btn btn-block btn-primary" data-action="again">⚔️ FIGHT AGAIN</button>
    <button class="btn btn-block" data-action="select">🗺 BOSS SELECT</button>
    <button class="btn btn-block" data-action="home">🏠 HOME</button>
  `;

  // Show level-up overlay if applicable
  if (ctx.lvlInfo.leveledUp) {
    setTimeout(() => App.goto('level-up', { newLevel: ctx.lvlInfo.newLevel, returnTo: 'results', returnCtx: ctx }), 400);
  }

  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'again')  App.goto('prep-camp',   { course: ctx.course, bossId: ctx.bossId });
      if (a === 'select') App.goto('boss-select', { course: ctx.course });
      if (a === 'home')   App.goto('home');
    });
  });
});
```

- [ ] **Step 2: Verify in browser**

After a battle ends, results screen shows trophy or skull, XP/gold earned, correct count, and 3 buttons. Level-up overlay triggers if applicable (placeholder for now since level-up screen isn't built yet — falls through).

- [ ] **Step 3: Commit**

```bash
git add js/screens/results.js
git commit -q -m "feat: results screen — victory/defeat summary, rewards"
```

---

## Task 12: Prep-Camp Screen

**Files:**
- Create: `js/screens/prep-camp.js`

- [ ] **Step 1: Create `js/screens/prep-camp.js`**

```js
/* ============================================================
   PREP-CAMP — choose train / shop / equip / enter fight
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('prep-camp', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">⚔️ PREP CAMP</span>
      <span class="t-sm t-dim">${boss.course.toUpperCase()}</span>
    </div>

    <div class="arena" style="min-height: 150px;">
      <div class="boss-emoji">${boss.emoji}</div>
      <div class="boss-name">${boss.name}</div>
      <div class="boss-sub">${boss.description || ''}</div>
    </div>

    <div class="panel" style="display:flex; flex-direction:column; gap:6px;">
      <div class="xp-header">
        <span class="lvl-txt">★ LVL ${state.level}</span>
        <span class="gold-txt">🪙 ${state.gold}g</span>
      </div>
      <div class="xp-sub">EQUIPPED: ${state.equipped.length ? state.equipped.map(k => ITEM_EMOJI[k]).join(' ') : '—'}</div>
    </div>

    <button class="btn btn-block" data-go="training">🏋️ TRAIN
      <span class="spacer"></span>
      <span class="t-xs t-dim">+5 XP / +10g per correct</span>
    </button>
    <button class="btn btn-block" data-go="shop">🪙 SHOP
      <span class="spacer"></span>
      <span class="t-xs t-dim">Buy items</span>
    </button>
    <button class="btn btn-block" data-go="equip">🎒 EQUIP
      <span class="spacer"></span>
      <span class="t-xs t-dim">Up to 3 items</span>
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block btn-primary" data-go="fight">⚔️ ENTER BOSS FIGHT</button>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('boss-select', { course: ctx.course }));

  root.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.go;
      if (d === 'training') App.goto('training',  { course: ctx.course, bossId: ctx.bossId });
      if (d === 'shop')     App.goto('settings',  { /* placeholder; shop is integrated into prep-camp via modal in Task 14 */ });
      if (d === 'equip')    App.goto('settings',  { /* placeholder for Task 15 */ });
      if (d === 'fight')    App.goto('battle',    { course: ctx.course, bossId: ctx.bossId });
    });
  });
});

const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡', reviveCharm:'💖', doubleXpTome:'⚡' };
```

- [ ] **Step 2: Verify in browser**

Navigate: Home → RCP 103 → BOSS BATTLE → pick COPD boss. Expected: prep-camp shows boss sprite, level/gold panel, 4 buttons (Train, Shop, Equip, Enter Fight). Train and Enter Fight work (other two placeholder).

- [ ] **Step 3: Commit**

```bash
git add js/screens/prep-camp.js
git commit -q -m "feat: prep-camp screen — train/shop/equip/fight menu"
```

---

## Task 13: Training Screen

**Files:**
- Create: `js/screens/training.js`

- [ ] **Step 1: Create `js/screens/training.js`**

```js
/* ============================================================
   TRAINING — repeated flashcard questions for XP + gold
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('training', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const pool = (window.ALL_QUESTIONS || []).filter(
    q => boss.questionTopics.includes(q.topic) && q.course === boss.course
  );

  let queue = shuffle(pool);
  let session = { correct: 0, total: 0, xp: 0, gold: 0 };
  let currentQ = null;
  let revealed = false;

  function shuffle(a) { return a.slice().sort(() => Math.random() - 0.5); }

  function nextQ() {
    if (!queue.length) queue = shuffle(pool);
    currentQ = queue.pop();
    revealed = false;
    render();
  }

  function render() {
    if (!currentQ) { root.innerHTML = '<div class="panel t-red">No questions available.</div>'; return; }

    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← DONE</button>
        <span class="t-sm t-orange">🏋️ TRAINING</span>
        <span class="t-sm t-dim">${boss.name}</span>
      </div>

      <div class="panel">
        <div class="xp-header">
          <span class="t-green">+${session.xp} XP</span>
          <span class="gold-txt">+${session.gold}g</span>
        </div>
        <div class="xp-sub">${session.correct} / ${session.total} correct this session</div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ FLASHCARD</div>
        <div class="q-text">${currentQ.q}</div>
      </div>

      <div class="answers" id="answers">
        ${currentQ.choices.map((c, i) => `
          <button class="ans-btn" data-i="${i}">
            <span class="ans-key">${'ABCD'[i]}</span>${c}
          </button>
        `).join('')}
      </div>

      <div id="postq"></div>
    `;

    root.querySelector('[data-back]').addEventListener('click', () => {
      State.save(state);
      App.goto('prep-camp', { course: ctx.course, bossId: ctx.bossId });
    });

    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => answer(+btn.dataset.i, btn));
    });
  }

  function answer(idx, btn) {
    if (revealed) return;
    revealed = true;
    const ok = idx === currentQ.correct;
    session.total += 1;
    if (ok) {
      session.correct += 1;
      session.xp += 5;
      session.gold += 10;
      State.addXp(state, 5);
      State.addGold(state, 10);
      State.save(state);
    }

    root.querySelectorAll('.ans-btn').forEach((b, i) => {
      b.classList.add('disabled-vis');
      if (i === currentQ.correct) b.classList.add('correct');
      else if (i === idx) b.classList.add('wrong');
    });

    const post = root.querySelector('#postq');
    post.innerHTML = `
      <div class="explanation">${currentQ.explanation}</div>
      <button class="btn btn-block btn-primary" id="nextq">▶ NEXT QUESTION</button>
    `;
    post.querySelector('#nextq').addEventListener('click', nextQ);
  }

  nextQ();
});
```

- [ ] **Step 2: Verify in browser**

From prep-camp click 🏋️ TRAIN. Expected: a question, click an answer → green/red highlight, explanation shown, NEXT button. Tally at top updates. DONE button returns to prep-camp.

- [ ] **Step 3: Commit**

```bash
git add js/screens/training.js
git commit -q -m "feat: training screen — flashcard loop earns XP/gold"
```

---

## Task 14: shop.js + Shop Modal in Prep-Camp

**Files:**
- Create: `js/engine/shop.js`
- Modify: `js/screens/prep-camp.js`

- [ ] **Step 1: Create `js/engine/shop.js`**

```js
/* ============================================================
   SHOP — item catalog, prices, purchase logic
   ============================================================ */
(function (global) {
  'use strict';

  const ITEMS = [
    { key:'healthPotion', emoji:'🧪', name:'Health Potion',  desc:'Restore 25 HP during battle.',                    price: 50 },
    { key:'hintScroll',   emoji:'🔮', name:'Hint Scroll',    desc:'Remove 2 wrong answers on one question.',         price: 75 },
    { key:'shieldRune',   emoji:'🛡', name:'Shield Rune',    desc:'Absorb 1 wrong answer (no HP loss).',             price:100 },
    { key:'reviveCharm',  emoji:'💖', name:'Revive Charm',   desc:'Auto-revive at 1 HP if you would die.',           price:200 },
    { key:'doubleXpTome', emoji:'⚡', name:'Double XP Tome',  desc:'2× XP earned in your next fight.',                price:150 },
  ];

  function catalog() { return ITEMS.slice(); }
  function priceOf(key) { return (ITEMS.find(i => i.key === key) || {}).price || 0; }
  function buy(state, key) {
    const p = priceOf(key);
    if (!p) return { ok: false, reason: 'unknown item' };
    if (state.gold < p) return { ok: false, reason: 'not enough gold' };
    state.gold -= p;
    State.addItem(state, key, 1);
    return { ok: true };
  }

  global.Shop = { catalog, priceOf, buy, ITEMS };
})(window);
```

- [ ] **Step 2: Replace `js/screens/prep-camp.js`** with a version that includes shop + equip modals inline:

```js
/* ============================================================
   PREP-CAMP — train / shop / equip / enter fight (with modals)
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('prep-camp', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡', reviveCharm:'💖', doubleXpTome:'⚡' };

  let panel = 'menu'; // 'menu' | 'shop' | 'equip'

  function render() {
    if (panel === 'shop')  return renderShop();
    if (panel === 'equip') return renderEquip();
    renderMenu();
  }

  function renderMenu() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">⚔️ PREP CAMP</span>
        <span class="t-sm t-dim">${boss.course.toUpperCase()}</span>
      </div>

      <div class="arena" style="min-height: 150px;">
        <div class="boss-emoji">${boss.emoji}</div>
        <div class="boss-name">${boss.name}</div>
        <div class="boss-sub">${boss.description || ''}</div>
      </div>

      <div class="panel" style="display:flex; flex-direction:column; gap:6px;">
        <div class="xp-header">
          <span class="lvl-txt">★ LVL ${state.level}</span>
          <span class="gold-txt">🪙 ${state.gold}g</span>
        </div>
        <div class="xp-sub">EQUIPPED: ${state.equipped.length ? state.equipped.map(k => ITEM_EMOJI[k]).join(' ') : '—'}</div>
      </div>

      <button class="btn btn-block" data-go="training">🏋️ TRAIN <span class="spacer"></span><span class="t-xs t-dim">+5 XP / +10g</span></button>
      <button class="btn btn-block" data-go="shop">🪙 SHOP <span class="spacer"></span><span class="t-xs t-dim">Buy items</span></button>
      <button class="btn btn-block" data-go="equip">🎒 EQUIP <span class="spacer"></span><span class="t-xs t-dim">Up to 3 items</span></button>

      <div class="spacer"></div>

      <button class="btn btn-block btn-primary" data-go="fight">⚔️ ENTER BOSS FIGHT</button>
    `;

    root.querySelector('[data-back]').addEventListener('click', () => App.goto('boss-select', { course: ctx.course }));
    root.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.go;
        if (d === 'training') App.goto('training', { course: ctx.course, bossId: ctx.bossId });
        else if (d === 'fight') App.goto('battle', { course: ctx.course, bossId: ctx.bossId });
        else { panel = d; render(); }
      });
    });
  }

  function renderShop() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">🪙 SHOP</span>
        <span class="gold-txt t-sm">${state.gold}g</span>
      </div>
      <div class="t-xs t-mute t-center" style="margin: 4px 0 8px;">Buy items to bring into the fight.</div>
      <div id="items"></div>
    `;

    const list = root.querySelector('#items');
    Shop.catalog().forEach(item => {
      const have = state.inventory[item.key] || 0;
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-count">×${have}</div>
          <button class="item-btn" data-buy="${item.key}" ${state.gold < item.price ? 'disabled' : ''}>${item.price}g</button>
        </div>`;
      list.appendChild(row);
    });

    root.querySelector('[data-back]').addEventListener('click', () => { panel = 'menu'; render(); });
    root.querySelectorAll('[data-buy]').forEach(b => {
      b.addEventListener('click', () => {
        const r = Shop.buy(state, b.dataset.buy);
        if (r.ok) { State.save(state); App.toast('Purchased!'); render(); }
        else App.toast(r.reason);
      });
    });
  }

  function renderEquip() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">🎒 EQUIP</span>
        <span class="t-sm t-dim">${state.equipped.length}/3</span>
      </div>
      <div class="t-xs t-mute t-center" style="margin: 4px 0 8px;">Tap to equip / unequip (max 3).</div>
      <div id="items"></div>
    `;
    const list = root.querySelector('#items');

    Shop.catalog().forEach(item => {
      const have = state.inventory[item.key] || 0;
      const equipped = state.equipped.includes(item.key);
      if (have === 0) return;

      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-count">×${have}</div>
          <button class="item-btn ${equipped ? 'equipped' : ''}" data-toggle="${item.key}">${equipped ? '✓ EQUIPPED' : 'EQUIP'}</button>
        </div>`;
      list.appendChild(row);
    });

    if (!list.children.length) {
      list.innerHTML = '<div class="panel t-mute t-center t-sm">No items yet — visit the shop.</div>';
    }

    root.querySelector('[data-back]').addEventListener('click', () => { panel = 'menu'; render(); });
    root.querySelectorAll('[data-toggle]').forEach(b => {
      b.addEventListener('click', () => {
        const key = b.dataset.toggle;
        let eq = state.equipped.slice();
        if (eq.includes(key)) eq = eq.filter(k => k !== key);
        else if (eq.length < 3) eq.push(key);
        else { App.toast('Max 3 items'); return; }
        State.setEquipped(state, eq);
        State.save(state);
        render();
      });
    });
  }

  render();
});
```

- [ ] **Step 3: Verify in browser**

From prep-camp tap SHOP → list of 5 items with prices. Tap an item button: if you have enough gold, count goes up; if not, toast says "not enough gold". To test: open console and run `s = State.load(); s.gold = 500; State.save(s); App.refresh();` then return to shop. Buy 2 potions and 1 shield. Tap EQUIP → see your inventory, equip 2 items. Tap back → menu shows EQUIPPED: 🧪 🛡.

- [ ] **Step 4: Commit**

```bash
git add js/engine/shop.js js/screens/prep-camp.js
git commit -q -m "feat: shop + equip — prep-camp inline panels, gold purchase"
```

---

## Task 15: Battle Item Display Integration

Battle screen already supports items (Task 10). This task just verifies end-to-end and adjusts the prep-camp → battle handoff so equipped items survive correctly.

- [ ] **Step 1: Verify equip → battle flow**

In browser:
1. `s = State.load(); s.gold = 1000; State.save(s); App.refresh();`
2. Home → 103 → Battle → COPD → SHOP — buy 1× Potion, 1× Shield, 1× Hint
3. EQUIP — equip all three
4. ENTER BOSS FIGHT
5. Verify the battle screen shows the 3 item buttons at the bottom
6. Tap shield → toast "Shield ready"
7. Answer wrong → toast notes shield absorbed, player HP unchanged
8. Tap hint → 2 wrong answers go faded/non-clickable
9. Tap potion → toast "+25 HP" (test with player HP < max by taking a hit first)

Expected: all 3 items work as described. Equipped slot in state clears after battle starts.

- [ ] **Step 2: Commit (only if any tweaks were needed — otherwise skip)**

```bash
git add -A
git diff --cached --quiet || git commit -q -m "fix: item handoff prep-camp -> battle"
```

---

## Task 16: crisis.js — Patient Crisis Engine

**Files:**
- Create: `js/engine/crisis.js`

- [ ] **Step 1: Create `js/engine/crisis.js`**

```js
/* ============================================================
   CRISIS ENGINE — branching patient-scenario state machine
   ============================================================ */
(function (global) {
  'use strict';

  /**
   * Start a crisis session.
   * scenario: { id, title, intro, vitals, startingHp, decisions:[ {id, prompt, options:[ {text, hpDelta, explain, next} ]} ] }
   */
  function start(scenario) {
    return {
      scenario,
      patientHp: scenario.startingHp,
      patientMaxHp: scenario.startingHp,
      currentId: scenario.decisions[0]?.id,
      history: [],       // [{ decisionId, optionIdx, hpDelta }]
      outcome: null,     // 'stabilized' | 'rocky' | 'coded'
      xpEarned: 0,
    };
  }

  function currentDecision(c) {
    return c.scenario.decisions.find(d => d.id === c.currentId) || null;
  }

  /**
   * Resolve a choice. Returns { hpDelta, explain, gameOver }.
   */
  function choose(c, optionIdx) {
    const d = currentDecision(c);
    if (!d || c.outcome) return { invalid: true };
    const opt = d.options[optionIdx];
    if (!opt) return { invalid: true };

    c.patientHp = Math.max(0, Math.min(c.patientMaxHp, c.patientHp + opt.hpDelta));
    c.history.push({ decisionId: d.id, optionIdx, hpDelta: opt.hpDelta });

    let gameOver = false;
    if (c.patientHp <= 0) { c.outcome = 'coded'; gameOver = true; }
    else if (!opt.next)   { gameOver = true; computeOutcome(c); }
    else                  { c.currentId = opt.next; }

    return { hpDelta: opt.hpDelta, explain: opt.explain, gameOver };
  }

  function computeOutcome(c) {
    if (c.patientHp <= 0) c.outcome = 'coded';
    else if (c.patientHp > 50) c.outcome = 'stabilized';
    else c.outcome = 'rocky';
  }

  /** Returns { xp, gold } for the outcome. */
  function rewards(c) {
    if (c.outcome === 'stabilized') { c.xpEarned = 100; return { xp: 100, gold: 50 }; }
    if (c.outcome === 'rocky')      { c.xpEarned = 50;  return { xp: 50,  gold: 0  }; }
    c.xpEarned = 10; return { xp: 10, gold: 0 };
  }

  global.Crisis = { start, currentDecision, choose, computeOutcome, rewards };
})(window);
```

- [ ] **Step 2: Append crisis tests to `test-engine.html`** — INSERT this block ABOVE the summary `<h2>`:

```js
    // ─── Crisis ────────────────────────────────────────────
    section('Crisis');
    const scenario = ALL_SCENARIOS[0];
    let c = Crisis.start(scenario);
    check('crisis start hp = startingHp', c.patientHp === scenario.startingHp);
    check('first decision id matches', c.currentId === scenario.decisions[0].id);

    // Pick the +10 option in first decision (titrate O2)
    const titrate = scenario.decisions[0].options.findIndex(o => o.hpDelta === 10);
    let r = Crisis.choose(c, titrate);
    check('+10 hp delta applied', r.hpDelta === 10 && c.patientHp === 70);

    // Pick the +15 option in d2
    const ac = scenario.decisions[1].options.findIndex(o => o.hpDelta === 15);
    Crisis.choose(c, ac);
    check('hp climbs to 85 (cap 60? no, max is startingHp)', c.patientHp === c.patientMaxHp);

    // Pick the +20 option in d3 — should terminate
    const bipap = scenario.decisions[2].options.findIndex(o => o.hpDelta === 20);
    r = Crisis.choose(c, bipap);
    check('final decision terminates', r.gameOver === true);
    check('outcome stabilized', c.outcome === 'stabilized');
    const rw = Crisis.rewards(c);
    check('stabilized rewards 100xp/50g', rw.xp === 100 && rw.gold === 50);

    // Bad-path: pick all minus options → coded
    c = Crisis.start(scenario);
    Crisis.choose(c, scenario.decisions[0].options.findIndex(o => o.hpDelta === -25));
    Crisis.choose(c, scenario.decisions[1].options.findIndex(o => o.hpDelta === -15));
    Crisis.choose(c, scenario.decisions[2].options.findIndex(o => o.hpDelta === -10));
    check('coded after disasters', c.outcome === 'coded');
```

- [ ] **Step 3: Run tests**

```bash
open /Users/lourdsonfernando/RCPStudyGame/test-engine.html
```

Expected: all green ✓.

- [ ] **Step 4: Commit**

```bash
git add js/engine/crisis.js test-engine.html
git commit -q -m "feat: crisis.js engine — branching scenarios + outcome rewards"
```

---

## Task 17: Scenario Select Screen

**Files:**
- Create: `js/screens/scenario-select.js`

- [ ] **Step 1: Create `js/screens/scenario-select.js`**

```js
/* ============================================================
   SCENARIO-SELECT — grid of patient scenarios for the chosen course
   ctx: { course }
   ============================================================ */
App.registerScreen('scenario-select', ({ root, state, ctx }) => {
  const course = ctx.course;
  const all = (window.ALL_SCENARIOS || []).filter(s => s.course === course);
  const completed = (id) => state.completedScenarios.includes(id);

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">🏥 PATIENT CRISIS</span>
      <span class="t-sm t-dim">${course.toUpperCase()}</span>
    </div>
    <div class="t-xs t-mute t-center" style="margin: 8px 0;">
      Completed: ${all.filter(s => completed(s.id)).length} / ${all.length}
    </div>

    ${all.length === 0 ? '<div class="panel t-mute t-center t-sm">No scenarios yet. Content generation pending.</div>' : ''}

    ${all.map(s => `
      <div class="item-row" data-id="${s.id}" style="cursor:pointer;">
        <div class="item-emoji">${completed(s.id) ? '✓' : '🚑'}</div>
        <div class="item-body">
          <div class="item-name">${s.title}</div>
          <div class="item-desc">${s.intro.slice(0, 90)}${s.intro.length > 90 ? '…' : ''}</div>
        </div>
      </div>
    `).join('')}
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('course-mode', { course }));
  root.querySelectorAll('[data-id]').forEach(row => {
    row.addEventListener('click', () => App.goto('crisis', { course, scenarioId: row.dataset.id }));
  });
});
```

- [ ] **Step 2: Verify in browser**

Home → 103 → PATIENT CRISIS. Expected: list of 2 stub scenarios with titles + intro snippets. Tap one → routes to `crisis` placeholder.

- [ ] **Step 3: Commit**

```bash
git add js/screens/scenario-select.js
git commit -q -m "feat: scenario-select screen"
```

---

## Task 18: Crisis Screen (Patient Mode)

**Files:**
- Create: `js/screens/crisis.js`

- [ ] **Step 1: Create `js/screens/crisis.js`**

```js
/* ============================================================
   CRISIS SCREEN — drives a patient-scenario session
   ctx: { course, scenarioId }
   ============================================================ */
App.registerScreen('crisis', ({ root, state, ctx }) => {
  const scenario = (window.ALL_SCENARIOS || []).find(s => s.id === ctx.scenarioId);
  if (!scenario) { root.innerHTML = '<div class="panel t-red">Scenario not found.</div>'; return; }

  const session = Crisis.start(scenario);
  let phase = 'intro';            // 'intro' | 'decision' | 'reveal'
  let lastResult = null;

  function render() {
    if (phase === 'intro')    return renderIntro();
    if (phase === 'decision') return renderDecision();
    if (phase === 'reveal')   return renderReveal();
  }

  function renderIntro() {
    const v = scenario.vitals;
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">🏥 ${scenario.title}</span>
        <span></span>
      </div>

      <div class="arena" style="min-height:140px;">
        <div class="boss-emoji calm">🛏</div>
        <div class="boss-name calm">INCOMING PATIENT</div>
      </div>

      <div class="panel">
        <div class="t-md t-line">${scenario.intro}</div>
      </div>

      <div class="panel">
        <div class="t-sm t-dim">VITAL SIGNS</div>
        <div class="t-md t-line" style="margin-top:6px;">
          RR ${v.rr} · SpO₂ ${v.spo2}% · HR ${v.hr} · BP ${v.bp}
        </div>
      </div>

      <button class="btn btn-block btn-primary" id="begin">▶ BEGIN ASSESSMENT</button>
    `;
    root.querySelector('[data-back]').addEventListener('click', () => App.goto('scenario-select', { course: ctx.course }));
    root.querySelector('#begin').addEventListener('click', () => { phase = 'decision'; render(); });
  }

  function renderDecision() {
    const d = Crisis.currentDecision(session);
    if (!d) return endScenario();
    const pct = (session.patientHp / session.patientMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="t-sm t-orange">🏥 ${scenario.title}</span>
        <span class="t-sm t-dim">${session.history.length + 1} / ${scenario.decisions.length}</span>
      </div>

      <div class="panel">
        <div class="hp-row">
          <span class="hp-name">PATIENT</span>
          <div class="hp-track"><div class="hp-fill patient" style="width:${pct}%"></div></div>
          <span class="hp-val">${session.patientHp}</span>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ DECISION</div>
        <div class="q-text">${d.prompt}</div>
      </div>

      <div class="answers" id="answers">
        ${d.options.map((o, i) => `
          <button class="ans-btn" data-i="${i}">
            <span class="ans-key">${'ABC'[i] || ('OPT '+(i+1))}</span>${o.text}
          </button>
        `).join('')}
      </div>
    `;

    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        lastResult = Crisis.choose(session, i);
        lastResult.optionIdx = i;
        phase = 'reveal';
        render();
      });
    });
  }

  function renderReveal() {
    const d = session.scenario.decisions.find(dd => dd.id === session.history.at(-1).decisionId);
    const i = lastResult.optionIdx;
    const goodSign = lastResult.hpDelta >= 0;
    const pct = (session.patientHp / session.patientMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="t-sm t-orange">🏥 ${scenario.title}</span>
        <span class="t-sm ${goodSign ? 't-green' : 't-red'}">${goodSign ? '+' : ''}${lastResult.hpDelta} HP</span>
      </div>

      <div class="panel">
        <div class="hp-row">
          <span class="hp-name">PATIENT</span>
          <div class="hp-track"><div class="hp-fill patient" style="width:${pct}%"></div></div>
          <span class="hp-val">${session.patientHp}</span>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ YOUR CHOICE</div>
        <div class="q-text">${d.options[i].text}</div>
      </div>

      <div class="panel">
        <div class="t-sm t-dim">RESULT</div>
        <div class="explanation">${lastResult.explain}</div>
      </div>

      <button class="btn btn-block btn-primary" id="next">${lastResult.gameOver ? '▶ SEE OUTCOME' : '▶ CONTINUE'}</button>
    `;
    root.querySelector('#next').addEventListener('click', () => {
      if (lastResult.gameOver) return endScenario();
      phase = 'decision'; render();
    });
  }

  function endScenario() {
    if (!session.outcome) Crisis.computeOutcome(session);
    const rew = Crisis.rewards(session);
    const lvlInfo = State.addXp(state, rew.xp);
    State.addGold(state, rew.gold);
    if (session.outcome === 'stabilized' && !state.completedScenarios.includes(scenario.id)) {
      state.completedScenarios.push(scenario.id);
    }
    State.save(state);
    App.goto('outcome', { session, lvlInfo, course: ctx.course, scenarioId: scenario.id });
  }

  render();
});
```

- [ ] **Step 2: Verify in browser**

Home → 103 → CRISIS → "ER Bay 4". Expected: intro screen with vitals, BEGIN button → decision screen with patient HP bar, 3 options. Click each, see hpDelta applied + explanation, continue, after 3 decisions → outcome (placeholder).

- [ ] **Step 3: Commit**

```bash
git add js/screens/crisis.js
git commit -q -m "feat: crisis screen — intro, decision, reveal phases"
```

---

## Task 19: Outcome Screen

**Files:**
- Create: `js/screens/outcome.js`

- [ ] **Step 1: Create `js/screens/outcome.js`**

```js
/* ============================================================
   OUTCOME SCREEN — patient crisis end state
   ctx: { session, lvlInfo, course, scenarioId }
   ============================================================ */
App.registerScreen('outcome', ({ root, state, ctx }) => {
  const s = ctx.session;
  const outcomeText = {
    stabilized: { emoji:'❤️‍🩹', title:'STABILIZED',         color:'var(--green)' },
    rocky:      { emoji:'⚕️',  title:'SURVIVED BUT ROCKY', color:'var(--orange)' },
    coded:      { emoji:'⚰️',  title:'PATIENT CODED',      color:'var(--red)' },
  }[s.outcome];

  const rew = Crisis.rewards(s);

  root.innerHTML = `
    <div class="topbar">
      <span></span>
      <span class="t-sm" style="color:${outcomeText.color};">${outcomeText.title}</span>
      <span></span>
    </div>

    <div class="arena" style="min-height: 220px;">
      <div class="boss-emoji calm" style="filter: drop-shadow(0 0 12px ${outcomeText.color});">${outcomeText.emoji}</div>
      <div class="boss-name calm" style="color:${outcomeText.color}; text-shadow: 0 0 8px ${outcomeText.color};">${outcomeText.title}</div>
      <div class="boss-sub">${s.scenario.title}</div>
    </div>

    <div class="panel" style="display:flex; flex-direction:column; gap:8px;">
      <div class="t-sm t-dim">PATIENT FINAL HP</div>
      <div class="t-md">${s.patientHp} / ${s.patientMaxHp}</div>
      <div class="t-sm t-dim">REWARDS</div>
      <div class="t-md">📈 XP earned: <span class="t-gold">+${rew.xp}</span></div>
      <div class="t-md">🪙 Gold earned: <span class="t-gold">+${rew.gold}</span></div>
      ${ctx.lvlInfo.leveledUp ? `<div class="t-md t-gold">⭐ LEVEL UP! → LVL ${ctx.lvlInfo.newLevel} ${State.titleForLevel(ctx.lvlInfo.newLevel).toUpperCase()}</div>` : ''}
    </div>

    <button class="btn btn-block btn-primary" data-action="select">🗺 SCENARIO LIST</button>
    <button class="btn btn-block" data-action="home">🏠 HOME</button>
  `;

  if (ctx.lvlInfo.leveledUp) {
    setTimeout(() => App.goto('level-up', { newLevel: ctx.lvlInfo.newLevel, returnTo: 'outcome', returnCtx: ctx }), 400);
  }

  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'select') App.goto('scenario-select', { course: ctx.course });
      else App.goto('home');
    });
  });
});
```

- [ ] **Step 2: Verify in browser**

Complete a scenario by always picking the best options. Expected: outcome screen says STABILIZED with green ❤️‍🩹, shows rewards, two buttons.

- [ ] **Step 3: Commit**

```bash
git add js/screens/outcome.js
git commit -q -m "feat: outcome screen — patient scenario summary"
```

---

## Task 20: Daily Challenge — Already Wired

The daily challenge logic is already in state.js (Task 3), seeded by app.js (Task 4), and surfaced via home.js (Task 6) which routes to battle with `isDaily: true`. battle.js (Task 9) disables items in daily mode and includes the bonus rewards. battle screen (Task 10) marks `state.dailyChallenge.completed = true` and ticks the streak on victory.

- [ ] **Step 1: Manual verification of full daily flow**

In browser:
1. `s = State.load(); s.gold = 500; State.save(s); App.refresh();`
2. Buy a Potion in shop
3. Try to equip and start the daily — confirm items are NOT carried into daily fight
4. Win the daily challenge — confirm:
   - Streak count incremented
   - Daily challenge completed marker set
   - Home screen no longer shows daily challenge button
5. Refresh page — confirm daily stays marked complete for today
6. Open console: `s = State.load(); s.dailyChallenge.date = '2020-01-01'; State.save(s); App.refresh();`
7. Confirm new daily is regenerated for today

- [ ] **Step 2: Commit (only if any fixes were needed — otherwise skip)**

```bash
git add -A
git diff --cached --quiet || git commit -q -m "fix: daily challenge flow tweaks"
```

---

## Task 21: Settings Screen

**Files:**
- Create: `js/screens/settings.js`

- [ ] **Step 1: Create `js/screens/settings.js`**

```js
/* ============================================================
   SETTINGS — reset progress, toggles, about
   ============================================================ */
App.registerScreen('settings', ({ root, state }) => {
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">⚙️ SETTINGS</span>
      <span></span>
    </div>

    <div class="panel">
      <div class="t-sm t-dim">PROGRESS</div>
      <div class="t-md" style="margin-top:6px;">XP: ${state.xp}</div>
      <div class="t-md">Level: ${state.level} · ${State.titleForLevel(state.level)}</div>
      <div class="t-md">Gold: ${state.gold}g</div>
      <div class="t-md">Bosses defeated: ${state.defeatedBosses.length}</div>
      <div class="t-md">Scenarios completed: ${state.completedScenarios.length}</div>
      <div class="t-md">Streak: ${state.streak.count}</div>
    </div>

    <button class="btn btn-block ${state.settings.timerOn ? 'btn-primary' : ''}" id="t-timer">
      ⏱ QUESTION TIMER: ${state.settings.timerOn ? 'ON' : 'OFF'}
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block btn-danger" id="reset">🗑 RESET ALL PROGRESS</button>

    <div class="t-xs t-mute t-center" style="margin-top: 12px;">RCP Study Game · v1.0</div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));

  root.querySelector('#t-timer').addEventListener('click', () => {
    state.settings.timerOn = !state.settings.timerOn;
    State.save(state);
    App.refresh();
  });

  root.querySelector('#reset').addEventListener('click', () => {
    if (!confirm('Erase all XP, gold, items, and progress?')) return;
    State.reset();
    location.reload();
  });
});
```

- [ ] **Step 2: Verify in browser**

From home → SETTINGS. Expected: shows your stats, can toggle timer, reset wipes localStorage and reloads.

- [ ] **Step 3: Commit**

```bash
git add js/screens/settings.js
git commit -q -m "feat: settings screen — stats, toggles, reset"
```

---

## Task 22: Level-Up Fanfare Overlay

**Files:**
- Create: `js/screens/level-up.js`

- [ ] **Step 1: Create `js/screens/level-up.js`**

```js
/* ============================================================
   LEVEL-UP OVERLAY — celebration before returning to caller
   ctx: { newLevel, returnTo, returnCtx }
   ============================================================ */
App.registerScreen('level-up', ({ root, state, ctx }) => {
  const newLvl = ctx.newLevel;
  const title = State.titleForLevel(newLvl);

  // Confetti particles
  const confettiHtml = Array.from({ length: 24 }).map((_, i) => {
    const left = Math.random() * 100;
    const dur = (1.6 + Math.random() * 1.4).toFixed(2);
    const delay = (Math.random() * 0.6).toFixed(2);
    const color = ['#ffd700','#44ff66','#5577ff','#ff9900','#aa55ff'][i % 5];
    return `<div style="position:absolute; left:${left}%; top:-20px; width:8px; height:8px; background:${color}; animation: confetti-fall ${dur}s ${delay}s linear forwards;"></div>`;
  }).join('');

  root.innerHTML = `
    <div style="position:absolute; inset:0; overflow:hidden;">${confettiHtml}</div>

    <div style="text-align:center; display:flex; flex-direction:column; gap:14px; padding:24px;">
      <div class="fanfare" style="font-size: 48px;">⭐</div>
      <div class="t-xl t-gold fanfare">LEVEL UP!</div>
      <div class="t-md t-dim">LVL ${newLvl} · ${title.toUpperCase()}</div>
      <div class="t-sm t-mute">Max HP: ${State.maxHpForLevel(newLvl)}</div>

      <div style="height: 18px;"></div>

      <button class="btn btn-block btn-primary" id="continue">▶ CONTINUE</button>
    </div>
  `;

  root.querySelector('#continue').addEventListener('click', () => {
    App.goto(ctx.returnTo || 'home', ctx.returnCtx || {});
  });

  // Tap anywhere to dismiss
  root.addEventListener('click', e => {
    if (e.target.id === 'continue') return; // handled above
    if (e.currentTarget !== root) return;
    App.goto(ctx.returnTo || 'home', ctx.returnCtx || {});
  });
});
```

- [ ] **Step 2: Verify in browser**

Trigger a level up: `s = State.load(); s.xp = 240; State.save(s);` then complete a scenario or battle that earns 20+ XP. Expected: level-up overlay shows with confetti rain, big ⭐ animation, level title, CONTINUE button returns to results/outcome.

- [ ] **Step 3: Commit**

```bash
git add js/screens/level-up.js
git commit -q -m "feat: level-up overlay — confetti + fanfare"
```

---

## Task 23: Final Polish + Mobile Test

**Files:**
- May modify: `css/style.css`
- May modify: any screen file based on findings

- [ ] **Step 1: Mobile viewport test**

Open `index.html` in Chrome DevTools. Toggle device toolbar (Cmd+Shift+M). Pick:
- iPhone 12/13/14 (390px wide)
- iPhone SE (375px wide)
- Pixel 7 (412px wide)

Walk every screen. Note any:
- Text overflowing the panel
- Buttons too small to tap (< 44px tall)
- Horizontal scrollbars
- Misaligned grids

- [ ] **Step 2: Run a full game session end-to-end**

1. Fresh state (open `test-engine.html`, then run `localStorage.clear()` in console then reload `index.html`)
2. Daily challenge → play → win
3. RCP 103 → Boss Battle → COPD → Train (3 questions) → Shop (buy potion) → Equip → Enter Fight → win
4. RCP 103 → Patient Crisis → ER Bay 4 → stabilize
5. RCP 104 → Boss Battle → Corticosteroids → win
6. Confirm Settings shows accurate stats
7. Reset → verify wipe

- [ ] **Step 3: Fix any issues found, then commit**

```bash
git add -A
git diff --cached --quiet || git commit -q -m "polish: mobile responsive fixes + UX tweaks"
```

---

# CONTENT GENERATION TASKS (Phase 3 — Parallel)

These four tasks each operate on their own file. They can be dispatched as **parallel Opus subagents**. Each agent reads the relevant source notes in `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/` and writes one content file.

After all four complete, replace `content/stub.js` with an empty file (the production files set `window.ALL_*` first; stub is a fallback).

---

## Task 25: Generate RCP 103 Bosses + Questions

**Files:**
- Create: `content/rcp103-bosses.js`
- Append to: `content/questions.js`

**Source notes (read these):**
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 103/Study Guide/RCP 103 Final Study Guide.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 103/Pulmonary Disorders/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 103/Pleural and Chest/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 103/Assessment/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/Concepts/*.md` (cross-course concepts)

- [ ] **Step 1: Generate `content/rcp103-bosses.js`**

The file must define and **prepend** to `window.ALL_BOSSES` (so it runs before stub.js conditional). Use exactly this structure:

```js
/* ============================================================
   RCP 103 BOSSES — generated from Study Brain notes
   ============================================================ */
(function () {
  const list = [
    { id:'copd',     name:'The Blue Bloater',      emoji:'🌫️', course:'rcp103', description:'COPD: chronic bronchitis & emphysema', hp:100, unlockedByDefault:true,  questionTopics:['copd','cor-pulmonale'] },
    { id:'asthma',   name:'The Hyperresponsive',   emoji:'💨', course:'rcp103', description:'Asthma: zones, biphasic, severity',     hp:100, unlockedByDefault:true,  questionTopics:['asthma'] },
    { id:'abg',      name:'The Acid-Base Specter', emoji:'🩸', course:'rcp103', description:'ABG interpretation & anion gap',        hp:100, unlockedByDefault:true,  questionTopics:['abg','acid-base'] },
    { id:'pleural',  name:'Tension Wraith',        emoji:'🫁', course:'rcp103', description:'PTX, effusion, chest tubes',            hp:100, unlockedByDefault:false, questionTopics:['pleural','chest-tubes','flail-chest'] },
    { id:'infectious', name:'The Consolidation King', emoji:'🦠', course:'rcp103', description:'Pneumonia / TB / fungal',           hp:100, unlockedByDefault:false, questionTopics:['pneumonia','tb','fungal'] },
    { id:'ards',     name:'Hyaline Hydra',         emoji:'💧', course:'rcp103', description:'ARDS — Berlin, P/F, lung-protective',   hp:100, unlockedByDefault:false, questionTopics:['ards'] },
    { id:'ild',      name:'The Honeycomb Husk',    emoji:'🪨', course:'rcp103', description:'ILD, pneumoconioses, IPF',              hp:100, unlockedByDefault:false, questionTopics:['ild','pneumoconioses'] },
    { id:'sleep',    name:'Apnea Phantom',         emoji:'😴', course:'rcp103', description:'OSA / CSA / CPAP / BiPAP',              hp:100, unlockedByDefault:false, questionTopics:['sleep-apnea'] },
    { id:'neuro',    name:'The Paralytic',         emoji:'⚡', course:'rcp103', description:'GBS, botulism, MIP/NIF',                hp:100, unlockedByDefault:false, questionTopics:['neuro-resp','phrenic'] },
    { id:'pvd',      name:'The Drowning Heart',    emoji:'💔', course:'rcp103', description:'Pulm edema / PE / cor pulmonale',       hp:100, unlockedByDefault:false, questionTopics:['pulm-edema','pe','pvd'] },
  ];
  window.ALL_BOSSES = (window.ALL_BOSSES || []).filter(b => b.course !== 'rcp103').concat(list);
})();
```

- [ ] **Step 2: Append RCP 103 questions to `content/questions.js`**

Generate **20 questions per boss** (200 total). Each question must follow this exact schema and the questions should be derived directly from the study guide content:

```js
{
  id: 'q-<topic>-<index>',           // e.g. 'q-copd-01'
  topic: '<one of questionTopics>',   // matches a boss's questionTopics entry
  course: 'rcp103',
  difficulty: 1 | 2 | 3,              // 1 easy, 2 medium, 3 hard
  q: '<question text>',
  choices: ['<A>', '<B>', '<C>', '<D>'],
  correct: 0 | 1 | 2 | 3,             // index of the correct choice
  explanation: '<1-2 sentence teaching point from the notes>',
}
```

The file structure to follow (this is how you bootstrap the global):

```js
/* ============================================================
   QUESTIONS — generated from Study Brain notes
   ============================================================ */
(function () {
  const additions = [
    { id:'q-copd-01', topic:'copd', course:'rcp103', difficulty:1,
      q:'The hallmark PFT finding in COPD is...',
      choices:['FEV1/FVC > 0.70','Post-bronchodilator FEV1/FVC < 0.70','Normal FEV1','Increased DLCO'],
      correct:1,
      explanation:'Post-bronchodilator FEV1/FVC < 0.70 is the GOLD diagnostic criterion for COPD.' },
    // ... 199 more ...
  ];
  // Replace stub questions of the same course; keep others
  const existing = (window.ALL_QUESTIONS || []).filter(q => q.course !== 'rcp103');
  window.ALL_QUESTIONS = existing.concat(additions);
})();
```

**Quality requirements:**
- Questions must be exam-relevant (drawn from the study guide topics)
- Distractors must be plausible (other drug names, similar conditions, near-miss values)
- Each `topic` tag must match a boss's `questionTopics` entry
- Approximately even distribution across the 10 RCP 103 bosses
- No duplicate questions
- Explanations should be ≤ 220 characters

- [ ] **Step 3: Verify in browser**

```bash
open /Users/lourdsonfernando/RCPStudyGame/index.html
```

Console:
```js
ALL_BOSSES.filter(b => b.course === 'rcp103').length;     // expect 10
ALL_QUESTIONS.filter(q => q.course === 'rcp103').length;  // expect 200
```

- [ ] **Step 4: Commit**

```bash
git add content/rcp103-bosses.js content/questions.js
git commit -q -m "content: RCP 103 — 10 bosses + 200 questions"
```

---

## Task 26: Generate RCP 104 Bosses + Questions

**Files:**
- Create: `content/rcp104-bosses.js`
- Append to: `content/questions.js`

**Source notes:**
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Study Guide/RCP 104 Final Study Guide.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Foundations/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Bronchoactive/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Airway Clearance/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Anti-Inflammatory/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Antimicrobial/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Symptomatic and Pulmonary Vasc/*.md`
- `/Users/lourdsonfernando/Documents/Obsidian Mind/My Mind/Study Brain/RCP 104/Other Systems/*.md`

- [ ] **Step 1: Generate `content/rcp104-bosses.js`**

```js
/* ============================================================
   RCP 104 BOSSES — generated from Study Brain notes
   ============================================================ */
(function () {
  const list = [
    { id:'corticosteroids',  name:'Corticosteroid Boss',         emoji:'🧪', course:'rcp104', description:'Ch 11 · Anti-inflammatory',           hp:100, unlockedByDefault:true,  questionTopics:['corticosteroids'] },
    { id:'nonsteroidal',     name:'Non-Steroidal Anti-Asthma',   emoji:'💊', course:'rcp104', description:'Ch 12 · Cromolyn, LTRAs, biologics',   hp:100, unlockedByDefault:true,  questionTopics:['nonsteroidal','leukotrienes'] },
    { id:'antiinfective',    name:'Anti-Infective Boss',         emoji:'🧫', course:'rcp104', description:'Ch 13 · Pentamidine, Ribavirin, CF',   hp:100, unlockedByDefault:true,  questionTopics:['antiinfective','pentamidine','ribavirin','cf'] },
    { id:'antimicrobial',    name:'Antimicrobial Boss',          emoji:'🦠', course:'rcp104', description:'Ch 14 · TB, VAP, MRSA',                hp:100, unlockedByDefault:false, questionTopics:['antimicrobial','tb-meds','vap-meds'] },
    { id:'cold-cough',       name:'Cold & Cough Boss',           emoji:'🤧', course:'rcp104', description:'Ch 15 · Antitussives, mucolytics',     hp:100, unlockedByDefault:false, questionTopics:['cold-cough','mucolytics'] },
    { id:'emphysema-no',     name:'α1-AT / Nitric Oxide Boss',   emoji:'🚬', course:'rcp104', description:'Ch 16 · Emphysema, NO, smoking',       hp:100, unlockedByDefault:false, questionTopics:['emphysema-rx','nitric-oxide','smoking-cessation'] },
    { id:'nmba',             name:'Neuromuscular Blocker Boss',  emoji:'🦴', course:'rcp104', description:'Ch 18 · NMBA, succinylcholine',        hp:100, unlockedByDefault:false, questionTopics:['nmba'] },
    { id:'diuretics',        name:'Diuretic Boss',               emoji:'💧', course:'rcp104', description:'Ch 19 · Loop, thiazide, osmotic',      hp:100, unlockedByDefault:false, questionTopics:['diuretics'] },
    { id:'cns-drugs',        name:'CNS Drugs Boss',              emoji:'🧠', course:'rcp104', description:'Ch 20 · Opioids, benzos, naloxone',    hp:100, unlockedByDefault:false, questionTopics:['cns-drugs','opioids','benzos'] },
    { id:'vasopressors',     name:'Vasopressor & Antiarrhythmic',emoji:'❤️', course:'rcp104', description:'Ch 21 · NAVEL, epi, atropine',         hp:100, unlockedByDefault:false, questionTopics:['vasopressors','antiarrhythmics','navel'] },
    { id:'antihypertensives',name:'Antihypertensive Boss',       emoji:'🩸', course:'rcp104', description:'Ch 22 · ACEI, MI, anticoag',           hp:100, unlockedByDefault:false, questionTopics:['antihypertensives','htn','mi-rx'] },
    { id:'sleep-pharm',      name:'Sleep Pharm Boss',            emoji:'🌙', course:'rcp104', description:'Ch 23 · Sleep disorders, melatonin',   hp:100, unlockedByDefault:false, questionTopics:['sleep-pharm'] },
  ];
  window.ALL_BOSSES = (window.ALL_BOSSES || []).filter(b => b.course !== 'rcp104').concat(list);
})();
```

- [ ] **Step 2: Append RCP 104 questions to `content/questions.js`**

Generate **20 questions per boss × 12 bosses = 240 total questions**. Use the exact same schema as Task 25 but with `course: 'rcp104'`. Append to the IIFE pattern (or create a second IIFE block in the file). Make sure topic tags match `questionTopics` entries above.

Distribute questions per chapter approximately matching the question counts from the study guide:
- Ch 11 (10 Q in exam) → ~20 questions
- Ch 12 (6 Q) → ~12 questions, fill remainder from related topics
- Ch 13 (10 Q) → ~20 questions
- Ch 14 (10 Q) → ~20 questions
- Ch 15 (11 Q) → ~22 questions
- Ch 16 (9 Q) → ~18 questions
- Ch 18 (7 Q) → ~14 questions
- Ch 19 (11 Q) → ~22 questions
- Ch 20 (15 Q) → ~30 questions
- Ch 21 (10 Q) → ~20 questions
- Ch 22 (19 Q) → ~38 questions
- Ch 23 (8 Q) → ~16 questions

Target: 240+ total RCP 104 questions.

- [ ] **Step 3: Verify in browser**

Console:
```js
ALL_BOSSES.filter(b => b.course === 'rcp104').length;     // expect 12
ALL_QUESTIONS.filter(q => q.course === 'rcp104').length;  // expect 240+
```

- [ ] **Step 4: Commit**

```bash
git add content/rcp104-bosses.js content/questions.js
git commit -q -m "content: RCP 104 — 12 bosses + 240 questions"
```

---

## Task 27: Generate RCP 103 Patient Scenarios

**Files:**
- Create: `content/rcp103-scenarios.js`

**Source notes:** same RCP 103 directory plus the Concepts files.

- [ ] **Step 1: Generate 6 scenarios for RCP 103**

Each scenario must follow this schema:

```js
{
  id: '<kebab-case-id>',                    // e.g. 'er-bay-4'
  title: '<location: short clinical hook>', // e.g. 'ER Bay 4: 62yo Chronic Smoker'
  course: 'rcp103',
  intro: '<2-4 sentences setting the scene, chief complaint, key history>',
  vitals: { rr: <number>, spo2: <number>, hr: <number>, bp: '<sys/dia>' },
  startingHp: 60,                            // standard
  decisions: [
    {
      id: 'd1',
      prompt: '<clinical decision>',
      options: [
        { text: '<choice>', hpDelta: <int -25 to +20>, explain: '<teaching point>', next: 'd2' | null },
        // 3 options total per decision
      ],
    },
    // 3-5 decisions per scenario
  ],
}
```

Cover these RCP 103 topics across the 6 scenarios (one each):
1. COPD acute exacerbation (acid-base, BiPAP, hypoxic drive)
2. Severe asthma attack (silent chest, rising PaCO2)
3. ARDS post-op (P/F ratio, lung-protective ventilation, proning)
4. Tension pneumothorax (clinical Dx, needle decompression)
5. Pneumonia with sepsis (Gram stain, antibiotics, ventilator support)
6. Guillain-Barré with falling MIP (intubation timing)

Final file structure:

```js
/* ============================================================
   RCP 103 PATIENT SCENARIOS — generated from Study Brain notes
   ============================================================ */
(function () {
  const list = [
    // 6 scenarios
  ];
  window.ALL_SCENARIOS = (window.ALL_SCENARIOS || []).filter(s => s.course !== 'rcp103').concat(list);
})();
```

**Quality requirements:**
- Each scenario has exactly 3 decisions (3 options each)
- HP deltas: best option +15 to +20, partial +5 to +10, wrong −10 to −25
- The wrong option's `explain` should teach *why* it's wrong (the test-pearl)
- All decisions reachable on every branch
- Last decision's `next: null` to terminate

- [ ] **Step 2: Verify in browser**

Console:
```js
ALL_SCENARIOS.filter(s => s.course === 'rcp103').length;  // expect 6
ALL_SCENARIOS.filter(s => s.course === 'rcp103').every(s => s.decisions.length >= 3);  // true
```

- [ ] **Step 3: Commit**

```bash
git add content/rcp103-scenarios.js
git commit -q -m "content: RCP 103 — 6 patient crisis scenarios"
```

---

## Task 28: Generate RCP 104 Patient Scenarios

**Files:**
- Create: `content/rcp104-scenarios.js`

**Source notes:** RCP 104 directory.

- [ ] **Step 1: Generate 6 scenarios for RCP 104**

Same schema as Task 27 but with `course: 'rcp104'`. Cover these pharmacology-flavored scenarios:

1. **Acetaminophen overdose** — naloxone vs N-acetylcysteine (Ch 15/20)
2. **Status asthmaticus** — albuterol → ipratropium → steroids → mag → intubation (Ch 11, 12)
3. **VAP** — Gram stain, antibiotic choice, vent management (Ch 14)
4. **Opioid overdose** — Narcan, supportive ventilation, withdrawal mgmt (Ch 20)
5. **Cardiac arrest** — NAVEL meds, epinephrine, atropine, vasopressin (Ch 21)
6. **Hypertensive crisis** — first-line, second-line antihypertensives, nitroglycerin (Ch 22)

File structure:

```js
(function () {
  const list = [
    // 6 scenarios
  ];
  window.ALL_SCENARIOS = (window.ALL_SCENARIOS || []).filter(s => s.course !== 'rcp104').concat(list);
})();
```

- [ ] **Step 2: Verify in browser**

```js
ALL_SCENARIOS.filter(s => s.course === 'rcp104').length;  // expect 6
ALL_SCENARIOS.length;                                       // expect 12 total
```

- [ ] **Step 3: Commit**

```bash
git add content/rcp104-scenarios.js
git commit -q -m "content: RCP 104 — 6 patient crisis scenarios"
```

---

## Task 29: Remove Stub Content + Final Smoke Test

**Files:**
- Modify: `content/stub.js`
- Verify: everything

- [ ] **Step 1: Replace `content/stub.js` with a minimal no-op**

```js
/* Stub content is no longer used — production content files seed the globals.
   Keeping this file as a no-op so the <script src> in index.html doesn't 404. */
```

- [ ] **Step 2: Full smoke test**

```bash
open /Users/lourdsonfernando/RCPStudyGame/index.html
```

In console:
```js
ALL_BOSSES.length;       // 22 (10 + 12)
ALL_QUESTIONS.length;    // 440+
ALL_SCENARIOS.length;    // 12

// Sanity: every boss has at least 10 questions in its pool
ALL_BOSSES.every(b => {
  const pool = ALL_QUESTIONS.filter(q => b.questionTopics.includes(q.topic) && q.course === b.course);
  return pool.length >= 10;
});  // true
```

If any boss has < 10 questions, return to task 25/26 and add more.

Play one boss from each course and one scenario from each course. Confirm no console errors.

- [ ] **Step 3: Commit**

```bash
git add content/stub.js
git commit -q -m "chore: retire stub content — full content now in production files"
```

---

# Final Self-Review (run before declaring complete)

After all tasks complete:

- [ ] `git log --oneline` shows a clean linear history matching the task list
- [ ] `test-engine.html` shows all green
- [ ] Mobile viewport (375px) renders without horizontal scrolling on every screen
- [ ] All 22 bosses have ≥ 10 unique questions in their pool
- [ ] All 12 scenarios complete end-to-end with valid HP arithmetic
- [ ] Daily challenge appears on home and properly disables items
- [ ] Streak increments on daily completion and resets on 2-day gap
- [ ] localStorage state survives a hard refresh
- [ ] Reset button wipes all state
