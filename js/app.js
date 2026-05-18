/* ============================================================
   APP — screen router and global state hub
   Exposes `App` global.
   ============================================================ */
(function (global) {
  'use strict';

  let state = null;                  // current game state (loaded from localStorage)
  let currentScreen = 'home';
  const screenInits = {};            // map: screenId → render fn(ctx)
  let routeCtx = {};                 // arbitrary data passed between screens

  function $screen(id) { return document.querySelector(`[data-screen="${id}"]`); }

  function goto(screenId, ctx = {}) {
    routeCtx = { ...ctx };
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = $screen(screenId);
    if (!el) { console.error('Unknown screen:', screenId); return; }
    el.classList.add('active');
    currentScreen = screenId;
    window.scrollTo(0, 0);

    const init = screenInits[screenId];
    if (init) init({ root: el, state, ctx: routeCtx });
    else el.innerHTML = `<div class="panel t-center t-mute">Screen <b>${screenId}</b> not implemented.</div>`;
  }

  function registerScreen(id, init) { screenInits[id] = init; }

  function refresh() { goto(currentScreen, routeCtx); }

  function getState() { return state; }
  function persist()  { State.save(state); }

  function toast(msg, ms = 1800) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  // ────────────────────────────  BOOT  ──────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    state = State.load();

    // Seed daily challenge if content is available
    if (global.ALL_BOSSES && global.ALL_BOSSES.length) {
      State.ensureDailyChallenge(state, global.ALL_BOSSES.map(b => ({ id: b.id, name: b.name, course: b.course })));
      State.save(state);
    }
    goto('home');
  });

  // ────────────────────────────  EXPORT  ────────────────────────────
  global.App = { goto, registerScreen, refresh, getState, persist, toast };
})(window);
