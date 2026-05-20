/* ============================================================
   LEVEL-UP OVERLAY — HUD promotion notice v1.3
   ctx: { newLevel, oldLevel, returnTo, returnCtx }
   ============================================================ */
App.registerScreen('level-up', ({ root, state, ctx }) => {
  const newLvl = ctx.newLevel;
  const title = State.titleForLevel(newLvl);
  const maxHp = State.maxHpForLevel(newLvl);
  const oldLvl = (ctx.oldLevel ?? (newLvl - 1));

  root.innerHTML = `
    <div class="hud hud-corners" style="max-width: 360px; width: 100%;">
      <span class="br1"></span><span class="br2"></span>

      <div class="header-strip" style="margin: -14px -16px 14px;">
        <span><span class="status-dot"></span>RANK UP DETECTED</span>
        <span class="blink">▮ NOTIFY</span>
      </div>

      <div class="title-block fanfare">
        <div class="title-eyebrow">▸ PROMOTION GRANTED ◂</div>
        <div class="title-main" style="font-size: 36px;">LV.${newLvl}</div>
        <div class="title-sub">${title.toUpperCase()}</div>
      </div>

      <div class="vitals" style="margin-top: 14px;">
        <div class="vital">
          <span class="vital-label">RANK</span>
          <span class="vital-value green">${oldLvl} → ${newLvl}</span>
          <span class="vital-unit">PROMOTED</span>
        </div>
        <div class="vital">
          <span class="vital-label">MAX HP</span>
          <span class="vital-value amber">${maxHp}</span>
          <span class="vital-unit">CAPACITY</span>
        </div>
        <div class="vital">
          <span class="vital-label">STATUS</span>
          <span class="vital-value">CLEARED</span>
          <span class="vital-unit">ACTIVE</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block" id="continue" style="margin-top: 16px;">▶ CONTINUE</button>
    </div>
  `;

  // Juicy entrance — particle burst + flash
  setTimeout(() => {
    if (window.Fx) {
      Fx.flash('rgba(255,174,0,.40)', 400);
      const star = root.querySelector('.title-main');
      if (star) Fx.particles(star, { color: 'gold', count: 28 });
    }
  }, 50);

  function dismiss() { App.goto(ctx.returnTo || 'home', ctx.returnCtx || {}); }
  root.querySelector('#continue').addEventListener('click', dismiss);
  root.addEventListener('click', (e) => { if (e.target === root) dismiss(); });
});
