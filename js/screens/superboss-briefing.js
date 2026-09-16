/* ============================================================
   SUPERBOSS BRIEFING — pre-run screen for VITALS TITAN.
   Offers RESUME when a saved run exists, and shows any phase that
   is pinned from a failed attempt.
   ============================================================ */
App.registerScreen('superboss-briefing', ({ root, state }) => {
  const bank = (window.ALL_QUESTIONS || []).filter(q => q.course === 'rcp2xx');
  const saved = state.superbossRun;
  const pinned = state.superbossPinned || {};
  const pinnedPhases = SuperBoss.PHASES.filter(p => pinned[p.id]);
  const sprite = (window.BOSS_SPRITES || {})['vitals-titan'] || '🗿';

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>BACK</button>
      <span class="mode-tag">🗿 FINAL PROTOCOL</span>
      <span class="chapter-tag">RCP 202+203</span>
    </div>

    <div class="hud hud-corners">
      <span class="br1"></span><span class="br2"></span>
      <div class="title-block">
        <div class="title-eyebrow">▸ APEX HOSTILE ◂</div>
        <div class="title-main">VITALS TITAN</div>
        <div class="title-sub">EVERY NUMBER THAT MATTERS</div>
      </div>
    </div>

    <div class="arena" style="min-height:190px;">
      <div class="boss-portrait">${sprite}</div>
      <div class="boss-name">VITALS TITAN</div>
      <div class="boss-sub">${bank.length} QUERIES LOADED</div>
    </div>

    ${pinnedPhases.length ? `
      <div class="pin-note">
        ▸ RETRY DRILL ARMED — ${pinnedPhases.map(p => 'PHASE ' + p.n).join(', ')}
        will serve the same queries you missed, reshuffled.
      </div>` : ''}

    <div class="hud">
      <div class="header-strip" style="margin:-14px -16px 10px;">
        <span><span class="status-dot"></span>ENGAGEMENT RULES</span>
        <span>5 × 15 = 75</span>
      </div>
      <ul class="brief-list t-sm">
        <li><b>5 phases × 15 queries</b> — 75 total</li>
        <li><b>12 of 15</b> correct to advance a phase</li>
        <li>Fail a phase and the run <b>ends</b> — restart from phase 1</li>
        <li>No query, and no value, repeats before the final phase</li>
        <li>Vitals restore <b>30%</b> between phases</li>
      </ul>

      <div class="phase-list t-sm">
        ${SuperBoss.PHASES.map(p => `
          <div class="phase-row">
            <span class="phase-n${pinned[p.id] ? ' pinned' : ''}">${p.n}</span>
            <span><b>${p.name}</b>${pinned[p.id] ? ' <span class="t-mute">· pinned</span>' : ''}
              <br><span class="t-mute">${p.blurb}</span></span>
          </div>`).join('')}
      </div>
    </div>

    ${saved ? `<button class="btn btn-primary btn-block" data-resume>RESUME — PHASE ${saved.phaseIndex + 1}</button>` : ''}
    <button class="btn ${saved ? '' : 'btn-primary'} btn-block" data-start>${saved ? 'START OVER' : 'ENGAGE'}</button>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => App.back());
  root.querySelector('[data-start]').addEventListener('click', () => {
    // Clears the in-progress run, NOT the pins — a failed phase stays armed.
    state.superbossRun = null;
    App.persist();
    App.goto('superboss', {});
  });
  const resumeBtn = root.querySelector('[data-resume]');
  if (resumeBtn) resumeBtn.addEventListener('click', () => App.goto('superboss', { resume: true }));
});
