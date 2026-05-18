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

  const courseLabel = course === 'rcp103' ? 'RCP 103 · DISEASE' : 'RCP 104 · PHARMACOLOGY';

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>← BACK</button>
      <span class="t-sm t-orange">⚡ BOSS SELECT</span>
      <span class="t-sm t-dim">${courseLabel}</span>
    </div>

    <div class="t-xs t-mute t-center" style="margin: 8px 0;">
      Defeated: ${state.defeatedBosses.filter(id => all.some(b => b.id === id)).length} / ${all.length}
    </div>

    <div class="grid-2">
      ${all.map(b => {
        const unlocked = isUnlocked(b);
        const defeated = state.defeatedBosses.includes(b.id);
        return `
          <div class="tile ${unlocked ? '' : 'locked'} ${defeated ? 'defeated' : ''}" data-boss-id="${b.id}">
            <div class="tile-emoji">${unlocked ? b.emoji : '🔒'}</div>
            <div class="tile-name">${unlocked ? b.name : '???'}</div>
            <div class="tile-sub">${unlocked ? (b.description || '') : 'LOCKED'}</div>
            ${defeated ? '<div class="tile-badge">✓ DEFEATED</div>' : ''}
          </div>`;
      }).join('')}
    </div>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.goto('course-mode', { course }));

  root.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
      if (tile.classList.contains('locked')) { App.toast('Defeat another boss to unlock'); return; }
      const bossId = tile.dataset.bossId;
      App.goto('prep-camp', { course, bossId });
    });
  });
});
