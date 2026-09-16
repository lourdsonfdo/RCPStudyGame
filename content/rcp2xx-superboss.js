/* ============================================================
   VITALS TITAN — super boss built from RCP 202/203 Tier 3 values.
   Not part of the 103/104 boss grids; reached from the home screen.
   ============================================================ */
(function () {
  const boss = {
    id: 'vitals-titan',
    name: 'VITALS TITAN',
    emoji: '🗿',
    course: 'rcp2xx',
    description: 'RCP 202 + 203 · every number that matters',
    superboss: true,
    hp: 500,                      // 5 bars x 100, tracked per phase by the engine
    questionTopics: ['sb-202', 'sb-gas', 'sb-equip', 'sb-formula'],
  };

  window.ALL_BOSSES = (window.ALL_BOSSES || [])
    .filter(b => b.id !== 'vitals-titan')
    .concat([boss]);
})();
