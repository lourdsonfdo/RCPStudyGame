/* ============================================================
   CRISIS SCREEN — drives a patient-scenario session
   ctx: { course, scenarioId }
   ============================================================ */
App.registerScreen('crisis', ({ root, state, ctx }) => {
  const scenario = (window.ALL_SCENARIOS || []).find(s => s.id === ctx.scenarioId);
  if (!scenario) { root.innerHTML = '<div class="panel t-red">Scenario not found.</div>'; return; }

  const session = Crisis.start(scenario);
  let phase = 'intro';            // 'intro' | 'decision' | 'reveal'
  let lastResult = null;

  function render() {
    if (phase === 'intro')    return renderIntro();
    if (phase === 'decision') return renderDecision();
    if (phase === 'reveal')   return renderReveal();
  }

  function renderIntro() {
    const v = scenario.vitals;
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">🏥 ${scenario.title}</span>
        <span></span>
      </div>

      <div class="arena" style="min-height:140px;">
        <div class="boss-emoji calm">🛏</div>
        <div class="boss-name calm">INCOMING PATIENT</div>
      </div>

      <div class="panel">
        <div class="t-md t-line">${scenario.intro}</div>
      </div>

      <div class="panel">
        <div class="t-sm t-dim">VITAL SIGNS</div>
        <div class="t-md t-line" style="margin-top:6px;">
          RR ${v.rr} · SpO₂ ${v.spo2}% · HR ${v.hr} · BP ${v.bp}
        </div>
      </div>

      <button class="btn btn-block btn-primary" id="begin">▶ BEGIN ASSESSMENT</button>
    `;
    const arenaEl = root.querySelector('.arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'crisis' });

    root.querySelector('[data-back]').addEventListener('click', () => App.goto('scenario-select', { course: ctx.course }));
    root.querySelector('#begin').addEventListener('click', () => { phase = 'decision'; render(); });
  }

  function renderDecision() {
    const d = Crisis.currentDecision(session);
    if (!d) return endScenario();
    const pct = (session.patientHp / session.patientMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="t-sm t-orange">🏥 ${scenario.title}</span>
        <span class="t-sm t-dim">${session.history.length + 1} / ${scenario.decisions.length}</span>
      </div>

      <div class="panel">
        <div class="hp-row">
          <span class="hp-name">PATIENT</span>
          <div class="hp-track"><div class="hp-fill patient" style="width:${pct}%"></div></div>
          <span class="hp-val">${session.patientHp}</span>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ DECISION</div>
        <div class="q-text">${d.prompt}</div>
      </div>

      <div class="answers" id="answers">
        ${d.options.map((o, i) => `
          <button class="ans-btn" data-i="${i}">
            <span class="ans-key">${'ABC'[i] || ('OPT '+(i+1))}</span>${o.text}
          </button>
        `).join('')}
      </div>
    `;

    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        lastResult = Crisis.choose(session, i);
        lastResult.optionIdx = i;
        phase = 'reveal';
        render();
      });
    });
  }

  function renderReveal() {
    const d = session.scenario.decisions.find(dd => dd.id === session.history.at(-1).decisionId);
    const i = lastResult.optionIdx;
    const goodSign = lastResult.hpDelta >= 0;
    const pct = (session.patientHp / session.patientMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="t-sm t-orange">🏥 ${scenario.title}</span>
        <span class="t-sm ${goodSign ? 't-green' : 't-red'}">${goodSign ? '+' : ''}${lastResult.hpDelta} HP</span>
      </div>

      <div class="panel">
        <div class="hp-row">
          <span class="hp-name">PATIENT</span>
          <div class="hp-track"><div class="hp-fill patient" style="width:${pct}%"></div></div>
          <span class="hp-val">${session.patientHp}</span>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ YOUR CHOICE</div>
        <div class="q-text">${d.options[i].text}</div>
      </div>

      <div class="panel">
        <div class="t-sm t-dim">RESULT</div>
        <div class="explanation">${lastResult.explain}</div>
      </div>

      <button class="btn btn-block btn-primary" id="next">${lastResult.gameOver ? '▶ SEE OUTCOME' : '▶ CONTINUE'}</button>
    `;
    root.querySelector('#next').addEventListener('click', () => {
      if (lastResult.gameOver) return endScenario();
      phase = 'decision'; render();
    });
  }

  function endScenario() {
    if (!session.outcome) Crisis.computeOutcome(session);
    const rew = Crisis.rewards(session);
    const lvlInfo = State.addXp(state, rew.xp);
    State.addGold(state, rew.gold);
    if (session.outcome === 'stabilized' && !state.completedScenarios.includes(scenario.id)) {
      state.completedScenarios.push(scenario.id);
    }
    State.save(state);
    App.goto('outcome', { session, lvlInfo, course: ctx.course, scenarioId: scenario.id });
  }

  render();
});
