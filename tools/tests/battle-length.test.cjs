'use strict';
const assert = require('node:assert/strict');
global.window = globalThis;
require('../../js/engine/state.js');
require('../../js/engine/battle.js');
const pool = Array.from({length: 40}, (_, i) => ({id: 'q'+i, q: 'Question '+i, choices: ['yes','no'], correct: 0, topic: 'test'}));
function start(questions, state) {
  return Battle.start({boss: {hp: 100}, playerMaxHp: 80, questionPool: questions, state});
}
for (const size of [5, 12, 30, 40]) {
  for (const state of [undefined, {}]) {
    const run = start(pool.slice(0, size), state);
    assert.equal(run.questions.length, 30);
    assert.equal(run.correctTarget, 24);
    assert.equal(new Set(run.questions.slice(0, Math.min(size,30)).map(q => q.id)).size, Math.min(size,30));
    for (const q of run.questions) assert.equal(q.choices[q.correct], 'yes');
  }
}
for (const correctCount of [23,24,30]) {
  const run = start(pool);
  for (let i=0; i<30; i++) {
    const q = Battle.currentQ(run);
    const result = Battle.answer(run, i<correctCount ? q.correct : 1-q.correct);
    assert.equal(result.gameOver, i===29);
  }
  assert.equal(run.outcome, correctCount>=24 ? 'victory' : 'defeat');
}
const legacy = start(pool);
legacy.questions = legacy.questions.slice(0,10);
legacy.correctTarget = 8;
for (let i=0; i<10; i++) Battle.answer(legacy, Battle.currentQ(legacy).correct);
assert.equal(legacy.outcome,'victory');
console.log('PASS 30-question pools, choice mapping, 80% pass boundary, and legacy sessions');

const balanced = start(pool);
assert.equal(Battle.answer(balanced, Battle.currentQ(balanced).correct).bossHpDelta, -3);
assert.equal(Battle.answer(balanced, Battle.currentQ(balanced).correct).bossHpDelta, -3);
assert.equal(Battle.answer(balanced, Battle.currentQ(balanced).correct).bossHpDelta, -5);
assert.equal(Battle.answer(balanced, 1 - Battle.currentQ(balanced).correct).playerHpDelta, -5);
balanced.shieldQueued = true;
assert.equal(Battle.answer(balanced, 1 - Battle.currentQ(balanced).correct).playerHpDelta, 0);
balanced.bossHp = 2;
assert.equal(Battle.answer(balanced, Battle.currentQ(balanced).correct).bossHpDelta, -2);
assert.equal(balanced.bossHp, 0);
balanced.playerHp = 2;
assert.equal(Battle.answer(balanced, 1 - Battle.currentQ(balanced).correct).playerHpDelta, -2);
assert.equal(balanced.playerHp, 0);
const oldFight = start(pool);
oldFight.questions = oldFight.questions.slice(0,10);
assert.equal(Battle.answer(oldFight, Battle.currentQ(oldFight).correct).bossHpDelta, -10);
assert.equal(Battle.answer(oldFight, 1 - Battle.currentQ(oldFight).correct).playerHpDelta, -15);
console.log('PASS scaled normal/critical/incoming damage, shields, clamping, and legacy damage');
