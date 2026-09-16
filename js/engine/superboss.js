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
  const HIT_BOSS            = 8;    // damage to the current bar per correct answer
  const HIT_PLAYER          = 9;    // damage taken per wrong answer

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
      // Copy, never alias: clearing a pin on a pass must not reach back and
      // mutate the caller's saved state while the run is still going.
      pinned: Object.assign({}, pinned || {}),
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

  function currentQ(run) {
    return run.questions[run.qIndex] || null;
  }

  function currentPhase(run) {
    return PHASES[run.phaseIndex];
  }

  /**
   * Answer the current question. Returns { correct, question, correctIndex }.
   * Mutates `run`.
   */
  function answer(run, choiceIndex) {
    const q = currentQ(run);
    if (!q || run.outcome) {
      return { correct: false, question: q, correctIndex: q ? q.correct : -1 };
    }

    const correct = choiceIndex === q.correct;

    if (correct) {
      run.correctCount++;
      run.bossBars[run.phaseIndex] = Math.max(0, run.bossBars[run.phaseIndex] - HIT_BOSS);
    } else {
      run.playerHp = Math.max(0, run.playerHp - HIT_PLAYER);
      if (run.missed.indexOf(q.id) === -1) run.missed.push(q.id);
    }

    // The drawn question is kept, not just its id: its choices were shuffled
    // for this run, so `chosen` is only meaningful against this exact copy.
    run.answers.push({
      phase: currentPhase(run).id,
      id: q.id,
      question: q,
      chosen: choiceIndex,
      correct: correct,
      srcItem: q.srcItem,
      srcCite: q.srcCite,
    });
    run.qIndex++;

    // Running out of HP mid-phase is still failing that phase, so it pins the
    // same way a gate failure does. Without this, the worse you do the LESS
    // likely you are to get the retry drill -- exactly backwards.
    if (run.playerHp === 0) failPhase(run);
    return { correct: correct, question: q, correctIndex: q.correct };
  }

  /**
   * Close out the current phase. Returns { passed, correct, total, phase }.
   *
   * On a pass, the phase's pin is cleared and the run advances, heals and
   * draws. On a fail the run is over — there is no mid-fight retry — and the
   * phase's 15 questions are PINNED so the next attempt drills the same set.
   */
  /**
   * Record this phase as failed, pin its questions and end the run.
   * Shared by the gate check and by running out of HP mid-phase.
   */
  function failPhase(run) {
    if (run.outcome === 'defeat') return null;
    const phase = currentPhase(run);
    const result = {
      phase: phase.id,
      phaseName: phase.name,
      correct: run.correctCount,
      total: QUESTIONS_PER_PHASE,
      passed: false,
      pinned: true,
    };
    run.pinned[phase.id] = run.questions.map(q => q.id);
    run.phaseResults.push(result);
    run.outcome = 'defeat';
    return result;
  }

  function endPhase(run) {
    const phase = currentPhase(run);
    // Death already closed this phase out and pinned it.
    if (run.outcome === 'defeat') {
      return run.phaseResults[run.phaseResults.length - 1];
    }
    const passed = run.correctCount >= PHASE_GATE;
    const result = {
      phase: phase.id,
      phaseName: phase.name,
      correct: run.correctCount,
      total: QUESTIONS_PER_PHASE,
      passed: passed,
    };
    run.phaseResults.push(result);

    if (!passed) {
      run.phaseResults.pop();          // failPhase records its own result
      return failPhase(run);
    }

    // Cleared it — the pin has done its job.
    delete run.pinned[phase.id];

    if (run.phaseIndex === PHASES.length - 1) {
      run.outcome = 'victory';
      return result;
    }

    run.phaseIndex++;
    run.playerHp = Math.min(
      run.playerMaxHp,
      run.playerHp + Math.round(run.playerMaxHp * INTER_PHASE_HEAL));
    run.questions = drawPhase(run, run.phaseIndex);
    run.asked = run.asked.concat(run.questions.map(q => q.id));
    run.askedValues = run.askedValues.concat(run.questions.map(valueKeyOf));
    run.qIndex = 0;
    run.correctCount = 0;
    return result;
  }

  function phaseComplete(run) {
    return run.qIndex >= run.questions.length;
  }

  /**
   * Shrink a run for localStorage. The bank is content, not state — it is
   * reloaded from the content files and re-joined by id on restore.
   */
  function serialize(run) {
    return {
      v: 1,
      pinned: JSON.parse(JSON.stringify(run.pinned || {})),
      phaseIndex: run.phaseIndex,
      bossBars: run.bossBars.slice(),
      playerHp: run.playerHp,
      playerMaxHp: run.playerMaxHp,
      asked: run.asked.slice(),
      askedValues: run.askedValues.slice(),
      missed: run.missed.slice(),
      phaseResults: run.phaseResults.slice(),
      questionIds: run.questions.map(q => q.id),
      qIndex: run.qIndex,
      correctCount: run.correctCount,
      answers: run.answers.slice(),
      outcome: run.outcome,
    };
  }

  /** Rebuild a run from a serialized blob plus the live question bank. */
  function deserialize(blob, bank) {
    const byId = new Map(bank.map(q => [q.id, q]));
    return {
      bank: bank.slice(),
      pinned: blob.pinned || {},
      phaseIndex: blob.phaseIndex,
      bossBars: blob.bossBars.slice(),
      playerHp: blob.playerHp,
      playerMaxHp: blob.playerMaxHp,
      asked: blob.asked.slice(),
      askedValues: (blob.askedValues || []).slice(),
      missed: blob.missed.slice(),
      phaseResults: blob.phaseResults.slice(),
      questions: blob.questionIds.map(id => byId.get(id)).filter(Boolean),
      qIndex: blob.qIndex,
      correctCount: blob.correctCount,
      answers: blob.answers.slice(),
      outcome: blob.outcome,
    };
  }

  global.SuperBoss = {
    QUESTIONS_PER_PHASE, PHASE_GATE, BAR_HP, INTER_PHASE_HEAL, PHASES,
    startRun, drawPhase, drawFinalPhase, valueKeyOf,
    currentQ, currentPhase, answer, endPhase, failPhase, phaseComplete,
    serialize, deserialize,
  };

  /**
   * Draw one phase's questions.
   *
   * Phases 1-4 draw ONLY from questions whose id AND whose tested value have
   * not been seen this run. Phase 5 is handled separately (see
   * drawFinalPhase) because it deliberately revisits misses.
   *
   * Throws when the unseen pool cannot fill the phase: that means the bank is
   * too thin for this phase, which is a content bug and must be visible.
   */
  function drawPhase(run, phaseIndex) {
    const phase = PHASES[phaseIndex];

    // A phase that was failed last attempt replays its own set, reshuffled.
    // These questions are SUPPOSED to repeat, so the unseen filters are
    // deliberately bypassed here.
    const pin = (run.pinned || {})[phase.id];
    if (pin && pin.length) {
      const byId = new Map(run.bank.map(q => [q.id, q]));
      const restored = pin.map(id => byId.get(id)).filter(Boolean);
      if (restored.length >= QUESTIONS_PER_PHASE) {
        return shuffle(restored).slice(0, QUESTIONS_PER_PHASE).map(shuffleChoices);
      }
      // Bank changed under the pin — fall through and draw fresh.
    }

    if (phase.id === 'p5-final') return drawFinalPhase(run);

    const asked = new Set(run.asked || []);
    const askedValues = new Set(run.askedValues || []);
    const pool = run.bank.filter(q =>
      q.phase === phase.n && !asked.has(q.id) && !askedValues.has(valueKeyOf(q)));

    if (pool.length < QUESTIONS_PER_PHASE) {
      throw new Error(
        'SuperBoss: phase ' + phase.id + ' has only ' + pool.length +
        ' unseen questions, needs ' + QUESTIONS_PER_PHASE +
        '. Bank is too thin — fix the content, do not repeat questions.');
    }

    // Within the draw itself, never take two questions on the same value.
    const picked = [];
    const takenValues = new Set();
    shuffle(pool).forEach(q => {
      if (picked.length >= QUESTIONS_PER_PHASE) return;
      const vk = valueKeyOf(q);
      if (takenValues.has(vk)) return;
      takenValues.add(vk);
      picked.push(q);
    });

    if (picked.length < QUESTIONS_PER_PHASE) {
      throw new Error(
        'SuperBoss: phase ' + phase.id + ' has only ' + picked.length +
        ' distinct values available, needs ' + QUESTIONS_PER_PHASE +
        '. Bank has too many duplicate values — fix the content.');
    }
    return picked.map(shuffleChoices);
  }

  /**
   * The final phase is the ONLY place a question may come back, and only on
   * purpose: it replays what this run got wrong, then tops up with questions
   * the run has not seen yet.
   */
  function drawFinalPhase(run) {
    const byId = new Map(run.bank.map(q => [q.id, q]));
    const missed = shuffle((run.missed || []).filter(id => byId.has(id)))
      .map(id => byId.get(id));

    if (missed.length >= QUESTIONS_PER_PHASE) {
      return missed.slice(0, QUESTIONS_PER_PHASE).map(shuffleChoices);
    }

    const taken = new Set(missed.map(q => q.id));
    const asked = new Set(run.asked || []);
    const unseen = shuffle(run.bank.filter(q => !asked.has(q.id) && !taken.has(q.id)));

    let picked = missed.concat(unseen.slice(0, QUESTIONS_PER_PHASE - missed.length));

    // Last resort: a run that answered almost everything correctly can exhaust
    // the unseen pool. Top up from already-asked questions rather than
    // shipping a short phase — this is the one sanctioned repeat.
    if (picked.length < QUESTIONS_PER_PHASE) {
      const used = new Set(picked.map(q => q.id));
      const rest = shuffle(run.bank.filter(q => !used.has(q.id)));
      picked = picked.concat(rest.slice(0, QUESTIONS_PER_PHASE - picked.length));
    }
    return picked.map(shuffleChoices);
  }
})(typeof window !== 'undefined' ? window : globalThis);
