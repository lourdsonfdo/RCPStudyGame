/* ============================================================
   SETTINGS — reset progress, toggles, about
   ============================================================ */
App.registerScreen('settings', ({ root, state }) => {
  const title = State.titleForLevel(state.level);
  const prog = State.xpProgressInCurrentLevel(state);

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>BACK</button>
      <span class="mode-tag">⚙ SYSTEM CONFIG</span>
      <span></span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="header-strip" style="margin: -14px -16px 14px;">
        <span><span class="status-dot"></span>OPERATOR PROFILE</span>
        <span>LOURD · ID#0042</span>
      </div>
      <div class="vitals">
        <div class="vital">
          <span class="vital-label">RANK</span>
          <span class="vital-value">LV.${state.level}</span>
          <span class="vital-unit">${title.toUpperCase()}</span>
        </div>
        <div class="vital">
          <span class="vital-label">BOSSES</span>
          <span class="vital-value green">${state.defeatedBosses.length}/22</span>
          <span class="vital-unit">DEFEATED</span>
        </div>
        <div class="vital">
          <span class="vital-label">STREAK</span>
          <span class="vital-value amber">×${state.streak.count}</span>
          <span class="vital-unit">DAY</span>
        </div>
        <div class="vital">
          <span class="vital-label">GOLD</span>
          <span class="vital-value amber">${state.gold}</span>
          <span class="vital-unit">CREDITS</span>
        </div>
        <div class="vital">
          <span class="vital-label">SCENARIOS</span>
          <span class="vital-value">${state.completedScenarios.length}/12</span>
          <span class="vital-unit">RESOLVED</span>
        </div>
        <div class="vital">
          <span class="vital-label">EXP</span>
          <span class="vital-value">${Math.round(prog.ratio * 100)}%</span>
          <span class="vital-unit">${state.xp} TOTAL</span>
        </div>
      </div>
    </div>

    <div class="header-strip"><span>▸ SYSTEM OPTIONS</span><span></span></div>

    <button class="btn btn-block ${state.settings.timerOn ? 'btn-primary' : ''}" id="t-timer">
      ⏱ QUESTION TIMER: ${state.settings.timerOn ? 'ENABLED' : 'DISABLED'}
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block btn-danger" id="reset">🗑 PURGE ALL DATA</button>

    <div class="data-stream" style="margin-top: 10px;">
      <span>RCP // GAME</span>
      <span>v1.3</span>
      <span class="ds-active">OPERATIONAL</span>
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.back());

  root.querySelector('#t-timer').addEventListener('click', () => {
    state.settings.timerOn = !state.settings.timerOn;
    State.save(state);
    App.refresh();
  });

  root.querySelector('#reset').addEventListener('click', () => {
    if (!confirm('Erase all XP, gold, items, and progress?')) return;
    if (window.Audio_) Audio_.stop();
    State.reset();
    localStorage.removeItem('rcpsg_audio');
    localStorage.removeItem('rcpsg_music_hinted');
    location.reload();
  });
});
