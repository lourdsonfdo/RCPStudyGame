/* Respiratory Academy — real study progress, existing game destinations. */
App.registerScreen('home', ({ root, state }) => {
  const bosses = window.ALL_BOSSES || [];
  const questions = window.ALL_QUESTIONS || [];
  const next = Academy.recommendation(state, bosses, questions);
  const review = Academy.reviewQuestions(state, questions);
  const saved = Academy.resumableBattle(state, bosses);
  const savedBoss = saved && bosses.find(b => b.id === saved.bossId);
  const dailyBoss = bosses.find(b => b.id === state.dailyChallenge.bossId);
  const dailyAvailable = State.isDailyAvailable(state) && dailyBoss;
  const xp = Math.max(0, Math.min(100, State.xpProgressInCurrentLevel(state).ratio * 100));
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = (name) => {
    const paths = {
      book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Zm0 0v15"/>',
      lungs: '<path d="M12 2v7m0-3-3 4m3-4 3 4M8 7C5 7 2 13 2 18c0 4 7 2 7-1V9m7-2c3 0 6 6 6 11 0 4-7 2-7-1V9"/>',
      flask: '<path d="M9 2h6m-5 0v7L4 19c-1 2 1 3 3 3h10c2 0 4-1 3-3L14 9V2M7 15h10"/>',
      pulse: '<path d="M2 12h5l3-8 4 16 3-8h5"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3 1-2h4l1 2 3 2h3l2 4-2 2v3l2 2-2 4h-3l-3 2h-6l-3-2H3l-2-4 2-2v-3L1 9l2-4h3Z"/>',
      flag: '<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
      mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
      arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  };
  const countFor = course => bosses.filter(b => b.course === course && state.defeatedBosses.includes(b.id)).length;
  const totalFor = course => bosses.filter(b => b.course === course).length;
  const motionPaused = !!state.settings.academyMotionPaused;
  root.classList.add('academy');
  root.classList.toggle('academy-paused', motionPaused);
  root.innerHTML = `
    <header class="ac-header">
      <a class="ac-brand" href="#" aria-label="RCP Study home">${icon('lungs')}<span>RCP STUDY</span></a>
      <span class="ac-header-caption">The Respiratory Academy</span>
      <button class="ac-icon-button" data-action="settings" aria-label="Settings">${icon('settings')}</button>
    </header>
    <div class="ac-intro"><span class="ac-kicker">A little practice. A stronger clinician.</span><h1>Welcome to the academy.</h1></div>
    <div class="ac-main">
      <div class="ac-scene">
        <picture><source media="(max-width: 600px)" srcset="img/academy-room-mobile.webp"><img src="img/academy-room.webp" width="1400" height="933" fetchpriority="high" alt="A sunlit respiratory teaching academy with a library, simulation mannequin and ventilator, and a glowing arena doorway."></picture>
        <div class="ac-sunlight" aria-hidden="true"></div><div class="ac-portal-glow" aria-hidden="true"></div>
        <div class="ac-dust" aria-hidden="true">${Array.from({ length: 9 }, (_, i) => `<i style="--i:${i};left:${15+i*8}%;top:${22+(i*13)%54}%"></i>`).join('')}</div>
        <nav class="ac-stations" aria-label="Academy stations">
          <button data-station="library">${icon('book')}<span>Library</span></button>
          <button data-station="simulation">${icon('pulse')}<span>Simulation Lab</span></button>
          <button data-station="arena">${icon('flag')}<span>Boss Arena</span></button>
        </nav>
        <button class="ac-motion" data-action="motion" aria-pressed="${motionPaused}">${motionPaused ? 'Play ambience' : 'Pause ambience'}</button>
        <span class="ac-scene-caption">Learn. Practice. Become.</span>
      </div>
      <aside class="ac-study" aria-labelledby="ac-next-title">
        <div class="ac-welcome">Welcome back, Lourd<span>${esc(State.titleForLevel(state.level))}</span></div>
        <div class="ac-next"><span class="ac-kicker">Your next step</span>
          <h2 id="ac-next-title">${next ? (next.isWeak ? 'Build confidence in ' : 'Explore ') + esc(next.label) : 'Choose your path'}</h2>
          <p>${next?.isWeak ? 'A little focused practice on a topic you’ve found challenging.' : 'Make a little progress today. Practice first, then take on a boss.'}</p>
          ${next ? `<span class="ac-session-meta">${icon('book')}${next.count} questions · Practice at your pace</span>` : ''}
          <button class="ac-primary" data-action="study" ${next ? '' : 'disabled'}>Start Study Session ${icon('arrow')}</button>
          ${saved ? `<button class="ac-resume" data-action="resume">Resume saved battle<span>${esc(savedBoss.name)}</span></button>` : ''}
        </div>
        <div class="ac-progress">
          <div class="ac-level"><span>Level ${state.level}</span><span>${state.streak.count} day${state.streak.count === 1 ? '' : 's'} streak</span></div>
          <div class="ac-xp" role="progressbar" aria-label="Progress to next level" aria-valuenow="${Math.round(xp)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${xp}%"></span></div>
          <div class="ac-progress-meta"><span>${state.xp.toLocaleString()} XP${state.level >= 10 ? ' · Max level' : ' / '+State.xpForNextLevel(state.level).toLocaleString()}</span><span>${state.gold.toLocaleString()} gold</span></div>
        </div>
      </aside>
    </div>
    <section class="ac-paths" aria-labelledby="ac-path-title">
      <div class="ac-section-heading"><h2 id="ac-path-title">Choose your path</h2><span>Small steps. Lasting knowledge.</span></div>
      <div class="ac-course-grid">
        <button class="ac-course" data-course="rcp103"><img src="img/academy-pulmonary.webp" width="480" height="135" alt="" loading="lazy"><span class="ac-course-body"><span class="ac-course-name">Pulmonary Disease ${icon('arrow')}</span><span class="ac-course-code">RCP 103</span><span class="ac-course-description">Pathophysiology, assessment, and management.</span><span class="ac-course-progress">${countFor('rcp103')} / ${totalFor('rcp103')} bosses mastered</span></span></button>
        <button class="ac-course" data-course="rcp104"><img src="img/academy-pharmacology.webp" width="474" height="135" alt="" loading="lazy"><span class="ac-course-body"><span class="ac-course-name">Pharmacology ${icon('arrow')}</span><span class="ac-course-code">RCP 104</span><span class="ac-course-description">Medications, indications, and respiratory therapy.</span><span class="ac-course-progress">${countFor('rcp104')} / ${totalFor('rcp104')} bosses mastered</span></span></button>
        <button class="ac-course" data-station="simulation"><img src="img/academy-clinical.webp" width="476" height="135" alt="" loading="lazy"><span class="ac-course-body"><span class="ac-course-name">Clinical Challenges ${icon('arrow')}</span><span class="ac-course-code">Simulation Lab</span><span class="ac-course-description">Put your knowledge to work in clinical scenarios.</span><span class="ac-course-progress">${state.completedScenarios.length} scenarios completed</span></span></button>
      </div>
    </section>
    <div class="ac-activities">
      <button class="ac-activity" data-action="daily" ${dailyAvailable ? '' : 'disabled'}>${icon('mail')}<span><strong>Daily Challenge</strong><small>${dailyAvailable ? esc(dailyBoss.name) : 'Completed for today. Well done.'}</small></span>${icon('arrow')}</button>
      <button class="ac-activity" data-action="review" ${review.length ? '' : 'disabled'}>${icon('book')}<span><strong>Review missed questions</strong><small>${review.length ? review.length + ' questions ready for another look' : 'Your missed questions will appear here'}</small></span>${icon('arrow')}</button>
    </div>
    <footer class="ac-footer"><button data-action="titan">${icon('flag')}Vitals Titan <small>RCP 202 + 203</small></button><button data-action="survival">${icon('clock')}Survival <small>Test your endurance</small></button></footer>
    <dialog class="ac-dialog" aria-labelledby="ac-dialog-title"><div class="ac-dialog-head"><h2 id="ac-dialog-title">Choose your course</h2><button data-close aria-label="Close course selection">×</button></div><p class="ac-dialog-sub"></p><div class="ac-dialog-options"></div></dialog>
  `;
  const dialog = root.querySelector('dialog');
  const resume = () => App.goto('battle', { course: saved.course, bossId: saved.bossId, isDaily: !!saved.isDaily, resume: true });
  root.querySelector('.ac-brand').addEventListener('click', event => { event.preventDefault(); window.scrollTo({top:0,behavior:'auto'}); });
  root.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  function chooseCourse(station) {
    root.querySelector('#ac-dialog-title').textContent = {library:'Study library',simulation:'Simulation lab',arena:'Boss arena'}[station];
    root.querySelector('.ac-dialog-sub').textContent = 'Choose the course you’d like to practice.';
    const options = root.querySelector('.ac-dialog-options');
    options.innerHTML = '<button data-pick="rcp103">Pulmonary Disease <small>RCP 103</small></button><button data-pick="rcp104">Pharmacology <small>RCP 104</small></button>';
    options.querySelectorAll('[data-pick]').forEach(button => button.addEventListener('click', () => {
      dialog.close();
      App.goto(station === 'simulation' ? 'scenario-select' : 'boss-select', { course: button.dataset.pick, mode: station === 'library' ? 'training' : 'battle' });
    }));
    dialog.showModal();
  }
  root.querySelectorAll('[data-station]').forEach(button => button.addEventListener('click', () => chooseCourse(button.dataset.station)));
  root.querySelectorAll('[data-course]').forEach(button => button.addEventListener('click', () => App.goto('course-mode', { course: button.dataset.course })));
  root.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    switch (button.dataset.action) {
      case 'study': if (next) App.goto('training', {course:next.boss.course,bossId:next.boss.id,studyCount:next.count}); break;
      case 'review': if (review.length) App.goto('training', {review:true,studyCount:Math.min(8,review.length)}); break;
      case 'resume': if (saved) resume(); break;
      case 'settings': App.goto('settings'); break;
      case 'titan': App.goto('superboss-briefing'); break;
      case 'survival': App.goto('survival'); break;
      case 'motion':
        state.settings.academyMotionPaused = !state.settings.academyMotionPaused;
        State.save(state);
        root.classList.toggle('academy-paused',state.settings.academyMotionPaused);
        button.setAttribute('aria-pressed', String(state.settings.academyMotionPaused));
        button.textContent = state.settings.academyMotionPaused ? 'Play ambience' : 'Pause ambience';
        break;
      case 'daily': {
        if (!dailyAvailable) break;
        const start = () => App.goto('battle', {course:dailyBoss.course,bossId:dailyBoss.id,isDaily:true});
        if (saved?.isDaily && saved.bossId === dailyBoss.id) { resume(); break; }
        if (!saved) { start(); break; }
        root.querySelector('#ac-dialog-title').textContent = 'A battle is in progress';
        root.querySelector('.ac-dialog-sub').textContent = 'Starting today’s challenge replaces your saved battle. Your study progress stays safe.';
        const options = root.querySelector('.ac-dialog-options');
        options.innerHTML = '<button data-keep>Resume saved battle</button><button data-replace>Start daily challenge instead</button>';
        options.querySelector('[data-keep]').onclick = () => { dialog.close(); resume(); };
        options.querySelector('[data-replace]').onclick = () => { dialog.close(); start(); };
        dialog.showModal();
        break;
      }
    }
  }));
});
