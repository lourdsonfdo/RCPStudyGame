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
    root.innerHTML = `<div class="hud hud-corners t-red t-sm" style="padding:14px;"><span class="br1"></span><span class="br2"></span>NOT ENOUGH QUERIES FOR THIS TARGET (${questionPool.length}). CONTENT PENDING.</div>
      <button class="btn btn-block" data-back>◀ ABORT</button>`;
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
    const sprite = (window.BOSS_SPRITES && window.BOSS_SPRITES[boss.id]) || `<div class="boss-emoji">${boss.emoji}</div>`;

    root.innerHTML = `
      <div class="topbar">
        <span class="mode-tag">⚡ COMBAT${session.isDaily ? ' · DAILY' : ''}</span>
        <span class="course-tag">${boss.course.toUpperCase()}</span>
        <span class="chapter-tag">${Math.min(prog.idx+1, prog.total)}/${prog.total}</span>
      </div>

      <div class="hud hud-corners" style="padding: 12px 14px;">
        <span class="br1"></span><span class="br2"></span>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="hp-row">
            <span class="hp-name">OP</span>
            <div class="hp-track"><div class="hp-fill player" style="width:${playerPct}%"></div></div>
            <span class="hp-val">${session.playerHp}</span>
          </div>
          <div class="hp-row">
            <span class="hp-name">BOSS</span>
            <div class="hp-track"><div class="hp-fill boss" style="width:${bossPct}%"></div></div>
            <span class="hp-val">${session.bossHp}</span>
          </div>
        </div>
      </div>

      <div class="arena" id="arena">
        <div class="boss-portrait" id="boss-portrait">${sprite}</div>
        <div class="boss-name">${boss.name}</div>
        <div class="boss-sub">${boss.description || ''}</div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ QUERY ${prog.idx+1} / ${prog.total}${session.streak >= 2 ? ' · 🔥 STREAK ×' + session.streak : ''}</div>
        <div class="q-text">${q.q}</div>
      </div>

      <div class="answers" id="answers">
        ${q.choices.map((c, i) => `
          <button class="ans-btn ${hintRemoved.includes(i) ? 'disabled-vis' : ''}" data-i="${i}">
            <span class="ans-key">${'ABCD'[i]}</span>${c}
          </button>
        `).join('')}
      </div>

      ${(() => {
        // Only show items the player can manually trigger.
        // reviveCharm and doubleXpTome auto-activate — they're shown as passive badges, not buttons.
        const active  = session.items.filter(k => ITEM_LABEL[k]);
        const passive = session.items.filter(k => !ITEM_LABEL[k]);
        if (!active.length && !passive.length) return '';
        return `
      <div class="hud" style="padding: 10px 12px;">
        <div class="header-strip" style="margin: -10px -12px 8px; font-size: 8px;"><span><span class="status-dot"></span>LOADOUT</span><span>${session.items.length}/3</span></div>
        <div style="display:flex; gap:6px; flex-wrap:wrap;">
          ${active.map(k => `<button class="item-btn" data-use="${k}">${ITEM_EMOJI[k]} ${ITEM_LABEL[k].toUpperCase()}</button>`).join('')}
          ${passive.map(k => `<span class="item-btn" style="opacity:.7;cursor:default;">${PASSIVE_EMOJI[k]} ${PASSIVE_LABEL[k].toUpperCase()}</span>`).join('')}
        </div>
      </div>`;
      })()}
    `;

    // Animated arena background
    const arenaEl = root.querySelector('#arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'battle' });

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

    const arena = root.querySelector('#arena');
    const bossPortrait = root.querySelector('#boss-portrait');

    btn.classList.add(res.correct ? 'correct' : 'wrong');

    if (res.correct) {
      const dmgAmount = res.crit ? 15 : 10;
      if (window.Fx) {
        Fx.damageNumber(bossPortrait, '-' + dmgAmount, { crit: res.crit });
        Fx.particles(bossPortrait, { color: res.crit ? 'gold' : 'green', count: res.crit ? 24 : 14 });
        Fx.bossHit(bossPortrait);
        if (session.streak >= 3) {
          const qLabel = root.querySelector('.q-label');
          if (qLabel) Fx.attachFire(qLabel);
        }
        if (res.crit) {
          Fx.banner('CRIT!', 'crit');
          Fx.shake(2);
          Fx.flash('rgba(255,174,0,.4)');
        } else {
          Fx.shake(1);
        }
      }
    } else {
      if (res.shielded && window.Fx) {
        Fx.damageNumber(arena, 'BLOCK!', { miss: true });
        Fx.particles(arena, { color: 'blue', count: 10 });
        Fx.shake(1);
      } else if (window.Fx) {
        Fx.damageNumber(arena, '-15', {});
        Fx.particles(arena, { color: 'red', count: 10 });
        Fx.bossLunge(bossPortrait, 1);
        Fx.shake(3);
        Fx.flash('rgba(255,56,85,.45)');
      }
      const correctBtn = root.querySelectorAll('.ans-btn')[correctIdx];
      if (correctBtn) correctBtn.classList.add('correct');
    }

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
    if (eff.effect === 'heal') App.toast('+' + eff.amount + ' HP');
    if (eff.effect === 'shield') App.toast('SHIELD READY');
    render();
  }

  function endBattle() {
    Battle.computeRewards(session);

    // Award rewards — computeRewards already applied the doubleXpTome multiplier, so don't double again here
    const lvlInfo = State.addXp(state, session.xpEarned);
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

// Manually-activated items (have buttons)
const ITEM_LABEL = { healthPotion:'Potion', hintScroll:'Hint', shieldRune:'Shield' };
const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡' };

// Passive items (auto-trigger, shown as badges)
const PASSIVE_LABEL = { reviveCharm:'Revive Ready', doubleXpTome:'2× XP Active' };
const PASSIVE_EMOJI = { reviveCharm:'💖', doubleXpTome:'⚡' };
