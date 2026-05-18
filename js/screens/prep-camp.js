/* ============================================================
   PREP-CAMP — choose train / shop / equip / enter fight
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('prep-camp', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">⚔️ PREP CAMP</span>
      <span class="t-sm t-dim">${boss.course.toUpperCase()}</span>
    </div>

    <div class="arena" style="min-height: 150px;">
      <div class="boss-emoji">${boss.emoji}</div>
      <div class="boss-name">${boss.name}</div>
      <div class="boss-sub">${boss.description || ''}</div>
    </div>

    <div class="panel" style="display:flex; flex-direction:column; gap:6px;">
      <div class="xp-header">
        <span class="lvl-txt">★ LVL ${state.level}</span>
        <span class="gold-txt">🪙 ${state.gold}g</span>
      </div>
      <div class="xp-sub">EQUIPPED: ${state.equipped.length ? state.equipped.map(k => ITEM_EMOJI[k]).join(' ') : '—'}</div>
    </div>

    <button class="btn btn-block" data-go="training">🏋️ TRAIN
      <span class="spacer"></span>
      <span class="t-xs t-dim">+5 XP / +10g per correct</span>
    </button>
    <button class="btn btn-block" data-go="shop">🪙 SHOP
      <span class="spacer"></span>
      <span class="t-xs t-dim">Buy items</span>
    </button>
    <button class="btn btn-block" data-go="equip">🎒 EQUIP
      <span class="spacer"></span>
      <span class="t-xs t-dim">Up to 3 items</span>
    </button>

    <div class="spacer"></div>

    <button class="btn btn-block btn-primary" data-go="fight">⚔️ ENTER BOSS FIGHT</button>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('boss-select', { course: ctx.course }));

  root.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.go;
      if (d === 'training') App.goto('training',  { course: ctx.course, bossId: ctx.bossId });
      if (d === 'shop')     App.goto('settings',  { /* placeholder; shop is integrated into prep-camp via modal in Task 14 */ });
      if (d === 'equip')    App.goto('settings',  { /* placeholder for Task 15 */ });
      if (d === 'fight')    App.goto('battle',    { course: ctx.course, bossId: ctx.bossId });
    });
  });
});

const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡', reviveCharm:'💖', doubleXpTome:'⚡' };
