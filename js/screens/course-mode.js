/* ============================================================
   COURSE-MODE SELECT — after picking a course, pick a mode.
   ctx: { course: 'rcp103' | 'rcp104' }
   ============================================================ */
App.registerScreen('course-mode', ({ root, state, ctx }) => {
  const course = ctx.course || 'rcp103';
  const courseLabel = course === 'rcp103' ? 'RCP 103 · DISEASE & PATHO' : 'RCP 104 · PHARMACOLOGY';

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-dim">${courseLabel}</span>
      <span></span>
    </div>

    <div class="t-center t-lg" style="margin:30px 0 6px;">PICK A MODE</div>
    <div class="t-center t-xs t-mute" style="margin-bottom:18px;">Choose your training</div>

    <button class="btn btn-block btn-primary" data-mode="battle">
      <span style="font-size:24px;">⚡</span>
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:4px;">
        <span>BOSS BATTLE</span>
        <span class="t-xs t-dim">Topic bosses · HP combat · items</span>
      </div>
    </button>

    <button class="btn btn-block" data-mode="crisis">
      <span style="font-size:24px;">🏥</span>
      <div style="display:flex; flex-direction:column; align-items:flex-start; gap:4px;">
        <span>PATIENT CRISIS</span>
        <span class="t-xs t-dim">Clinical scenarios · branching decisions</span>
      </div>
    </button>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));

  root.querySelectorAll('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = btn.dataset.mode;
      if (m === 'battle') App.goto('boss-select', { course });
      else App.goto('scenario-select', { course });
    });
  });
});
