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
