/* ============================================================
   BOSS-SELECT — grid of bosses for the chosen course
   ctx: { course: 'rcp103' | 'rcp104' }
   ============================================================ */
App.registerScreen('boss-select', ({ root, state, ctx }) => {
  const course = ctx.course;
  const all = (window.ALL_BOSSES || []).filter(b => b.course === course);

  // Unlock rule: unlockedByDefault OR player has defeated ANY boss
  const anyDefeated = state.defeatedBosses.length > 0;
  function isUnlocked(b) { return b.unlockedByDefault || anyDefeated; }

  const courseShort = course.toUpperCase();
  const defeated = state.defeatedBosses.filter(id => all.some(b => b.id === id)).length;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>BACK</button>
      <span class="mode-tag">⚡ TARGET ACQUISITION</span>
      <span class="chapter-tag">${courseShort}</span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="header-strip" style="margin: -14px -16px 12px;">
        <span><span class="status-dot"></span>HOSTILES ON GRID</span>
        <span>${defeated}/${all.length} ELIMINATED</span>
      </div>
      <div class="grid-2">
        ${all.map(b => {
          const unlocked = isUnlocked(b);
          const wasDefeated = state.defeatedBosses.includes(b.id);
          const sprite = (window.BOSS_SPRITES && window.BOSS_SPRITES[b.id]) || '';
          return `
            <div class="tile ${unlocked ? '' : 'locked'} ${wasDefeated ? 'defeated' : ''}" data-boss-id="${b.id}">
              ${unlocked
                ? (sprite
                    ? `<div class="boss-portrait-sm">${sprite}</div>`
                    : `<div class="tile-emoji">${b.emoji}</div>`)
                : `<div class="tile-emoji">🔒</div>`}
              <div class="tile-name">${unlocked ? b.name : '???'}</div>
              <div class="tile-sub">${unlocked ? (b.description || '') : 'LOCKED'}</div>
            </div>`;
        }).join('')}
      </div>
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.back());

  root.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('locked')) { App.toast('LOCKED · Defeat another target to unlock'); return; }
      App.goto('prep-camp', { course, bossId: tile.dataset.bossId });
    });
  });
});
