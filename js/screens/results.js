/* ============================================================
   RESULTS SCREEN — victory or defeat summary
   ctx: { session, lvlInfo, course, bossId, isDaily }
   ============================================================ */
App.registerScreen('results', ({ root, state, ctx }) => {
  const s = ctx.session;
  const won = s.outcome === 'victory';
  const sprite = (window.BOSS_SPRITES && window.BOSS_SPRITES[s.boss.id]) || '';

  root.innerHTML = `
    <div class="topbar">
      <span></span>
      <span class="mode-tag" style="color:${won ? 'var(--hud-green)' : 'var(--hud-red)'};">${won ? '★ MISSION COMPLETE' : '✗ MISSION FAILED'}</span>
      <span></span>
    </div>

    <div class="arena" style="min-height: 220px;">
      <div class="boss-portrait ${won ? 'victory' : 'calm'}" style="${won ? 'filter: drop-shadow(0 0 16px var(--hud-green));' : ''}">${sprite || (won ? '🏆' : '💀')}</div>
      <div class="boss-name" style="color:${won ? 'var(--hud-green)' : 'var(--hud-red)'}; text-shadow: 0 0 10px ${won ? 'var(--hud-green)' : 'var(--hud-red)'};">${won ? 'TARGET ELIMINATED' : 'OPERATOR DOWN'}</div>
      <div class="boss-sub">${s.boss.name}</div>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="header-strip" style="margin: -14px -16px 12px;">
        <span><span class="status-dot"></span>MISSION REPORT</span>
        <span class="${won ? 't-green' : 't-red'}">${won ? 'VICTORY' : 'DEFEAT'}</span>
      </div>
      <div class="vitals">
        <div class="vital">
          <span class="vital-label">EXP</span>
          <span class="vital-value green">+${s.xpEarned}</span>
          <span class="vital-unit">EARNED</span>
        </div>
        <div class="vital">
          <span class="vital-label">GOLD</span>
          <span class="vital-value amber">+${s.goldEarned}</span>
          <span class="vital-unit">¢</span>
        </div>
        <div class="vital">
          <span class="vital-label">ACCURACY</span>
          <span class="vital-value">${s.correctCount}/${s.questions.length}</span>
          <span class="vital-unit">HITS</span>
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

    <button class="btn btn-block btn-primary" data-action="again">⚔ ENGAGE AGAIN</button>
    <button class="btn btn-block" data-action="select">🗺 TARGET SELECT</button>
    <button class="btn btn-block" data-action="home">⌂ HQ</button>
  `;

  const arenaEl = root.querySelector('.arena');
  if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: won ? 'victory' : 'defeat' });

  // Show level-up overlay if applicable
  if (ctx.lvlInfo.leveledUp) {
    setTimeout(() => App.goto('level-up', { newLevel: ctx.lvlInfo.newLevel, oldLevel: ctx.lvlInfo.oldLevel, returnTo: 'results', returnCtx: ctx }), 600);
  }

  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'again')  App.goto('prep-camp',   { course: ctx.course, bossId: ctx.bossId });
      if (a === 'select') App.goto('boss-select', { course: ctx.course });
      if (a === 'home')   App.goto('home');
    });
  });
});
