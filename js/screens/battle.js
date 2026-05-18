/* ============================================================
   BATTLE SCREEN — drives a Battle session and renders combat
   ctx: { course, bossId, isDaily? }
   ============================================================ */
App.registerScreen('battle', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const questionPool = (window.ALL_QUESTIONS || []).filter(
    q => boss.questionTopics.includes(q.topic) && q.course === boss.course
  );
  if (questionPool.length < 5) {
    root.innerHTML = `<div class="panel t-red t-sm">Not enough questions for this boss yet (${questionPool.length}). Content generation pending.</div>
      <button class="btn btn-block" data-back>← BACK</button>`;
    root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));
    return;
  }

  // Initialize session (stored on closure)
  const session = Battle.start({
    boss, playerMaxHp: state.maxHp,
    equipped: state.equipped, isDaily: !!ctx.isDaily,
    questionPool,
  });

  // Remove equipped items from inventory now (they're "in use")
  if (!ctx.isDaily) {
    session.items.forEach(k => State.consumeItem(state, k));
    State.clearEquipped(state);
    State.save(state);
  }

  let hintRemoved = [];

  function render() {
    const q = Battle.currentQ(session);
    const prog = Battle.progress(session);
    const bossPct  = (session.bossHp   / session.bossMaxHp)   * 100;
    const playerPct= (session.playerHp / session.playerMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="mode-tag">⚡ BOSS BATTLE${session.isDaily ? ' · DAILY' : ''}</span>
        <span class="course-tag">${boss.course.toUpperCase()}</span>
        <span class="chapter-tag">Q ${Math.min(prog.idx+1, prog.total)}/${prog.total}</span>
      </div>

      <div class="panel" style="display:flex;flex-direction:column;gap:8px;">
        <div class="hp-row">
          <span class="hp-name">PLAYER</span>
          <div class="hp-track"><div class="hp-fill player" style="width:${playerPct}%"></div></div>
          <span class="hp-val">${session.playerHp}</span>
        </div>
        <div class="hp-row">
          <span class="hp-name">BOSS</span>
          <div class="hp-track"><div class="hp-fill boss" style="width:${bossPct}%"></div></div>
          <span class="hp-val">${session.bossHp}</span>
        </div>
      </div>

      <div class="arena" id="arena">
        <div class="boss-emoji">${boss.emoji}</div>
        <div class="boss-name">${boss.name}</div>
        <div class="boss-sub">${boss.description || ''}</div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ Q ${prog.idx+1} / ${prog.total}${session.streak >= 2 ? ' · 🔥 STREAK ' + session.streak : ''}</div>
        <div class="q-text">${q.q}</div>
      </div>

      <div class="answers" id="answers">
        ${q.choices.map((c, i) => `
          <button class="ans-btn ${hintRemoved.includes(i) ? 'disabled-vis' : ''}" data-i="${i}">
            <span class="ans-key">${'ABCD'[i]}</span>${c}
          </button>
        `).join('')}
      </div>

      ${session.items.length ? `
      <div class="panel" style="display:flex; gap:6px; flex-wrap:wrap;">
        <div class="t-xs t-mute" style="width:100%;">ITEMS</div>
        ${session.items.map(k => `
          <button class="item-btn" data-use="${k}">${ITEM_EMOJI[k]} ${ITEM_LABEL[k]}</button>
        `).join('')}
      </div>` : ''}
    `;

    // Click answers
    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled-vis')) return;
        const i = +btn.dataset.i;
        handleAnswer(i, btn);
      });
    });

    // Item buttons
    root.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => useItem(btn.dataset.use));
    });
  }

  function handleAnswer(idx, btn) {
    const q = Battle.currentQ(session);
    const correctIdx = q.correct;
    const res = Battle.answer(session, idx);
    hintRemoved = [];

    // Visual feedback
    btn.classList.add(res.correct ? 'correct' : 'wrong');
    if (!res.correct) {
      const correctBtn = root.querySelectorAll('.ans-btn')[correctIdx];
      if (correctBtn) correctBtn.classList.add('correct');
      const arena = root.querySelector('#arena');
      if (arena) arena.classList.add('shake');
    } else {
      const arena = root.querySelector('#arena');
      if (arena) arena.classList.add('flash-red');
    }

    // Brief explanation overlay
    const expl = document.createElement('div');
    expl.className = 'explanation';
    expl.textContent = res.explanation;
    const qbox = root.querySelector('.q-box');
    if (qbox) qbox.appendChild(expl);

    root.querySelectorAll('.ans-btn').forEach(b => b.classList.add('disabled-vis'));

    setTimeout(() => {
      if (res.gameOver) endBattle();
      else render();
    }, 1400);
  }

  function useItem(key) {
    const eff = Battle.useItem(session, key);
    if (!eff.used) return;
    if (eff.effect === 'hint') hintRemoved = eff.removed || [];
    if (eff.effect === 'heal') App.toast('💚 +' + eff.amount + ' HP');
    if (eff.effect === 'shield') App.toast('🛡 Shield ready');
    render();
  }

  function endBattle() {
    Battle.computeRewards(session);

    // Award rewards
    const lvlInfo = State.addXp(state, session.xpEarned, { doubleActive: session.doubleXpActive });
    State.addGold(state, session.goldEarned);
    if (session.outcome === 'victory' && !state.defeatedBosses.includes(boss.id)) {
      state.defeatedBosses.push(boss.id);
    }
    if (session.isDaily && session.outcome === 'victory') {
      state.dailyChallenge.completed = true;
      State.tickStreakForDailyComplete(state);
    }
    State.save(state);

    App.goto('results', { session, lvlInfo, course: boss.course, bossId: boss.id, isDaily: session.isDaily });
  }

  render();
});

const ITEM_LABEL = { healthPotion:'Potion', hintScroll:'Hint', shieldRune:'Shield' };
const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡' };
