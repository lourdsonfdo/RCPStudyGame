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
          // srcItem must differ per phase: two questions sharing one
          // srcItem and answer share a valueKey, and the no-repeat rule
          // would correctly refuse to draw both in one run.
          srcItem: `202:s0${phase}-${i}`,
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

    // ── No-repeat across phases 1-4 ──────────────────────────────
    // Every question carries exactly one `phase`, so filtering by id alone
    // makes cross-phase repeats structurally impossible and proves nothing.
    // The repeat that actually matters is by VALUE: a phase-4 calculation
    // question and a phase-1 recall question are different ids that can test
    // the same number. Dedupe on valueKey = srcItem + normalised answer.
    const bank4 = makeBank({ 1: 20, 2: 20, 3: 20, 4: 20, 5: 20 });
    const r4 = SuperBoss.startRun({ bank: bank4, playerMaxHp: 100 });
    let allIds = r4.questions.map(q => q.id);
    let allVals = r4.questions.map(SuperBoss.valueKeyOf);
    for (let p = 1; p <= 3; p++) {
      r4.phaseIndex = p;
      r4.questions = SuperBoss.drawPhase(r4, p);
      r4.asked = r4.asked.concat(r4.questions.map(q => q.id));
      r4.askedValues = r4.askedValues.concat(r4.questions.map(SuperBoss.valueKeyOf));
      allIds = allIds.concat(r4.questions.map(q => q.id));
      allVals = allVals.concat(r4.questions.map(SuperBoss.valueKeyOf));
    }
    check('phases 1-4 drew 60 questions', allIds.length === 60);
    check('phases 1-4 contain zero repeated ids', new Set(allIds).size === 60,
      `${allIds.length - new Set(allIds).size} duplicate id(s)`);
    check('phases 1-4 contain zero repeated values', new Set(allVals).size === 60,
      `${allVals.length - new Set(allVals).size} duplicate value(s)`);

    const vq = { srcItem: '202:s07-3', choices: ['20 cmH2O', '30 cmH2O'], correct: 1 };
    check('valueKeyOf joins item and normalised answer',
      SuperBoss.valueKeyOf(vq) === '202:s07-3|30cmh2o', SuperBoss.valueKeyOf(vq));

    // 30 in the bank, 10 already asked -> 20 left, enough to draw 15.
    const bankShared = makeBank({ 4: 30 });
    const rShared = {
      bank: bankShared,
      asked: bankShared.slice(0, 10).map(q => q.id),
      askedValues: [],
      missed: [],
    };
    const drawn = SuperBoss.drawPhase(rShared, 3);
    check('drawPhase excludes already-asked ids',
      drawn.every(q => rShared.asked.indexOf(q.id) === -1));

    // Two questions on the SAME value in different phases: only one may appear.
    const twin = [
      { id: 'twin-recall', phase: 1, srcItem: '202:s07-3',
        choices: ['20 cmH2O', '30 cmH2O'], correct: 1 },
      { id: 'twin-calc',   phase: 4, srcItem: '202:s07-3',
        choices: ['20 cmH2O', '30 cmH2O'], correct: 1 },
    ];
    const rTwin = {
      bank: twin.concat(makeBank({ 4: 20 })),
      asked: ['twin-recall'],
      askedValues: [SuperBoss.valueKeyOf(twin[0])],
      missed: [],
    };
    const twinDraw = SuperBoss.drawPhase(rTwin, 3);
    check('drawPhase excludes a different question testing an already-asked value',
      twinDraw.every(q => q.id !== 'twin-calc'));

    // ── Short pool is loud, not silently repeated ────────────────
    const thin = { bank: makeBank({ 4: 9 }), asked: [], askedValues: [], missed: [] };
    let threw = null;
    try { SuperBoss.drawPhase(thin, 3); } catch (e) { threw = e; }
    check('short pool throws', threw !== null);
    check('short pool names the phase and the shortfall',
      threw && /p4-formulas/.test(threw.message) && /9/.test(threw.message),
      threw ? threw.message : 'no error thrown');

    // ── Phase 5 prefers this run's misses ────────────────────────
    const bank5 = makeBank({ 1: 20, 2: 20, 3: 20, 4: 20 });
    const missedIds = bank5.slice(0, 6).map(q => q.id);
    const r5 = {
      bank: bank5,
      asked: bank5.slice(0, 40).map(q => q.id),
      askedValues: [],
      missed: missedIds,
    };
    const final5 = SuperBoss.drawFinalPhase(r5);
    check('final phase draws 15', final5.length === 15);
    const finalIds = final5.map(q => q.id);
    check('final phase includes every missed question',
      missedIds.every(id => finalIds.indexOf(id) !== -1));
    check('final phase has no internal duplicates',
      new Set(finalIds).size === finalIds.length);

    const manyMissed = bank5.slice(0, 20).map(q => q.id);
    const rMany = { bank: bank5, asked: bank5.map(q => q.id), askedValues: [], missed: manyMissed };
    const finalMany = SuperBoss.drawFinalPhase(rMany).map(q => q.id);
    check('final phase is all misses when misses exceed slots',
      finalMany.every(id => manyMissed.indexOf(id) !== -1));

    const rClean = { bank: bank5, asked: bank5.slice(0, 40).map(q => q.id), askedValues: [], missed: [] };
    const finalClean = SuperBoss.drawFinalPhase(rClean);
    check('final phase fills from unseen when nothing was missed',
      finalClean.length === 15);

  };
})(typeof window !== 'undefined' ? window : globalThis);
