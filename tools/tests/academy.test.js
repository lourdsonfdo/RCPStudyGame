/* Run with: node tools/tests/academy.test.js */
'use strict';
const assert = require('node:assert/strict');
globalThis.window = globalThis;
require('../../js/engine/state.js');
require('../../js/engine/academy.js');
const bosses = [
  { id: 'empty', course: 'rcp103', questionTopics: ['empty'] },
  { id: 'copd', course: 'rcp103', questionTopics: ['copd'], description: 'COPD: breathing' },
  { id: 'abg', course: 'rcp103', questionTopics: ['abg'], description: 'ABG: interpretation' },
  { id: 'nmba', course: 'rcp104', questionTopics: ['nmba'] }
];
const questions = [
  ...Array.from({ length: 10 }, (_, i) => ({ q: 'COPD ' + i, topic: 'copd', course: 'rcp103' })),
  { q: 'ABG battle', topic: 'abg', course: 'rcp103', pool: 'battle' },
  { q: 'ABG training', topic: 'abg', course: 'rcp103', pool: 'training' },
  { q: 'ABG both', topic: 'abg', course: 'rcp103', pool: 'both' },
  { q: 'NMBA', topic: 'nmba', course: 'rcp104' },
  { q: 'Wrong course', topic: 'abg', course: 'rcp104' }
];
let count = 0;
function test(name, fn) { fn(); count++; console.log('✓ ' + name); }
test('fresh state skips unsupported bosses and caps drill count', () => {
  const r = Academy.recommendation({}, bosses, questions);
  assert.equal(r.boss.id, 'copd'); assert.equal(r.label, 'COPD');
  assert.equal(r.count, 8); assert.equal(r.isWeak, false); assert.equal(r.topic, null);
});
test('weak selection skips unavailable topics and uses lowest supported accuracy', () => {
  const state = { topicStats: { empty: { correct: 0, total: 5 }, copd: { correct: 2, total: 4 }, abg: { correct: 1, total: 4 } } };
  const before = JSON.stringify(state);
  const r = Academy.recommendation(state, bosses, questions);
  assert.equal(r.boss.id, 'abg'); assert.equal(r.topic, 'abg');
  assert.equal(r.label, 'ABG'); assert.equal(r.isWeak, true);
  assert.equal(r.count, 2); // Only training/both; battle and wrong course excluded.
  assert.equal(JSON.stringify(state), before);
});
test('insufficient evidence and 80% accuracy do not count as weak', () => {
  const r = Academy.recommendation({ topicStats: { abg: { correct: 0, total: 2 }, copd: { correct: 4, total: 5 } } }, bosses, questions);
  assert.equal(r.isWeak, false);
});
test('first undefeated supported boss, then first when all completed', () => {
  assert.equal(Academy.recommendation({ defeatedBosses: ['copd'] }, bosses, questions).boss.id, 'abg');
  assert.equal(Academy.recommendation({ defeatedBosses: bosses.map(b => b.id) }, bosses, questions).boss.id, 'copd');
});
test('no questions or bosses gives no recommendation', () => {
  assert.equal(Academy.recommendation({}, bosses, []), null);
  assert.equal(Academy.recommendation({}, [], questions), null);
});
test('review uses actual State weakness, deduplicates across courses, excludes unseen', () => {
  const state = { questionStats: {} };
  const missed = questions[0], lowAccuracy = questions[13];
  state.questionStats[State.qSig(missed)] = { seen: 2, correct: 1, lastWrong: Date.now() };
  state.questionStats[State.qSig(lowAccuracy)] = { seen: 5, correct: 1, lastWrong: 0 };
  const before = JSON.stringify(state);
  const result = Academy.reviewQuestions(state, [lowAccuracy, missed, { ...missed, course: 'rcp104' }, questions[1]]);
  assert.deepEqual(result, [missed, lowAccuracy]);
  assert.equal(JSON.stringify(state), before);
  assert.deepEqual(Academy.reviewQuestions({}, questions), []);
});
test('resume requires existing boss, matching course and unfinished session', () => {
  const saved = { bossId: 'abg', course: 'rcp103', session: { outcome: null, questions: [questions[10]], qIndex: 0, items: [] } };
  assert.equal(Academy.resumableBattle({ battleRun: saved }, bosses), saved);
  for (const bad of [null, { ...saved, bossId: 'removed' }, { ...saved, course: 'rcp104' },
    { ...saved, session: null }, { ...saved, session: {} },
    { ...saved, session: { ...saved.session, qIndex: 1 } }, { ...saved, session: { outcome: 'win' } }]) {
    assert.equal(Academy.resumableBattle({ battleRun: bad }, bosses), null);
  }
});
console.log(`${count} academy tests passed`);
