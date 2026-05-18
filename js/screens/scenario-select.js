/* ============================================================
   SCENARIO-SELECT — grid of patient scenarios for the chosen course
   ctx: { course }
   ============================================================ */
App.registerScreen('scenario-select', ({ root, state, ctx }) => {
  const course = ctx.course;
  const all = (window.ALL_SCENARIOS || []).filter(s => s.course === course);
  const completed = (id) => state.completedScenarios.includes(id);

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">🏥 PATIENT CRISIS</span>
      <span class="t-sm t-dim">${course.toUpperCase()}</span>
    </div>
    <div class="t-xs t-mute t-center" style="margin: 8px 0;">
      Completed: ${all.filter(s => completed(s.id)).length} / ${all.length}
    </div>

    ${all.length === 0 ? '<div class="panel t-mute t-center t-sm">No scenarios yet. Content generation pending.</div>' : ''}

    ${all.map(s => `
      <div class="item-row" data-id="${s.id}" style="cursor:pointer;">
        <div class="item-emoji">${completed(s.id) ? '✓' : '🚑'}</div>
        <div class="item-body">
          <div class="item-name">${s.title}</div>
          <div class="item-desc">${s.intro.slice(0, 90)}${s.intro.length > 90 ? '…' : ''}</div>
        </div>
      </div>
    `).join('')}
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('course-mode', { course }));
  root.querySelectorAll('[data-id]').forEach(row => {
    row.addEventListener('click', () => App.goto('crisis', { course, scenarioId: row.dataset.id }));
  });
});
