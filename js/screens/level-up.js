/* ============================================================
   LEVEL-UP OVERLAY — celebration before returning to caller
   ctx: { newLevel, returnTo, returnCtx }
   ============================================================ */
App.registerScreen('level-up', ({ root, state, ctx }) => {
  const newLvl = ctx.newLevel;
  const title = State.titleForLevel(newLvl);

  // Confetti particles
  const confettiHtml = Array.from({ length: 24 }).map((_, i) => {
    const left = Math.random() * 100;
    const dur = (1.6 + Math.random() * 1.4).toFixed(2);
    const delay = (Math.random() * 0.6).toFixed(2);
    const color = ['#ffd700','#44ff66','#5577ff','#ff9900','#aa55ff'][i % 5];
    return `<div style="position:absolute; left:${left}%; top:-20px; width:8px; height:8px; background:${color}; animation: confetti-fall ${dur}s ${delay}s linear forwards;"></div>`;
  }).join('');

  root.innerHTML = `
    <div style="position:absolute; inset:0; overflow:hidden;">${confettiHtml}</div>

    <div style="text-align:center; display:flex; flex-direction:column; gap:14px; padding:24px;">
      <div class="fanfare" style="font-size: 48px;">⭐</div>
      <div class="t-xl t-gold fanfare">LEVEL UP!</div>
      <div class="t-md t-dim">LVL ${newLvl} · ${title.toUpperCase()}</div>
      <div class="t-sm t-mute">Max HP: ${State.maxHpForLevel(newLvl)}</div>

      <div style="height: 18px;"></div>

      <button class="btn btn-block btn-primary" id="continue">▶ CONTINUE</button>
    </div>
  `;

  root.querySelector('#continue').addEventListener('click', () => {
    App.goto(ctx.returnTo || 'home', ctx.returnCtx || {});
  });

  // Tap anywhere to dismiss
  root.addEventListener('click', e => {
    if (e.target.id === 'continue') return; // handled above
    if (e.currentTarget !== root) return;
    App.goto(ctx.returnTo || 'home', ctx.returnCtx || {});
  });

  // Juicy entrance
  setTimeout(() => {
    Fx.flash('rgba(255,215,0,.45)', 400);
    const star = root.querySelector('.fanfare');
    if (star) Fx.particles(star, { color: 'gold', count: 32 });
  }, 50);
});
