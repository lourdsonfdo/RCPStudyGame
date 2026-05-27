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
          <!-- Normal Sinus Rhythm: P wave → PR segment → QRS complex → ST segment → T wave
               Cycle = 180 units wide. 5 cycles across 900 width. ~72 bpm visual cadence. -->
          <path fill="none" stroke="#b85462" stroke-width="1.6"
            stroke-linejoin="round" stroke-linecap="round"
            style="filter: drop-shadow(0 0 2px rgba(184,84,98,.4));"
            d="M 0,20
               L 20,20  Q 30,14 40,20  L 65,20
               L 68,22  L 72,3   L 76,30  L 80,20
               L 108,20 Q 124,11 140,20 L 180,20

               L 200,20 Q 210,14 220,20 L 245,20
               L 248,22 L 252,3  L 256,30 L 260,20
               L 288,20 Q 304,11 320,20 L 360,20

               L 380,20 Q 390,14 400,20 L 425,20
               L 428,22 L 432,3  L 436,30 L 440,20
               L 468,20 Q 484,11 500,20 L 540,20

               L 560,20 Q 570,14 580,20 L 605,20
               L 608,22 L 612,3  L 616,30 L 620,20
               L 648,20 Q 664,11 680,20 L 720,20

               L 740,20 Q 750,14 760,20 L 785,20
               L 788,22 L 792,3  L 796,30 L 800,20
               L 828,20 Q 844,11 860,20 L 900,20"/>
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
