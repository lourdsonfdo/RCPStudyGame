/* ============================================================
   SETTINGS — reset progress, toggles, about
   ============================================================ */
App.registerScreen('settings', ({ root, state }) => {
  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">⚙️ SETTINGS</span>
      <span></span>
    </div>

    <div class="panel">
      <div class="t-sm t-dim">PROGRESS</div>
      <div class="t-md" style="margin-top:6px;">XP: ${state.xp}</div>
      <div class="t-md">Level: ${state.level} · ${State.titleForLevel(state.level)}</div>
      <div class="t-md">Gold: ${state.gold}g</div>
      <div class="t-md">Bosses defeated: ${state.defeatedBosses.length}</div>
      <div class="t-md">Scenarios completed: ${state.completedScenarios.length}</div>
      <div class="t-md">Streak: ${state.streak.count}</div>
    </div>

    <button class="btn btn-block ${state.settings.timerOn ? 'btn-primary' : ''}" id="t-timer">
      ⏱ QUESTION TIMER: ${state.settings.timerOn ? 'ON' : 'OFF'}
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block btn-danger" id="reset">🗑 RESET ALL PROGRESS</button>

    <div class="t-xs t-mute t-center" style="margin-top: 12px;">RCP Study Game · v1.0</div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));

  root.querySelector('#t-timer').addEventListener('click', () => {
    state.settings.timerOn = !state.settings.timerOn;
    State.save(state);
    App.refresh();
  });

  root.querySelector('#reset').addEventListener('click', () => {
    if (!confirm('Erase all XP, gold, items, and progress?')) return;
    State.reset();
    location.reload();
  });
});
