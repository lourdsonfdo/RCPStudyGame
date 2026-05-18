/* ============================================================
   RESULTS SCREEN — victory or defeat summary
   ctx: { session, lvlInfo, course, bossId, isDaily }
   ============================================================ */
App.registerScreen('results', ({ root, state, ctx }) => {
  const s = ctx.session;
  const won = s.outcome === 'victory';

  root.innerHTML = `
    <div class="topbar">
      <span></span>
      <span class="t-sm ${won ? 't-green' : 't-red'}">${won ? '★ VICTORY' : '✗ DEFEAT'}</span>
      <span></span>
    </div>

    <div class="arena" style="min-height: 220px;">
      <div class="boss-emoji ${won ? '' : 'calm'}" style="${won ? 'filter: drop-shadow(0 0 16px var(--green));' : ''}">${won ? '🏆' : '💀'}</div>
      <div class="boss-name ${won ? '' : 'calm'}" style="${won ? 'color: var(--green); text-shadow: 0 0 10px var(--green);' : ''}">${won ? 'BOSS DEFEATED!' : 'YOU FELL'}</div>
      <div class="boss-sub">${s.boss.name}</div>
    </div>

    <div class="panel" style="display:flex; flex-direction:column; gap:8px;">
      <div class="t-sm t-dim">REWARDS</div>
      <div class="t-md">📈 XP earned: <span class="t-gold">+${s.xpEarned}</span></div>
      <div class="t-md">🪙 Gold earned: <span class="t-gold">+${s.goldEarned}</span></div>
      <div class="t-md">🎯 Correct: <span class="t-green">${s.correctCount} / ${s.questions.length}</span></div>
      ${ctx.lvlInfo.leveledUp ? `<div class="t-md t-gold">⭐ LEVEL UP! → LVL ${ctx.lvlInfo.newLevel} ${State.titleForLevel(ctx.lvlInfo.newLevel).toUpperCase()}</div>` : ''}
    </div>

    <button class="btn btn-block btn-primary" data-action="again">⚔️ FIGHT AGAIN</button>
    <button class="btn btn-block" data-action="select">🗺 BOSS SELECT</button>
    <button class="btn btn-block" data-action="home">🏠 HOME</button>
  `;

  // Show level-up overlay if applicable
  if (ctx.lvlInfo.leveledUp) {
    setTimeout(() => App.goto('level-up', { newLevel: ctx.lvlInfo.newLevel, returnTo: 'results', returnCtx: ctx }), 400);
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
