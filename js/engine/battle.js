/* ============================================================
   BATTLE ENGINE — boss fight session state machine
   Exposes `Battle` global.
   ============================================================ */
(function (global) {
  'use strict';

  const QUESTIONS_PER_FIGHT = 10;
  const MISSION_TARGET     = 8;   // correct answers needed to pass the boss
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

  // Randomize the order of a question's choices and remap `correct` accordingly.
  // Returns a NEW question object — original is untouched.
  function shuffleChoices(q) {
    const order = q.choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      ...q,
      choices: order.map(i => q.choices[i]),
      correct: order.indexOf(q.correct),
    };
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
  function start({ boss, playerMaxHp, equipped, isDaily, questionPool, state }) {
    const items = isDaily ? [] : (equipped || []).slice();
    // If we have access to the player's state, bias the pool toward questions
    // they've recently missed (light spaced repetition).
    const picked = (state && State.biasedQuestionPool)
      ? State.biasedQuestionPool(state, questionPool, { targetCount: QUESTIONS_PER_FIGHT, weakRatio: 0.5 })
      : shuffle(questionPool).slice(0, QUESTIONS_PER_FIGHT);
    const questions = picked.map(shuffleChoices);

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
      correctTarget: MISSION_TARGET,  // 8 of 10 = pass
      hintUsedThisQ: false,
      shieldQueued: false,    // shield rune absorbs the NEXT wrong answer
      doubleXpActive: items.includes('doubleXpTome'),
      isDaily: !!isDaily,
      outcome: null,          // 'victory' | 'defeat' | null
      xpEarned: 0,
      goldEarned: 0,
      // History of every answer this fight (for end-of-battle review screen)
      answers: [],
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

    // record this answer for the post-battle review screen
    b.answers.push({
      q: q.q,
      choices: q.choices.slice(),
      chose: choiceIdx,
      correctIdx: q.correct,
      isCorrect,
      explanation: q.explanation,
      topic: q.topic,
    });

    // advance
    b.qIndex += 1;
    b.hintUsedThisQ = false;

    // outcome — always play all 10 questions; victory = correctCount >= 8
    let gameOver = false;
    if (b.qIndex >= b.questions.length) {
      b.outcome = b.correctCount >= b.correctTarget ? 'victory' : 'defeat';
      gameOver = true;
    }

    return { correct: isCorrect, bossHpDelta, playerHpDelta, crit, shielded, gameOver, explanation: q.explanation };
  }

  /**
   * Uses an item. Returns { used, effect }.
   * key: 'healthPotion' | 'hintScroll' | 'shieldRune'  (double XP auto-applies)
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
