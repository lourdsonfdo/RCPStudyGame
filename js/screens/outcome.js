/* ============================================================
   OUTCOME SCREEN — patient crisis end state
   ctx: { session, lvlInfo, course, scenarioId }
   ============================================================ */
App.registerScreen('outcome', ({ root, state, ctx }) => {
  const s = ctx.session;
  const outcomeText = {
    stabilized: { emoji:'❤️‍🩹', title:'PATIENT STABILIZED', color:'var(--hud-green)' },
    rocky:      { emoji:'⚕️',  title:'SURVIVED',            color:'var(--hud-amber)' },
    coded:      { emoji:'⚰️',  title:'PATIENT EXPIRED',     color:'var(--hud-red)' },
  }[s.outcome];

  const rew = Crisis.rewards(s);

  root.innerHTML = `
    <div class="topbar">
      <span></span>
      <span class="mode-tag" style="color:${outcomeText.color};">★ CASE CLOSED</span>
      <span></span>
    </div>

    <div class="arena" style="min-height: 220px;">
      <div class="boss-portrait calm" style="filter: drop-shadow(0 0 12px ${outcomeText.color});">${outcomeText.emoji}</div>
      <div class="boss-name calm" style="color:${outcomeText.color}; text-shadow: 0 0 8px ${outcomeText.color};">${outcomeText.title}</div>
      <div class="boss-sub">${s.scenario.title}</div>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="header-strip" style="margin: -14px -16px 12px;">
        <span><span class="status-dot"></span>FINAL REPORT</span>
        <span style="color:${outcomeText.color};">${s.outcome.toUpperCase()}</span>
      </div>
      <div class="vitals">
        <div class="vital">
          <span class="vital-label">PT HP</span>
          <span class="vital-value" style="color:${outcomeText.color};">${s.patientHp}/${s.patientMaxHp}</span>
          <span class="vital-unit">FINAL</span>
        </div>
        <div class="vital">
          <span class="vital-label">EXP</span>
          <span class="vital-value green">+${rew.xp}</span>
          <span class="vital-unit">EARNED</span>
        </div>
        <div class="vital">
          <span class="vital-label">GOLD</span>
          <span class="vital-value amber">+${rew.gold}</span>
          <span class="vital-unit">¢</span>
        </div>
      </div>
      ${ctx.lvlInfo.leveledUp ? `<div class="case-file" style="margin-top: 12px;">
        <div class="case-icon">⭐</div>
        <div class="case-body">
          <div class="case-tag">▸ RANK UP</div>
          <div class="case-title">LV.${ctx.lvlInfo.newLevel} · ${State.titleForLevel(ctx.lvlInfo.newLevel).toUpperCase()}</div>
          <div class="case-meta">PROMOTION GRANTED</div>
        </div>
      </div>` : ''}
    </div>

    <div class="spacer"></div>

    <button class="btn btn-block btn-primary" data-action="select">🗺 CASE LIST</button>
    <button class="btn btn-block" data-action="home">⌂ HQ</button>
  `;

  const arenaEl = root.querySelector('.arena');
  if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: s.outcome === 'stabilized' ? 'victory' : (s.outcome === 'coded' ? 'defeat' : 'crisis') });

  if (ctx.lvlInfo.leveledUp) {
    setTimeout(() => App.goto('level-up', { newLevel: ctx.lvlInfo.newLevel, oldLevel: ctx.lvlInfo.oldLevel, returnTo: 'outcome', returnCtx: ctx }), 600);
  }

  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'select') App.goto('scenario-select', { course: ctx.course });
      else App.goto('home');
    });
  });
});
