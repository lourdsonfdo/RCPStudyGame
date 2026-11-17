/* Practice progress is keyed to the original missed question, even when the
   student answers its companion calculation. Battle scoring stays separate. */
const Rematch = (() => {
  const boss = 'f202-s01';
  const bank = () => (window.ALL_QUESTIONS || []).filter(q => q.topic === boss);
  function missed(session) {
    if (session.boss.id !== boss) return [];
    return [...new Set((session.answers || []).flatMap((answer, i) =>
      answer.isCorrect ? [] : [session.questions[i]?.id]).filter(Boolean))];
  }
  function pending(state) {
    const saved = new Set(state.wardenMisses || []);
    return bank().filter(q => saved.has(q.id)).map(q => q.id);
  }
  function record(state, session) {
    if (session.boss.id === boss)
      state.wardenMisses = [...new Set([...pending(state), ...missed(session)])];
  }
  function fromFight(state, session) {
    const saved = new Set(pending(state));
    return missed(session).filter(id => saved.has(id));
  }
  // Two authored RSBI calculations with different patient data.
  const companions = { 'q-f202-s01-026': 'q-f202-s01-027', 'q-f202-s01-027': 'q-f202-s01-026' };
  function round(ids) {
    const questions = new Map(bank().map(q => [q.id, q]));
    return ids.filter(id => questions.has(id)).map(id => ({
      id, question: Battle.shuffleChoices(questions.get(companions[id]) || questions.get(id))
    }));
  }
  return { boss, pending, record, fromFight, round };
})();

App.registerScreen('rematch', ({ root, state, ctx }) => {
  root.classList.add('acsc');
  const saved = new Set(Rematch.pending(state));
  const round = Rematch.round((ctx.ids || []).filter(id => saved.has(id)));
  let index = 0, corrected = 0;
  function element(tag, cls, text, parent = root) {
    const el = document.createElement(tag);
    el.className = cls;
    el.textContent = text;
    parent.appendChild(el);
    return el;
  }
  function leave() {
    App.goto('prep-camp', { course: ctx.course, bossId: ctx.bossId }, { clearHistory: true });
  }
  function render() {
    root.replaceChildren();
    element('h2', 'mode-tag', 'Weaning Warden · Rematch');
    if (index === round.length) {
      element('p', 'q-text', corrected + ' of ' + round.length + ' corrected · ' + (round.length - corrected) + ' still need practice');
      element('button', 'btn btn-primary', 'Back to prep camp').onclick = leave;
      return;
    }
    const { id, question } = round[index];
    element('p', 'q-label', 'Question ' + (index + 1) + ' of ' + round.length);
    element('p', 'q-text', question.q);
    const buttons = question.choices.map((choice, i) => {
      const button = element('button', 'btn btn-block', choice);
      button.onclick = () => {
        buttons.forEach(b => { b.disabled = true; });
        const right = i === question.correct;
        if (right) {
          corrected++;
          state.wardenMisses = Rematch.pending(state).filter(key => key !== id);
          State.save(state);
        }
        const feedback = element('div', 'q-box', '');
        feedback.setAttribute('role', 'status');
        element('strong', '', right ? 'Correct' : 'Correct answer: ' + question.choices[question.correct], feedback);
        element('p', '', question.explanation, feedback);
        element('button', 'btn btn-primary', index + 1 === round.length ? 'See results' : 'Next question').onclick = () => { index++; render(); };
      };
      return button;
    });
    element('button', 'btn', 'Return to prep camp').onclick = leave;
  }
  render();
});
