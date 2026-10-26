/* ============================================================
   COURSE-MODE SELECT — after picking a course, pick a mode.
   ctx: { course: 'rcp103' | 'rcp104' }
   ============================================================ */
App.registerScreen('course-mode', ({ root, state, ctx }) => {
  root.classList.add('acsc');
  const course = ctx.course || 'rcp103';
  const courseInfo = Academy.course(course);
  const courseFull = courseInfo.name;
  const hasScenarios = (window.ALL_SCENARIOS || []).some(s => s.course === course);
  const courseShort = course.toUpperCase();

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>BACK</button>
      <span class="mode-tag">Module Briefing</span>
      <span class="chapter-tag">${courseShort}</span>
    </div>

    <div class="acsc-banner">
      <img src="${courseInfo.img}" width="480" height="160" alt="" loading="eager">
      <div class="acsc-banner-overlay"></div>
      <span class="acsc-banner-label">${courseFull}</span>
    </div>

    <div class="module" data-mode="battle">
      <div class="module-icon-wrap">⚡</div>
      <div class="module-body">
        <div class="module-tag">Protocol 01</div>
        <div class="module-title">Boss Battle</div>
        <div class="module-meta">Topic bosses · HP combat · loadout</div>
      </div>
    </div>

    <div class="module" data-mode="training">
      <div class="module-icon-wrap">📖</div>
      <div class="module-body">
        <div class="module-tag">Protocol 02</div>
        <div class="module-title">Study Library</div>
        <div class="module-meta">Practice at your pace · no HP</div>
      </div>
    </div>

    ${hasScenarios ? `<div class="module module-104" data-mode="crisis">
      <div class="module-icon-wrap">🏥</div>
      <div class="module-body">
        <div class="module-tag">Protocol 03</div>
        <div class="module-title">Patient Crisis</div>
        <div class="module-meta">Clinical scenarios · branching decisions</div>
      </div>
    </div>` : ''}
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.back());

  root.querySelectorAll('[data-mode]').forEach(el => {
    el.addEventListener('click', () => {
      const m = el.dataset.mode;
      if (m === 'battle') App.goto('boss-select', { course });
      else if (m === 'training') App.goto('boss-select', { course, mode: 'training' });
      else App.goto('scenario-select', { course });
    });
  });
});
