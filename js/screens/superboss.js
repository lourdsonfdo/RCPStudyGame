/* ============================================================
   SUPERBOSS — VITALS TITAN run screen.
   ctx: { resume: true } to restore a saved run, otherwise starts fresh.
   ============================================================ */
App.registerScreen('superboss', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === 'vitals-titan');
  const bank = (window.ALL_QUESTIONS || []).filter(q => q.course === 'rcp2xx');
  const sprite = (window.BOSS_SPRITES || {})['vitals-titan'] || '🗿';

  if (!boss || bank.length < SuperBoss.QUESTIONS_PER_PHASE * 4) {
    root.innerHTML = `<div class="hud hud-corners t-red t-sm" style="padding:14px;">
        <span class="br1"></span><span class="br2"></span>
        TITAN OFFLINE — BANK HAS ${bank.length} QUERIES, NEEDS 60+.
      </div>
      <button class="btn btn-block" data-home>◀ ABORT</button>`;
    root.querySelector('[data-home]').addEventListener('click', () => App.goto('home'));
    return;
  }

  let run;
  try {
    run = (ctx.resume && state.superbossRun)
      ? SuperBoss.deserialize(state.superbossRun, bank)
      : SuperBoss.startRun({
          bank,
          playerMaxHp: state.maxHp,
          pinned: state.superbossPinned || {},
        });
  } catch (err) {
    // A phase too thin to fill is a content bug, and it is meant to be loud.
    root.innerHTML = `<div class="hud hud-corners t-red t-sm" style="padding:14px;">
        <span class="br1"></span><span class="br2"></span>${err.message}
      </div>
      <button class="btn btn-block" data-home>◀ ABORT</button>`;
    root.querySelector('[data-home]').addEventListener('click', () => App.goto('home'));
    return;
  }

  function persistRun() {
    state.superbossRun = run.outcome ? null : SuperBoss.serialize(run);
    App.persist();
  }

  function render() {
    const phase = SuperBoss.currentPhase(run);
    const q = SuperBoss.currentQ(run);
    if (!q) return;

    const playerPct = (run.playerHp / run.playerMaxHp) * 100;
    const gatePct = (run.correctCount / SuperBoss.PHASE_GATE) * 100;
    const secured = run.correctCount >= SuperBoss.PHASE_GATE;
    const isPinned = !!(state.superbossPinned || {})[phase.id];

    root.innerHTML = `
      <div class="topbar">
        <span class="mode-tag">🗿 VITALS TITAN</span>
        <span class="course-tag">RCP 202+203</span>
        <span class="chapter-tag">PHASE ${phase.n}/5</span>
      </div>

      <div class="hud hud-corners" style="padding:12px 14px;">
        <span class="br1"></span><span class="br2"></span>

        <div class="titan-bars">
          ${run.bossBars.map((hp, i) => `
            <div class="titan-bar ${i === run.phaseIndex ? 'active' : ''} ${i < run.phaseIndex ? 'cleared' : ''}">
              <div class="titan-bar-fill" style="width:${hp}%"></div>
            </div>`).join('')}
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <div class="hp-row mission-row">
            <span class="hp-name">GATE</span>
            <div class="hp-track">
              <div class="hp-fill mission ${secured ? 'secured' : ''}" style="width:${Math.min(100, gatePct)}%"></div>
            </div>
            <span class="hp-val ${secured ? 'val-secured' : ''}">${run.correctCount}/${SuperBoss.PHASE_GATE}${secured ? ' ✓' : ''}</span>
          </div>
          <div class="hp-row">
            <span class="hp-name">OP</span>
            <div class="hp-track"><div class="hp-fill player" style="width:${playerPct}%"></div></div>
            <span class="hp-val">${run.playerHp}</span>
          </div>
        </div>
      </div>

      ${isPinned ? `<div class="pin-note">▸ RETRY DRILL — the same 15 queries you missed, reshuffled</div>` : ''}

      <div class="arena" id="arena" style="min-height:170px;">
        <div class="boss-portrait" id="boss-portrait">${sprite}</div>
        <div class="boss-name">${phase.name}</div>
        <div class="boss-sub">${phase.blurb}</div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ QUERY ${run.qIndex + 1} / ${SuperBoss.QUESTIONS_PER_PHASE}</div>
        <div class="q-text">${q.q}</div>
      </div>

      <div class="answers">
        ${q.choices.map((c, i) => `
          <button class="ans-btn" data-i="${i}"><span class="ans-key">${'ABCD'[i]}</span>${c}</button>
        `).join('')}
      </div>
    `;

    const arenaEl = root.querySelector('#arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'battle' });

    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => onAnswer(Number(btn.dataset.i), btn));
    });
  }

  function onAnswer(choiceIndex, btn) {
    const q = SuperBoss.currentQ(run);
    const res = SuperBoss.answer(run, choiceIndex);

    if (window.State && State.recordAnswer) {
      State.recordAnswer(state, q, res.correct);
    }

    root.querySelectorAll('.ans-btn').forEach((b, i) => {
      if (i === res.correctIndex) b.classList.add('correct');
      else if (i === choiceIndex) b.classList.add('wrong');
      b.classList.add('disabled-vis');
    });

    const portrait = root.querySelector('#boss-portrait');
    if (window.Fx) {
      if (res.correct) Fx.strike({ target: portrait, dmg: 8 });
      else Fx.shake(1);
    }

    persistRun();

    setTimeout(() => {
      if (run.outcome === 'defeat') return finish();
      if (SuperBoss.phaseComplete(run)) {
        const result = SuperBoss.endPhase(run);
        persistRun();
        if (run.outcome) return finish();
        return showPhaseBreak(result);
      }
      render();
    }, res.correct ? 850 : 1200);
  }

  function showPhaseBreak(result) {
    const next = SuperBoss.currentPhase(run);
    root.innerHTML = `
      <div class="hud hud-corners" style="text-align:center;padding:24px 16px;">
        <span class="br1"></span><span class="br2"></span>
        <div class="title-eyebrow">▸ PHASE CLEARED ◂</div>
        <div class="title-main" style="font-size:26px;margin:6px 0;">${result.correct}/${result.total}</div>
        <div class="t-sm t-mute" style="margin:10px 0;">
          VITALS RESTORED +${Math.round(run.playerMaxHp * SuperBoss.INTER_PHASE_HEAL)}
        </div>
        <div class="header-strip" style="margin:16px -16px 12px;">
          <span>NEXT // PHASE ${next.n}</span><span class="blink">▮ READY</span>
        </div>
        <div class="title-sub">${next.name}</div>
        <div class="t-sm t-mute">${next.blurb}</div>
      </div>
      <button class="btn btn-primary btn-block" data-continue>ENGAGE</button>`;
    root.querySelector('[data-continue]').addEventListener('click', render);
  }

  function finish() {
    const won = run.outcome === 'victory';
    state.superbossRun = null;
    // Carry pins forward: a phase failed this run is drilled on the next one.
    state.superbossPinned =
      run.pinned && Object.keys(run.pinned).length ? run.pinned : null;
    if (won && state.defeatedBosses.indexOf('vitals-titan') === -1) {
      state.defeatedBosses.push('vitals-titan');
    }
    App.persist();

    const failed = run.phaseResults.filter(r => !r.passed);
    root.innerHTML = `
      <div class="topbar">
        <span></span>
        <span class="mode-tag" style="color:${won ? 'var(--hud-green)' : 'var(--hud-red)'};">
          ${won ? '★ TITAN DOWN' : '✗ RUN ENDED'}</span>
        <span></span>
      </div>

      <div class="arena" style="min-height:200px;">
        <div class="boss-portrait ${won ? 'victory' : 'calm'}">${sprite}</div>
        <div class="boss-name" style="color:${won ? 'var(--hud-green)' : 'var(--hud-red)'};">
          ${won ? 'TARGET ELIMINATED' : 'OPERATOR DOWN'}</div>
        <div class="boss-sub">VITALS TITAN</div>
      </div>

      <div class="hud">
        <div class="header-strip" style="margin:-14px -16px 10px;">
          <span><span class="status-dot"></span>PHASE BREAKDOWN</span>
          <span>${run.answers.length} ANSWERED</span>
        </div>
        <div class="phase-list t-sm">
          ${run.phaseResults.map(r => `
            <div class="phase-row">
              <span class="phase-n" style="background:${r.passed ? 'var(--hud-green)' : 'var(--hud-red)'};">
                ${r.passed ? '✓' : '✗'}</span>
              <span><b>${r.phaseName}</b><br><span class="t-mute">${r.correct}/${r.total}</span></span>
            </div>`).join('')}
          ${run.phaseResults.length < 5 ? `
            <div class="phase-row">
              <span class="phase-n" style="background:var(--line);">–</span>
              <span class="t-mute">${5 - run.phaseResults.length} phase(s) not reached</span>
            </div>` : ''}
        </div>
      </div>

      ${failed.length ? `
        <div class="pin-note">
          ▸ ${failed.map(r => r.phaseName).join(', ')} pinned — your next attempt
          drills the same queries in a new order.
        </div>` : ''}

      <button class="btn btn-primary btn-block" data-review>REVIEW MISSES</button>
      <button class="btn btn-block" data-home>RETURN</button>`;

    root.querySelector('[data-review]').addEventListener('click', () => {
      // Shape the run's history for the shared review screen.
      const answers = run.answers.map(a => ({
        q: a.question.q,
        choices: a.question.choices,
        chose: a.chosen,
        correctIdx: a.question.correct,
        isCorrect: a.correct,
        explanation: a.question.explanation,
        topic: a.question.topic,
        srcItem: a.srcItem,
        srcCite: a.srcCite,
        caution: a.question.caution,
      }));
      App.goto('review-answers', { answers, returnTo: 'home', returnCtx: {} });
    });
    root.querySelector('[data-home]').addEventListener('click',
      () => App.goto('home', {}, { clearHistory: true }));
  }

  render();
});
