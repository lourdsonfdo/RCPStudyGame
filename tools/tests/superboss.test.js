/* Shared by tools/run-engine-tests.js (Node) and test-engine.html (browser).
   Expects globals: SuperBoss, and a `check(name, cond, detail)` function. */
(function (global) {
  'use strict';

  function makeBank(spec) {
    // spec: { phase: count } -> flat array of fake questions
    const out = [];
    Object.keys(spec).forEach(phase => {
      for (let i = 0; i < spec[phase]; i++) {
        out.push({
          id: `q-p${phase}-${i}`,
          course: 'rcp2xx',
          phase: Number(phase),
          topic: `sb-p${phase}`,
          q: `phase ${phase} question ${i}`,
          choices: ['a', 'b', 'c', 'd'],
          correct: 0,
          srcItem: `202:s01-${i}`,
        });
      }
    });
    return out;
  }

  global.SuperBossTests = function (check) {
    // ── Phase config ────────────────────────────────────────────
    check('5 phases defined', SuperBoss.PHASES.length === 5);
    check('15 questions per phase', SuperBoss.QUESTIONS_PER_PHASE === 15);
    check('75 questions per run',
      SuperBoss.PHASES.length * SuperBoss.QUESTIONS_PER_PHASE === 75);
    check('gate is 12', SuperBoss.PHASE_GATE === 12);
    check('phase 4 is formulas', SuperBoss.PHASES[3].id === 'p4-formulas');
    check('phase 5 is the final', SuperBoss.PHASES[4].id === 'p5-final');

    // ── Run creation ────────────────────────────────────────────
    const bank = makeBank({ 1: 30, 2: 30, 3: 30, 4: 30, 5: 0 });
    const run = SuperBoss.startRun({ bank, playerMaxHp: 100 });
    check('run starts at phase index 0', run.phaseIndex === 0);
    check('first phase drew 15', run.questions.length === 15);
    check('boss has 5 bars', run.bossBars.length === 5);
    check('each bar is 100 hp', run.bossBars.every(b => b === 100));
    check('asked set seeded with phase 1', run.asked.length === 15);
    check('player hp at max', run.playerHp === 100);
  };
})(typeof window !== 'undefined' ? window : globalThis);
