/* ============================================================
   SUPER BOSS ENGINE — VITALS TITAN
   Five-phase gauntlet over the RCP 202/203 value banks.

   Wraps the shared Battle engine's conventions without modifying it:
   battle.js is used by 22 bosses, the daily challenge and survival mode.

   Exposes a global `SuperBoss`.
   ============================================================ */
(function (global) {
  'use strict';

  const QUESTIONS_PER_PHASE = 15;
  const PHASE_GATE          = 12;   // correct answers needed to advance
  const BAR_HP              = 100;  // boss hp per phase bar
  const INTER_PHASE_HEAL    = 0.30; // fraction of max hp restored between phases

  const PHASES = [
    { id: 'p1-202-core',  n: 1, name: '202 · CORE VALUES',
      blurb: 'Vent settings · ABG · burn · renal · BiPAP' },
    { id: 'p2-203-gas',   n: 2, name: '203 · GAS SUPPLY',
      blurb: 'Cylinders · LOX · regulators · flowmeters · PISS' },
    { id: 'p3-203-equip', n: 3, name: '203 · EQUIPMENT',
      blurb: 'Airways · spirometry · chest tubes · PFT · transcutaneous' },
    { id: 'p4-formulas',  n: 4, name: 'FORMULAS',
      blurb: 'FiO2 · PBW · entrainment · cylinder duration · dead space' },
    { id: 'p5-final',     n: 5, name: 'FINAL PROTOCOL',
      blurb: 'Everything · weighted to what you missed' },
  ];

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Randomise a question's choices and remap `correct`. Returns a NEW object;
   * the bank entry is untouched. Matters most on a pinned replay — the point
   * of seeing a failed question again is to learn the value, not which letter
   * it sat on last time.
   */
  function shuffleChoices(q) {
    const order = q.choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    return Object.assign({}, q, {
      choices: order.map(i => q.choices[i]),
      correct: order.indexOf(q.correct),
    });
  }

  /**
   * Identity of the FACT a question tests, as opposed to the question object.
   *
   * Two questions can carry different ids and still ask for the same number —
   * a phase-1 recall question and a phase-4 calculation question built on the
   * same source card. Deduping on id alone would let that pair both appear in
   * one run, which reads as a repeat even though the ids differ.
   */
  function valueKeyOf(q) {
    const answer = (q.choices && q.choices[q.correct]) || '';
    const normalized = String(answer)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[—–]/g, '-');
    return q.srcItem + '|' + normalized;
  }

  /**
   * Begin a run.
   * opts: {
   *   bank: question[],
   *   playerMaxHp: number,
   *   pinned: { [phaseId]: questionId[] }   // sets saved from failed phases
   * }
   */
  function startRun({ bank, playerMaxHp, pinned }) {
    const run = {
      bank: bank.slice(),
      pinned: pinned || {},
      phaseIndex: 0,
      bossBars: PHASES.map(() => BAR_HP),
      playerHp: playerMaxHp,
      playerMaxHp,
      asked: [],            // question ids seen this run (phases 1-4 never repeat)
      askedValues: [],      // valueKeys seen this run — the real no-repeat guard
      missed: [],           // question ids answered wrong this run
      phaseResults: [],     // { phase, correct, total, passed }
      questions: [],        // the current phase's drawn questions
      qIndex: 0,
      correctCount: 0,
      answers: [],
      outcome: null,        // 'victory' | 'defeat' | null
    };
    // Reserve every pinned question's value BEFORE the first draw, so an
    // earlier phase cannot consume a value a later pinned phase is holding.
    const byId = new Map(run.bank.map(q => [q.id, q]));
    Object.keys(run.pinned).forEach(phaseId => {
      run.pinned[phaseId].forEach(id => {
        const q = byId.get(id);
        if (q) run.askedValues.push(valueKeyOf(q));
      });
    });

    run.questions = drawPhase(run, 0);
    run.asked = run.questions.map(q => q.id);
    run.askedValues = run.askedValues.concat(run.questions.map(valueKeyOf));
    return run;
  }

  global.SuperBoss = {
    QUESTIONS_PER_PHASE, PHASE_GATE, BAR_HP, INTER_PHASE_HEAL, PHASES,
    startRun, drawPhase,
  };

  // Defined in Task 4.
  function drawPhase(run, phaseIndex) {
    const phase = PHASES[phaseIndex];
    const pool = run.bank.filter(q => q.phase === phase.n);
    return shuffle(pool).slice(0, QUESTIONS_PER_PHASE);
  }
})(typeof window !== 'undefined' ? window : globalThis);
