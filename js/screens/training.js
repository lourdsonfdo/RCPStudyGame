/* ============================================================
   TRAINING — repeated flashcard questions for XP + gold
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('training', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const pool = (window.ALL_QUESTIONS || []).filter(
    q => boss.questionTopics.includes(q.topic) && q.course === boss.course
  );

  let queue = shuffle(pool);
  let session = { correct: 0, total: 0, xp: 0, gold: 0 };
  let currentQ = null;
  let revealed = false;

  function shuffle(a) { return a.slice().sort(() => Math.random() - 0.5); }

  function nextQ() {
    if (!queue.length) queue = shuffle(pool);
    currentQ = queue.pop();
    revealed = false;
    render();
  }

  function render() {
    if (!currentQ) { root.innerHTML = '<div class="panel t-red">No questions available.</div>'; return; }

    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← DONE</button>
        <span class="t-sm t-orange">🏋️ TRAINING</span>
        <span class="t-sm t-dim">${boss.name}</span>
      </div>

      <div class="panel">
        <div class="xp-header">
          <span class="t-green">+${session.xp} XP</span>
          <span class="gold-txt">+${session.gold}g</span>
        </div>
        <div class="xp-sub">${session.correct} / ${session.total} correct this session</div>
      </div>

      <div class="q-box">
        <div class="q-label">▸ FLASHCARD</div>
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
      App.goto('prep-camp', { course: ctx.course, bossId: ctx.bossId });
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
      <button class="btn btn-block btn-primary" id="nextq">▶ NEXT QUESTION</button>
    `;
    post.querySelector('#nextq').addEventListener('click', nextQ);
  }

  nextQ();
});
