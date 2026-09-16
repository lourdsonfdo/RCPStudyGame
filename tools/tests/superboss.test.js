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

    // ── Answering ────────────────────────────────────────────────
    // Choices are shuffled at draw time, so the correct index must be read
    // from the drawn question — never assumed.
    function rightIdx(run) { return SuperBoss.currentQ(run).correct; }
    function wrongIdx(run) { return (SuperBoss.currentQ(run).correct + 1) % 4; }

    function freshRun() {
      return SuperBoss.startRun({
        bank: makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 }), playerMaxHp: 100 });
    }

    let ra = freshRun();
    const before = ra.bossBars[0];
    let res = SuperBoss.answer(ra, rightIdx(ra));
    check('correct answer is reported correct', res.correct === true);
    check('correct answer damages the boss bar', ra.bossBars[0] < before);
    check('correct increments correctCount', ra.correctCount === 1);
    check('correct does not record a miss', ra.missed.length === 0);
    check('qIndex advances', ra.qIndex === 1);

    const hpBefore = ra.playerHp;
    res = SuperBoss.answer(ra, wrongIdx(ra));
    check('wrong answer is reported wrong', res.correct === false);
    check('wrong answer damages the player', ra.playerHp < hpBefore);
    check('wrong answer records the miss', ra.missed.length === 1);
    check('answer history records both', ra.answers.length === 2);

    // ── Gate: 11/15 fails, 12/15 passes ──────────────────────────
    function playPhase(run, correctCount) {
      for (let i = 0; i < SuperBoss.QUESTIONS_PER_PHASE; i++) {
        SuperBoss.answer(run, i < correctCount ? rightIdx(run) : wrongIdx(run));
      }
      return SuperBoss.endPhase(run);
    }

    let rFail = freshRun();
    rFail.playerHp = 1000; rFail.playerMaxHp = 1000;
    let gate = playPhase(rFail, 11);
    check('11/15 fails the gate', gate.passed === false);
    check('failing the gate ends the run', rFail.outcome === 'defeat');

    let rPass = freshRun();
    rPass.playerHp = 1000; rPass.playerMaxHp = 1000;
    gate = playPhase(rPass, 12);
    check('12/15 passes the gate', gate.passed === true);
    check('passing advances the phase', rPass.phaseIndex === 1);
    check('phase result recorded', rPass.phaseResults.length === 1);
    check('counters reset for the new phase', rPass.correctCount === 0 && rPass.qIndex === 0);
    check('new phase drew 15', rPass.questions.length === 15);
    check('asked set grew to 30', rPass.asked.length === 30);
    check('askedValues grew to 30', rPass.askedValues.length === 30);

    // ── Inter-phase heal ─────────────────────────────────────────
    let rHeal = freshRun();
    rHeal.playerHp = 20;
    playPhase(rHeal, 15);
    check('heal restores 30% of max', rHeal.playerHp === 50);

    let rCap = freshRun();
    rCap.playerHp = 95;
    playPhase(rCap, 15);
    check('heal never exceeds max hp', rCap.playerHp === 100);

    // ── Death ends the run ───────────────────────────────────────
    let rDead = freshRun();
    rDead.playerHp = 1;
    SuperBoss.answer(rDead, wrongIdx(rDead));
    check('hp reaching zero ends the run', rDead.outcome === 'defeat');
    check('hp never goes negative', rDead.playerHp === 0);

    // ── Victory ──────────────────────────────────────────────────
    let rWin = freshRun();
    rWin.playerHp = 1000; rWin.playerMaxHp = 1000;
    for (let p = 0; p < 5; p++) playPhase(rWin, 15);
    check('clearing all five phases wins', rWin.outcome === 'victory');
    check('five phase results recorded', rWin.phaseResults.length === 5);

    // ── Serialisation round-trip ─────────────────────────────────
    let rSer = SuperBoss.startRun({
      bank: makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 }), playerMaxHp: 100 });
    SuperBoss.answer(rSer, SuperBoss.currentQ(rSer).correct);
    SuperBoss.answer(rSer, (SuperBoss.currentQ(rSer).correct + 1) % 4);

    const blob = SuperBoss.serialize(rSer);
    check('serialized form is JSON-safe',
      typeof JSON.parse(JSON.stringify(blob)) === 'object');
    check('serialized form drops the bank', blob.bank === undefined);

    const restored = SuperBoss.deserialize(
      JSON.parse(JSON.stringify(blob)),
      makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 }));
    check('restored qIndex', restored.qIndex === rSer.qIndex);
    check('restored playerHp', restored.playerHp === rSer.playerHp);
    check('restored asked set', restored.asked.length === rSer.asked.length);
    check('restored askedValues', restored.askedValues.length === rSer.askedValues.length);
    check('restored missed set', restored.missed.length === rSer.missed.length);
    check('restored question order',
      restored.questions.map(q => q.id).join() === rSer.questions.map(q => q.id).join());
    check('restored run is answerable',
      SuperBoss.currentQ(restored).id === SuperBoss.currentQ(rSer).id);

    // ── Failed-phase pinning ─────────────────────────────────────
    const pinBank = makeBank({ 1: 40, 2: 40, 3: 40, 4: 40 });

    function playPhaseOn(run, correctCount) {
      for (let i = 0; i < SuperBoss.QUESTIONS_PER_PHASE; i++) {
        const q = SuperBoss.currentQ(run);
        SuperBoss.answer(run, i < correctCount ? q.correct : (q.correct + 1) % 4);
      }
      return SuperBoss.endPhase(run);
    }

    let rPin = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000 });
    const failedIds = rPin.questions.map(q => q.id);
    const pinResult = playPhaseOn(rPin, 11);
    check('failing a phase pins its set', pinResult.pinned === true);
    check('pin is keyed by phase id', !!rPin.pinned['p1-202-core']);
    check('pin holds exactly 15 ids', rPin.pinned['p1-202-core'].length === 15);
    check('pin holds the questions that were failed',
      rPin.pinned['p1-202-core'].slice().sort().join() === failedIds.slice().sort().join());

    const rReplay = SuperBoss.startRun({
      bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
    const replayIds = rReplay.questions.map(q => q.id);
    check('pinned phase replays the same 15 questions',
      replayIds.slice().sort().join() === failedIds.slice().sort().join());

    let sawDifferentOrder = false;
    for (let i = 0; i < 20 && !sawDifferentOrder; i++) {
      const r = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
      if (r.questions.map(q => q.id).join() !== failedIds.join()) sawDifferentOrder = true;
    }
    check('pinned replay reshuffles question order', sawDifferentOrder);

    let sawDifferentChoices = false;
    for (let i = 0; i < 20 && !sawDifferentChoices; i++) {
      const r = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
      const q = r.questions[0];
      const source = pinBank.filter(b => b.id === q.id)[0];
      if (q.choices.join() !== source.choices.join() || q.correct !== source.correct) {
        sawDifferentChoices = true;
      }
    }
    check('pinned replay reshuffles choices', sawDifferentChoices);

    const rClear = SuperBoss.startRun({
      bank: pinBank, playerMaxHp: 10000, pinned: rPin.pinned });
    playPhaseOn(rClear, 15);
    check('passing a pinned phase clears the pin',
      rClear.pinned['p1-202-core'] === undefined);

    const latePin = {};
    latePin['p3-203-equip'] = pinBank.filter(q => q.phase === 3).slice(0, 15).map(q => q.id);
    const rLate = SuperBoss.startRun({ bank: pinBank, playerMaxHp: 10000, pinned: latePin });
    const reserved = latePin['p3-203-equip']
      .map(id => SuperBoss.valueKeyOf(pinBank.filter(b => b.id === id)[0]));
    check('pinned values are reserved before the first draw',
      reserved.every(v => rLate.askedValues.indexOf(v) !== -1));

    const pinBlob = JSON.parse(JSON.stringify(SuperBoss.serialize(rPin)));
    const rPinRestored = SuperBoss.deserialize(pinBlob, pinBank);
    check('pin round-trips through serialize',
      rPinRestored.pinned['p1-202-core'].length === 15);
  };
})(typeof window !== 'undefined' ? window : globalThis);
