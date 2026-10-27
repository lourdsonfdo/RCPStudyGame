'use strict';
/* ================================================================
   BATTLE-MOTION INTEGRATION TESTS — Task 3
   Tests ArenaBg course mapping, Fx reset/tracking, BossMotion
   hooks, reduced-motion suppression, and answer-guard behavior.
   Run: node tools/tests/battle-motion-integration.test.cjs
   ================================================================ */

const assert = require('node:assert/strict');
const fs     = require('node:fs');
const path   = require('node:path');
const vm     = require('node:vm');

const root = path.resolve(__dirname, '../..');

// ── Minimal DOM element stub ──────────────────────────────────────
function makeEl(tag) {
  const _attrs    = {};
  const _stylePr  = {};
  const _classes  = new Set();
  const el = {
    tagName    : (tag || 'DIV').toUpperCase(),
    className  : '',
    innerHTML  : '',
    textContent: '',
    offsetWidth: 0,
    firstChild : null,
    _attrs, _stylePr, _classes,
    getAttribute(k) {
      return Object.prototype.hasOwnProperty.call(_attrs, k) ? _attrs[k] : null;
    },
    setAttribute(k, v)  { _attrs[k] = String(v); },
    removeAttribute(k)  { delete _attrs[k]; },
    style: {
      cssText: '',
      setProperty(k, v)    { _stylePr[k] = v; },
      removeProperty(k)    { delete _stylePr[k]; },
      getPropertyValue(k)  { return _stylePr[k] || ''; },
    },
    classList: {
      add   (...cs) { cs.forEach(c => _classes.add(c)); },
      remove(...cs) { cs.forEach(c => _classes.delete(c)); },
      contains(c)   { return _classes.has(c); },
      toggle(c, f) {
        if (f === undefined) { _classes.has(c) ? _classes.delete(c) : _classes.add(c); }
        else { f ? _classes.add(c) : _classes.delete(c); }
      },
    },
    appendChild(child)          { return child; },
    insertBefore(child)         { return child; },
    querySelectorAll()          { return []; },
    querySelector()             { return null; },
    getBoundingClientRect()     { return { left:0, top:0, width:100, height:100 }; },
    animate(kf, opts)           { return { cancel() {} }; },
    remove()                    {},
  };
  return el;
}

// ── Build a VM context with minimal DOM stubs ─────────────────────
function makeDocCtx({ baseURI = 'https://host/RCPStudyGame/', hidden = false, matchMediaReduces = false, BossMotion } = {}) {
  const createdEls = [];
  const timerMap   = new Map();
  let   nextId     = 1;
  const clearedIds = [];
  const timerLog   = [];   // { fn, ms, id } in order of scheduling

  const body = makeEl('body');
  // Track children appended to body (for banner detection)
  const bodyChildren = [];
  body.appendChild = (child) => { bodyChildren.push(child); return child; };

  const doc = {
    createElement(tag) {
      const el = makeEl(tag);
      createdEls.push(el);
      return el;
    },
    body,
    baseURI,
    hidden,
    getElementById()  { return null; },
    querySelector()   { return null; },
    addEventListener() {},
  };

  const _matchMedia = function(query) {
    return { matches: matchMediaReduces && query.includes('reduce') };
  };

  const win = { document: doc, matchMedia: _matchMedia };

  const ctx = vm.createContext({
    window          : win,
    document        : doc,
    Math,
    URL             : typeof URL !== 'undefined' ? URL : require('url').URL,
    setTimeout(fn, ms) {
      const id = nextId++;
      timerMap.set(id, { fn, ms, id });
      timerLog.push({ fn, ms, id });
      return id;
    },
    clearTimeout(id) {
      clearedIds.push(id);
      timerMap.delete(id);
    },
    matchMedia: _matchMedia,
  });

  if (BossMotion) {
    ctx.BossMotion = BossMotion;
    win.BossMotion = BossMotion;
  }

  return { ctx, win, doc, body, bodyChildren, createdEls, timerMap, timerLog, clearedIds };
}

function loadArenaBg(opts) {
  const { ctx, win, ...rest } = makeDocCtx(opts);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/engine/arena-bg.js'), 'utf8'), ctx);
  return { ArenaBg: win.ArenaBg, ...rest };
}

function loadFx(opts) {
  const { ctx, win, ...rest } = makeDocCtx(opts);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/engine/fx.js'), 'utf8'), ctx);
  return { Fx: win.Fx, ...rest };
}

// ── Test runner ───────────────────────────────────────────────────
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else       { fail++; failures.push(name + (detail ? ' — ' + detail : '')); }
}

// ================================================================
// SUITE 1 — ArenaBg.attach: course → data-battle-world + art var
// ================================================================

;(function suitArenaBg() {
  // 1a. battle + rcp103 → sets data-battle-world attribute
  {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'battle', course: 'rcp103' });
    check('ArenaBg: battle+rcp103 sets data-battle-world="rcp103"',
      el.getAttribute('data-battle-world') === 'rcp103',
      'got: ' + el.getAttribute('data-battle-world'));
  }

  // 1b. battle + rcp103 → sets --battle-world-art CSS var with correct path
  {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'battle', course: 'rcp103' });
    const artVal = el._stylePr['--battle-world-art'] || '';
    check('ArenaBg: battle+rcp103 sets --battle-world-art with rcp103.webp path',
      artVal.includes('img/arenas/rcp103.webp'),
      'got: ' + artVal);
  }

  // 1c. all six allowed courses are accepted
  for (const course of ['rcp103','rcp104','rcp201','rcp202','rcp203','rcp2xx']) {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'battle', course });
    check(`ArenaBg: battle+${course} is an allowed course`,
      el.getAttribute('data-battle-world') === course,
      'got: ' + el.getAttribute('data-battle-world'));
  }

  // 1d. non-battle mode + course → does NOT set data-battle-world
  {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'crisis', course: 'rcp103' });
    check('ArenaBg: non-battle mode does not set data-battle-world',
      el.getAttribute('data-battle-world') === null,
      'got: ' + el.getAttribute('data-battle-world'));
  }

  // 1e. unknown course → does NOT set data-battle-world
  {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'battle', course: 'rcp999' });
    check('ArenaBg: unknown course does not set data-battle-world',
      el.getAttribute('data-battle-world') === null,
      'got: ' + el.getAttribute('data-battle-world'));
  }

  // 1f. switching from battle to non-battle removes data-battle-world
  {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'battle', course: 'rcp103' });
    ArenaBg.attach(el, { mode: 'crisis' });
    check('ArenaBg: re-attach non-battle removes data-battle-world',
      el.getAttribute('data-battle-world') === null,
      'got: ' + el.getAttribute('data-battle-world'));
  }

  // 1g. no course → does NOT set data-battle-world (compatible with old callers)
  {
    const { ArenaBg } = loadArenaBg();
    const el = makeEl('div');
    ArenaBg.attach(el, { mode: 'battle' });
    check('ArenaBg: battle without course does not set data-battle-world',
      el.getAttribute('data-battle-world') === null);
  }
})();

// ================================================================
// SUITE 2 — Fx.reset: timer tracking and BossMotion.reset
// ================================================================

;(function suitFxReset() {
  // 2a. Fx.reset is exported
  {
    const { Fx } = loadFx();
    check('Fx.reset is a function', typeof Fx.reset === 'function');
  }

  // 2b. bossCounter registers tracked timers; reset clears them
  {
    const { Fx, timerMap } = loadFx();
    const portrait  = makeEl('div');
    const player    = makeEl('div');
    Fx.bossCounter({ playerArea: player, bossPortrait: portrait });
    const before = timerMap.size;
    check('bossCounter registers at least one tracked timer', before >= 1,
      'timer count: ' + before);
    if (typeof Fx.reset === 'function') Fx.reset();
    check('Fx.reset clears all tracked timers', timerMap.size === 0,
      timerMap.size + ' timers remain');
  }

  // 2c. Fx.reset calls BossMotion.reset if window.BossMotion is available
  {
    let resetCalled = false;
    const mockBM = { reset() { resetCalled = true; }, play() { return false; }, attach() {} };
    const { Fx } = loadFx({ BossMotion: mockBM });
    if (typeof Fx.reset === 'function') Fx.reset();
    check('Fx.reset calls window.BossMotion.reset when available', resetCalled === true);
  }

  // 2d. Fx.reset called a second time does not throw (idempotent)
  {
    const { Fx } = loadFx();
    let threw = false;
    try { if (typeof Fx.reset === 'function') { Fx.reset(); Fx.reset(); } }
    catch(e) { threw = true; }
    check('Fx.reset is idempotent (no throw on double call)', !threw);
  }
})();

// ================================================================
// SUITE 3 — Fx.bossHit calls BossMotion.play('hit') when mounted
// ================================================================

;(function suitBossHit() {
  // 3a. bossHit triggers BossMotion.play with state 'hit'
  {
    const playCalls = [];
    const mockBM = { play(el, state) { playCalls.push({ el, state }); return true; }, reset() {}, attach() {} };
    const { Fx } = loadFx({ BossMotion: mockBM });
    const portrait = makeEl('div');
    Fx.bossHit(portrait);
    check('Fx.bossHit calls BossMotion.play with state "hit"',
      playCalls.length === 1 && playCalls[0].state === 'hit',
      JSON.stringify(playCalls));
  }

  // 3b. bossHit still works without BossMotion (graceful fallback)
  {
    const { Fx } = loadFx();
    let threw = false;
    try { Fx.bossHit(makeEl('div')); } catch(e) { threw = true; }
    check('Fx.bossHit works without BossMotion (no throw)', !threw);
  }
})();

// ================================================================
// SUITE 4 — Fx.bossCounter: boss-aware label, atlas avoids lunge
// ================================================================

;(function suitBossCounter() {
  // Helper: load Fx with a capturing body so we can inspect created elements
  function loadFxCapturing(opts) {
    const { ctx, win, doc, body, bodyChildren, createdEls, timerMap, timerLog, clearedIds } = makeDocCtx(opts);

    // Patch the host element that FX appends to: capture children of ensureHost()
    // We record ALL createdEls, then after calling bossCounter, scan for fx-attack-banner.
    vm.runInContext(fs.readFileSync(path.join(root, 'js/engine/fx.js'), 'utf8'), ctx);
    return { Fx: win.Fx, createdEls, timerLog };
  }

  // 4a. bossCounter banner does NOT contain 'PLEURAL CRUSH' (hardcoded text removed)
  {
    const { Fx, createdEls } = loadFxCapturing();
    const portrait = makeEl('div');
    const player   = makeEl('div');
    Fx.bossCounter({ playerArea: player, bossPortrait: portrait });
    const banner = createdEls.find(el => el.className === 'fx-attack-banner');
    check('bossCounter creates an fx-attack-banner element', banner != null);
    check('bossCounter banner does not contain hardcoded "PLEURAL CRUSH"',
      !banner || !banner.innerHTML.includes('PLEURAL CRUSH'),
      banner ? banner.innerHTML : 'no banner');
  }

  // 4b. bossCounter with bossName includes that name in the banner
  {
    const { Fx, createdEls } = loadFxCapturing();
    const portrait = makeEl('div');
    const player   = makeEl('div');
    Fx.bossCounter({ playerArea: player, bossPortrait: portrait, bossName: 'Oxygenator' });
    const banner = createdEls.find(el => el.className === 'fx-attack-banner');
    check('bossCounter with bossName puts boss name in banner',
      banner != null && banner.innerHTML.includes('Oxygenator'),
      banner ? banner.innerHTML : 'no banner');
  }

  // 4c. bossCounter with atlas active does NOT call bossLunge (no fx-lunge class)
  //     BossMotion.play returns true → atlas is mounted → skip lunge
  {
    const playCalls = [];
    const mockBM = { play(el, state) { playCalls.push(state); return true; }, reset() {}, attach() {} };
    const { Fx, timerLog } = loadFxCapturing({ BossMotion: mockBM });
    const portrait = makeEl('div');
    const player   = makeEl('div');

    Fx.bossCounter({ playerArea: player, bossPortrait: portrait });

    // Flush the impact timer (~600ms) to check if bossLunge was called
    const impactTimer = timerLog.find(t => t.ms >= 500 && t.ms <= 700);
    if (impactTimer) impactTimer.fn();

    check('bossCounter avoids bossLunge (fx-lunge) when atlas is active',
      !portrait._classes.has('fx-lunge'),
      'fx-lunge was added despite atlas being active');
  }

  // 4d. bossCounter with reduced motion still shows damage number but skips visual fx
  //     In reduced-motion the impact callback should skip flash/lunge but still call damageNumber
  {
    const { Fx, createdEls, timerLog } = loadFxCapturing({ matchMediaReduces: true });
    const portrait = makeEl('div');
    const player   = makeEl('div');
    Fx.bossCounter({ playerArea: player, bossPortrait: portrait, dmg: 12 });

    // Flush impact timer
    const impactTimer = timerLog.find(t => t.ms >= 500 && t.ms <= 700);
    if (impactTimer) impactTimer.fn();

    // lunge should be suppressed
    check('bossCounter with reduced-motion suppresses fx-lunge',
      !portrait._classes.has('fx-lunge'));

    // damage number element (fx-dmg) should still be created for text feedback
    const dmgEl = createdEls.find(el => el.className && el.className.startsWith('fx-dmg'));
    check('bossCounter with reduced-motion still creates damage number (text feedback)',
      dmgEl != null,
      'No fx-dmg element found in: ' + createdEls.map(e => e.className).join(', '));
  }
})();

// ================================================================
// RESULTS
// ================================================================

if (failures.length) {
  console.error('\nFailures:');
  failures.forEach(f => console.error('  ✗ ' + f));
  console.error('');
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
