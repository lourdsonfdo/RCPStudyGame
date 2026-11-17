#!/usr/bin/env node
/* The Final and TMC courses must match the Recall app's banks question for question.
   Loads every content file the way the browser does, then compares the three new
   courses with ~/recall (skipped with a notice when Recall is not on this machine).
   Usage: node tools/tests/finals-content.test.cjs */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), assert = require('assert');
const root = path.join(__dirname, '..', '..');
globalThis.window = globalThis;

// Load content in index.html's order.
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/src="(content\/[^"?]+)/g)].map(m => m[1]);
for (const f of ['content/rcp202-final.js', 'content/rcp203-final.js', 'content/tmc-boards.js']) {
  assert(files.includes(f), `index.html does not load ${f}`);
  assert(fs.readFileSync(path.join(root, 'sw.js'), 'utf8').includes('/RCPStudyGame/' + f), `sw.js does not precache ${f}`);
}
files.forEach(f => require(path.join(root, f)));
require(path.join(root, 'js/engine/academy.js'));

const B = window.ALL_BOSSES, Q = window.ALL_QUESTIONS;
const expected = { rcp202f: [18, 887], rcp203f: [7, 702], rcptmc: [15, 420] };
let checks = 0;
for (const [cid, [nb, nq]] of Object.entries(expected)) {
  const bosses = B.filter(b => b.course === cid), qs = Q.filter(q => q.course === cid);
  assert.strictEqual(bosses.length, nb, `${cid} bosses`);
  assert.strictEqual(qs.length, nq, `${cid} questions`);
  assert(window.Academy.COURSES.some(c => c.id === cid), `${cid} missing from Academy.COURSES`);
  assert.strictEqual(window.Academy.course(cid).short, cid.replace(/^rcp/, ''), `${cid} survival key`);
  for (const b of bosses) {
    const pool = qs.filter(q => b.questionTopics.includes(q.topic));
    assert(pool.length >= 10, `${b.id} has only ${pool.length} questions`);
    assert(b.name && b.emoji && b.description, `${b.id} is missing a name, emoji or description`);
  }
  for (const q of qs) {
    assert(bosses.some(b => b.questionTopics.includes(q.topic)), `${q.id} has no boss`);
    assert(q.choices.length === 4 && new Set(q.choices).size === 4 && q.correct === 0, `${q.id} choices`);
    assert(q.q.trim() && q.explanation.trim(), `${q.id} empty text`);
    checks++;
  }
}
// Ids are unique across the whole game, and old courses are untouched by the new files.
assert.strictEqual(new Set(B.map(b => b.id)).size, B.length, 'duplicate boss id');
const newIds = Q.filter(q => expected[q.course]).map(q => q.id);
assert.strictEqual(new Set(newIds).size, newIds.length, 'duplicate question id in the new courses');
const oldIds = new Set(Q.filter(q => !expected[q.course]).map(q => q.id));
assert(!newIds.some(id => oldIds.has(id)), 'a new question id collides with an older course');

// Compare with Recall, question for question.
const recall = path.join(os.homedir(), 'recall');
if (!fs.existsSync(path.join(recall, 'drills', 'rcp202-final.json'))) {
  console.log(`finals-content: ${checks} structure checks passed (Recall not found, source comparison skipped)`);
  process.exit(0);
}
const sig = (stem, opts, why) => JSON.stringify([stem, opts, why]);
const game = cid => Q.filter(q => q.course === cid).map(q => sig(q.q, q.choices, q.explanation));
let compared = 0;
for (const [cid, file] of [['rcp202f', 'rcp202-final.json'], ['rcp203f', 'rcp203-final.json']]) {
  const drill = JSON.parse(fs.readFileSync(path.join(recall, 'drills', file), 'utf8'));
  const src = drill.sections.flatMap(s => s.q.map(q => sig(q.q, q.o, q.e)));
  assert.deepStrictEqual(game(cid), src, `${cid} differs from Recall ${file}`);
  // each Recall section maps to exactly one boss, in order
  const bosses = B.filter(b => b.course === cid);
  drill.sections.forEach((s, i) => {
    assert.strictEqual(bosses[i].description, s.title, `${cid} section ${s.id} title`);
    assert.strictEqual(Q.filter(q => q.topic === bosses[i].id).length, s.q.length, `${cid} ${s.id} count`);
  });
  compared += src.length;
}
const page = fs.readFileSync(path.join(recall, 'guides', 'tmc-trainer.html'), 'utf8');
// Since 2026-11-17 the page is the 2027 RTE trainer: its bank is <script id="bank" type="application/json">,
// and the game uses the 420 book-sourced breadth items (ids C<chapter>-Q<n>). The 2020 page used window.__BANK__.
let bank;
if (page.includes('window.__BANK__ = ')) {
  const start = page.indexOf('window.__BANK__ = ') + 'window.__BANK__ = '.length;
  bank = JSON.parse(page.slice(start, page.indexOf('</script>', start)).trim().replace(/;$/, ''));
} else {
  const m = page.match(/<script id="bank" type="application\/json">([\s\S]*?)<\/script>/);
  assert(m, 'no RTE bank in tmc-trainer.html');
  const rte = JSON.parse(m[1]);
  bank = { questions: rte.breadth.filter(q => q.origin === 'heuer').map(q => ({ ...q, ch: Number(q.id.slice(1, 3)) })) };
  assert.strictEqual(bank.questions.length, 420, 'expected 420 book-sourced RTE breadth items');
}
assert(bank.questions.every(q => q.key === 0), 'a TMC key is not 0');
const tmcSrc = bank.questions.map(q => sig(q.stem, q.opts, q.why)).sort();
assert.deepStrictEqual(game('rcptmc').sort(), tmcSrc, 'rcptmc differs from the Recall TMC trainer');
// every TMC question sits under the boss for its own NBRC chapter
const merged = { 7: 'tmc-c07', 8: 'tmc-c07', 16: 'tmc-c16', 17: 'tmc-c16' };
const byStem = new Map(Q.filter(q => q.course === 'rcptmc').map(q => [q.q + '\u0000' + q.choices[0], q]));
for (const q of bank.questions) {
  const want = merged[q.ch] || 'tmc-c' + String(q.ch).padStart(2, '0');
  const got = byStem.get(q.stem + '\u0000' + q.opts[0]);
  assert(got && got.topic === want, `${q.id} is under ${got && got.topic}, expected ${want}`);
  assert(got.srcItem.includes(q.id) && got.srcItem.includes(q.sec), `${q.id} source tag`);
}
compared += tmcSrc.length;
console.log(`finals-content: ${checks} structure checks passed, ${compared} questions identical to Recall`);
