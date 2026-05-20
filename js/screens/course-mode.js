/* ============================================================
   COURSE-MODE SELECT — after picking a course, pick a mode.
   ctx: { course: 'rcp103' | 'rcp104' }
   ============================================================ */
App.registerScreen('course-mode', ({ root, state, ctx }) => {
  const course = ctx.course || 'rcp103';
  const courseFull = course === 'rcp103' ? 'PULMONARY DISEASE' : 'PHARMACOLOGY';
  const courseShort = course.toUpperCase();

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>◀ ABORT</button>
      <span class="mode-tag">▸ MODULE BRIEFING</span>
      <span class="chapter-tag">${courseShort}</span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="title-block">
        <div class="title-eyebrow">▸ MODULE LOADED ◂</div>
        <div class="title-main">${courseShort}</div>
        <div class="title-sub">${courseFull}</div>
      </div>
    </div>

    <div class="header-strip" style="margin-top: 4px;"><span>SELECT // TRAINING PROTOCOL</span><span class="blink">▮ READY</span></div>

    <div class="module" data-mode="battle">
      <div class="module-icon-wrap">⚡</div>
      <div class="module-body">
        <div class="module-tag">▸ PROTOCOL 01</div>
        <div class="module-title">BOSS BATTLE</div>
        <div class="module-meta">TOPIC BOSSES · HP COMBAT · LOADOUT</div>
      </div>
    </div>

    <div class="module module-104" data-mode="crisis">
      <div class="module-icon-wrap">🏥</div>
      <div class="module-body">
        <div class="module-tag">▸ PROTOCOL 02</div>
        <div class="module-title">PATIENT CRISIS</div>
        <div class="module-meta">CLINICAL SCENARIOS · BRANCHING</div>
      </div>
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));

  root.querySelectorAll('[data-mode]').forEach(el => {
    el.addEventListener('click', () => {
      const m = el.dataset.mode;
      if (m === 'battle') App.goto('boss-select', { course });
      else App.goto('scenario-select', { course });
    });
  });
});
