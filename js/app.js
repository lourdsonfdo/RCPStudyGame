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

  // ── Navigation history stack ─────────────────────────────────
  // Each entry: { screen: string, ctx: object }
  // We push the previous screen+ctx whenever goto() moves forward.
  // App.back() pops one entry and switches to it.
  const history = [];
  // Screens that should NEVER appear as a "back" target — going back from
  // them does nothing meaningful, or they're terminal/transient overlays.
  const NO_BACK_TO = new Set(['battle', 'crisis', 'level-up', 'results', 'outcome']);

  function $screen(id) { return document.querySelector(`[data-screen="${id}"]`); }

  /**
   * Navigate to a screen.
   * opts:
   *   replace      — don't push current screen onto history (used by App.back internally)
   *   clearHistory — wipe history first (used by terminal transitions: battle→results, crisis→outcome)
   */
  function goto(screenId, ctx = {}, opts = {}) {
    if (opts.clearHistory) history.length = 0;

    const isInitial = !document.querySelector('.screen.active');

    // Push current screen onto history before navigating away (unless replacing or it's the initial boot)
    if (!isInitial && !opts.replace && currentScreen && currentScreen !== screenId) {
      // Don't record returns through transient overlays
      if (!NO_BACK_TO.has(currentScreen)) {
        history.push({ screen: currentScreen, ctx: routeCtx });
        // Cap stack to prevent unbounded growth
        if (history.length > 20) history.shift();
      }
    }

    if (isInitial || currentScreen === screenId) { _doSwitch(screenId, ctx); return; }
    _transition(() => _doSwitch(screenId, ctx));
  }

  /** Pop history stack and navigate back. Falls through to home if stack is empty. */
  function back() {
    const prev = history.pop();
    if (prev) {
      _transition(() => _doSwitch(prev.screen, prev.ctx));
    } else {
      // Empty history → go home
      if (currentScreen === 'home') return; // already there
      _transition(() => _doSwitch('home', {}));
    }
  }

  function canGoBack() { return history.length > 0 && currentScreen !== 'home'; }

  function _doSwitch(screenId, ctx) {
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

  function _transition(midpointFn) {
    // Build pixel grid overlay
    const overlay = document.createElement('div');
    overlay.className = 'screen-transition';
    const cells = 16 * 24;
    // Randomize delay per cell so dissolve looks pixel-art-y
    const order = Array.from({ length: cells }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let i = 0; i < cells; i++) {
      const cell = document.createElement('div');
      cell.className = 'pixel';
      cell.style.animationDelay = (order[i] / cells * 0.15) + 's';
      overlay.appendChild(cell);
    }
    document.body.appendChild(overlay);

    // After fade-in completes, switch screens then fade out
    setTimeout(() => {
      midpointFn();
      overlay.classList.add('out');
      // Reverse delays for fade-out so it doesn't all clear at once
      overlay.querySelectorAll('.pixel').forEach((c, i) => {
        c.style.animationDelay = (order[i] / cells * 0.15) + 's';
      });
      setTimeout(() => overlay.remove(), 450);
    }, 250);
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

  function injectMiniPlayer() {
    if (document.querySelector('.music-mini')) return;
    const mini = document.createElement('div');
    mini.className = 'music-mini';
    document.body.appendChild(mini);

    const popover = document.createElement('div');
    popover.className = 'music-popover';
    document.body.appendChild(popover);

    function renderMini() {
      const s = Audio_.get();
      const t = Audio_.tracks().find(tr => tr.id === s.track) || Audio_.tracks()[0];
      const playing = s.track !== 'off';
      mini.classList.toggle('playing', playing);
      mini.innerHTML = `
        <span class="mm-icon">${t.emoji}</span>
        <span class="mm-track">${t.label.toUpperCase()}</span>
        ${playing ? '<span class="mm-eq"><span></span><span></span><span></span></span>' : ''}
      `;
    }

    function renderPopover() {
      const s = Audio_.get();
      popover.innerHTML = `
        <div class="mp-label">SOUNDTRACK</div>
        ${Audio_.tracks().map(t => `
          <div class="mp-row ${s.track === t.id ? 'active' : ''}" data-pick="${t.id}">
            <span class="mp-emoji">${t.emoji}</span>
            <span>${t.label}</span>
          </div>
        `).join('')}
        <div class="mp-label" style="margin-top:4px;">VOLUME</div>
        <div class="mp-volume">
          <span>🔉</span>
          <input type="range" min="0" max="100" value="${Math.round(s.volume * 100)}" id="mp-vol">
          <span>🔊</span>
        </div>
        ${s.usingProcedural ? '<div class="mp-label" style="margin-top:4px; color:var(--orange);">⚡ 8-BIT FALLBACK</div>' : ''}
      `;
      popover.querySelectorAll('[data-pick]').forEach(row => {
        row.addEventListener('click', () => { Audio_.play(row.dataset.pick); });
      });
      const vol = popover.querySelector('#mp-vol');
      if (vol) vol.addEventListener('input', e => Audio_.setVolume(+e.target.value / 100));
    }

    mini.addEventListener('click', (e) => {
      e.stopPropagation();
      popover.classList.toggle('open');
      if (popover.classList.contains('open')) renderPopover();
    });

    document.addEventListener('click', (e) => {
      if (!popover.classList.contains('open')) return;
      if (mini.contains(e.target) || popover.contains(e.target)) return;
      popover.classList.remove('open');
    });

    Audio_.subscribe(() => { renderMini(); if (popover.classList.contains('open')) renderPopover(); });
    renderMini();
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

    // Mini-player + first-visit hint
    injectMiniPlayer();
    // Ambient floating orbs (every screen)
    injectHomeOrbs();
    if (!localStorage.getItem('rcpsg_music_hinted')) {
      setTimeout(() => {
        toast('🎵 Tap the music icon to pick a soundtrack');
        localStorage.setItem('rcpsg_music_hinted', '1');
      }, 1200);
    }
  });

  function injectHomeOrbs() {
    if (document.querySelector('.home-orb')) return;
    const colors = ['h1','h2','h3','h4'];
    for (let i = 0; i < 7; i++) {
      const o = document.createElement('div');
      o.className = 'home-orb ' + colors[i % colors.length];
      o.style.left = (Math.random() * 100) + '%';
      o.style.setProperty('--ox', ((Math.random() - 0.5) * 80) + 'vw');
      o.style.animationDuration = (12 + Math.random() * 12) + 's';
      o.style.animationDelay = (-Math.random() * 14) + 's';
      document.body.appendChild(o);
    }
  }

  // ── Browser back button (mobile swipe / desktop back) ─────────
  // Each goto() pushes a history state; popstate fires when the user uses
  // the browser/system back gesture. We intercept and call App.back().
  window.addEventListener('popstate', () => {
    if (canGoBack()) back();
    else history.length === 0 && currentScreen !== 'home' && _transition(() => _doSwitch('home', {}));
  });
  // Ensure there's an initial history entry so the first back doesn't exit
  if (typeof window.history !== 'undefined' && window.history.pushState) {
    try { window.history.replaceState({ rcpsg: 'home' }, ''); } catch {}
  }

  // ────────────────────────────  EXPORT  ────────────────────────────
  global.App = { goto, back, canGoBack, registerScreen, refresh, getState, persist, toast };
})(window);
