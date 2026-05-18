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
