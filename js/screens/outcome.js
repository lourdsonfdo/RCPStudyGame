/* ============================================================
   OUTCOME SCREEN — patient crisis end state
   ctx: { session, lvlInfo, course, scenarioId }
   ============================================================ */
App.registerScreen('outcome', ({ root, state, ctx }) => {
  const s = ctx.session;
  const outcomeText = {
    stabilized: { emoji:'❤️‍🩹', title:'STABILIZED',         color:'var(--green)' },
    rocky:      { emoji:'⚕️',  title:'SURVIVED BUT ROCKY', color:'var(--orange)' },
    coded:      { emoji:'⚰️',  title:'PATIENT CODED',      color:'var(--red)' },
  }[s.outcome];

  const rew = Crisis.rewards(s);

  root.innerHTML = `
    <div class="topbar">
      <span></span>
      <span class="t-sm" style="color:${outcomeText.color};">${outcomeText.title}</span>
      <span></span>
    </div>

    <div class="arena" style="min-height: 220px;">
      <div class="boss-emoji calm" style="filter: drop-shadow(0 0 12px ${outcomeText.color});">${outcomeText.emoji}</div>
      <div class="boss-name calm" style="color:${outcomeText.color}; text-shadow: 0 0 8px ${outcomeText.color};">${outcomeText.title}</div>
      <div class="boss-sub">${s.scenario.title}</div>
    </div>

    <div class="panel" style="display:flex; flex-direction:column; gap:8px;">
      <div class="t-sm t-dim">PATIENT FINAL HP</div>
      <div class="t-md">${s.patientHp} / ${s.patientMaxHp}</div>
      <div class="t-sm t-dim">REWARDS</div>
      <div class="t-md">📈 XP earned: <span class="t-gold">+${rew.xp}</span></div>
      <div class="t-md">🪙 Gold earned: <span class="t-gold">+${rew.gold}</span></div>
      ${ctx.lvlInfo.leveledUp ? `<div class="t-md t-gold">⭐ LEVEL UP! → LVL ${ctx.lvlInfo.newLevel} ${State.titleForLevel(ctx.lvlInfo.newLevel).toUpperCase()}</div>` : ''}
    </div>

    <button class="btn btn-block btn-primary" data-action="select">🗺 SCENARIO LIST</button>
    <button class="btn btn-block" data-action="home">🏠 HOME</button>
  `;

  const arenaEl = root.querySelector('.arena');
  if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: s.outcome === 'stabilized' ? 'victory' : (s.outcome === 'coded' ? 'defeat' : 'crisis') });

  if (ctx.lvlInfo.leveledUp) {
    setTimeout(() => App.goto('level-up', { newLevel: ctx.lvlInfo.newLevel, returnTo: 'outcome', returnCtx: ctx }), 400);
  }

  root.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'select') App.goto('scenario-select', { course: ctx.course });
      else App.goto('home');
    });
  });
});
