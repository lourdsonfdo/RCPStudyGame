/* Pure home-screen recommendations; never modifies saved progress. */
(function (global) {
  'use strict';

  function trainingPool(boss, questions) {
    const all = questions.filter(q => q.course === boss.course &&
      (boss.questionTopics || []).includes(q.topic));
    const training = all.filter(q => q.pool === 'training' || q.pool === 'both');
    return training.length ? training : all;
  }

  function topicLabel(topic) {
    const acronyms = { copd: 'COPD', abg: 'ABG', ards: 'ARDS', ild: 'ILD',
      nmba: 'NMBA', tb: 'TB', cf: 'CF', pe: 'PE', pvd: 'PVD', htn: 'Hypertension',
      'acid-base': 'Acid–base balance', 'cns-drugs': 'CNS drugs' };
    return acronyms[topic] || topic.replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
  }

  function recommendation(state, bosses, questions) {
    const supported = (bosses || []).map(boss => ({ boss, pool: trainingPool(boss, questions || []) }))
      .filter(entry => entry.pool.length);
    const weakTopics = Object.entries(state.topicStats || {})
      .filter(([, s]) => s.total >= 3 && s.correct / s.total < 0.8)
      .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
    for (const [topic] of weakTopics) {
      const entry = supported.find(({ boss }) => (boss.questionTopics || []).includes(topic));
      if (entry) return { boss: entry.boss, topic, label: topicLabel(topic),
        count: Math.min(8, entry.pool.length), isWeak: true };
    }
    const entry = supported.find(({ boss }) => !(state.defeatedBosses || []).includes(boss.id)) || supported[0];
    if (!entry) return null;
    const boss = entry.boss;
    return { boss, topic: null, label: boss.description
      ? boss.description.split(':')[0].trim()
      : topicLabel((boss.questionTopics || [])[0] || boss.id),
    count: Math.min(8, entry.pool.length), isWeak: false };
  }

  function reviewQuestions(state, questions) {
    const seen = new Set();
    return (questions || []).filter(q => {
      const sig = global.State.qSig(q);
      if (!sig || seen.has(sig) || !global.State.isWeakQuestion(state, q)) return false;
      seen.add(sig);
      return true;
    }).sort((a, b) => {
      const stats = state.questionStats || {};
      return (stats[global.State.qSig(b)].lastWrong || 0) - (stats[global.State.qSig(a)].lastWrong || 0);
    });
  }

  function resumableBattle(state, bosses) {
    const saved = state.battleRun;
    if (!saved || !saved.session || saved.session.outcome) return null;
    const session = saved.session;
    if (!Array.isArray(session.questions) || !Number.isInteger(session.qIndex) ||
      session.qIndex < 0 || session.qIndex >= session.questions.length ||
      !Array.isArray(session.items)) return null;
    return (bosses || []).some(boss => boss.id === saved.bossId && boss.course === saved.course)
      ? saved : null;
  }

  global.Academy = { recommendation, reviewQuestions, resumableBattle };
})(window);
