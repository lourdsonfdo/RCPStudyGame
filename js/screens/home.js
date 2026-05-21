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
  const weakTopics = (State.getWeakTopics ? State.getWeakTopics(state, { limit: 3, minSample: 3 }) : []);
  const survivalBest = state.survival || { best103: 0, best104: 0 };

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
        <div class="title-main">RESPIRATORY GAME</div>
        <div class="title-sub">EXAM PREP SIMULATOR · BUILD 1.3</div>
      </div>
    </div>

    <div class="ekg">
      <div class="ekg-line">
        <svg width="900" height="40" viewBox="0 0 900 40" preserveAspectRatio="none">
          <path fill="none" stroke="#00ff9d" stroke-width="1.5"
            stroke-linejoin="round" stroke-linecap="round"
            style="filter: drop-shadow(0 0 3px #00ff9d);"
            d="M 0,20 L 25,20 Q 30,17 36,17 Q 42,17 48,20 L 65,20 L 68,21 L 71,23 L 73,5 L 75,28 L 78,23 L 82,20 L 100,20 Q 110,11 120,11 Q 130,11 140,20 L 150,20 L 175,20 Q 180,17 186,17 Q 192,17 198,20 L 215,20 L 218,21 L 221,23 L 223,5 L 225,28 L 228,23 L 232,20 L 250,20 Q 260,11 270,11 Q 280,11 290,20 L 300,20 L 325,20 Q 330,17 336,17 Q 342,17 348,20 L 365,20 L 368,21 L 371,23 L 373,5 L 375,28 L 378,23 L 382,20 L 400,20 Q 410,11 420,11 Q 430,11 440,20 L 450,20 L 475,20 Q 480,17 486,17 Q 492,17 498,20 L 515,20 L 518,21 L 521,23 L 523,5 L 525,28 L 528,23 L 532,20 L 550,20 Q 560,11 570,11 Q 580,11 590,20 L 600,20 L 625,20 Q 630,17 636,17 Q 642,17 648,20 L 665,20 L 668,21 L 671,23 L 673,5 L 675,28 L 678,23 L 682,20 L 700,20 Q 710,11 720,11 Q 730,11 740,20 L 750,20 L 775,20 Q 780,17 786,17 Q 792,17 798,20 L 815,20 L 818,21 L 821,23 L 823,5 L 825,28 L 828,23 L 832,20 L 850,20 Q 860,11 870,11 Q 880,11 890,20 L 900,20"/>
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

    <div class="module module-survival" data-go="survival">
      <div class="module-icon-wrap">⏱</div>
      <div class="module-body">
        <div class="module-tag">▸ RAPID-FIRE</div>
        <div class="module-title">SURVIVAL</div>
        <div class="module-meta">BEAT THE CLOCK · BEST 103: ${survivalBest.best103} · 104: ${survivalBest.best104}</div>
      </div>
    </div>

    ${weakTopics.length ? `
      <div class="hud hud-corners weak-topics">
        <span class="br1"></span><span class="br2"></span>
        <div class="header-strip" style="margin: -14px -16px 12px;">
          <span><span class="status-dot"></span>WEAK TOPICS DETECTED</span>
          <span>${weakTopics.length} FLAGGED</span>
        </div>
        ${weakTopics.map(t => `
          <div class="weak-row">
            <span class="weak-name">${t.topic.toUpperCase()}</span>
            <div class="weak-bar"><div class="weak-fill" style="width:${Math.round(t.acc * 100)}%"></div></div>
            <span class="weak-val">${t.correct}/${t.total}</span>
          </div>
        `).join('')}
        <div class="weak-hint">▸ THESE WILL APPEAR MORE OFTEN IN FUTURE BATTLES</div>
      </div>
    ` : ''}

    <div class="module module-config" data-go="settings">
      <div class="module-icon-wrap">⚙</div>
      <div class="module-body">
        <div class="module-tag">▸ SYSTEM</div>
        <div class="module-title">SETTINGS</div>
        <div class="module-meta">TEXT SIZE · TIMER · AUDIO · RESET</div>
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
      } else if (dest === 'survival') {
        App.goto('survival', {});
      } else {
        App.goto(dest);
      }
    });
  });
});
