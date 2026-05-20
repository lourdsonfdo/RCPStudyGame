/* ============================================================
   SCENARIO-SELECT — grid of patient scenarios for the chosen course
   ctx: { course }
   ============================================================ */
App.registerScreen('scenario-select', ({ root, state, ctx }) => {
  const course = ctx.course;
  const all = (window.ALL_SCENARIOS || []).filter(s => s.course === course);
  const completed = (id) => state.completedScenarios.includes(id);
  const resolved = all.filter(s => completed(s.id)).length;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>◀ BACK</button>
      <span class="mode-tag">🏥 CASE FILES</span>
      <span class="chapter-tag">${course.toUpperCase()}</span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="header-strip" style="margin: -14px -16px 12px;">
        <span><span class="status-dot"></span>INCOMING CASES</span>
        <span>${resolved}/${all.length} RESOLVED</span>
      </div>

      ${all.length === 0 ? '<div class="t-mute t-center t-sm" style="padding:20px;">NO CASES ON FILE</div>' : ''}

      ${all.map(s => `
        <div class="item-row" data-id="${s.id}" style="cursor:pointer; margin-bottom: 8px;">
          <div class="item-emoji" style="filter: drop-shadow(0 0 6px ${completed(s.id) ? 'var(--hud-green)' : 'var(--hud-amber)'});">${completed(s.id) ? '✓' : '🚑'}</div>
          <div class="item-body">
            <div class="item-name">${s.title.toUpperCase()}</div>
            <div class="item-desc">${s.intro.slice(0, 100)}${s.intro.length > 100 ? '…' : ''}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('course-mode', { course }));
  root.querySelectorAll('[data-id]').forEach(row => {
    row.addEventListener('click', () => App.goto('crisis', { course, scenarioId: row.dataset.id }));
  });
});
