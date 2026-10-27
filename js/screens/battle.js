/* ============================================================
   BATTLE SCREEN — drives a Battle session and renders combat
   ctx: { course, bossId, isDaily? }
   Returns a cleanup function that cancels pending timers and
   disposes BossMotion when the router navigates away.
   ============================================================ */
App.registerScreen('battle', ({ root, state, ctx }) => {
  root.classList.add('acsc');
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  // Battle pool: untagged questions (legacy) + explicitly 'battle' or 'both'.
  // Training-only questions are excluded so the drill feels different from the fight.
  const questionPool = (window.ALL_QUESTIONS || []).filter(q =>
    boss.questionTopics.includes(q.topic) && q.course === boss.course
    && (!q.pool || q.pool === 'battle' || q.pool === 'both')
  );
  if (questionPool.length < 5) {
    root.innerHTML = `<div class="hud hud-corners t-red t-sm" style="padding:14px;"><span class="br1"></span><span class="br2"></span>NOT ENOUGH QUERIES FOR THIS TARGET (${questionPool.length}). CONTENT PENDING.</div>
      <button class="btn btn-block" data-back>◀ ABORT</button>`;
    root.querySelector('[data-back]').addEventListener('click', () => App.goto('home'));
    return;
  }

  const saved = state.battleRun;
  const resuming = !!(ctx.resume && saved && saved.bossId === boss.id);

  const session = resuming
    ? saved.session
    : Battle.start({
        boss, playerMaxHp: state.maxHp,
        equipped: state.equipped, isDaily: !!ctx.isDaily,
        questionPool, state,
      });

  if (!resuming && !ctx.isDaily) {
    session.items.forEach(k => State.consumeItem(state, k));
    State.clearEquipped(state);
    State.save(state);
  }

  function persistFight() {
    state.battleRun = session.outcome
      ? null
      : { bossId: boss.id, course: boss.course, isDaily: !!session.isDaily, session: session };
    State.save(state);
  }

  function leaveFight() {
    persistFight();
    if (session.isDaily) App.goto('home', {}, { clearHistory: true });
    else App.goto('prep-camp', { course: boss.course, bossId: boss.id }, { clearHistory: true });
  }

  persistFight();

  let hintRemoved = [];

  // Screen-local pending timers — cancelled on cleanup
  const _pending = new Set();
  function _wait(ms, fn) {
    const id = setTimeout(() => { _pending.delete(id); fn(); }, ms);
    _pending.add(id);
    return id;
  }

  function render() {
    if (window.Fx && Fx.reset) Fx.reset();
    const q = Battle.currentQ(session);
    const prog = Battle.progress(session);
    const bossPct  = (session.bossHp   / session.bossMaxHp)   * 100;
    const playerPct= (session.playerHp / session.playerMaxHp) * 100;
    const missionPct = (session.correctCount / session.questions.length) * 100;
    const targetPct  = (session.correctTarget / session.questions.length) * 100;
    const missionSecured = session.correctCount >= session.correctTarget;
    const sprite = (window.BOSS_SPRITES && window.BOSS_SPRITES[boss.id]) || `<div class="boss-emoji">${boss.emoji}</div>`;

    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-leave>BACK</button>
        <span class="mode-tag">⚡ COMBAT${session.isDaily ? ' · DAILY' : ''}</span>
        <span class="chapter-tag">${Math.min(prog.idx+1, prog.total)}/${prog.total}</span>
      </div>

      <div class="hud hud-corners" style="padding: 12px 14px;">
        <span class="br1"></span><span class="br2"></span>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="hp-row mission-row">
            <span class="hp-name">PASS</span>
            <div class="hp-track">
              <div class="hp-fill mission ${missionSecured ? 'secured' : ''}" style="width:${missionPct}%"></div>
              <div class="mission-marker" style="left:${targetPct}%" title="Need ${session.correctTarget}/${session.questions.length} to pass"></div>
            </div>
            <span class="hp-val ${missionSecured ? 'val-secured' : ''}">${session.correctCount}/${session.questions.length}${missionSecured ? ' ✓' : ''}</span>
          </div>
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

    // Animated arena background with course-specific art
    const arenaEl = root.querySelector('#arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'battle', course: boss.course });

    // Mount atlas on the combat portrait if BossMotion is available
    const bossPortraitEl = root.querySelector('#boss-portrait');
    if (bossPortraitEl && window.BossMotion) {
      BossMotion.attach(bossPortraitEl, { bossId: boss.id });
    }

    // Click answers — guard against double-clicks via immediate disabled state
    root.querySelectorAll('.ans-btn').forEach(btn => {
      if (btn.classList.contains('disabled-vis')) return;
      btn.addEventListener('click', () => handleAnswer(+btn.dataset.i, btn));
    });

    root.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => useItem(btn.dataset.use));
    });

    const leaveBtn = root.querySelector('[data-leave]');
    if (leaveBtn) leaveBtn.addEventListener('click', leaveFight);
  }

  function _disableAllAnswers() {
    root.querySelectorAll('.ans-btn').forEach(b => {
      b.disabled = true;
      b.classList.add('disabled-vis');
    });
  }

  function handleAnswer(idx, btn) {
    // Guard: if this button is already disabled, ignore stale event
    if (btn.disabled || btn.classList.contains('disabled-vis')) return;

    // Immediately disable all answer buttons to prevent repeat input
    _disableAllAnswers();
    root.querySelectorAll('[data-use]').forEach(b => { b.disabled = true; });

    const q = Battle.currentQ(session);
    const correctIdx = q.correct;
    const res = Battle.answer(session, idx);
    hintRemoved = [];

    if (window.State && State.recordAnswer) {
      State.recordAnswer(state, q, res.correct);
      State.save(state);
    }

    const arena = root.querySelector('#arena');
    const bossPortrait = root.querySelector('#boss-portrait');
    const qbox = root.querySelector('.q-box');

    btn.classList.add(res.correct ? 'correct' : 'wrong');

    let waitMs = 1400;
    if (res.correct) {
      const dmgAmount = Math.abs(res.bossHpDelta);
      if (window.Fx) {
        if (session.streak >= 3) {
          const qLabel = root.querySelector('.q-label');
          if (qLabel) Fx.attachFire(qLabel);
        }
        if (res.gameOver && session.outcome === 'victory') {
          Fx.judgement({ caster: qbox, target: bossPortrait, dmg: dmgAmount });
          _wait(1850, () => { if (window.BossMotion) BossMotion.play(bossPortrait, 'defeat'); });
          waitMs = 2800;
        } else if (session.streak >= 5) {
          Fx.comboStrike({ target: bossPortrait, dmg: dmgAmount });
          waitMs = 1900;
        } else if (res.crit) {
          Fx.lanceOfLight({ caster: qbox, target: bossPortrait, dmg: dmgAmount });
          waitMs = 1500;
        } else {
          Fx.strike({ target: bossPortrait, dmg: dmgAmount });
        }
      }
    } else {
      if (res.shielded && window.Fx) {
        Fx.damageNumber(arena, 'BLOCK!', { miss: true });
        Fx.particles(arena, { color: 'blue', count: 10 });
        Fx.shake(1);
      } else if (window.Fx) {
        Fx.bossCounter({ playerArea: arena, bossPortrait, bossName: boss.name, dmg: Math.abs(res.playerHpDelta) });
        waitMs = 1700;
      }
      const correctBtn = root.querySelectorAll('.ans-btn')[correctIdx];
      if (correctBtn) correctBtn.classList.add('correct');
    }

    const expl = document.createElement('div');
    expl.className = 'explanation';
    expl.textContent = res.explanation;
    if (qbox) qbox.appendChild(expl);

    persistFight();

    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-block btn-primary next-q-btn';
    nextBtn.textContent = res.gameOver ? '▶ VIEW RESULTS' : '▶ NEXT QUERY';
    nextBtn.addEventListener('click', () => {
      if (res.gameOver) endBattle();
      else render();
    });
    if (qbox) qbox.appendChild(nextBtn);

    _wait(waitMs, () => nextBtn.classList.add('show'));
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
    state.battleRun = null;
    Battle.computeRewards(session);

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

    App.goto('results', { session, lvlInfo, course: boss.course, bossId: boss.id, isDaily: session.isDaily }, { clearHistory: true });
  }

  render();

  // Return cleanup: cancel pending timers, dispose atlas on navigate-away
  return function cleanup() {
    _pending.forEach(id => clearTimeout(id));
    _pending.clear();
    if (window.BossMotion) BossMotion.reset();
  };
});

// Manually-activated items (have buttons)
const ITEM_LABEL = { healthPotion:'Potion', hintScroll:'Hint', shieldRune:'Shield' };
const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡' };

// Passive items (auto-trigger, shown as badges)
const PASSIVE_LABEL = { doubleXpTome:'2× XP Active' };
const PASSIVE_EMOJI = { doubleXpTome:'⚡' };
