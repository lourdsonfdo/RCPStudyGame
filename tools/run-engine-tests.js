#!/usr/bin/env node
/* Headless runner for the superboss engine suite.
   Usage: node tools/run-engine-tests.js */
'use strict';

const path = require('path');

globalThis.window = globalThis;

require(path.join(__dirname, '..', 'js', 'engine', 'superboss.js'));
require(path.join(__dirname, 'tests', 'superboss.test.js'));

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(name + (detail ? ' — ' + detail : ''));
  }
}

globalThis.SuperBossTests(check);

failures.forEach(f => console.error('  ✗ ' + f));
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
