/* ============================================================
   REVIEW ANSWERS — post-battle/post-survival miss review
   ctx: { answers, returnTo, returnCtx, course?, bossId? }
   answers: [{ q, choices, chose, correctIdx, isCorrect, explanation, topic }]
   ============================================================ */
App.registerScreen('review-answers', ({ root, state, ctx }) => {
  const answers = ctx.answers || [];
  const misses  = answers.filter(a => !a.isCorrect);
  const total   = answers.length;

  root.innerHTML = `
    <div class="topbar">
      <button class="back-btn" data-back>BACK</button>
      <span class="mode-tag">📖 REVIEW</span>
      <span class="chapter-tag">${misses.length}/${total} MISSED</span>
    </div>

    <div class="hud hud-corners" style="text-align:center;">
      <span class="br1"></span><span class="br2"></span>
      <div class="title-eyebrow">▸ POST-BATTLE DEBRIEF ◂</div>
      <div class="title-main" style="font-size: 22px; margin: 6px 0;">${misses.length === 0 ? 'PERFECT RUN' : misses.length + ' MISSES'}</div>
      <div class="title-sub">${misses.length === 0 ? 'No corrections needed. Outstanding work.' : 'Study these to lock them in for next time.'}</div>
    </div>

    ${misses.length === 0 ? '' : misses.map((a, idx) => `
      <div class="review-card hud-corners">
        <span class="br1"></span><span class="br2"></span>
        <div class="review-head">
          <span class="review-num">Q${idx + 1}</span>
          <span class="review-topic">${(a.topic || '').toUpperCase()}</span>
        </div>
        <div class="review-q">${a.q}</div>
        <div class="review-choices">
          ${a.choices.map((c, i) => {
            let cls = 'review-choice';
            if (i === a.correctIdx) cls += ' correct';
            else if (i === a.chose) cls += ' chosen-wrong';
            return `
              <div class="${cls}">
                <span class="review-key">${'ABCD'[i]}</span>
                <span>${c}</span>
                ${i === a.correctIdx ? '<span class="review-tag tag-correct">CORRECT</span>' : ''}
                ${i === a.chose && i !== a.correctIdx ? '<span class="review-tag tag-wrong">YOUR ANSWER</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div class="review-expl">
          <span class="review-expl-label">▸ WHY</span>
          <div>${a.explanation || 'No explanation available.'}</div>
        </div>
      </div>
    `).join('')}

    <div class="spacer"></div>

    <button class="btn btn-block btn-primary" data-action="done">▶ BACK TO RESULTS</button>
  `;

  root.querySelector('[data-back]').addEventListener('click', () => goBack());
  root.querySelector('[data-action="done"]').addEventListener('click', () => goBack());

  function goBack() {
    if (ctx.returnTo && ctx.returnCtx) {
      App.goto(ctx.returnTo, ctx.returnCtx);
    } else {
      App.back();
    }
  }
});
