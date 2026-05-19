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
    if (!localStorage.getItem('rcpsg_music_hinted')) {
      setTimeout(() => {
        toast('🎵 Tap the music icon to pick a soundtrack');
        localStorage.setItem('rcpsg_music_hinted', '1');
      }, 1200);
    }
  });

  // ────────────────────────────  EXPORT  ────────────────────────────
  global.App = { goto, registerScreen, refresh, getState, persist, toast };
})(window);
