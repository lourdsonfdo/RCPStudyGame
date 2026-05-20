/* ============================================================
   TRAINING — repeated flashcard questions for XP + gold
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('training', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const allForBoss = (window.ALL_QUESTIONS || []).filter(
    q => boss.questionTopics.includes(q.topic) && q.course === boss.course
  );
  // Training pool: only questions explicitly marked 'training' or 'both' —
  // so drill ≠ boss fight. If a topic has no training-tagged questions yet,
  // fall back to the full topic set so the screen still works.
  const trainingOnly = allForBoss.filter(q => q.pool === 'training' || q.pool === 'both');
  const pool = trainingOnly.length ? trainingOnly : allForBoss;

  let queue = shuffle(pool);
  let session = { correct: 0, total: 0, xp: 0, gold: 0 };
  let currentQ = null;
  let revealed = false;

  function shuffle(a) {
    const out = a.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Randomize the order of a question's choices so the correct answer
  // isn't always in the same slot. Returns a NEW question object.
  function shuffleChoices(q) {
    const order = q.choices.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      ...q,
      choices: order.map(i => q.choices[i]),
      correct: order.indexOf(q.correct),
    };
  }

  function nextQ() {
    if (!queue.length) queue = shuffle(pool);
    currentQ = shuffleChoices(queue.pop());
    revealed = false;
    render();
  }

  function render() {
    if (!currentQ) { root.innerHTML = '<div class="panel t-red">No questions available.</div>'; return; }

    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>BACK</button>
        <span class="mode-tag">🏋 DRILL SIMULATION</span>
        <span class="chapter-tag">${boss.name.split(' ').slice(0,2).join(' ').toUpperCase()}</span>
      </div>

      <div class="hud hud-corners">
        <span class="br1"></span><span class="br2"></span>
        <div class="header-strip" style="margin: -14px -16px 10px;">
          <span><span class="status-dot"></span>SESSION ACTIVE</span>
          <span>${session.correct}/${session.total} CORRECT</span>
        </div>
        <div class="vitals">
          <div class="vital">
            <span class="vital-label">EARNED</span>
            <span class="vital-value green">+${session.xp}</span>
            <span class="vital-unit">EXP</span>
          </div>
          <div class="vital">
            <span class="vital-label">CREDITS</span>
            <span class="vital-value amber">+${session.gold}</span>
            <span class="vital-unit">¢</span>
          </div>
          <div class="vital">
            <span class="vital-label">ACCURACY</span>
            <span class="vital-value">${session.total ? Math.round(session.correct/session.total*100) : 0}%</span>
            <span class="vital-unit">RATIO</span>
          </div>
        </div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ FLASHCARD // QUERY</div>
        <div class="q-text">${currentQ.q}</div>
      </div>

      <div class="answers" id="answers">
        ${currentQ.choices.map((c, i) => `
          <button class="ans-btn" data-i="${i}">
            <span class="ans-key">${'ABCD'[i]}</span>${c}
          </button>
        `).join('')}
      </div>

      <div id="postq"></div>
    `;

    root.querySelector('[data-back]').addEventListener('click', () => {
      State.save(state);
      App.back();
    });

    root.querySelectorAll('.ans-btn').forEach(btn => {
      btn.addEventListener('click', () => answer(+btn.dataset.i, btn));
    });
  }

  function answer(idx, btn) {
    if (revealed) return;
    revealed = true;
    const ok = idx === currentQ.correct;
    session.total += 1;
    if (ok) {
      session.correct += 1;
      session.xp += 5;
      session.gold += 10;
      State.addXp(state, 5);
      State.addGold(state, 10);
      State.save(state);
    }

    root.querySelectorAll('.ans-btn').forEach((b, i) => {
      b.classList.add('disabled-vis');
      if (i === currentQ.correct) b.classList.add('correct');
      else if (i === idx) b.classList.add('wrong');
    });

    const post = root.querySelector('#postq');
    post.innerHTML = `
      <div class="explanation">${currentQ.explanation}</div>
      <button class="btn btn-block btn-primary" id="nextq">▶ NEXT QUERY</button>
    `;
    post.querySelector('#nextq').addEventListener('click', nextQ);
  }

  nextQ();
});
