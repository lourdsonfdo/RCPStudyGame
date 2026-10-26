/* Pure home-screen recommendations; never modifies saved progress. */
(function (global) {
  'use strict';

  // Every playable course. `short` is the survival best-score suffix.
  const COURSES = [
    { id: 'rcp103', short: '103', name: 'Pulmonary Disease', icon: '🫁', img: 'img/academy-pulmonary.webp',
      description: 'Pathophysiology, assessment, and management.' },
    { id: 'rcp104', short: '104', name: 'Pharmacology', icon: '💊', img: 'img/academy-pharmacology.webp',
      description: 'Medications, indications, and respiratory therapy.' },
    { id: 'rcp201', short: '201', name: 'Neonatal & Pediatrics', icon: '👶', img: 'img/academy-neonatal.webp',
      description: 'Midterm study guide: fetal development to pediatric care.' },
    { id: 'rcp202', short: '202', name: 'Critical Care', icon: '🔥', img: 'img/academy-critical-care.webp',
      description: 'Midterm study guide: burns, ECMO, ventilation, ABGs.' },
    { id: 'rcp203', short: '203', name: 'Board Prep (TMC)', icon: '🩺', img: 'img/academy-diagnostics.webp',
      description: 'Midterm study guide: equipment, monitoring, airways.' },
  ];
  const course = id => COURSES.find(c => c.id === id) || { id, short: id.replace(/^rcp/, ''), name: id.toUpperCase(), icon: '📘' };

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
      if (entry) return { boss: entry.boss, topic, label: entry.boss.sectionTitle || topicLabel(topic),
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

  // Questions due for spaced review: least-known box first, then most recently missed.
  function reviewQuestions(state, questions, now = Date.now()) {
    const seen = new Set();
    const stats = state.questionStats || {};
    const stat = q => stats[global.State.qSig(q)];
    return (questions || []).filter(q => {
      const sig = global.State.qSig(q);
      if (!sig || seen.has(sig) || !global.State.isWeakQuestion(state, q, now)) return false;
      seen.add(sig);
      return true;
    }).sort((a, b) => ((stat(a).box || 0) - (stat(b).box || 0)) ||
      ((stat(b).lastWrong || 0) - (stat(a).lastWrong || 0)));
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

  global.Academy = { COURSES, course, recommendation, reviewQuestions, resumableBattle };
})(window);
