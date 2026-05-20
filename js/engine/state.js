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
    settings: { sfxOn: true, timerOn: true, textSize: 'md' },  // textSize: 'sm'|'md'|'lg'|'xl'
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
