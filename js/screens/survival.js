/* ============================================================
   SURVIVAL — rapid-fire questions vs. a draining timer
   Course-specific (RCP 103 or 104). Correct answers add time,
   wrong answers shave time. End when the clock hits 0.
   ============================================================ */
(function () {
  // Outside the screen closure so re-entry can cancel a stale RAF
  let activeRaf = null;

  // Tuning constants
  const START_TIME    = 20;    // seconds
  const CAP_TIME      = 30;    // max bar fill
  const BONUS_CORRECT = 3;     // +seconds per correct
  const PENALTY_WRONG = -2;    // seconds shaved per wrong
  const FLASH_OK_MS   = 280;   // pause after correct answer
  const FLASH_BAD_MS  = 720;   // pause after wrong (lets player register correct one)

  App.registerScreen('survival', ({ root, state }) => {
    if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = null; }

    // ── session ──────────────────────────────────────────────
    let view = 'pick';                      // 'pick' | 'playing' | 'over'
    let course = null;                      // 'rcp103' | 'rcp104'
    let pool = [];
    let queue = [];
    let currentQ = null;
    let remaining = START_TIME;
    let lastTick = 0;
    let score = 0;
    let best = 0;
    let answersLog = [];                    // for end-of-run review
    let revealed = false;                   // locks inputs during flash window

    function shuffle(a) {
      const o = a.slice();
      for (let i = o.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [o[i], o[j]] = [o[j], o[i]];
      }
      return o;
    }
    function shuffleChoices(q) {
      const order = q.choices.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { ...q, choices: order.map(i => q.choices[i]), correct: order.indexOf(q.correct) };
    }

    function bestFor(crs) {
      return ((state.survival || {})[crs === 'rcp103' ? 'best103' : 'best104']) || 0;
    }

    function render() {
      if (view === 'pick')    return renderPick();
      if (view === 'playing') return renderPlay();
      if (view === 'over')    return renderOver();
    }

    // ── PICK ────────────────────────────────────────────────
    function renderPick() {
      root.innerHTML = `
        <div class="topbar">
          <button class="back-btn" data-back>BACK</button>
          <span class="mode-tag">⏱ SURVIVAL</span>
          <span class="chapter-tag">PICK COURSE</span>
        </div>

        <div class="hud hud-corners" style="text-align:center;">
          <span class="br1"></span><span class="br2"></span>
          <div class="title-eyebrow">▸ RAPID-FIRE PROTOCOL ◂</div>
          <div class="title-main" style="font-size: 28px; margin: 6px 0;">SURVIVAL</div>
          <div class="title-sub">+${BONUS_CORRECT}s PER CORRECT · ${PENALTY_WRONG}s PER WRONG · BEAT THE CLOCK</div>
        </div>

        <div class="module module-103" data-pick="rcp103">
          <div class="module-icon-wrap">🫁</div>
          <div class="module-body">
            <div class="module-tag">▸ COURSE 103</div>
            <div class="module-title">PULMONARY DISEASE</div>
            <div class="module-meta">BEST RUN: ${bestFor('rcp103')} CORRECT</div>
          </div>
        </div>

        <div class="module module-104" data-pick="rcp104">
          <div class="module-icon-wrap">💊</div>
          <div class="module-body">
            <div class="module-tag">▸ COURSE 104</div>
            <div class="module-title">PHARMACOLOGY</div>
            <div class="module-meta">BEST RUN: ${bestFor('rcp104')} CORRECT</div>
          </div>
        </div>

        <div class="spacer"></div>
        <div class="data-stream">
          <span>RULES: ⏱ ${START_TIME}s START · CAP ${CAP_TIME}s · NO MERCY</span>
        </div>
      `;

      root.querySelector('[data-back]').addEventListener('click', () => App.back());
      root.querySelectorAll('[data-pick]').forEach(el => {
        el.addEventListener('click', () => startGame(el.dataset.pick));
      });
    }

    function startGame(crs) {
      course = crs;
      best = bestFor(crs);
      pool = (window.ALL_QUESTIONS || []).filter(q => q.course === crs);
      if (pool.length < 5) {
        App.toast('Not enough questions for this course');
        return;
      }
      queue = shuffle(pool);
      remaining = START_TIME;
      score = 0;
      answersLog = [];
      view = 'playing';
      currentQ = shuffleChoices(queue.pop());
      revealed = false;
      render();
      lastTick = performance.now();
      activeRaf = requestAnimationFrame(tick);
    }

    // ── PLAY ────────────────────────────────────────────────
    function renderPlay() {
      const pct = Math.max(0, Math.min(100, (remaining / CAP_TIME) * 100));
      const lowTime = remaining < 6;
      root.innerHTML = `
        <div class="topbar">
          <button class="back-btn" data-back>BACK</button>
          <span class="mode-tag">⏱ SURVIVAL</span>
          <span class="chapter-tag">SCORE ${score}</span>
        </div>

        <div class="survival-clock ${lowTime ? 'low' : ''}">
          <div class="survival-bar-track">
            <div class="survival-bar-fill" id="sv-fill" style="width:${pct}%"></div>
          </div>
          <div class="survival-meta">
            <span>⏱ <span id="sv-time">${remaining.toFixed(1)}</span>s</span>
            <span>BEST: ${best}</span>
          </div>
        </div>

        <div class="q-box">
          <div class="q-label">▸ RAPID QUERY · ${course.toUpperCase()}</div>
          <div class="q-text">${currentQ.q}</div>
        </div>

        <div class="answers" id="answers">
          ${currentQ.choices.map((c, i) => `
            <button class="ans-btn" data-i="${i}">
              <span class="ans-key">${'ABCD'[i]}</span>${c}
            </button>
          `).join('')}
        </div>
      `;

      root.querySelector('[data-back]').addEventListener('click', () => {
        endGame();
        view = 'pick';
        render();
      });
      root.querySelectorAll('.ans-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(+btn.dataset.i, btn));
      });
    }

    function handleAnswer(idx, btn) {
      if (revealed) return;
      revealed = true;
      const ok = idx === currentQ.correct;

      // Update score + timer
      if (ok) {
        score += 1;
        remaining = Math.min(CAP_TIME, remaining + BONUS_CORRECT);
      } else {
        remaining = Math.max(0, remaining + PENALTY_WRONG);
      }
      answersLog.push({
        q: currentQ.q,
        choices: currentQ.choices.slice(),
        chose: idx,
        correctIdx: currentQ.correct,
        isCorrect: ok,
        explanation: currentQ.explanation,
        topic: currentQ.topic,
      });
      if (window.State && State.recordAnswer) State.recordAnswer(state, currentQ, ok);

      // Visual feedback
      root.querySelectorAll('.ans-btn').forEach((b, i) => {
        b.classList.add('disabled-vis');
        if (i === currentQ.correct) b.classList.add('correct');
        else if (i === idx) b.classList.add('wrong');
      });
      if (window.Fx) {
        Fx.flash(ok ? 'rgba(0,255,157,.32)' : 'rgba(255,56,85,.32)', 220);
        Fx.shake(ok ? 1 : 2);
      }

      const pause = ok ? FLASH_OK_MS : FLASH_BAD_MS;
      setTimeout(() => {
        if (view !== 'playing') return; // user bailed
        if (remaining <= 0) { endGame(); return; }
        nextQuestion();
      }, pause);
    }

    function nextQuestion() {
      if (!queue.length) queue = shuffle(pool);
      currentQ = shuffleChoices(queue.pop());
      revealed = false;
      render();
    }

    function tick(now) {
      if (!root.classList.contains('active')) { activeRaf = null; return; }
      if (view !== 'playing') { activeRaf = null; return; }
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      // Drain even during the flash window — that's the tension.
      remaining = Math.max(0, remaining - dt);

      // Update only the bar + time text without full re-render
      const fill = root.querySelector('#sv-fill');
      const tEl  = root.querySelector('#sv-time');
      if (fill) fill.style.width = ((remaining / CAP_TIME) * 100) + '%';
      if (tEl)  tEl.textContent = remaining.toFixed(1);
      const clock = root.querySelector('.survival-clock');
      if (clock) clock.classList.toggle('low', remaining < 6);

      if (remaining <= 0 && view === 'playing') {
        endGame();
        return;
      }
      activeRaf = requestAnimationFrame(tick);
    }

    // ── OVER ─────────────────────────────────────────────────
    function endGame() {
      if (view === 'over') return;
      view = 'over';
      if (activeRaf) { cancelAnimationFrame(activeRaf); activeRaf = null; }

      // Rewards: 5 XP + 10 gold per correct, +50 XP bonus if new best
      const newBest = score > best;
      const xpGained = score * 5 + (newBest ? 50 : 0);
      const goldGained = score * 10;
      if (xpGained) State.addXp(state, xpGained);
      if (goldGained) State.addGold(state, goldGained);
      if (State.recordSurvival) State.recordSurvival(state, course, score);
      State.save(state);

      render();
    }

    function renderOver() {
      const misses = answersLog.filter(a => !a.isCorrect).length;
      const newBest = score > best;
      const xpGained = score * 5 + (newBest ? 50 : 0);
      const goldGained = score * 10;

      root.innerHTML = `
        <div class="topbar">
          <span></span>
          <span class="mode-tag" style="color: var(--hud-amber);">⏱ RUN ENDED</span>
          <span></span>
        </div>

        <div class="hud hud-corners" style="text-align:center;">
          <span class="br1"></span><span class="br2"></span>
          <div class="title-eyebrow">▸ FINAL SCORE ◂</div>
          <div class="title-main" style="font-size: 56px; margin: 4px 0; color: var(--hud-green); text-shadow: 0 0 16px var(--hud-green);">${score}</div>
          <div class="title-sub">${course.toUpperCase()} · ${newBest ? '★ NEW PERSONAL BEST ★' : 'previous best: ' + best}</div>
        </div>

        <div class="hud hud-corners">
          <span class="br1"></span><span class="br2"></span>
          <div class="vitals">
            <div class="vital">
              <span class="vital-label">CORRECT</span>
              <span class="vital-value green">${score}</span>
              <span class="vital-unit">QUERIES</span>
            </div>
            <div class="vital">
              <span class="vital-label">EXP</span>
              <span class="vital-value amber">+${xpGained}</span>
              <span class="vital-unit">EARNED</span>
            </div>
            <div class="vital">
              <span class="vital-label">GOLD</span>
              <span class="vital-value amber">+${goldGained}</span>
              <span class="vital-unit">¢</span>
            </div>
          </div>
        </div>

        <div class="spacer"></div>

        ${misses > 0 ? `<button class="btn btn-block btn-review" data-action="review">📖 REVIEW MISSES (${misses})</button>` : ''}
        <button class="btn btn-block btn-primary" data-action="again">⚔ ANOTHER RUN</button>
        <button class="btn btn-block" data-action="other">↔ SWITCH COURSE</button>
        <button class="btn btn-block" data-action="home">⌂ HQ</button>
      `;

      root.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const a = btn.dataset.action;
          if (a === 'review') {
            App.goto('review-answers', {
              answers: answersLog,
              returnTo: 'survival',
              returnCtx: {},
            });
          }
          if (a === 'again') { startGame(course); }
          if (a === 'other') { view = 'pick'; render(); }
          if (a === 'home')  { App.goto('home'); }
        });
      });
    }

    render();
  });
})();
