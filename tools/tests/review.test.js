/* Spaced-repetition (Leitner box) tests for State. Run with: node tools/tests/review.test.js */
'use strict';
const assert = require('node:assert/strict');
globalThis.window = globalThis;
require('../../js/engine/state.js');
require('../../js/engine/academy.js');

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 1, 12);  // fixed clock for every test
const q = (text, extra) => ({ q: text, topic: 'abg', course: 'rcp202', ...extra });
const stat = (state, question) => state.questionStats[State.qSig(question)];

let count = 0;
function test(name, fn) { fn(); count++; console.log('✓ ' + name); }

test('correct answers on a never-missed question do not enter review', () => {
  const state = {}, a = q('A');
  State.recordAnswer(state, a, true, T0);
  State.recordAnswer(state, a, true, T0);
  assert.equal(State.isWeakQuestion(state, a, T0), false);
  assert.equal(stat(state, a).box, undefined);
});

test('a miss puts the question in box 0, due immediately', () => {
  const state = {}, a = q('A');
  State.recordAnswer(state, a, false, T0);
  assert.equal(stat(state, a).box, 0);
  assert.equal(State.isWeakQuestion(state, a, T0), true);
});

test('a correct review moves it up a box and schedules it 1 day out', () => {
  const state = {}, a = q('A');
  State.recordAnswer(state, a, false, T0);
  State.recordAnswer(state, a, true, T0);
  assert.equal(stat(state, a).box, 1);
  assert.equal(State.isWeakQuestion(state, a, T0), false, 'not due right after a correct review');
  assert.equal(State.isWeakQuestion(state, a, T0 + DAY - 1), false);
  assert.equal(State.isWeakQuestion(state, a, T0 + DAY), true, 'due again after 1 day');
});

test('intervals grow 1, 3, 7, 14 days, then the question is mastered', () => {
  const state = {}, a = q('A');
  State.recordAnswer(state, a, false, T0);
  let now = T0;
  for (const [box, days] of [[1, 1], [2, 3], [3, 7], [4, 14]]) {
    State.recordAnswer(state, a, true, now);
    assert.equal(stat(state, a).box, box);
    assert.equal(stat(state, a).due, now + days * DAY, `box ${box} due in ${days} days`);
    now += days * DAY;
  }
  State.recordAnswer(state, a, true, now);
  assert.equal(stat(state, a).box, State.MASTERED_BOX);
  assert.equal(State.isWeakQuestion(state, a, now + 365 * DAY), false, 'mastered never comes due');
});

test('a miss at any box, even mastered, resets to box 0 and due now', () => {
  const state = {}, a = q('A');
  State.recordAnswer(state, a, false, T0);
  for (let i = 0; i < 5; i++) State.recordAnswer(state, a, true, T0 + i * 30 * DAY);
  assert.equal(stat(state, a).box, State.MASTERED_BOX);
  const later = T0 + 400 * DAY;
  State.recordAnswer(state, a, false, later);
  assert.equal(stat(state, a).box, 0);
  assert.equal(State.isWeakQuestion(state, a, later), true);
});

test('the old 14-day rule is gone: miss then correct is no longer weak for two weeks', () => {
  const state = {}, a = q('A');
  State.recordAnswer(state, a, false, T0);
  State.recordAnswer(state, a, true, T0 + 1000);
  assert.equal(State.isWeakQuestion(state, a, T0 + 2 * 60 * 60 * 1000), false);
});

test('legacy entries (saved before boxes) count as due, then progress normally', () => {
  const missed = q('missed'), lowAcc = q('low accuracy'), fine = q('fine');
  const state = { questionStats: {
    [State.qSig(missed)]: { seen: 2, correct: 1, lastWrong: T0 - 30 * DAY },
    [State.qSig(lowAcc)]: { seen: 5, correct: 1, lastWrong: 0 },
    [State.qSig(fine)]: { seen: 4, correct: 4, lastWrong: 0 },
  } };
  assert.equal(State.isWeakQuestion(state, missed, T0), true, 'any past miss is due once');
  assert.equal(State.isWeakQuestion(state, lowAcc, T0), true, 'accuracy below 60% is due');
  assert.equal(State.isWeakQuestion(state, fine, T0), false);
  State.recordAnswer(state, missed, true, T0);
  assert.equal(stat(state, missed).box, 1);
  assert.equal(stat(state, missed).seen, 3, 'existing counts are kept');
  assert.equal(State.isWeakQuestion(state, missed, T0), false);
});

test('checking weakness and building the review list never modify saved state', () => {
  const a = q('A'), b = q('B');
  const state = { questionStats: { [State.qSig(a)]: { seen: 1, correct: 0, lastWrong: T0 } } };
  State.recordAnswer(state, b, false, T0);
  const before = JSON.stringify(state);
  State.isWeakQuestion(state, a, T0);
  Academy.reviewQuestions(state, [a, b], T0);
  State.reviewSummary(state, T0);
  assert.equal(JSON.stringify(state), before);
});

test('review list: due only, lowest box first, then most recently missed', () => {
  const state = {}, early = q('early miss'), late = q('late miss'), climbing = q('climbing'), notDue = q('not due');
  State.recordAnswer(state, early, false, T0);
  State.recordAnswer(state, late, false, T0 + 5 * DAY);
  State.recordAnswer(state, climbing, false, T0);
  State.recordAnswer(state, climbing, true, T0);           // box 1, due T0 + 1 day
  State.recordAnswer(state, notDue, false, T0);
  State.recordAnswer(state, notDue, true, T0 + 5 * DAY);   // box 1, due T0 + 6 days
  const list = Academy.reviewQuestions(state, [climbing, notDue, early, late], T0 + 5 * DAY);
  assert.deepEqual(list.map(x => x.q), ['late miss', 'early miss', 'climbing']);
});

test('reviewSummary counts due, scheduled and mastered, and the next due time', () => {
  const state = {}, a = q('A'), b = q('B'), c = q('C');
  State.recordAnswer(state, a, false, T0);                                   // due now
  State.recordAnswer(state, b, false, T0); State.recordAnswer(state, b, true, T0);  // box 1, due +1 day
  State.recordAnswer(state, c, false, T0);
  for (let i = 0; i < 5; i++) State.recordAnswer(state, c, true, T0);        // mastered
  assert.deepEqual(State.reviewSummary(state, T0), { due: 1, scheduled: 1, mastered: 1, nextDue: T0 + DAY });
});

console.log(`${count} review tests passed`);
