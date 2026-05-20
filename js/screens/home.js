/* ============================================================
   HOME SCREEN — Medical HUD v1.3
   ============================================================ */
App.registerScreen('home', ({ root, state }) => {
  const prog = State.xpProgressInCurrentLevel(state);
  const title = State.titleForLevel(state.level);
  const xpNext = State.xpForNextLevel(state.level);
  const dailyOn = State.isDailyAvailable(state);
  const dailyBoss = state.dailyChallenge.bossId
    ? (window.ALL_BOSSES || []).find(b => b.id === state.dailyChallenge.bossId)
    : null;
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 8);
  const bossesDef = state.defeatedBosses.length;
  const audioState = window.Audio_ ? Audio_.get() : { track: 'off' };

  root.innerHTML = `
    <div class="header-strip">
      <span><span class="status-dot"></span>SYSTEM ONLINE</span>
      <span class="blink">▮ REC</span>
      <span>${timeStr}</span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="title-block">
        <div class="title-eyebrow">▸ RESPIRATORY CARE ◂</div>
        <div class="title-main">RCP // GAME</div>
        <div class="title-sub">EXAM PREP SIMULATOR · BUILD 1.3</div>
      </div>
    </div>

    <div class="ekg">
      <div class="ekg-line">
        <svg width="900" height="40" viewBox="0 0 900 40" preserveAspectRatio="none">
          <polyline fill="none" stroke="#00ff9d" stroke-width="1.5"
            style="filter: drop-shadow(0 0 3px #00ff9d);"
            points="0,20 30,20 50,20 60,12 65,28 70,8 75,32 80,20 110,20 140,20 160,20 170,12 175,28 180,8 185,32 190,20 220,20 250,20 270,20 280,12 285,28 290,8 295,32 300,20 330,20 360,20 380,20 390,12 395,28 400,8 405,32 410,20 440,20 470,20 490,20 500,12 505,28 510,8 515,32 520,20 550,20 580,20 600,20 610,12 615,28 620,8 625,32 630,20 660,20 690,20 710,20 720,12 725,28 730,8 735,32 740,20 770,20 800,20 820,20 830,12 835,28 840,8 845,32 850,20 880,20 900,20"/>
        </svg>
      </div>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="header-strip" style="margin: -14px -16px 12px;">
        <span>OPERATOR // LOURD</span>
        <span>ID#0042</span>
      </div>
      <div class="vitals">
        <div class="vital">
          <span class="vital-label">RANK</span>
          <span class="vital-value">LV.${state.level}</span>
          <span class="vital-unit">${title.toUpperCase()}</span>
        </div>
        <div class="vital">
          <span class="vital-label">BOSSES</span>
          <span class="vital-value green">${bossesDef}/22</span>
          <span class="vital-unit">DEFEATED</span>
        </div>
        <div class="vital">
          <span class="vital-label">STREAK</span>
          <span class="vital-value amber">×${state.streak.count}</span>
          <span class="vital-unit">DAY</span>
        </div>
      </div>
      <div class="xp-readout" style="margin-top: 12px;">
        <div class="xp-header">
          <span class="xp-rank lvl-txt">EXP // PROGRESS</span>
          <span class="xp-pct">${Math.round(prog.ratio * 100)}%</span>
        </div>
        <div class="xp-track"><div class="xp-fill" style="width:${(prog.ratio * 100).toFixed(0)}%"></div></div>
        <div class="xp-meta xp-sub" style="display:flex; justify-content:space-between;">
          <span>${state.xp} XP · 🪙 ${state.gold}</span>
          <span>NEXT: ${xpNext} XP</span>
        </div>
      </div>
    </div>

    ${dailyOn && dailyBoss ? `
      <div class="case-file" data-go="daily">
        <div class="case-icon">⚕</div>
        <div class="case-body">
          <div class="case-tag">▸ INCOMING CASE</div>
          <div class="case-title">${dailyBoss.name.toUpperCase()}</div>
          <div class="case-meta">REWARD: 75 XP · 50 ¢ · NO LOADOUT</div>
        </div>
        <div class="case-action">▶</div>
      </div>
    ` : ''}

    <div class="module" data-go="course-mode" data-course="rcp103">
      <div class="module-icon-wrap">🫁</div>
      <div class="module-body">
        <div class="module-tag">▸ MODULE 103</div>
        <div class="module-title">PULMONARY DISEASE</div>
        <div class="module-meta">10 TARGETS · 100 QUERIES · 6 SCENARIOS</div>
      </div>
    </div>

    <div class="module module-104" data-go="course-mode" data-course="rcp104">
      <div class="module-icon-wrap">💊</div>
      <div class="module-body">
        <div class="module-tag">▸ MODULE 104</div>
        <div class="module-title">PHARMACOLOGY</div>
        <div class="module-meta">12 TARGETS · 120 QUERIES · 6 SCENARIOS</div>
      </div>
    </div>

    <div class="spacer"></div>

    <div class="data-stream">
      <span>SYS: <span class="ds-active">ACTIVE</span></span>
      <span>AUDIO: ${audioState.track.toUpperCase()}</span>
      <span data-go="settings">CFG: ⚙</span>
    </div>
  `;

  root.querySelectorAll('[data-go]').forEach(el => {
    el.addEventListener('click', () => {
      const dest = el.dataset.go;
      if (dest === 'daily') {
        App.goto('battle', { course: state.dailyChallenge.course, bossId: state.dailyChallenge.bossId, isDaily: true });
      } else if (dest === 'course-mode') {
        App.goto('course-mode', { course: el.dataset.course });
      } else {
        App.goto(dest);
      }
    });
  });
});
