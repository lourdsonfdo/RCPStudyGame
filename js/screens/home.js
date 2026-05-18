/* ============================================================
   HOME SCREEN
   ============================================================ */
App.registerScreen('home', ({ root, state }) => {
  const prog = State.xpProgressInCurrentLevel(state);
  const title = State.titleForLevel(state.level);
  const xpNext = State.xpForNextLevel(state.level);
  const dailyOn = State.isDailyAvailable(state);
  const dailyBoss = state.dailyChallenge.bossId
    ? (window.ALL_BOSSES || []).find(b => b.id === state.dailyChallenge.bossId)
    : null;

  root.innerHTML = `
    <div class="t-center t-lg t-gold" style="margin:20px 0 8px;">⚕️ RCP STUDY GAME</div>
    <div class="t-center t-xs t-mute" style="margin-bottom:18px;">FINAL EXAM PREP · POCKET EDITION</div>

    <div class="panel">
      <div class="xp-header">
        <span class="lvl-txt">★ LVL ${state.level} · ${title.toUpperCase()}</span>
        <span class="streak-txt">🔥 ×${state.streak.count}</span>
      </div>
      <div style="height:6px;"></div>
      <div class="xp-track"><div class="xp-fill" style="width:${(prog.ratio * 100).toFixed(0)}%"></div></div>
      <div class="xp-sub">${state.xp} / ${xpNext} XP · ${state.gold}g</div>
    </div>

    ${dailyOn && dailyBoss ? `
    <button class="btn btn-block btn-primary" data-go="daily">
      <span>📅 DAILY CHALLENGE</span>
      <span class="spacer"></span>
      <span class="t-xs t-dim">${dailyBoss.emoji} ${dailyBoss.name}</span>
    </button>
    ` : `
    <div class="panel t-center t-mute t-sm">📅 Daily challenge complete ✓</div>
    `}

    <button class="btn btn-block" data-go="course-mode" data-course="rcp103">
      <span>🫁 RCP 103 · DISEASE & PATHO</span>
    </button>
    <button class="btn btn-block" data-go="course-mode" data-course="rcp104">
      <span>💊 RCP 104 · PHARMACOLOGY</span>
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block" data-go="settings"><span>⚙️ SETTINGS</span></button>
  `;

  root.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dest = btn.dataset.go;
      if (dest === 'daily') {
        // Daily challenge: route to battle directly with the assigned boss
        App.goto('battle', { course: state.dailyChallenge.course, bossId: state.dailyChallenge.bossId, isDaily: true });
      } else if (dest === 'course-mode') {
        App.goto('course-mode', { course: btn.dataset.course });
      } else {
        App.goto(dest);
      }
    });
  });
});
