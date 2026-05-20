/* ============================================================
   CRISIS SCREEN — drives a patient-scenario session
   ctx: { course, scenarioId }
   ============================================================ */
App.registerScreen('crisis', ({ root, state, ctx }) => {
  const scenario = (window.ALL_SCENARIOS || []).find(s => s.id === ctx.scenarioId);
  if (!scenario) { root.innerHTML = '<div class="panel t-red">SCENARIO NOT FOUND.</div>'; return; }

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
        <button class="back-btn" data-back>BACK</button>
        <span class="mode-tag">🏥 CASE FILE</span>
        <span class="chapter-tag">${scenario.id.toUpperCase()}</span>
      </div>

      <div class="arena" style="min-height:140px;">
        <div class="boss-portrait calm">🛏</div>
        <div class="boss-name calm">INCOMING PATIENT</div>
      </div>

      <div class="hud hud-corners">
        <span class="br1"></span><span class="br2"></span>
        <div class="header-strip" style="margin: -14px -16px 12px;">
          <span><span class="status-dot"></span>CHIEF COMPLAINT</span>
          <span class="blink">▮ ASSESS</span>
        </div>
        <div class="t-md t-line" style="padding: 4px 0;">${scenario.intro}</div>
      </div>

      <div class="hud hud-corners">
        <span class="br1"></span><span class="br2"></span>
        <div class="header-strip" style="margin: -14px -16px 12px;">
          <span>▸ VITAL SIGNS</span>
          <span>BASELINE</span>
        </div>
        <div class="vitals">
          <div class="vital">
            <span class="vital-label">RR</span>
            <span class="vital-value">${v.rr}</span>
            <span class="vital-unit">/MIN</span>
          </div>
          <div class="vital">
            <span class="vital-label">SPO₂</span>
            <span class="vital-value ${v.spo2 < 90 ? 'red' : 'green'}">${v.spo2}%</span>
            <span class="vital-unit">SATURATION</span>
          </div>
          <div class="vital">
            <span class="vital-label">HR</span>
            <span class="vital-value ${v.hr > 100 ? 'amber' : ''}">${v.hr}</span>
            <span class="vital-unit">BPM</span>
          </div>
        </div>
        <div style="margin-top: 10px; font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); letter-spacing: 1px;">BP // <span class="t-blue">${v.bp}</span></div>
      </div>

      <button class="btn btn-block btn-primary" id="begin">▶ BEGIN ASSESSMENT</button>
    `;
    const arenaEl = root.querySelector('.arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'crisis' });
    root.querySelector('[data-back]').addEventListener('click', () => App.back());
    root.querySelector('#begin').addEventListener('click', () => { phase = 'decision'; render(); });
  }

  function renderDecision() {
    const d = Crisis.currentDecision(session);
    if (!d) return endScenario();
    const pct = (session.patientHp / session.patientMaxHp) * 100;

    root.innerHTML = `
      <div class="topbar">
        <span class="mode-tag">🏥 ACTIVE CASE</span>
        <span class="chapter-tag">${session.history.length + 1}/${scenario.decisions.length}</span>
      </div>

      <div class="hud hud-corners" style="padding: 12px 14px;">
        <span class="br1"></span><span class="br2"></span>
        <div class="hp-row">
          <span class="hp-name">PT</span>
          <div class="hp-track"><div class="hp-fill patient" style="width:${pct}%"></div></div>
          <span class="hp-val">${session.patientHp}</span>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ DECISION POINT // ${session.history.length + 1}</div>
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
        <span class="mode-tag">🏥 OUTCOME</span>
        <span class="chapter-tag ${goodSign ? 't-green' : 't-red'}">${goodSign ? '+' : ''}${lastResult.hpDelta} HP</span>
      </div>

      <div class="hud hud-corners" style="padding: 12px 14px;">
        <span class="br1"></span><span class="br2"></span>
        <div class="hp-row">
          <span class="hp-name">PT</span>
          <div class="hp-track"><div class="hp-fill patient" style="width:${pct}%"></div></div>
          <span class="hp-val">${session.patientHp}</span>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ YOUR INTERVENTION</div>
        <div class="q-text">${d.options[i].text}</div>
      </div>

      <div class="hud hud-corners">
        <span class="br1"></span><span class="br2"></span>
        <div class="header-strip" style="margin: -14px -16px 10px;">
          <span><span class="status-dot"></span>CLINICAL OUTCOME</span>
          <span>${goodSign ? 'POSITIVE' : 'ADVERSE'}</span>
        </div>
        <div class="explanation">${lastResult.explain}</div>
      </div>

      <button class="btn btn-block btn-primary" id="next">${lastResult.gameOver ? '▶ FINAL REPORT' : '▶ CONTINUE'}</button>
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
    App.goto('outcome', { session, lvlInfo, course: ctx.course, scenarioId: scenario.id }, { clearHistory: true });
  }

  render();
});
